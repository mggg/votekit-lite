import type { VotekitConfig } from "$lib/types/votekitConfig";

export const twoBlocTwoSlate: VotekitConfig = {
  id: "test-123",
  name: "Test Run",
  numVoters: 100,
  voterBlocs: {
    bloc1: {
      proportion: 0.5,
      preference: {
        slate1: "all_bets_off",
        slate2: "strong"
      },
      cohesion: {
        slate1: 0.7,
        slate2: 0.3
      },
    },
    bloc2: {
      proportion: 0.5,
      preference: {
        slate1: "all_bets_off",
        slate2: "strong"
      },
      cohesion: {
        slate1: 0.6,
        slate2: 0.4
      },
    }
  },
  slates: {
    slate1: {
      numCandidates: 3
    },
    slate2: {
      numCandidates: 3
    }
  },
  election: {
    system: "STV",
    numSeats: 5,
    maxBallotLength:6
  },
  ballotGenerator: "sPL",
  trials: 100,
  createdAt: "1700000000000"
}

export const twoBlocThreeSlate: VotekitConfig = {
  id: "test-123",
  name: "Test Run",
  numVoters: 100,
  voterBlocs: {
    bloc1: {
      proportion: 0.5,
      preference: {
        slate1: "all_bets_off",
        slate2: "strong",
        slate3: "unif",
      },
      cohesion: {
        slate1: 0.6,
        slate2: 0.3,
        slate3: 0.1,
      },
    },
    bloc2: {
      proportion: 0.5,
      preference: {
        slate1: "strong",
        slate2: "strong",
        slate3: "unif",
      },
      cohesion: {
        slate1: 0.7,
        slate2: 0.2,
        slate3: 0.1,
      },
    }
  },
  slates: {
    slate1: {
      numCandidates: 3
    },
    slate2: {
      numCandidates: 3
    },
    slate3: {
      numCandidates: 4
    }
  },
  election: {
    system: "blocPlurality",
    numSeats: 3,
    maxBallotLength:10
  },
  ballotGenerator: "sBT",
  trials: 50,
  createdAt: "1700000000000"
}

export const threeBlocThreeSlate: VotekitConfig = {
  id: "test-123",
  name: "Test Run",
  numVoters: 100,
  voterBlocs: {
    bloc1: {
      proportion: 50/600,
      preference: {
        slate1: "all_bets_off",
        slate2: "strong",
      },
      cohesion: {
        slate1: 0.6,
        slate2: 0.3,
      },
    },
    bloc2: {
      proportion: 50/600,
      preference: {
        slate1: "strong",
        slate2: "strong",
      },
      cohesion: {
        slate1: 0.7,
        slate2: 0.2,
      },
    },
    bloc3: {
      proportion: 500/600,
      preference: {
        slate1: "unif",
        slate2: "strong",
      },
      cohesion: {
        slate1: 0.7,
        slate2: 0.2,
      },
    }
  },
  slates: {
    slate1: {
      numCandidates: 3
    },
    slate2: {
      numCandidates: 3
    }
  },
  election: {
    system: "blocPlurality",
    numSeats: 3,
    maxBallotLength:3
  },
  ballotGenerator: "CS",
  trials: 50,
  createdAt: "1700000000000"
}

export const threeBlocFourSlate: VotekitConfig = {
  id: "test-123",
  name: "Test Run",
  numVoters: 100,
  voterBlocs: {
    bloc1: {
      proportion: 50/600,
      preference: {
        slate1: "all_bets_off",
        slate2: "strong",
        slate3: "unif",
      },
      cohesion: {
        slate1: 0.6,
        slate2: 0.3,
        slate3: 0.1,
      },
    },
    bloc2: {
      proportion: 50/600,
      preference: {
        slate1: "strong",
        slate2: "strong",
        slate3: "unif",
      },
      cohesion: {
        slate1: 0.7,
        slate2: 0.2,
        slate3: 0.1,
      },
    },
    bloc3: {
      proportion: 500/600,
      preference: {
        slate1: "unif",
        slate2: "strong",
        slate3: "unif",
      },
      cohesion: {
        slate1: 0.7,
        slate2: 0.2,
        slate3: 0.1,
      },
    }
  },
  slates: {
    slate1: {
      numCandidates: 3
    },
    slate2: {
      numCandidates: 3
    },
    slate3: {
      numCandidates: 4
    }
  },
  election: {
    system: "blocPlurality",
    numSeats: 3,
    maxBallotLength:10
  },
  ballotGenerator: "sBT",
  trials: 50,
  createdAt: "1700000000000"
}