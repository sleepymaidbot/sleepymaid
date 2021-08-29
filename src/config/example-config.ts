import { Config } from '../lib/utils/config'

export const config = new Config({
	credentials: {
		token: 'prod_token',
		devToken: 'dev_token'
	},
    clientId: {
        prod: 'prod_client_id',
        dev: 'dev_client_id'
    },
	environment: 'development',
	owners: [''],
	prefix: '',
	devprefix: '',
	db: 'mongodb://localhost:27017/sleepymaid'
})
