[Português](README.md) | [English](README.en.md)

# Ops Autopsy

![Desktop Ops Autopsy view with the causal sequence and evidence for a failed run](share.png)

Ops Autopsy is an installable Visual Studio Code extension that presents read-only visual analysis of software-delivery incidents: a causal timeline, event-linked evidence, and recovery guidance.

> **Project status:** first installable VS Code extension, with fictional scenarios. Provider connections and real incident analysis are not implemented.

## Features

- Opens the visual analyzer in a VS Code Webview from the Command Palette.
- Includes three fictional scenarios: `deploy-api`, `infra-plan`, and `test-timeout`.
- Lets users select timeline events, inspect evidence, and compare an illustrative previous run.
- Presents recovery guidance without running commands or changing resources.
- Lets users configure the source and workspace/environment labels. Only `demo` is currently available.
- Also retains a standalone browser version that does not require installing the extension.

On PC screens, navigation, the causal sequence, and evidence appear side by side. Narrow panels switch to a run selector and a vertical sequence:

![Compact Ops Autopsy panel in a 380-by-640-pixel viewport](panel-compact.png)

## Install in VS Code

Visual Studio Code 1.85 or later is required. Building the local installer requires Node.js 22 or later and npm:

1. Install development dependencies and validate the project:

   ```sh
   npm ci
   npm test
   npm run check
   ```

2. Build the VSIX package:

   ```sh
   npm run package
   ```

   The generated file is named `ops-autopsy-0.1.0.vsix`.

3. Install it from the command line:

   ```sh
   code --install-extension ./ops-autopsy-0.1.0.vsix
   ```

   Alternatively, open **Extensions** in VS Code, choose **…**, and select **Install from VSIX…**.

4. Open the Command Palette and run **Ops Autopsy: Open Incident Analyzer**.

The settings dialog saves preferences in the VS Code user profile under `opsAutopsy.preferences`. It only contains `providerId`, `workspaceName`, and `environmentName`; it does not accept or store credentials.

## Run in a browser

A modern browser with JavaScript enabled is required. From the project directory, start a static server:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. The standalone version stores non-secret labels in browser `localStorage`. Outfit and DM Mono fonts load from Google Fonts; the CSS fallbacks are used when offline.

## Scenarios and usage

Open `index.html` with one of these fragments to select a scenario:

| Fragment | Scenario |
| --- | --- |
| `#deploy-api` | Delivery failure associated with an empty secret reference. |
| `#infra-plan` | Interrupted infrastructure apply with an uncertain outcome. |
| `#test-timeout` | A test timeout followed by a successful event. |

Select events to inspect evidence; use comparison to see a fictional previous event. Recommendations are informational and should not be executed automatically. Scenarios are not real incidents and do not query a platform's history.

## Integrations and limitations

The extension packages the existing application in a VS Code Webview. The `demo` adapter is the only registered source and provides local fictional data. There is no backend, authentication, incident API traffic, or data connector to Azure DevOps, GitHub, cloud platforms, or CI/CD; the current VS Code integration is limited to the UI and user settings. The UI and extension do not execute, retry, cancel, or change runs or resources.

The adapter registry is a foundation for future user-selected sources, not an operational integration. A real integration must use the IDE's secure secret storage and request read-only permissions only. See the [integration architecture](docs/integrations.md).

## Structure and validation

| File | Contents |
| --- | --- |
| `package.json` | Extension manifest, command, user preferences, and validation/package scripts. |
| `extension.js` | Activation, Webview, and VS Code settings bridge. |
| `index.html`, `styles.css`, `app.js` | UI structure, presentation, and fictional scenarios. |
| `integration-settings.js` | Adapter registry and non-secret preference validation. |
| `tests/` | Unit tests for settings and the Webview policy. |
| `docs/integrations.md` | Current status, security boundaries, and future adapter contract. |
| `share.png`, `panel-compact.png`, `favicon.svg` | Desktop and compact screenshots, plus the interface icon. |

`npm run package` runs `npm run check` and `npm test` before creating the VSIX. There is no CI pipeline or VS Code Marketplace publishing configured. Contributions should preserve read-only behaviour, clearly distinguish fictional data from real data, and run the tests before a pull request to `main`.

## Documentation and licence

- [Integration architecture](docs/integrations.md) — current status, user configuration, security, and future adapter contract.
- [Repository metadata proposal](docs/repository-metadata.md) — suggested topics, not applied.
- [MIT License](LICENSE).
