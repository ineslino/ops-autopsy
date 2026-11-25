# Ops Autopsy

Ops Autopsy is a read-only prototype for turning a failed delivery run into an evidence-backed causal timeline. It separates the first known cause from later failures and shows recovery checks before a rerun.

## Run locally

Open `index.html` in a browser, or serve this directory with any static file server. No build step or external dependency is required.

## Prototype scope

- Switch between three fictional incident examples.
- Select each causal event to inspect its evidence and source.
- Compare the incident against a fictional previous run.
- Review a recovery check that never applies changes.
- Copy a link to the selected incident when clipboard access is available.

No Orca, Azure DevOps, Git, or cloud provider integration is included yet. The sample data is illustrative and does not represent live systems. Provider adapters and the IDE extension surface should be selected after verifying the target platform's current extension APIs.
