/* eslint-disable */
// @ts-check

/**
 * @type {import('next').NextConfig}
 */
module.exports = {
	reactStrictMode: true,
	swcMinify: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
	productionBrowserSourceMaps: true,
	cleanDistDir: true,
	i18n: {
		locales: ['en'],
		defaultLocale: 'en',
	},
	redirects() {
		return [
			{
				source: '/github',
				destination: 'https://github.com/sleepymaidbot/sleepymaid',
				permanent: true,
			},
			{
				source: '/support',
				destination: 'https://discord.gg/8bpy2PC',
				permanent: true,
			},
			{
				source: '/invite',
				destination: 'yo',
				permanent: true,
			},
		];
	},
};
