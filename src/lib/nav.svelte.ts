export type NavPanel = 'Info' | 'Spaces' | 'Contact';

export const nav = $state<{ panel: NavPanel | null; overlayOpen: boolean }>({
	panel: null,
	overlayOpen: false
});

export function openNavPanel(panel: NavPanel) {
	nav.panel = panel;
}

export function closeNavPanel() {
	nav.panel = null;
}
