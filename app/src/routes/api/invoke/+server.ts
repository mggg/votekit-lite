import type { RequestHandler } from './$types';
import { VotekitConfigSchema, type VotekitConfig } from '../../../lib/types/votekitConfig';
import { invoke } from '../../../lib/server/lambda/invoke';
import { validateTurnstile } from '$lib/server/captcha/validate';

interface InvokeRequest {
	turnstileToken: string;
	votekitConfig: VotekitConfig;
}
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = (await request.json()) as InvokeRequest;
		const { turnstileToken, votekitConfig } = data;
		// VALIDATE CAPTCHA
		const captchaResult = await validateTurnstile(turnstileToken);
		if (!captchaResult.success) {
			return new Response(
				JSON.stringify({
					error: 'Captcha error: ' + captchaResult['error-codes'].join(', ')
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}

		// PARSE REQUEST
		const parsedVotekitConfig = VotekitConfigSchema.parse(votekitConfig);

		// INVOKE LAMBDA
		const response = await invoke(parsedVotekitConfig);
		return new Response(JSON.stringify(response), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error invoking lambda:', error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};
