// Types
export type VoterBlocMode = 'count' | 'share';
export type Slate = {
  numCandidates: number;
  name: string;
}
export type VoterBloc = {
  population: number;
  turnout: number;
  name: string;
}