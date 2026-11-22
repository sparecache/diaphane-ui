# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Use GitHub's private reporting instead:
go to the **Security** tab of this repository and choose **Report a vulnerability**.

Include what you found, the component or file involved, and steps to reproduce. You can expect an acknowledgement
within a few days, and a fix or a decision within 90 days. Please keep the details private until a fix is released.

## Supported versions

Only the latest release receives fixes while the project is 0.x.

## Scope

Diaphane UI is a client-side component library with a single runtime dependency (`lucide`, icon data only). It does not
fetch data, store credentials or run server code.

## How the project is protected

- Secret scanning with push protection, and Dependabot alerts and updates for dependencies and workflow actions.
- CI runs the type check, validation, a dependency audit and CodeQL analysis on every change.
- Workflow actions are pinned to commit hashes and run with read-only permissions unless a job needs more.
