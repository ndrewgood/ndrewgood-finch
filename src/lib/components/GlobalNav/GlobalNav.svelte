<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';
	import { animate } from 'motion';

	import type { IconName } from '$lib/assets/icons';
	import type { ExperienceEntry } from '$lib/types/experience';
	import type { PastSiteEntry } from '$lib/types/past-sites';
	import { closeNavPanel, nav, openNavPanel, type NavPanel } from '$lib/nav.svelte';

	import Icon from '../Icon.svelte';
	import ContactContent from './ContactContent.svelte';
	import InfoContent from './InfoContent.svelte';
	import SpacesContent from './SpacesContent.svelte';

	let { experience = [], pastSites = [] }: { experience?: ExperienceEntry[]; pastSites?: PastSiteEntry[] } =
		$props();

	type NavPosition = 'first' | 'middle' | 'last';

	const shellBase =
		'pb-[3px] bg-[rgba(94,84,79,0.2)] transition-all duration-[120ms] ease-out-cubic';

	const buttonBase =
		'cursor-pointer px-4 py-3 transition-[border-radius,background-color,transform,margin] duration-[120ms] ease-out-cubic';


	const cornerClassesByPosition: Record<NavPosition, string> = {
		first: 'rounded-tl-xl rounded-bl-xl',
		middle: '',
		last: 'rounded-tr-xl rounded-br-xl'
	};

	const activeColors: Record<NavPosition, string> = {
		first: 'bg-[#E2FCFF]',
		middle: 'bg-[#FFF3E0]',
		last: 'bg-[#E1FFDC]'
	};

	const activeTextColors: Record<NavPosition, string> = {
		first: 'text-[#04434B]',
		middle: 'text-[#793A26]',
		last: 'text-[#435320]'
	};

	const containerSizes: { id: string; width: number; height: number }[] = [
		{ id: 'Info', width: 700, height: 640 },
		{ id: 'Spaces', width: 640, height: 580 },
		{ id: 'Contact', width: 520, height: 370 }
	];

	const maxNavWidthRatio = 0.9;

	let viewportWidth = $state(0);

	const navItems: { label: NavPanel; position: NavPosition; icon: IconName }[] = [
		{ label: 'Info', position: 'first', icon: 'person_text' },
		{ label: 'Spaces', position: 'middle', icon: 'captive_portal' },
		{ label: 'Contact', position: 'last', icon: 'waving_hand' }
	];
	let navContainer = $state<HTMLElement | undefined>();
	let navBarEl = $state<HTMLElement | undefined>();
	let scrimEl = $state<HTMLElement | undefined>();
	let contentEl = $state<HTMLElement | undefined>();
	let openVisual = $state(false);
	let renderedPanel = $state<NavPanel | null>(null);
	let isClosing = $state(false);

	let closedW = 0;
	let closedH = 0;
	let measured = $state(false);
	let contentAnimGeneration = 0;

	function cornerClasses(position: NavPosition) {
		return nav.panel !== null ? 'rounded-none' : cornerClassesByPosition[position];
	}

	function buttonClasses(label: NavPanel, position: NavPosition) {
		const isActive = nav.panel === label;
		const pressClasses =
			nav.panel === null
				? 'bg-white hover:bg-stone-50 active:bg-stone-200 active:mt-[3px]'
				: 'bg-white hover:bg-stone-50 active:bg-stone-200';

		return [
			buttonBase,
			cornerClasses(position),
			isActive
				? `${activeColors[position]} ${activeTextColors[position]}`
				: pressClasses
		].join(' ');
	}

	function closeNav() {
		closeNavPanel();
	}

	function isClosedIdle() {
		return nav.panel === null && !openVisual;
	}

	function getMaxNavWidth() {
		if (!viewportWidth) return Infinity;
		return viewportWidth * maxNavWidthRatio;
	}

	function clampNavWidth(width: number) {
		return Math.min(width, getMaxNavWidth());
	}

	function getPanelSize(panel: NavPanel) {
		return containerSizes.find((entry) => entry.id === panel);
	}

	function getPanelWidth(panel: NavPanel) {
		const size = getPanelSize(panel);
		return size ? clampNavWidth(size.width) : 0;
	}

	const contentWidth = $derived.by(() => {
		if (nav.panel) return getPanelWidth(nav.panel);
		if (renderedPanel) return getPanelWidth(renderedPanel);
		return 0;
	});

	async function waitForContentEl(generation: number) {
		await tick();
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

		if (generation !== contentAnimGeneration || !contentEl) return false;
		return true;
	}

	async function animateContentIn() {
		const generation = ++contentAnimGeneration;
		if (!(await waitForContentEl(generation))) return;

		contentEl!.parentElement?.scrollTo(0, 0);
		contentEl!.style.opacity = '0';
		await animate(contentEl!, { opacity: 1 }, { duration: 0.25, ease: 'easeOut' }).finished;
	}

	async function animateContentOut() {
		const generation = ++contentAnimGeneration;
		if (!(await waitForContentEl(generation))) return;

		await animate(contentEl!, { opacity: 0.05 }, { duration: 0.1, ease: 'easeOut' }).finished;
		await animate(contentEl!, { opacity: 0 }, { duration: 0.15, ease: 'easeOut' }).finished;

		return generation === contentAnimGeneration;
	}

	function measureClosedShell() {
		const el = navContainer;
		const bar = navBarEl;
		if (!el || !bar || openVisual) return;

		el.style.width = '';
		el.style.height = '';

		const { width, height } = bar.getBoundingClientRect();
		closedW = Math.ceil(width);
		closedH = Math.ceil(height) - 3;

		if (isClosedIdle()) {
			el.style.width = `${clampNavWidth(closedW)}px`;
			el.style.height = `${closedH}px`;
		}
	}

	onMount(() => {
		viewportWidth = window.innerWidth;
		measureClosedShell();
		measured = true;

		let resizeRaf = 0;
		const onViewportChange = () => {
			viewportWidth = window.innerWidth;
			cancelAnimationFrame(resizeRaf);
			resizeRaf = requestAnimationFrame(() => {
				if (isClosedIdle()) {
					measureClosedShell();
				}
			});
		};

		window.addEventListener('resize', onViewportChange);

		const observer = new ResizeObserver(onViewportChange);
		observer.observe(document.documentElement);

		return () => {
			window.removeEventListener('resize', onViewportChange);
			observer.disconnect();
			cancelAnimationFrame(resizeRaf);
		};
	});

	$effect(() => {
		if (!browser) return;

		const panel = nav.panel;

		if (panel !== null) {
			openVisual = true;

			const wasClosing = isClosing;
			if (isClosing) {
				contentAnimGeneration++;
				isClosing = false;
			}

			if (renderedPanel !== panel) {
				renderedPanel = panel;
				void animateContentIn();
			} else if (wasClosing) {
				void animateContentIn();
			}
		} else if (renderedPanel !== null && !isClosing) {
			isClosing = true;
			void (async () => {
				const completed = await animateContentOut();
				if (!completed || nav.panel !== null) return;

				renderedPanel = null;
				isClosing = false;
				await tick();

				if (nav.panel === null && renderedPanel === null) {
					openVisual = false;
					measureClosedShell();
				}
			})();
		}
	});

	$effect(() => {
		if (!browser) return;

		if (openVisual) {
			const previousOverflow = document.documentElement.style.overflow;
			document.documentElement.style.overflow = 'hidden';

			return () => {
				document.documentElement.style.overflow = previousOverflow;
			};
		}
	});

	$effect(() => {
		if (!browser || !scrimEl) return;

		const playback = animate(
			scrimEl,
			{ opacity: nav.panel !== null ? 1 : 0 },
			{ duration: 0.2, ease: 'easeOut' }
		);

		return () => playback.stop();
	});

	$effect(() => {
		if (!browser || !measured || !navContainer) return;

		void viewportWidth;
		void renderedPanel;
		void isClosing;

		const isOpen = nav.panel !== null;
		let width: number;
		let height: number;

		if (isOpen && nav.panel) {
			const size = getPanelSize(nav.panel);
			if (!size) return;
			width = clampNavWidth(size.width);
			height = size.height;
		} else if (openVisual) {
			width = clampNavWidth(closedW);
			height = closedH;
		} else {
			width = clampNavWidth(closedW);
			height = closedH;
		}

		const playback = animate(
			navContainer,
			{ width, height },
			{ type: 'spring', stiffness: 700, damping: 50 }
		);

		return () => playback.stop();
	});
</script>

{#if openVisual}
	<button
		bind:this={scrimEl}
		type="button"
		class="fixed inset-0 z-[9] h-[100vh] w-[100vw] cursor-default border-0 bg-stone-900/20 p-0 opacity-0 backdrop-blur-[3px]"
		aria-label="Close navigation"
		onclick={closeNav}
	></button>
{/if}

<div
	bind:this={navContainer}
	class='fixed top-4 left-1/2 z-10 flex max-w-[90vw] -translate-x-1/2 flex-col rounded-xl'
>
    <div
        class={[
            'h-full w-full rounded-xl',
            openVisual && 'flex flex-col overflow-hidden bg-white'
        ]
            .filter(Boolean)
            .join(' ')}
    >
        <nav
            bind:this={navBarEl}
            class={[
                'relative flex shrink-0 flex-row items-stretch font-display text-lg font-bold',
                nav.panel === null && 'pb-[3px]',
                nav.panel !== null && 'border-b-[1.5px] border-stone-200'
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div class="flex flex-row items-start">
                {#each navItems as { label, position, icon }, index}
                    {@const isActive = nav.panel === label}
                    <button
                        type="button"
                        class={[
                            buttonClasses(label, position),
                            'inline-flex items-center gap-0',
                            index > 0 && '-ml-px'
                        ].filter(Boolean).join(' ')}
                        aria-current={isActive ? 'page' : undefined}
                        onclick={() => openNavPanel(label)}
                    >
                        <span
                            class={[
                                'flex h-2.5 items-center justify-start transition-all duration-[200ms] ease-out-cubic',
                                isActive ? 'w-6' : 'w-0'
                            ].join(' ')}
                        >
                            <Icon
                                name={icon}
                                class={[
                                    'size-5 transition-all duration-[160ms] ease-out-cubic',
                                    isActive
                                        ? 'scale-100 opacity-100 blur-none'
                                        : 'scale-50 opacity-0 blur-xs'
                                ].join(' ')}
                            />
                        </span>
                        {label}
                    </button>
                {/each}
            </div>

            {#if nav.panel !== null}
                <div class="ml-auto flex items-stretch">
                    <div class="w-px self-stretch bg-stone-200" aria-hidden="true"></div>
                    <button
                        type="button"
                        class="flex cursor-pointer items-center justify-center px-4 py-3 text-stone-500 transition-colors duration-[120ms] ease-out-cubic hover:bg-stone-50 hover:text-stone-900 active:bg-stone-200"
                        aria-label="Close navigation"
                        onclick={closeNav}
                    >
                        <Icon name="close" class="size-5" />
                    </button>
                </div>
            {/if}
        </nav>

        {#if openVisual}
            <div class="nav-panel-scroll flex min-h-0 flex-1 justify-center overflow-x-hidden overflow-y-auto">
                {#if renderedPanel}
                    {#key renderedPanel}
                        <div
                            bind:this={contentEl}
                            class="shrink-0"
                            style:width="{contentWidth}px"
                        >
                            {#if renderedPanel === 'Info'}
                                <InfoContent {experience} />
                            {:else if renderedPanel === 'Spaces'}
                                <SpacesContent {pastSites} />
                            {:else if renderedPanel === 'Contact'}
                                <ContactContent />
                            {/if}
                        </div>
                    {/key}
                {/if}
            </div>
        {/if}
    </div>
    <div
        class={[
            'absolute -z-10 h-[52px] w-[250px] rounded-xl bg-[rgba(94,84,79,0.2)]',
            'transition-[top] duration-[120ms] ease-out-cubic',
            nav.panel !== null ? 'top-0' : 'top-[3px]'
        ].join(' ')}
        style:transition-delay={openVisual && nav.panel === null ? '300ms' : '0ms'}
    ></div>
</div>
