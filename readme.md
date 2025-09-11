# VoteKit Frontend

## Repo Structure

### App
SvelteKit based frontend application. SvelteKit lives on top of Svelte and provides light backend functionality and SSR (Server side rendering)

### Lambda
Python function to handle VoteKit simulations and requests
Small FastAPI server for local dev and running this as a local package

### Infra
Pulumi scripts to deploy AWS Lambda function