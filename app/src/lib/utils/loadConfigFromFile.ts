import { formState } from '$lib/stores/formStore.svelte';

export const loadConfigFromFile = async (fileObj?: File) => {
	if (!fileObj) {
		alert('Please select a valid JSON file');
		return;
	}
	const text = await fileObj.text();
	const config = JSON.parse(text);
	if (!config.id) {
		alert('Please select a valid JSON file');
		return;
	}
	formState.loadSimulationSettings(config);
};
