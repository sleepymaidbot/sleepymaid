import { HelperClient } from './lib/HelperClient'

void (() => {
	const client: HelperClient = new HelperClient()

	client.start()
})()
