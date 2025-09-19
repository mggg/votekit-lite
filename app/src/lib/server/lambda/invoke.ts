import { LambdaClient, InvokeCommand, type LambdaClientConfig } from '@aws-sdk/client-lambda';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { type VotekitConfig } from '../../../lib/types/votekitConfig';
import { env } from '$env/dynamic/private';
import { IS_DEV } from '../../../lib/constants';

const { LAMBDA_FUNCTION_NAME, INVOKER_ROLE_ARN, AWS_STS_ACCESS_KEY_ID, AWS_STS_SECRET_ACCESS_KEY } =
	env;
const invokeLambdaDev = async (votekitConfig: VotekitConfig) => {
	const response = await fetch('http://votekit-lambda-dev:8000/invoke', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(votekitConfig)
	});

	if (!response.ok) {
		throw new Error(
			`Lambda dev server responded with status ${response.status}: ${await response.text()}`
		);
	}

	return await response.json();
};

const invokeLambdaProd = async (votekitConfig: VotekitConfig) => {
	if (!AWS_STS_ACCESS_KEY_ID || !AWS_STS_SECRET_ACCESS_KEY) {
		throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set');
	}
	// Your base credentials (AWS env vars)
	const sts = new STSClient({
		region: 'us-east-2', // change if needed
		credentials: {
			accessKeyId: AWS_STS_ACCESS_KEY_ID,
			secretAccessKey: AWS_STS_SECRET_ACCESS_KEY
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

	if (
		!assumeRoleRes.Credentials ||
		!assumeRoleRes.Credentials.AccessKeyId ||
		!assumeRoleRes.Credentials.SecretAccessKey ||
		!assumeRoleRes.Credentials.SessionToken
	) {
		throw new Error('Failed to assume role');
	}

	const tempCreds = {
		accessKeyId: assumeRoleRes.Credentials.AccessKeyId!,
		secretAccessKey: assumeRoleRes.Credentials.SecretAccessKey!,
		sessionToken: assumeRoleRes.Credentials.SessionToken!
	} as any;

	// Use temporary creds to make a Lambda client
	const lambda = new LambdaClient({
		region: 'us-east-2',
		credentials: tempCreds
	} as LambdaClientConfig);

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

const invoke = IS_DEV ? invokeLambdaDev : invokeLambdaProd;

export { invoke };
