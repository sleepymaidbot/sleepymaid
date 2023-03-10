import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import compress from 'astro-compress';
import critters from 'astro-critters';
import { fileURLToPath, URL } from 'node:url';
import tailwind from '@astrojs/tailwind';

const rootDir = new URL('../../', import.meta.url);

// https://astro.build/config
export default defineConfig({
	integrations: [react(), mdx(), compress(), critters(), tailwind()],
	output: 'server',
	adapter: node({
		mode: 'standalone',
	}),
	vite: {
		resolve: {
			alias: {
				'ariakit/button': fileURLToPath(new URL('node_modules/ariakit/esm/button/index.js', rootDir)),
				'ariakit/disclosure': fileURLToPath(new URL('node_modules/ariakit/esm/disclosure/index.js', rootDir)),
				'ariakit/separator': fileURLToPath(new URL('node_modules/ariakit/esm/separator/index.js', rootDir)),
				'ariakit-utils/dom': fileURLToPath(new URL('node_modules/ariakit-utils/esm/dom.js', rootDir)),
				'ariakit-utils/events': fileURLToPath(new URL('node_modules/ariakit-utils/esm/events.js', rootDir)),
				'ariakit-utils/focus': fileURLToPath(new URL('node_modules/ariakit-utils/esm/focus.js', rootDir)),
				'ariakit-utils/misc': fileURLToPath(new URL('node_modules/ariakit-utils/esm/misc.js', rootDir)),
				'ariakit-utils/platform': fileURLToPath(new URL('node_modules/ariakit-utils/esm/platform.js', rootDir)),
				'ariakit-react-utils/hooks': fileURLToPath(new URL('node_modules/ariakit-react-utils/esm/hooks.js', rootDir)),
				'ariakit-react-utils/misc': fileURLToPath(new URL('node_modules/ariakit-react-utils/esm/misc.js', rootDir)),
				'ariakit-react-utils/system': fileURLToPath(new URL('node_modules/ariakit-react-utils/esm/system.js', rootDir)),
				'react-icons/fi': fileURLToPath(new URL('node_modules/react-icons/fi/index.esm.js', rootDir)),
				'react-icons/vsc': fileURLToPath(new URL('node_modules/react-icons/vsc/index.esm.js', rootDir)),
				'react-use': fileURLToPath(new URL('node_modules/react-use/esm/index.js', rootDir)),
			},
		},
	},
});
