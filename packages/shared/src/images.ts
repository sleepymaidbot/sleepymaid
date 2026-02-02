import { createCanvas } from "@napi-rs/canvas"

export async function generateSplitImage(colorTop: number, colorBottom: number): Promise<Buffer> {
	const width = 800
	const height = 600
	const canvas = createCanvas(width, height)
	const ctx = canvas.getContext("2d")

	const hexColorTop = `#${colorTop.toString(16).padStart(6, "0")}`
	const hexColorBottom = `#${colorBottom.toString(16).padStart(6, "0")}`

	ctx.fillStyle = hexColorTop
	ctx.fillRect(0, 0, width, height / 2)

	ctx.fillStyle = hexColorBottom
	ctx.fillRect(0, height / 2, width, height)

	const fontSize = Math.floor(height / 4)
	ctx.font = `bold ${fontSize}px Arial`
	ctx.textAlign = "center"
	ctx.textBaseline = "middle"
	ctx.fillStyle = "#ffffff"

	ctx.fillText("OLD", width / 2, height / 4)

	ctx.fillText("NEW", width / 2, (3 * height) / 4)

	return canvas.toBuffer("image/png")
}
