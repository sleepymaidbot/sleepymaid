import { BaseConfig } from './baseConfig'

export const config = new BaseConfig({
	credentials: {
		token: 'prod_token',
		devToken: 'dev_token'
	},
	environment: 'development',
	owners: [''],
	prefix: '',
	devprefix: '',
	db: 'mongodb://localhost:27017/sleepymaid'
})
