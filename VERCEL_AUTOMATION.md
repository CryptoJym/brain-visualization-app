# Vercel Deployment Automation

This project now includes tooling to automate Vercel deployments across many repositories while keeping credentials under your control.

## Structure

- `ci-templates/.github/workflows/vercel-deploy.yml` &mdash; Reusable GitHub Actions workflow that performs the `vercel pull`, `vercel build`, and `vercel deploy` steps. It is designed to be stored in a dedicated `ci-templates` repository and invoked via `workflow_call`.
- `scripts/` &mdash; Helper scripts that use the GitHub CLI (`gh`) to set organisation or repository secrets in bulk.
  - `set_org_secrets.sh` – stores `VERCEL_TOKEN` and `VERCEL_ORG_ID` as org-level secrets.
  - `set_repo_secret.sh` – stores `VERCEL_PROJECT_ID` for a single repository.
  - `bulk_set_repo_secrets.sh` – reads `<repo> <project_id>` pairs from a file and sets secrets for many repos.

## Usage Overview

1. **Publish the template workflow**
   - Create (or reuse) a central repo such as `ci-templates` in your GitHub org.
   - Copy the contents of `ci-templates/` from this project into that repo so the workflow lives at `.github/workflows/vercel-deploy.yml`.
   - Commit and push.

2. **Set organisation-level secrets once**
   - Generate a Vercel token and retrieve your Vercel org ID.
   - Run:
     ```bash
     ./scripts/set_org_secrets.sh <org> <vercel_token> <vercel_org_id>
     ```
   - This stores the secrets so any repository can call the workflow without copying the token again.

3. **Wire repositories to the shared workflow**
   - In each project, add a GitHub Actions workflow that calls the shared one, e.g.
     ```yaml
     name: Deploy to Vercel

     on:
       push:
         branches: [main]
       pull_request:

     jobs:
       deploy:
         uses: <org>/ci-templates/.github/workflows/vercel-deploy.yml@main
         secrets:
           VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
           VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
           VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
     ```

4. **Set the per-project secret**
   - Each Vercel project has its own `VERCEL_PROJECT_ID`.
   - Store it once with:
     ```bash
     ./scripts/set_repo_secret.sh <org>/<repo> <project_id>
     ```
     or use the bulk script to handle many repos.

5. **Push code → automatic deploys**
   - Every push to `main` triggers a production deploy; PRs get preview URLs.
   - Rotating the organisation-level token only requires re-running `set_org_secrets.sh`.

## Requirements

- GitHub CLI authenticated with admin access to the organisation.
- Vercel CLI installed (for local testing).
- Node 18+ on build runners (configured in the shared workflow).

Adjust the shared workflow or scripts as needed for your org naming conventions. Once the shared workflow lives in its own repository all of your projects can adopt it with minimal configuration.
