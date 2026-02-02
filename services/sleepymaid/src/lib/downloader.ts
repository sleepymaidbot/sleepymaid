import { unlink } from "node:fs/promises"
import { join } from "node:path"
import { Result } from "@sapphire/result"
import { shell } from "@sleepymaid/util"
import { SleepyMaidClient } from "./SleepyMaidClient"

export const sites = [
	"tiktok.com",
	"https://redd.it",
	"https://v.redd.it",
	"reddit.com",
	"https://t.co",
	"facebook.com",
	"instagram.com",
	"nicovideo.jp/watch",
	"https://twitter.com",
	"https://x.com",
	"https://mobile.twitter.com",
]

export const sitesDelEmbed = [
	"https://redd.it",
	"https://v.redd.it",
	"reddit.com",
	"https://twitter.com",
	"https://x.com",
	"https://mobile.twitter.com",
	"https://vm.tiktok.com",
	"https://vt.tiktok.com",
	"https://www.tiktok.com",
	"https://tiktok.com",
	"instagram.com",
]

export async function downloadVideo(client: SleepyMaidClient, url: string): Promise<DownloadedFile | null> {
	url = url.replaceAll("fxtwitter.com", "twitter.com")
	url = url.replaceAll("x.com", "twitter.com")
	url = url.replaceAll("fixupx.com", "twitter.com")
	url = url.replaceAll("vxtwitter.com", "twitter.com")
	url = url.replaceAll("fixvx.com", "twitter.com")

	if (url.startsWith("https://") && sites.some((a) => url.includes(a))) {
		const sanitizedUrl = `"${url.replace(/"/g, '\\"')}"`

		const nameReturn = await Result.fromAsync(async () =>
			shell(`yt-dlp --print filename -o "%(id)s.%(ext)s" ${sanitizedUrl}`),
		)
		if (nameReturn.isErr()) {
			client.logger.error(nameReturn.unwrapErr() as Error)
			return null
		}

		const fileName = nameReturn.unwrap().stdout.trim()
		const dlReturn = await Result.fromAsync(async () =>
			shell(`yt-dlp -P "${join(__dirname, "../../../downloads/")}" -f mp4 -o "${fileName}" ${sanitizedUrl}`),
		)
		if (dlReturn.isErr()) {
			client.logger.error(dlReturn.unwrapErr() as Error)
			return null
		}

		return new DownloadedFile(fileName)
	}
	return null
}

export class DownloadedFile {
	private filePath: string
	private fileName: string

	constructor(fileName: string) {
		this.fileName = fileName
		this.filePath = join(__dirname, `../../../downloads/${fileName}`)
	}

	public async delete() {
		return await unlink(this.filePath)
	}

	public async getFilePath() {
		return this.filePath
	}

	public async getFileName() {
		return this.fileName
	}
}
