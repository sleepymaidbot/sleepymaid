import { createTsupConfig } from '../../tsup.config.js';

export default createTsupConfig({
	format: ['cjs'],
	dts: false,
});
