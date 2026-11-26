const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { buildWebviewHtml, registerExtension } = require("../extension.js");
const { DEFAULT_SETTINGS } = require("../integration-settings.js");

const extensionUri = "file:///ops-autopsy";
const vscode = {
  Uri: {
    joinPath: (base, fileName) => `${base}/${fileName}`,
  },
};

function createWebview() {
  return {
    cspSource: "vscode-webview://test",
    asWebviewUri: (uri) => `vscode-webview://test/${uri}`,
  };
}

test("webview HTML uses packaged assets and a restrictive content security policy", () => {
  const sourceHtml = readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const html = buildWebviewHtml({
    sourceHtml,
    webview: createWebview(),
    extensionUri,
    vscode,
    nonce: "test-nonce",
  });

  assert.match(html, /default-src 'none'/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /https:\/\/fonts\.googleapis\.com/);
  assert.match(html, /https:\/\/fonts\.gstatic\.com/);
  assert.doesNotMatch(html, /rel="preconnect"/);
  assert.match(html, /href="vscode-webview:\/\/test\/file:\/\/\/ops-autopsy\/styles\.css"/);
  assert.match(html, /src="vscode-webview:\/\/test\/file:\/\/\/ops-autopsy\/integration-settings\.js"/);
  assert.match(html, /src="vscode-webview:\/\/test\/file:\/\/\/ops-autopsy\/app\.js"/);
  assert.equal((html.match(/<script nonce="test-nonce"/g) || []).length, 2);
});

test("webview HTML rejects an incomplete app document", () => {
  assert.throws(() => buildWebviewHtml({
    sourceHtml: "<html></html>",
    webview: createWebview(),
    extensionUri,
    vscode,
    nonce: "test-nonce",
  }), /missing its head element/);
});

test("extension reads and saves only non-secret user preferences", async () => {
  const sourceHtml = readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  let commandHandler;
  let messageHandler;
  let savedPreferences = { ...DEFAULT_SETTINGS };
  let panel;
  const responses = [];
  const configurationUpdates = [];
  const vscode = {
    Uri: {
      joinPath: (base, fileName) => `${base}/${fileName}`,
    },
    ViewColumn: { One: 1 },
    ConfigurationTarget: { Global: "global" },
    commands: {
      registerCommand: (_id, handler) => {
        commandHandler = handler;
        return { dispose() {} };
      },
    },
    workspace: {
      fs: {
        readFile: async () => Buffer.from(sourceHtml),
      },
      getConfiguration: () => ({
        get: (_key, fallback) => savedPreferences || fallback,
        update: async (key, value, target) => {
          configurationUpdates.push({ key, value, target });
          savedPreferences = value;
        },
      }),
    },
    window: {
      createWebviewPanel: () => {
        panel = {
          webview: {
            cspSource: "vscode-webview://test",
            asWebviewUri: (uri) => `vscode-webview://test/${uri}`,
            onDidReceiveMessage: (handler) => {
              messageHandler = handler;
              return { dispose() {} };
            },
            postMessage: async (message) => {
              responses.push(message);
              return true;
            },
          },
          onDidDispose() {},
          dispose() {},
        };
        return panel;
      },
      showErrorMessage: async (message) => {
        throw new Error(message);
      },
    },
  };

  registerExtension(vscode, {
    extensionUri,
    subscriptions: [],
  });
  await commandHandler();
  await messageHandler({ type: "settings:get", requestId: "load-1" });
  assert.deepEqual(responses.at(-1), {
    type: "settings:loaded",
    requestId: "load-1",
    settings: DEFAULT_SETTINGS,
  });

  await messageHandler({
    type: "settings:save",
    requestId: "save-1",
    settings: {
      providerId: "demo",
      workspaceName: "Payments",
      environmentName: "Production",
      token: "must-not-be-saved",
    },
  });
  assert.deepEqual(configurationUpdates, [{
    key: "preferences",
    value: {
      providerId: "demo",
      workspaceName: "Payments",
      environmentName: "Production",
    },
    target: "global",
  }]);
  assert.deepEqual(responses.at(-1), {
    type: "settings:saved",
    requestId: "save-1",
    settings: {
      providerId: "demo",
      workspaceName: "Payments",
      environmentName: "Production",
    },
  });
});
