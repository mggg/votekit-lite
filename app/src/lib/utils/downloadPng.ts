import * as htmlToImage from 'html-to-image';
import FileSaver from 'file-saver';

export const downloadPng = (node: HTMLElement, runId: string) => {
	htmlToImage.toBlob(node).then((blob) => {
		if (blob) {
			FileSaver.saveAs(blob, `${runId}-chart.png`);
		}
	});
};
