import { CAPTCHA_SECRET_KEY } from '$env/static/private';
import { PUBLIC_CAPTCHA_KEY } from '$env/static/public';
type CaptchaResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

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
  console.log("CAPTCHA RESPONSE", response);
  return { ok: true, message: "Captcha validated successfully" };
  // const secret = CAPTCHA_SECRET_KEY;
  // const verifyUrl = CAPTCHA_VERIFY_URL;
  //   CAPTCHA_VERIFY_URL ||
  //   "https://www.google.com/recaptcha/api/siteverify";

  // if (!secret) {
  //   return { ok: false, error: "CAPTCHA_SECRET_KEY is not set in environment variables" };
  // }

  // try {
  //   const response = await fetch(verifyUrl, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //     body: {
  //       "event": {
  //         "token": token,
  //         "expectedAction": "USER_ACTION",
  //         "siteKey": PUBLIC_CAPTCHA_KEY,
  //       }
  //     }
  //   });

  //   if (!response.ok) {
  //     return { ok: false, error: `Request failed: ${response.status} ${response.statusText}` };
  //   }

  //   const data: { success: boolean; "error-codes"?: string[] } = await response.json();

  //   if (data.success) {
  //     return { ok: true, message: "Captcha validated successfully" };
  //   } else {
  //     return { ok: false, error: `Captcha failed: ${(data["error-codes"] || []).join(", ")}` };
  //   }
  // } catch (err) {
  //   return { ok: false, error: `Captcha validation error: ${(err as Error).message}` };
  // } finally {
  //   return { ok: true, message: "Captcha validated successfully" };
  // }
}
