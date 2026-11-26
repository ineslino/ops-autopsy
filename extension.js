const crypto = require("node:crypto");
const {
  DEFAULT_SETTINGS,
  createAdapterRegistry,
  normalizeSettings,
} = require("./integration-settings.js");

const COMMAND_ID = "opsAutopsy.openAnalyzer";
const SETTINGS_NAME = "preferences";

function escapeAttribute(value) {
  return String(value).replace(/[&"<>]/g, (character) => ({
    "&": "&amp;",
    '"': "&quot;",
    "<": "&lt;",
    ">": "&gt;",
  })[character]);
}

function buildWebviewHtml({ sourceHtml, webview, extensionUri, vscode, nonce }) {
  if (!sourceHtml.includes("<head>")) {
    throw new Error("The incident analyzer HTML is missing its head element.");
  }

  const assetUri = (fileName) => escapeAttribute(
    webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, fileName)).toString(),
  );
  const csp = [
    "default-src 'none'",
    `img-src ${webview.cspSource} data:`,
    `style-src ${webview.cspSource} https://fonts.googleapis.com 'unsafe-inline'`,
    `font-src ${webview.cspSource} https://fonts.gstatic.com data:`,
    `script-src 'nonce-${nonce}' ${webview.cspSource}`,
    "connect-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
  ].join("; ");

  return sourceHtml
    .replace(/^\s*<link rel="preconnect" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"[^>]*>\s*$/gm, "")
    .replace(
      /(href|src)="(favicon\.svg|styles\.css|integration-settings\.js|app\.js)"/g,
      (_match, attribute, fileName) => `${attribute}="${assetUri(fileName)}"`,
    )
    .replace(
      /content="share\.png"/,
      `content="${assetUri("share.png")}"`,
    )
    .replace(
      "<head>",
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${escapeAttribute(csp)}" />`,
    )
    .replace(/<script(?=\s|>)/g, `<script nonce="${escapeAttribute(nonce)}"`);
}

function createSupportedAdapterRegistry() {
  const registry = createAdapterRegistry();
  registry.register({
    id: "demo",
    label: "Demo data",
    shortLabel: "Demo",
    description: "Fictional local incidents. No provider requests or credentials are used.",
    loadIncidents: async () => [],
  });
  return registry;
}

async function loadWebviewHtml(vscode, webview, extensionUri) {
  const indexUri = vscode.Uri.joinPath(extensionUri, "index.html");
  const bytes = await vscode.workspace.fs.readFile(indexUri);
  return buildWebviewHtml({
    sourceHtml: Buffer.from(bytes).toString("utf8"),
    webview,
    extensionUri,
    vscode,
    nonce: crypto.randomBytes(16).toString("base64"),
  });
}

function registerExtension(vscode, context) {
  const registry = createSupportedAdapterRegistry();
  let currentPanel;

  const command = vscode.commands.registerCommand(COMMAND_ID, async () => {
    if (currentPanel) {
      currentPanel.reveal(vscode.ViewColumn.One);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "opsAutopsy.incidentAnalyzer",
      "Ops Autopsy",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [context.extensionUri],
      },
    );
    currentPanel = panel;

    const messageSubscription = panel.webview.onDidReceiveMessage(async (message) => {
      if (!message || typeof message !== "object"
        || typeof message.requestId !== "string"
        || message.requestId.length > 64) {
        return;
      }

      const requestId = message.requestId;
      if (message.type === "settings:get") {
        try {
          const value = vscode.workspace.getConfiguration("opsAutopsy").get(
            SETTINGS_NAME,
            DEFAULT_SETTINGS,
          );
          const settings = normalizeSettings(value, registry);
          await panel.webview.postMessage({
            type: "settings:loaded",
            requestId,
            settings,
          });
        } catch {
          await panel.webview.postMessage({
            type: "settings:loaded",
            requestId,
            settings: { ...DEFAULT_SETTINGS },
            warning: "VS Code preferences are invalid. Demo defaults are active.",
          });
        }
        return;
      }

      if (message.type !== "settings:save") return;

      try {
        const settings = normalizeSettings(message.settings, registry);
        await vscode.workspace.getConfiguration("opsAutopsy").update(
          SETTINGS_NAME,
          settings,
          vscode.ConfigurationTarget.Global,
        );
        await panel.webview.postMessage({
          type: "settings:saved",
          requestId,
          settings,
        });
      } catch (error) {
        await panel.webview.postMessage({
          type: "settings:error",
          requestId,
          error: error.message || "Preferences could not be saved in VS Code.",
        });
      }
    });

    panel.onDidDispose(() => {
      currentPanel = undefined;
      messageSubscription.dispose();
    });
    context.subscriptions.push(panel);

    try {
      panel.webview.html = await loadWebviewHtml(vscode, panel.webview, context.extensionUri);
    } catch (error) {
      panel.dispose();
      await vscode.window.showErrorMessage(
        `Ops Autopsy could not open the incident analyzer: ${error.message}`,
      );
    }
  });

  context.subscriptions.push(command);
}

function activate(context) {
  return registerExtension(require("vscode"), context);
}

function deactivate() {}

module.exports = {
  activate,
  buildWebviewHtml,
  deactivate,
  registerExtension,
};
