import boto3
from collections import Counter
import json
import os

S3_BUCKET = os.getenv("RESULTS_S3_BUCKET")
RESULTS_OUTPUT = os.getenv("RESULTS_OUTPUT")
s3 = boto3.client('s3')

def write_results(id: str, results: dict[str, Counter], config: dict) -> None:
  combined_results = {
    "status": "success",
    "results": results,
    "config": config
  }
  print(f"Writing results to {RESULTS_OUTPUT}")
  if RESULTS_OUTPUT == "local":
    with open(f"/output/{id}.json", "w") as f:
      json.dump(combined_results, f)
  else:
    print(f"Writing results to {S3_BUCKET}")
    s3.put_object(Bucket=S3_BUCKET, Key=f"{id}.json", Body=json.dumps(combined_results))

def write_error(id: str, error: str) -> None:
  combined_results = {
    "status": "error",
    "error": error
  }
  print(f"Writing error to {RESULTS_OUTPUT}")
  if RESULTS_OUTPUT == "local":
    with open(f"/output/{id}.json", "w") as f:
      json.dump(combined_results, f)
  else:
    print(f"Writing error to {S3_BUCKET}")
    s3.put_object(Bucket=S3_BUCKET, Key=f"{id}.json", Body=json.dumps(combined_results))