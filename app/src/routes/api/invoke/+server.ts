import { LambdaClient, InvokeCommand, InvokeCommand } from '@aws-sdk/client-lambda';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { VotekitConfigSchema, type VotekitConfig } from '../../../lib/types/votekitConfig';
import type { RequestHandler } from './$types';
import { dev as IS_DEV } from '$app/environment';
import  {LAMBDA_FUNCTION_NAME, INVOKER_ROLE_ARN, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} from '$env/static/private';
const invokeLambdaDev = async (votekitConfig: VotekitConfig) => {
	return await fetch('http://localhost:8000/invoke', {
		method: 'POST',
		body: JSON.stringify(votekitConfig)
	});
};

const invokeLambdaProd = async (votekitConfig: VotekitConfig) => {
	if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
		throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set');
	}
	// Your base credentials (AWS env vars)
	const sts = new STSClient({
		region: 'us-east-2', // change if needed
		credentials: {
			accessKeyId: AWS_ACCESS_KEY_ID,
			secretAccessKey: AWS_SECRET_ACCESS_KEY
		}
	});

	// Assume the role
	const assumeRoleRes = await sts.send(
		new AssumeRoleCommand({
			RoleArn: INVOKER_ROLE_ARN, // pick the exact role ARN
			RoleSessionName: 'invocation-session',
			DurationSeconds: 900
		})
	);

	if (!assumeRoleRes.Credentials) {
		throw new Error('Failed to assume role');
	}

	const tempCreds = {
		accessKeyId: assumeRoleRes.Credentials.AccessKeyId,
		secretAccessKey: assumeRoleRes.Credentials.SecretAccessKey,
		sessionToken: assumeRoleRes.Credentials.SessionToken
	};

	// Use temporary creds to make a Lambda client
	const lambda = new LambdaClient({
		region: 'us-east-2',
		credentials: tempCreds
	});

	// Invoke the Lambda
	const response = await lambda.send(
		new InvokeCommand({
			FunctionName: LAMBDA_FUNCTION_NAME, // update with your Lambda’s name
			Payload: Buffer.from(JSON.stringify(votekitConfig))
		})
	);

	// Parse response payload
	const payload = response.Payload ? JSON.parse(Buffer.from(response.Payload).toString()) : null;

	return payload;
};

export const POST: RequestHandler = async ({ request }) => {
  // Parse the request body
  // If the client sends JSON, use request.json()
  const data = await request.json(); 
	const votekitConfig = VotekitConfigSchema.parse(data);
	const invokeFn = IS_DEV ? invokeLambdaDev : invokeLambdaProd;
  const response = await invokeFn(votekitConfig);
	return new Response(JSON.stringify(response), {
		status: 200
	});
}
