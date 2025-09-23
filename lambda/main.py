"""
AWS Lambda containerized entrypoint.

This module exposes a `handler` function compatible with AWS Lambda. It is
kept intentionally minimal so it can be extended later. The container image
will be built and pushed to ECR, and the Lambda will reference that image.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict
from common_schema import validation_schema
import jsonschema

from votekit.ballot_generator import (
    BlocSlateConfig,
    slate_pl_profile_generator,
    slate_bt_profile_generator,
    cambridge_profile_generator,
)
from votekit.pref_profile import (
    RankProfile,
    convert_rank_profile_to_score_profile_via_score_vector,
)


from votekit.elections import STV, BlocPlurality

STRONG_ALPHA = 1 / 2
UNIF_ALPHA = 2

ALPHA_MAP = {"all_bets_off": 1, "strong": STRONG_ALPHA, "unif": UNIF_ALPHA}


def _convert_event_to_votekit_config(event: Dict[str, Any]) -> BlocSlateConfig:
    """
    Convert the event to a Votekit BlocSlateConfig

    Args:
        event (Dict[str, Any]): The event to convert to a Votekit BlocSlateConfig

    Returns:
        BlocSlateConfig: The Votekit BlocSlateConfig


    Doctests:
    """
    config = BlocSlateConfig(
        n_voters=event["numVoters"],
        slate_to_candidates={
            slate_name: [
                f"{slate_name}_{i}" for i in range(slate_data["numCandidates"])
            ]
            for slate_name, slate_data in event["slates"].items()
        },
        bloc_proportions={
            bloc_name: bloc_data["proportion"]
            for bloc_name, bloc_data in event["voterBlocs"].items()
        },
        cohesion_mapping={
            bloc_name: bloc_data["cohesion"]
            for bloc_name, bloc_data in event["voterBlocs"].items()
        },
    )
    config.set_dirichlet_alphas(
        alphas={
            bloc_name: {
                slate_name: ALPHA_MAP[bloc_data["preference"][slate_name]]
                for slate_name in event["slates"].keys()
            }
            for bloc_name, bloc_data in event["voterBlocs"].items()
        }
    )
    return config


def _generate_profile(
    config: BlocSlateConfig, ballot_generator: str, max_ranking_length: int
) -> RankProfile:
    f"""
    Generate the profile

    Args:
        config (BlocSlateConfig): The Votekit BlocSlateConfig
        ballot_generator (str): The ballot generator to use. sPL, sBT, or CS.
        max_ranking_length (int): The maximum ranking length to return.

    Returns:
        RankProfile: The generated profile, truncated to the max ranking length.

    Doctests:
        >>> config = BlocSlateConfig(
        ...     n_voters=100,
        ...     slate_to_candidates={"slate1": ["c1", "c2", "c3"], "slate2": ["d1", "d2", "d3"]},
        ...     bloc_proportions={"bloc1": 0.5, "bloc2": 0.5},
        ...     cohesion_mapping={"bloc1": {"slate1": .6, "slate2": .4}, 
        ...                         "bloc2": {"slate1": .7, "slate2": .3}},
        ... )
        >>> config.set_dirichlet_alphas(
        ...     alphas={"bloc1": {"slate1": 1, "slate2": 2}, "bloc2": {"slate1": 1/2, "slate2": 1/2}}
        ... )
        >>> profile = _generate_profile(config, "sPL", 3)
        >>> profile.max_ranking_length == 3 and profile.total_ballot_wt == 100
        True
        >>> profile = _generate_profile(config, "sBT", 6)
        >>> profile.max_ranking_length == 6 and profile.total_ballot_wt == 100
        True
        >>> profile = _generate_profile(config, "CS", 4)
        >>> profile.max_ranking_length == 4 and profile.total_ballot_wt == 100
        True
    """
    if ballot_generator == "sBT":
        profile = slate_bt_profile_generator(config)
    elif ballot_generator == "sPL":
        profile = slate_pl_profile_generator(config)
    elif ballot_generator == "CS":
        # TODO handle that 2 bloc and 2 slates, and have to name match.
        # each bloc must have a distinct >.5 preferred slate
        profile = cambridge_profile_generator(config)
    else:
        raise ValueError(f"Invalid ballot generator: {ballot_generator}.")

    if max_ranking_length < profile.max_ranking_length:
        profile = _truncate_profile(profile, max_ranking_length)
    return profile


def _truncate_profile(profile: RankProfile, new_max_ranking_length: int):
    """
    Truncate the profile to the new max ranking length.

    Args:
        profile (RankProfile): The profile to truncate.
        new_max_ranking_length (int): The new max ranking length.

    Returns:
        RankProfile: The truncated profile.

    Doctests:
        >>> import pandas as pd
        >>> df = pd.DataFrame({"Ranking_1": [frozenset({"Chris"})], "Ranking_2": [frozenset({"Peter"})],
        ...                     "Ranking_3": [frozenset({"Dylan"})], "Weight": [2], "Voter Set": [set()]})
        >>> df.index.name = "Ballot Index"
        >>> profile = RankProfile(df=df, max_ranking_length=3, candidates=["Chris", "Peter", "Dylan"])
        >>> truncated_profile = _truncate_profile(profile, 2)
        >>> truncated_profile.max_ranking_length == 2 and "Ranking_3" not in truncated_profile.df.columns
        True
        >>> bool(truncated_profile.total_ballot_wt == 2)
        True
    """
    return RankProfile(
        df=profile.df.drop(
            columns=[
                f"Ranking_{i+1}"
                for i in range(new_max_ranking_length, profile.max_ranking_length)
            ]
        ),
        candidates=profile.candidates,
        max_ranking_length=new_max_ranking_length,
    )


def _run_election(
    profile: RankProfile,
    election_dict: dict[str, Any],
    slate_to_candidates: dict[str, list[str]],
):
    """
    Run the election.

    Args:
        profile (RankProfile): The profile to run the election on.
        election_dict (dict[str, Any]): The election dictionary, which is a subset of the JSON
            event.
        slate_to_candidates (dict[str, list[str]]): The slate to candidates mapping.

    Returns:
        dict[str, int]: Number of elected candidates by slate.

    Doctests:
        >>> import pandas as pd
        >>> df = pd.DataFrame({"Ranking_1": [frozenset({"Chris"})], "Ranking_2": [frozenset({"Peter"})],
        ...                     "Ranking_3": [frozenset({"Dylan"})], "Weight": [2], "Voter Set": [set()]})
        >>> df.index.name = "Ballot Index"
        >>> profile = RankProfile(df=df, max_ranking_length=3, candidates=["Chris", "Peter", "Dylan"])
        >>> slate_to_candidates={"slate1": ["Chris"], "slate2": ["Dylan", "Peter"]}
        >>> election_dict = {"numSeats": 1, "system": "STV", "maxBallotLength": 3}
        >>> num_elected_by_slate = _run_election(profile, election_dict, slate_to_candidates)
        >>> num_elected_by_slate == {"slate1": 1, "slate2": 0}
        True
        >>> election_dict = {"numSeats": 1, "system": "blocPlurality", "maxBallotLength": 3}
        >>> num_elected_by_slate = _run_election(profile, election_dict, slate_to_candidates)
        >>> num_elected_by_slate == {"slate1": 1, "slate2": 0}
        True
    """
    m = election_dict["numSeats"]
    system = election_dict["system"]
    if system == "blocPlurality":
        profile = convert_rank_profile_to_score_profile_via_score_vector(
            profile, score_vector=[1] * m
        )  # each candidate in the top m of the ranking gets an approval score of 1
        election = BlocPlurality(profile=profile, m=m, tiebreak="random")
    elif system == "STV":
        election = STV(profile=profile, m=m)
    else:
        raise ValueError(f"Invalid election system: {election_dict['system']}.")

    elected = [c for c_set in election.get_elected() for c in c_set]
    num_elected_by_slate = {
        slate_name: len([c for c in slate_cand_list if c in elected])
        for slate_name, slate_cand_list in slate_to_candidates.items()
    }

    return num_elected_by_slate


def _run_simulations(
    num_trials: int,
    ballot_generator: str,
    config: BlocSlateConfig,
    election_dict: dict[str, Any],
) -> dict[str, list[int]]:
    """Run the simulations


    Returns:
        dict[str, list[int]]: Number of elected candidates by slate for each trial.
    """

    results = {slate_name: [-1] * num_trials for slate_name in config.slates}
    for i in range(num_trials):
        profile = _generate_profile(
            config=config,
            ballot_generator=ballot_generator,
            max_ranking_length=election_dict["maxBallotLength"],
        )
        num_elected_by_slate = _run_election(
            profile=profile,
            election_dict=election_dict,
            config=config,
        )

        for slate_name, num_elected in num_elected_by_slate.items():
            results[slate_name][i] = num_elected

        config.resample_preference_intervals_from_dirichlet_alphas()

    if any(
        any(trial_result == -1 for trial_result in result_list)
        for result_list in results.values()
    ):
        raise ValueError("Some trials resulted in an error.")
    return results


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Basic Lambda handler.

    - Echoes the incoming event
    - Includes environment metadata helpful for diagnostics
    """
    try:
        jsonschema.validate(event, validation_schema)
    except jsonschema.exceptions.ValidationError as e:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"message": "Invalid event", "errors": str(e)}),
        }

    config = _convert_event_to_votekit_config(event)

    try:
        config.is_valid(raise_errors=True)
    except Exception as e:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"message": "Invalid config", "errors": str(e)}),
        }

    results = _run_simulations(
        num_trials=event["trials"],
        ballot_generator=event["ballotGenerator"],
        config=config,
        election_dict=event["election"],
    )

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(
            {
                "message": "votekit lambda simulation results",
                "results": results,
                "env": {
                    "AWS_REGION": os.getenv("AWS_REGION"),
                    "AWS_EXECUTION_ENV": os.getenv("AWS_EXECUTION_ENV"),
                },
            }
        ),
    }


if __name__ == "__main__":
    # Simple local test harness
    print(
        json.dumps(
            handler({"local": True, "ping": "pong"}, context=None),
            indent=2,
        )
    )
