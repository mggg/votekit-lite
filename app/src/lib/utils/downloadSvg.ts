import * as htmlToImage from 'html-to-image';
import FileSaver from 'file-saver';

export const downloadSvg = (node: HTMLElement, runId: string) => {
	htmlToImage.toSvg(node).then((dataUrl: string) => {
		FileSaver.saveAs(dataUrl, `${runId}-chart.svg`);
	});
};
