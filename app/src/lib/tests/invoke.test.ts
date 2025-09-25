// src/routes/api/todos/+server.test.ts
import { describe, it, expect } from 'vitest';
import * as sampleConfigs from '$lib/tests/configs/sampleConfigs';
import { VotekitConfigSchema } from '$lib/types/votekitConfig';

const runTestConfig = async (config: any) => {
	const req = new Request('http://localhost:5173/api/invoke', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			votekitConfig: config,
			captchaToken: '1234567890'
		})
	});
	return await fetch(req);
};

describe('POST /api/invoke', () => {
	Object.entries(sampleConfigs).forEach(([key, config]) => {
		it(`Invokes a lambda function with good configs: ${key}`, async () => {
			const res = await runTestConfig(config);
			const data = await res.json();
			expect(res.ok).toBe(true);
		}, 10000); // 10 seconds timeout
	});
	it('Fails a bad configs', async () => {
		const badConfig = {
			...sampleConfigs.twoBlocTwoSlate,
			voterBlocs: {
				bloc1: {
					...sampleConfigs.twoBlocTwoSlate.voterBlocs.bloc1,
					proportion: 'not a number'
				}
			}
		};
		const res = await runTestConfig(badConfig);
		const data = await res.json();
		const error = JSON.parse(data.error);
		expect(error[0].expected).toBe('number');
		expect(error[0].code).toBe('invalid_type');
		expect(error[0].received).toBe('NaN');
		expect(error[0].message).toBe('Invalid input: expected number, received NaN');
	});
});
