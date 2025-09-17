import type { RequestHandler } from './$types';
import { VotekitConfigSchema, type VotekitConfig } from '../../../lib/types/votekitConfig';
import { invoke } from '../../../lib/server/lambda/invoke';
import { validateCaptcha } from '$lib/server/captcha/validate';

interface InvokeRequest {
  captchaToken: string;
  votekitConfig: VotekitConfig;
}
export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json() as InvokeRequest; 
    const { captchaToken, votekitConfig } = data;

    // VALIDATE CAPTCHA
    const captchaResult = await validateCaptcha(captchaToken);
    if (!captchaResult.success) {
      return new Response(JSON.stringify({ 
        error: captchaResult['error-codes'] 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
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
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
