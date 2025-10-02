import boto3
from collections import Counter
import json
import os

S3_BUCKET = os.getenv("RESULTS_S3_BUCKET")
RESULTS_OUTPUT = os.getenv("RESULTS_OUTPUT")
s3 = boto3.client('s3')

def write_results(id: str, results: dict[str, Counter], config: dict) -> None:
    """
    Write simulation results to either local disk or S3.

    Args:
        id (str): The identifier for the results file.
        results (dict[str, Counter]): The results dictionary.
        config (dict): The configuration dictionary.

    Returns:
        None

    Doctests:
        >>> import os, json, tempfile
        >>> from collections import Counter
        >>> os.environ["RESULTS_OUTPUT"] = "local"
        >>> write_results("testid", {"A": Counter({"x": 1})}, {"foo": "bar"})
        >>> with open(os.path.join("/output", "testid.json")) as f:
        ...     data = json.load(f)
        >>> data["status"] == "success" and data["results"] == {"A": {"x": 1}} and data["config"] == {"foo": "bar"}
        True
        >>> os.remove(os.path.join("/output", "testid.json"))
    """
    combined_results = {
        "status": "success",
        "results": results,
        "config": config
    }
    if RESULTS_OUTPUT == "local":
        with open(f"/output/{id}.json", "w") as f:
            json.dump(combined_results, f)
    else:
        s3.put_object(Bucket=S3_BUCKET, Key=f"{id}.json", Body=json.dumps(combined_results))

def write_error(id: str, error: str) -> None:
    """
    Write an error message to either local disk or S3.

    Args:
        id (str): The identifier for the error file.
        error (str): The error message.

    Returns:
        None

    Doctests:
        >>> import os, json, tempfile
        >>> os.environ["RESULTS_OUTPUT"] = "local"
        >>> write_error("errid", "something went wrong")
        >>> with open(os.path.join("/output", "errid.json")) as f:
        ...     data = json.load(f)
        >>> data["status"] == "error" and data["error"] == "something went wrong"
        True
        >>> os.remove(os.path.join("/output", "errid.json"))
    """
    combined_results = {
        "status": "error",
        "error": error
    }
    if RESULTS_OUTPUT == "local":
        with open(f"/output/{id}.json", "w") as f:
            json.dump(combined_results, f)
    else:
        s3.put_object(Bucket=S3_BUCKET, Key=f"{id}.json", Body=json.dumps(combined_results))

if __name__ == "__main__":
    import doctest
    doctest.testmod()