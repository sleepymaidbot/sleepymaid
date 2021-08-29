import { Config } from '../lib/utils/config'

export const config = new Config({
	credentials: {
		token: 'prod_token',
		devToken: 'dev_token'
	},
	environment: 'development',
	owners: [''],
	prefix: '',
	devprefix: '',
	slashprefix: '',
	db: 'mongodb://localhost:27017/sleepymaid'
})
