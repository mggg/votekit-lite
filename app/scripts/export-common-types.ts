import { writeFileSync } from "fs";
import { VotekitConfigSchema } from "../src/lib/types/votekitConfig";
import { toJSONSchema } from "zod";

const jsonSchema = toJSONSchema(VotekitConfigSchema);
const stringifiedSchema = JSON.stringify(jsonSchema, null, 2);
writeFileSync("/lambda/common_schema.py", `validation_schema = ${stringifiedSchema}`);
