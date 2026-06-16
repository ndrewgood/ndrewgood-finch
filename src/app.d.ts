// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace svelte.JSX {
		interface IntrinsicElements {
			'mux-player': import('svelte/elements').HTMLAttributes<HTMLElement> & {
				'playback-id'?: string;
				'metadata-video-title'?: string;
				autoplay?: string | boolean;
				muted?: boolean;
				loop?: boolean;
				playsinline?: boolean;
				preload?: string;
				nohotkeys?: boolean;
			};
		}
	}
}

export {};
