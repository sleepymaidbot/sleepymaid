/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
	transpilePackages: ["lucide-react"],
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	async redirects() {
		return [
			{
				source: "/invite",
				destination:
					"https://discord.com/oauth2/authorize?client_id=613040835684073506&permissions=564583048014912&scope=bot",
				permanent: true,
			},
			{
				source: "/invite/:guildId",
				destination:
					"https://discord.com/oauth2/authorize?client_id=613040835684073506&permissions=564583048014912&scope=bot&guild_id=:guildId",
				permanent: true,
			},
		];
	},
};

export default config;
