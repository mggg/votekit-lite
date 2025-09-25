import { env } from '$env/dynamic/private';
const { CAPTCHA_SECRET_KEY } = env;
type CaptchaResult =
	| { success: true; challenge_ts: string; hostname: string }
	| { success: false; 'error-codes': string[] };

/**
 * Validate a captcha token with the configured provider
 * Supports Google reCAPTCHA or hCaptcha
 */
export const validateCaptcha = async (token: string): Promise<CaptchaResult> => {
	const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			secret: CAPTCHA_SECRET_KEY!, // from Google console
			response: token
		})
	});

	const response = await res.json();
	return response;
};
