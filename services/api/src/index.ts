import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Logger } from "@sleepymaid/logger";
import { env } from "@sleepymaid/handler";
import { serveStatic } from "@hono/node-server/serve-static";
import loadStaticFolders from "./loadStaticFolders";
import { readdirSync } from "fs";
import { join } from "path";

const app = new Hono();
const logger = new Logger(process.env.NODE_ENV as env);
const imagesFolders = loadStaticFolders();
const secret = process.env.API_SECRET;

if (!secret) {
	logger.error("API_SECRET is not set");
	process.exit(1);
}

app.get("/", (c) => {
	return c.text("Sleepymaid API");
});

app.get("/images/:name", (c) => {
	if (c.req.header("Authorization") !== secret) {
		return c.json({ status: "error", message: "Invalid API secret" });
	}

	const name = c.req.param("name");

	if (!imagesFolders.includes(name)) {
		return c.json({ status: "error", message: "Image not found" });
	}

	const imagePath = join(process.cwd(), "static/images", name);
	const files = readdirSync(imagePath);
	const randomFile = files[Math.floor(Math.random() * files.length)];
	return c.json({
		status: "success",
		image: `/static/images/${name}/${randomFile}`,
	});
});

app.use("/static/*", serveStatic({ root: "./" }));

const port = 3000;
logger.info(`Starting server on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
