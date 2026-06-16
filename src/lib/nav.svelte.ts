export type NavPanel = 'Info' | 'Spaces' | 'Contact';

export const nav = $state<{ panel: NavPanel | null }>({
	panel: null
});

export function openNavPanel(panel: NavPanel) {
	nav.panel = panel;
}

export function closeNavPanel() {
	nav.panel = null;
}
