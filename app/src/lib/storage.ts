export type SlateConfig = {
  slateA: { numCandidates: number };
  slateB: { numCandidates: number };
};

export type VoterPreference = 'strong' | 'random' | 'indifferent';

export type BlocCrossPreferences = {
  forA: VoterPreference;
  forB: VoterPreference;
};

export type VoterBlocConfig = {
  blocA: { count: number; preference: BlocCrossPreferences; cohesionPct: number };
  blocB: { count: number; preference: BlocCrossPreferences; cohesionPct: number };
} | Array<{ count: number; preference: BlocCrossPreferences; cohesionPct: number }>;

export type ElectionConfig =
  | { mode: 'plurality' }
  | { mode: 'multiseat'; stv: true; numSeats: number };

export type RunParams = {
  id: string;
  name: string;
  voterBlocs: VoterBlocConfig;
  slates: SlateConfig;
  election: ElectionConfig;
  ballotGenerator: 'sBT' | 'sPL' | 'CS';
  trials: number;
  maxRankingCandidates?: number;
  numSlates?: number;
  slateCandidates?: number[];
  slateNames?: string[];
  numVoterBlocs?: number;
  blocCounts?: number[];
  blocShares?: number[];
  blocNames?: string[];
  blocPopulations?: number[];
  blocTurnouts?: number[];
  blocPreferences?: VoterPreference[][];
  blocCohesion?: number[][];
  voterBlocMode?: 'count' | 'share';
  totalVoters?: number;
  createdAt: number;
};

export type RunResult = {
  slateAElected: number[]; // histogram raw data per trial
  slateBElected: number[];
};

export type Run = {
  params: RunParams;
  result: RunResult;
};

const RUNS_KEY = 'votekit_runs';

function readRuns(): Run[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(RUNS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Run[];
  } catch {
    return [];
  }
}

function writeRuns(runs: Run[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
}

export function listRuns(): Run[] {
  return readRuns().sort((a, b) => b.params.createdAt - a.params.createdAt);
}

export function getRun(id: string): Run | undefined {
  return readRuns().find((r) => r.params.id === id);
}

export function saveRun(run: Run) {
  const runs = readRuns();
  runs.unshift(run);
  writeRuns(runs.slice(0, 50));
}

export function randomRunName(): string {
  const adjectives = ['Swift', 'Crimson', 'Emerald', 'Silent', 'Lucky', 'Brave', 'Neon', 'Clever'];
  const animals = ['Falcon', 'Otter', 'Lion', 'Fox', 'Panda', 'Eagle', 'Whale', 'Cobra'];
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const b = animals[Math.floor(Math.random() * animals.length)];
  const n = Math.floor(Math.random() * 900 + 100);
  return `${a} ${b} ${n}`;
}

export function mockHistogramData(trials: number, slateAShare = 0.5, maxSeats = 5) {
  // Simulate electing 0..maxSeats candidates per trial; returns frequency array length maxSeats+1
  const freq = new Array(maxSeats + 1).fill(0);
  for (let i = 0; i < trials; i++) {
    const seatsA = Math.max(0, Math.min(maxSeats, Math.round((slateAShare + (Math.random() - 0.5) * 0.3) * maxSeats)));
    freq[seatsA]++;
  }
  return freq;
}


