import { z } from "zod";


const PreferenceValuesSchema = z.union([
  z.literal("all_bets_off"),
  z.literal("strong"),
  z.literal("unif"),
]);

// Schema for a single bloc's preferences, keyed by bloc identifiers
const PreferenceSchema = z.record(z.string(), PreferenceValuesSchema);
const CohesionSchema  = z.record(z.string(), z.coerce.number());
// Voter bloc schema
const BlocSchema = z.object({
  proportion: z.coerce.number(),
  preference: PreferenceSchema,
  cohesion: CohesionSchema,
});

// Slate schema with number coercion
const SlateSchema = z.object({
  numCandidates: z.coerce.number(),
});

// Election schema
const ElectionSchema = z.object({
  system: z.union([   
    z.literal("STV"),
    z.literal("blocPlurality"),
  ]),
  numSeats: z.coerce.number(),
  maxBallotLength: z.coerce.number()

});

// Main config schema
export const VotekitConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  voterBlocs: z.record(z.string(), BlocSchema),
  slates: z.record(z.string(), SlateSchema),
  election: ElectionSchema,
  ballotGenerator: z.union([
    z.literal("sBT"),
    z.literal("sPL"),
    z.literal("CS"),
  ]),
  trials: z.coerce.number(),
  createdAt: z.string(),
});

// Example type
export type VotekitConfig = z.infer<typeof VotekitConfigSchema>;
export type VoterPreference = z.infer<typeof PreferenceValuesSchema>;
