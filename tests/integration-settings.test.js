const assert = require("node:assert/strict");
const test = require("node:test");
const {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  createAdapterRegistry,
  loadSettings,
  normalizeSettings,
  saveSettings,
} = require("../integration-settings.js");
const { demoIncidents } = require("../app.js");

function createRegistry() {
  const registry = createAdapterRegistry();
  registry.register({
    id: "demo",
    label: "Demo data",
    shortLabel: "Demo",
    description: "Fictional local examples.",
    loadIncidents: async () => [],
  });
  return registry;
}

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("registry rejects duplicate adapters and adapters without a reader", () => {
  const registry = createRegistry();
  assert.throws(() => registry.register({
    id: "demo",
    label: "Duplicate",
    shortLabel: "Duplicate",
    description: "Duplicate adapter.",
    loadIncidents: async () => [],
  }), /already registered/);
  assert.throws(() => registry.register({
    id: "unsafe",
    label: "Unsafe",
    shortLabel: "Unsafe",
    description: "Missing read function.",
  }), /read-only loadIncidents/);
});

test("loadSettings returns demo defaults when no preferences are saved", () => {
  assert.deepEqual(loadSettings(createStorage(), createRegistry()), DEFAULT_SETTINGS);
});

test("saveSettings trims and persists only non-secret preferences", () => {
  const storage = createStorage();
  const registry = createRegistry();
  const saved = saveSettings(storage, registry, {
    providerId: "demo",
    workspaceName: "  Payments team  ",
    environmentName: "  Staging  ",
    token: "must-not-be-persisted",
  });

  assert.deepEqual(saved, {
    providerId: "demo",
    workspaceName: "Payments team",
    environmentName: "Staging",
  });
  assert.deepEqual(loadSettings(storage, registry), saved);
  assert.equal(storage.getItem(STORAGE_KEY).includes("must-not-be-persisted"), false);
});

test("normalizeSettings rejects unavailable providers and blank labels", () => {
  const registry = createRegistry();
  assert.throws(() => normalizeSettings({
    providerId: "not-installed",
    workspaceName: "Payments",
    environmentName: "Staging",
  }, registry), /not available/);
  assert.throws(() => normalizeSettings({
    providerId: "demo",
    workspaceName: " ",
    environmentName: "Staging",
  }, registry), /Workspace is required/);
});

test("loadSettings reports malformed saved JSON instead of silently resetting it", () => {
  const storage = createStorage();
  storage.setItem(STORAGE_KEY, "{");
  assert.throws(() => loadSettings(storage, createRegistry()), /not valid JSON/);
});

test("saveSettings surfaces browser storage failures", () => {
  const storage = { setItem: () => { throw new Error("quota exceeded"); } };
  assert.throws(() => saveSettings(storage, createRegistry(), {
    providerId: "demo",
    workspaceName: "Payments",
    environmentName: "Staging",
  }), /quota exceeded/);
});

test("fictional run metric totals equal the sum of their reported states", () => {
  assert.deepEqual(demoIncidents.map((incident) => {
    const stateTotal = Object.values(incident.runMetrics.states)
      .reduce((total, count) => total + count, 0);
    return [incident.id, stateTotal, incident.runMetrics.unit];
  }), [
    ["deploy-api", 9, "steps"],
    ["infra-plan", 5, "steps"],
    ["test-timeout", 33, "tests"],
  ]);
});
