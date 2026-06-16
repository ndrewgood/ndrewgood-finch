import { collection, config, fields, singleton } from '@keystatic/core';

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
		}),
		featuredProjects: singleton({
			label: 'Featured projects',
			path: 'src/content/singletons/featured-projects',
			format: { data: 'yaml' },
			schema: {
				projects: fields.array(
					fields.relationship({
						label: 'Project',
						collection: 'allProjects'
					}),
					{
						label: 'Projects',
						description: 'Drag to reorder. Order is used on the site.',
						itemLabel: (props) => props.value ?? 'Select a project'
					}
				)
			}
		}),
		experience: singleton({
			label: 'Experience',
			path: 'src/content/singletons/experience',
			format: { data: 'yaml' },
			schema: {
				entries: fields.array(
					fields.object({
						label: fields.text({
							label: 'Label',
							description: 'Unique key for this experience entry.'
						}),
						company: fields.text({ label: 'Company' }),
						icon: fields.file({
							label: 'Icon',
							description: 'SVG icon for this company.',
							directory: 'src/content/singletons/experience/icons',
							publicPath: '/content/singletons/experience/icons/'
						}),
						startMonthYear: fields.text({ label: 'Starting Month / Year' }),
						endMonthYear: fields.text({ label: 'Ending Month / Year' }),
						title: fields.text({ label: 'Title' }),
						description: fields.document({
							label: 'Description',
							formatting: true,
							links: true
						})
					}),
					{
						label: 'Experience',
						description: 'Drag to reorder. Order is used on the site.',
						itemLabel: (props) => props.fields.label.value || 'New experience'
					}
				)
			}
		}),
		pastSites: singleton({
			label: 'Past sites',
			path: 'src/content/singletons/past-sites',
			format: { data: 'yaml' },
			schema: {
				sites: fields.array(
					fields.object({
						dateRange: fields.text({
							label: 'Date range',
							description: 'Unique key for this past site entry.'
						}),
						description: fields.text({ label: 'Description' }),
						link: fields.url({ label: 'Link' })
					}),
					{
						label: 'Past sites',
						description: 'Drag to reorder. Order is used on the site.',
						itemLabel: (props) => props.fields.dateRange.value || 'New past site'
					}
				)
			}
		})
	},
	collections: {
		allProjects: collection({
			label: 'All projects',
			slugField: 'title',
			path: 'src/content/all-projects/*',
			format: { data: 'yaml' },
			columns: ['description', 'endDate'],
			schema: {
				title: fields.slug({
					name: { label: 'Title' }
				}),
				shortDescription: fields.text({
					label: 'Short description'
				}),
				description: fields.text({
					label: 'Description'
				}),
				icon: fields.file({
					label: 'Icon',
					description: 'SVG icon for this project.',
					directory: 'src/content/all-projects/icons',
					publicPath: '/content/all-projects/icons/'
				}),
				tags: fields.multiselect({
					label: 'Tags',
					options: [
						{ label: 'Design', value: 'Design' },
						{ label: 'Development', value: 'Development' },
						{ label: 'Physical computing', value: 'Physical computing' }
					]
				}),
				videoId: fields.text({
					label: 'Video ID',
					description:
						'Mux playback ID for this project. Find it in your Mux assets: https://dashboard.mux.com/organizations/a2qbf5/environments/get0st/video/assets'
				}),
				highlightColor: fields.text({
					label: 'Highlight color',
					description: 'Hex color used for the video hover glow (e.g. #1A2B4A).'
				}),
				cta: fields.url({
					label: 'CTA'
				}),
				ctaText: fields.text({
					label: 'CTA text'
				}),
				startDate: fields.date({
					label: 'Start date'
				}),
				endDate: fields.date({
					label: 'End date'
				})
			}
		})
	}
});
