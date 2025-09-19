import { writeFileSync } from 'fs';
import { VotekitConfigSchema } from '../src/lib/types/votekitConfig';
import { toJSONSchema } from 'zod';

const jsonSchema = toJSONSchema(VotekitConfigSchema);
const stringifiedSchema = JSON.stringify(jsonSchema, null, 2);
// replace false with False when there is a space before it or a comma after it
const formattedSchema = stringifiedSchema
	.replace(/,\s*false/g, ', False')
	.replace(/\s*false/g, ' False');
writeFileSync('/lambda/common_schema.py', `validation_schema = ${formattedSchema}`);
