export const shareUrl = (id: string) => {
	// try navigator, if not, use window.location
	// copy to clipboard with query param result-share=id
	if (navigator.clipboard) {
		navigator.clipboard.writeText(window.location.href + '?result-share=' + id);
		return true;
	} else {
		const textarea = document.createElement('textarea');
		textarea.value = window.location.href + '?result-share=' + id;
		textarea.select();
		document.execCommand('copy');
		textarea.remove();
		return true;
	}
};
