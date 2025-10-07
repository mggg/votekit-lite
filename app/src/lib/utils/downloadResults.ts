import type { Run } from '$lib/stores/types';

export const downloadResults = (results: Run) => {
	if (!results.result) {
		return;
	}
	const data = results.result;
	let csvText = `"Seats Won",`;
	const slates = Object.keys(data);
	slates.forEach((_slateName) => {
		const slateName = _slateName.includes(' ') ? `"${_slateName}"` : _slateName;
		csvText += ` ${slateName},`;
	});
	csvText = csvText.slice(0, -1);
	csvText += `\n`;
	const numSeats = Object.keys(data[slates[0]]).sort((a, b) => parseInt(a) - parseInt(b));
	numSeats.forEach((numSeat) => {
		csvText += ` ${numSeat},`;
		slates.forEach((slateName) => {
			csvText += ` ${data[slateName][numSeat as any]},`;
		});
		csvText = csvText.slice(0, -1);
		csvText += `\n`;
	});

	const blob = new Blob([csvText], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${results.id}.csv`;
	a.click();
};
