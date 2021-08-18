import { Listener } from 'discord-akairo'
import {
	userActivityModel,
	customRoleModel,
	mondecorteModel
} from '../lib/utils/db'

export default class Migration extends Listener {
	constructor() {
		super('migration', {
			emitter: 'client',
			event: 'ready'
		})
	}

	async exec() {
		await userActivityModel
			.find({})
			.then((docs) => {
				docs.forEach(async (doc) => {
					const newDoc = new mondecorteModel({
						id: doc.id,
						points: doc.points
					})
					await newDoc
						.save()
						.catch(console.error)
						.then(() => console.log(newDoc))
				})
			})
			.then(async () => {
				await customRoleModel.find({}).then((docs) => {
					docs.forEach(async (doc) => {
						const inDb = await mondecorteModel.findOne({ id: doc.id })
						inDb.crole = doc.role
						await inDb
							.save()
							.catch(console.error)
							.then(() => console.log(inDb))
					})
				})
			})
	}
}
