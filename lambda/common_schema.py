validation_schema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "voterBlocs": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "type": "object",
        "properties": {
          "count": {
            "type": "number"
          },
          "preference": {
            "type": "object",
            "propertyNames": {
              "type": "string"
            },
            "additionalProperties": {
              "anyOf": [
                {
                  "type": "string",
                  "const": "all_bets_off"
                },
                {
                  "type": "string",
                  "const": "strong"
                },
                {
                  "type": "string",
                  "const": "unif"
                }
              ]
            }
          },
          "cohesion": {
            "type": "object",
            "propertyNames": {
              "type": "string"
            },
            "additionalProperties": {
              "type": "number"
            }
          }
        },
        "required": [
          "count",
          "preference",
          "cohesion"
        ],
        "additionalProperties": false
      }
    },
    "slates": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "type": "object",
        "properties": {
          "numCandidates": {
            "type": "number"
          }
        },
        "required": [
          "numCandidates"
        ],
        "additionalProperties": false
      }
    },
    "election": {
      "type": "object",
      "properties": {
        "mode": {
          "type": "string"
        },
        "numSeats": {
          "type": "number"
        },
        "maxBallotLength": {
          "type": "number"
        }
      },
      "required": [
        "mode",
        "numSeats",
        "maxBallotLength"
      ],
      "additionalProperties": false
    },
    "ballotGenerator": {
      "type": "string"
    },
    "trials": {
      "type": "number"
    },
    "createdAt": {
      "type": "string"
    }
  },
  "required": [
    "id",
    "name",
    "voterBlocs",
    "slates",
    "election",
    "ballotGenerator",
    "trials",
    "createdAt"
  ],
  "additionalProperties": false
}