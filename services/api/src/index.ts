import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { createDrizzleInstance } from "@sleepymaid/db"
import { env } from "@sleepymaid/handler"
import { Logger } from "@sleepymaid/logger"
import { readdirSync } from "fs"
import { Hono } from "hono"
import { getSignedCookie, setSignedCookie } from "hono/cookie"
import { logger as honoLogger } from "hono/logger"
import { join } from "path"
import * as discord from "./utils/discord"
import loadStaticFolders from "./utils/loadStaticFolders"
import * as storage from "./utils/storage"

const app = new Hono()
const logger = new Logger(process.env.NODE_ENV as env)
const imagesFolders = loadStaticFolders()
const secret = process.env.API_SECRET
export const db = createDrizzleInstance(process.env.DATABASE_URL!)

if (!secret) {
	logger.error("API_SECRET is not set")
	process.exit(1)
}

const customLogger = (message: string, ...args: string[]) => {
	logger.debug(message, ...args)
}

app.use(honoLogger(customLogger))

app.get("/", (c) => {
	return c.text("Sleepymaid API")
})

// Image API

app.get("/images/:name", (c) => {
	if (c.req.header("Authorization") !== secret) {
		return c.json({ status: "error", message: "Invalid API secret" })
	}

	const name = c.req.param("name")

	if (!imagesFolders.includes(name)) {
		return c.json({ status: "error", message: "Image not found" })
	}

	const imagePath = join(process.cwd(), "static/images", name)
	const files = readdirSync(imagePath)
	const randomFile = files[Math.floor(Math.random() * files.length)]
	return c.json({
		status: "success",
		image: `/static/images/${name}/${randomFile}`,
	})
})

app.use("/static/*", serveStatic({ root: "./" }))

// Linked roles API

app.get("/linked-roles", async (c) => {
	const { url, state } = discord.getOAuthUrl()

	await setSignedCookie(c, "clientState", state, process.env.API_SECRET!, { maxAge: 1000 * 60 * 5 })

	return c.redirect(url)
})

app.get("/linked-roles-callback", async (c) => {
	try {
		const code = c.req.query("code")
		const discordState = c.req.query("state")

		// make sure the state parameter exists
		const clientState = await getSignedCookie(c, process.env.API_SECRET!, "clientState")
		if (clientState !== discordState) {
			console.log(clientState, discordState)
			console.error("State verification failed.")
			return c.json({ status: "error", message: "Invalid client state" })
		}

		if (!code) {
			return c.json({ status: "error", message: "No code provided" })
		}

		const tokens = await discord.getOAuthTokens(code)

		// 2. Uses the Discord Access Token to fetch the user profile
		const meData = await discord.getUserData(tokens)
		const userId = meData.id
		await storage.storeDiscordTokens(userId, {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			expires_at: Date.now() + tokens.expires_in * 1000,
		})

		// 3. Update the users metadata, assuming future updates will be posted to the `/update-metadata` endpoint
		await storage.updateMetadata(userId)

		return c.text("You did it!  Now go back to Discord.")
	} catch (error) {
		console.error(error)
		return c.json({ status: "error", message: "Invalid client state" })
	}
})

app.post("/update-metadata", async (c) => {
	if (c.req.header("Authorization") !== secret) {
		return c.json({ status: "error", message: "Invalid API secret" })
	}

	try {
		const userId = c.req.query("userId")

		if (!userId) {
			return c.json({ status: "error", message: "No user ID provided" })
		}

		await storage.updateMetadata(userId)

		return c.json({ status: "success" })
	} catch (error) {
		console.error(error)
		return c.json({ status: "error", message: "Failed to update metadata" })
	}
})

const port = 3000
logger.info(`Starting server on port ${port}`)

serve({
	fetch: app.fetch,
	port,
})
