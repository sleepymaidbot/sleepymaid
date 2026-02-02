import { createCipheriv, createHash, randomBytes } from "node:crypto"

if (!process.env.SESSION_SECRET) {
	throw new Error("SESSION_SECRET environment variable is not set")
}

function encryptSessionId(userId: string, secret: string): string {
	const key = createHash("sha256").update(secret).digest()
	const iv = randomBytes(16)
	const cipher = createCipheriv("aes-256-gcm", key, iv)

	let encrypted = cipher.update(userId, "utf8", "hex")
	encrypted += cipher.final("hex")

	const authTag = cipher.getAuthTag()

	return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`
}

export default encryptSessionId
