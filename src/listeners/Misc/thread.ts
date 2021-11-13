module.exports = {
	name: 'threadCreate',
	once: false,

	async execute(thread) {
		thread.join()
	}
}
