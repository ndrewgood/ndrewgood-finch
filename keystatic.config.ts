import { config, fields, singleton } from '@keystatic/core';

export default config({
	storage: { kind: 'local' },
	singletons: {
		heroText: singleton({
			label: 'Hero text',
			path: 'src/content/singletons/hero-text',
			format: { data: 'json', contentField: 'text' },
			schema: {
				text: fields.mdx({
					label: 'Hero text',
					description: 'Supports rich text like bold and italics.'
				})
			}
		})
	}
});
