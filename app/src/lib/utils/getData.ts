import { PUBLIC_CDN_URL } from '$env/static/public';
import { IS_DEV } from '$lib/constants';

export const getData = async (id: string) => {
	const url = IS_DEV ? `/results/${id}.json` : `${PUBLIC_CDN_URL}/${id}.json`;
	console.log('CHECKING DATA FOR', id, 'AT', url);
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return {
				ok: false,
				message: 'Data not found'
			};
		}
		return {
			ok: true,
			data: await response.json()
		};
	} catch (error) {
		console.error('Error getting data:', error);
		return {
			ok: false,
			message: 'Error getting data'
		};
	}
};
