(function exposeIntegrationSettings(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.OpsAutopsyIntegrationSettings = api;
  }
})(globalThis, () => {
  const STORAGE_KEY = "ops-autopsy.integration-settings.v1";
  const DEFAULT_SETTINGS = Object.freeze({
    providerId: "demo",
    workspaceName: "Demo workspace",
    environmentName: "Development",
  });

  function createAdapterRegistry() {
    const adapters = new Map();

    return Object.freeze({
      register(adapter) {
        if (!adapter || typeof adapter !== "object") {
          throw new TypeError("An adapter definition is required.");
        }
        if (!/^[a-z][a-z0-9-]*$/.test(adapter.id || "")) {
          throw new TypeError("Adapter IDs must be lowercase words separated by hyphens.");
        }
        if (!adapter.label?.trim() || !adapter.shortLabel?.trim() || !adapter.description?.trim()) {
          throw new TypeError("Adapters need a label, short label, and description.");
        }
        if (typeof adapter.loadIncidents !== "function") {
          throw new TypeError("Adapters must provide a read-only loadIncidents function.");
        }
        if (adapters.has(adapter.id)) {
          throw new Error(`Adapter "${adapter.id}" is already registered.`);
        }

        const definition = Object.freeze({
          id: adapter.id,
          label: adapter.label.trim(),
          shortLabel: adapter.shortLabel.trim(),
          description: adapter.description.trim(),
          loadIncidents: adapter.loadIncidents,
        });
        adapters.set(definition.id, definition);
        return definition;
      },
      get(id) {
        return adapters.get(id) || null;
      },
      list() {
        return [...adapters.values()];
      },
    });
  }

  function normalizeSettings(value, registry) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError("Integration preferences must be an object.");
    }

    const providerId = typeof value.providerId === "string" ? value.providerId : "";
    if (!registry.get(providerId)) {
      throw new Error(`The "${providerId || "unknown"}" data source is not available.`);
    }

    const workspaceName = normalizeLabel(value.workspaceName, "Workspace", 64);
    const environmentName = normalizeLabel(value.environmentName, "Environment", 48);
    return { providerId, workspaceName, environmentName };
  }

  function normalizeLabel(value, label, maxLength) {
    if (typeof value !== "string") {
      throw new TypeError(`${label} must be text.`);
    }
    const normalized = value.trim();
    if (!normalized) {
      throw new Error(`${label} is required.`);
    }
    if (normalized.length > maxLength) {
      throw new RangeError(`${label} must be ${maxLength} characters or fewer.`);
    }
    return normalized;
  }

  function loadSettings(storage, registry) {
    if (!storage || typeof storage.getItem !== "function") {
      throw new TypeError("Browser storage is unavailable.");
    }

    const serialized = storage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return normalizeSettings(DEFAULT_SETTINGS, registry);
    }

    let value;
    try {
      value = JSON.parse(serialized);
    } catch (error) {
      throw new Error("Saved integration preferences are not valid JSON.", { cause: error });
    }
    return normalizeSettings(value, registry);
  }

  function saveSettings(storage, registry, value) {
    if (!storage || typeof storage.setItem !== "function") {
      throw new TypeError("Browser storage is unavailable.");
    }

    const settings = normalizeSettings(value, registry);
    storage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return settings;
  }

  return Object.freeze({
    DEFAULT_SETTINGS,
    STORAGE_KEY,
    createAdapterRegistry,
    loadSettings,
    normalizeSettings,
    saveSettings,
  });
});
