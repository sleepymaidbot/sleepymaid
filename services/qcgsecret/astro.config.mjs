import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import compress from 'astro-compress';
import critters from 'astro-critters';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// https://astro.build/config
export default defineConfig({
	integrations: [
		react(),
		mdx(/*{
			rehypePlugins: [
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						properties: {
							class:
								'relative inline-flex w-6 h-6 place-items-center place-content-center outline-0 text-black dark:text-white ml-2',
						},
						behavior: 'after',
						group: ({ tagName }: { tagName: string }) =>
							h('div', {
								class: `[&>*]:inline-block [&>h1]:m-0 [&>h2]:m-0 [&>h3]:m-0 [&>h4]:m-0 level-${tagName}`,
								tabIndex: -1,
							}),
						content: (heading: Node) => [
							h(
								`span.anchor-icon`,
								{
									ariaHidden: 'true',
								},
								LinkIcon,
							),
							createSROnlyLabel(toString(heading)),
						],
					},
				],
			],
		}*/),
		compress(),
		critters(),
	],
	output: 'server',
	adapter: node({
		mode: 'standalone',
	}),
});
