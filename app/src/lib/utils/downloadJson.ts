import type { VotekitConfig } from '$lib/types/votekitConfig';
import FileSaver from 'file-saver';

export const downloadJson = (config: VotekitConfig, runId: string) => {
	const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
	FileSaver.saveAs(blob, `${runId}-config.json`);
};
