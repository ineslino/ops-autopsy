const demoIncidents = [
  {
    id: "deploy-api",
    title: "Deploy API service",
    service: "api-gateway",
    status: "critical",
    statusLabel: "Failed",
    run: "#1842",
    repository: "acme/platform-infra",
    branch: "release/2.8",
    commit: "a93c2f1",
    time: "Today, 14:32 UTC",
    duration: "4m 18s",
    runMetrics: {
      unit: "steps",
      states: { completed: 3, failed: 1, skipped: 2, notStarted: 3 },
    },
    summary: "Task definition registration failed: the secret reference is empty.",
    safeToRerun: false,
    recovery: {
      title: "Verify the current revision",
      summary: "Compare the live task definition with the last successful deployment.",
      checkLabel: "Current state",
      check: "service state is unknown",
      actions: [
        "Inspect the service and task definition revision.",
        "Add the missing secret reference to the release config.",
      ],
      finalLabel: "Automated changes",
      final: "None.",
    },
    events: [
      {
        type: "cause",
        typeLabel: "Root cause",
        symbol: "!",
        title: "Empty secret reference",
        description: "Required value was missing in deployment config.",
        time: "14:31:06",
        evidenceTitle: "Secret mapping resolved to an empty value",
        evidenceDescription: "The deployment template contains a secret mapping, but its source value is blank in this run.",
        evidence: "secrets:\n  API_KEY:\n    valueFrom: \"\"",
        source: "deploy/production.yml",
        sourceLocation: "line 28 · config snapshot",
      },
      {
        type: "failed",
        typeLabel: "Failed step",
        symbol: "×",
        title: "Register task definition",
        description: "Provider rejected the incomplete secret mapping.",
        time: "14:32:41",
        evidenceTitle: "Task definition registration rejected",
        evidenceDescription: "The provider API returned a validation error. No new task definition revision was created.",
        evidence: "ClientException:\nInvalid secret option:\nvalueFrom must not be empty",
        source: "deploy-api · register-task",
        sourceLocation: "step 6 of 9 · stderr",
      },
      {
        type: "affected",
        typeLabel: "Partial state",
        symbol: "↗",
        title: "Earlier updates remain",
        description: "Changes from completed steps may still be active.",
        time: "14:32:43",
        evidenceTitle: "Run ended after earlier steps completed",
        evidenceDescription: "The runner records successful changes before the failed step. The current live state was not re-read.",
        evidence: "3 completed\n1 failed\n2 skipped\n3 not started\nLive state: unverified",
        source: "run #1842 · job summary",
        sourceLocation: "final job summary",
      },
      {
        type: "affected",
        typeLabel: "Rerun blocked",
        symbol: "⏸",
        title: "Safety guard stopped retry",
        description: "A follow-up run halted to avoid unsafe replay.",
        time: "14:36:18",
        evidenceTitle: "Guard halted the follow-up run",
        evidenceDescription: "The next run detected an unresolved prior attempt and exited before applying deployment changes.",
        evidence: "Previous run incomplete\nCurrent state not reconciled\nAction: stop and inspect",
        source: "deploy-api · preflight-guard",
        sourceLocation: "run #1843 · step 1",
      },
    ],
  },
  {
    id: "infra-plan",
    title: "Provision edge cache",
    service: "edge-cache",
    status: "warning",
    statusLabel: "Interrupted",
    run: "#1837",
    repository: "acme/platform-infra",
    branch: "feature/edge-cache",
    commit: "6bf28aa",
    time: "Today, 11:08 UTC",
    duration: "2m 51s",
    runMetrics: {
      unit: "steps",
      states: { completed: 2, interrupted: 1, notStarted: 2 },
    },
    summary: "An interrupted infrastructure apply left the final resource state unconfirmed.",
    safeToRerun: false,
    recovery: {
      title: "Inspect before retrying",
      summary: "The runner lost its connection during apply. Reconcile actual resources with the saved plan first.",
      checkLabel: "Current state",
      check: "apply outcome not confirmed",
      actions: [
        "Refresh the remote state and inspect the affected resource.",
        "Generate a new plan before starting another apply.",
      ],
      finalLabel: "Automated changes",
      final: "None.",
    },
    events: [
      {
        type: "cause",
        typeLabel: "Trigger",
        symbol: "!",
        title: "Runner lost connection",
        description: "The hosted runner stopped reporting during apply.",
        time: "11:08:12",
        evidenceTitle: "Runner heartbeat expired",
        evidenceDescription: "No completion or rollback event arrived before the runner connection timed out.",
        evidence: "heartbeat: timeout\nlast event: apply started\nexit status: unavailable",
        source: "infra-apply · runner",
        sourceLocation: "run #1837 · system log",
      },
      {
        type: "failed",
        typeLabel: "Interrupted",
        symbol: "×",
        title: "Apply outcome unknown",
        description: "No final state was recorded by the runner.",
        time: "11:10:54",
        evidenceTitle: "Apply did not report a final result",
        evidenceDescription: "The operation started, but the runner disconnected before writing the completion record.",
        evidence: "Apply started: yes\nApply completed: unknown\nRollback: not reported",
        source: "infra-apply · job summary",
        sourceLocation: "final job summary",
      },
      {
        type: "affected",
        typeLabel: "State check",
        symbol: "?",
        title: "Remote state may lag",
        description: "The saved state may not reflect every live change.",
        time: "11:10:55",
        evidenceTitle: "State and infrastructure need reconciliation",
        evidenceDescription: "An interrupted apply can leave remote resources ahead of the persisted state snapshot.",
        evidence: "state snapshot: 11:07 UTC\nlast refresh: before apply\nlive state: not verified",
        source: "infra-apply · state metadata",
        sourceLocation: "backend snapshot",
      },
      {
        type: "affected",
        typeLabel: "Next step",
        symbol: "→",
        title: "Refresh then re-plan",
        description: "A new plan will show the actual drift.",
        time: "Recommended",
        evidenceTitle: "Safe next step is a read-only refresh",
        evidenceDescription: "Inspect current state first; do not replay the old plan against unknown infrastructure.",
        evidence: "1. Refresh state\n2. Review resource drift\n3. Create a new plan",
        source: "recovery guidance",
        sourceLocation: "derived from run evidence",
      },
    ],
  },
  {
    id: "test-timeout",
    title: "Validate payments API",
    service: "payments-api",
    status: "resolved",
    statusLabel: "Resolved",
    run: "#1819",
    repository: "acme/payments",
    branch: "main",
    commit: "e174dd9",
    time: "Yesterday, 17:46 UTC",
    duration: "8m 03s",
    runMetrics: {
      unit: "tests",
      states: { passed: 24, failed: 1, skipped: 8 },
    },
    summary: "A flaky integration test timed out; a later run passed without code changes.",
    safeToRerun: true,
    recovery: {
      title: "Rerun appears safe",
      summary: "The later run passed and no deployment or infrastructure changes were made by the failed run.",
      checkLabel: "Verified condition",
      check: "no partial changes detected",
      actions: [
        "The same commit passed on run #1820.",
        "No environment mutations were recorded.",
      ],
      finalLabel: "Recommendation",
      final: "Use the successful run as the validation result.",
    },
    events: [
      {
        type: "cause",
        typeLabel: "Trigger",
        symbol: "!",
        title: "Integration test stalled",
        description: "The test exceeded its configured timeout.",
        time: "17:51:09",
        evidenceTitle: "Test exceeded the configured time limit",
        evidenceDescription: "The payment-provider mock did not return before the integration test timeout.",
        evidence: "test: refunds_create\nlimit: 120s\nresult: timeout",
        source: "integration-tests · junit",
        sourceLocation: "tests/refunds.spec.ts",
      },
      {
        type: "failed",
        typeLabel: "Failed step",
        symbol: "×",
        title: "Integration suite failed",
        description: "The validation job stopped on the timed-out test.",
        time: "17:52:30",
        evidenceTitle: "One test timed out; remaining tests were skipped",
        evidenceDescription: "The suite reported a timeout, not an assertion failure or a product-code error.",
        evidence: "1 failed (timeout)\n24 passed\n8 skipped",
        source: "integration-tests · summary",
        sourceLocation: "run #1819 · test report",
      },
      {
        type: "affected",
        typeLabel: "No mutations",
        symbol: "✓",
        title: "No changes applied",
        description: "This validation run did not mutate an environment.",
        time: "17:52:30",
        evidenceTitle: "Run was limited to read-only validation",
        evidenceDescription: "The workflow ran tests only; deployment and infrastructure mutation steps were not part of this job.",
        evidence: "deploy: not configured\ninfrastructure apply: not configured\nside effects: none recorded",
        source: "workflow definition",
        sourceLocation: ".github/workflows/validate.yml",
      },
      {
        type: "recovered",
        typeLabel: "Recovered",
        symbol: "✓",
        title: "Later run passed",
        description: "Same commit passed on the next attempt.",
        time: "18:06:44",
        evidenceTitle: "Follow-up run passed on the same commit",
        evidenceDescription: "A later run completed successfully without source changes, consistent with a transient test timeout.",
        evidence: "run #1820: passed\ncommit: e174dd9\nsource changes: none",
        source: "integration-tests · run #1820",
        sourceLocation: "workflow run summary",
      },
    ],
  },
];

let incidents = demoIncidents;

if (typeof module === "object" && module.exports) {
  module.exports = { demoIncidents };
}

if (typeof document !== "undefined") {
const incidentList = document.querySelector("#incident-list");
const incidentCount = document.querySelector("#incident-count");
const incidentSelect = document.querySelector("#incident-select");
const datasetSummary = document.querySelector("#dataset-summary");
const mainContent = document.querySelector(".main-content");
const appState = document.querySelector("#app-state");
const appStateMessage = document.querySelector("#app-state-message");
const retryLoadButton = document.querySelector("#retry-load-button");
const emptySettingsButton = document.querySelector("#empty-settings-button");
const incidentTitle = document.querySelector("#incident-title");
const incidentSubtitle = document.querySelector("#incident-subtitle");
const incidentContext = document.querySelector("#incident-context");
const metadataRow = document.querySelector("#metadata-row");
const runBanner = document.querySelector("#run-banner");
const trace = document.querySelector("#trace");
const traceSummary = document.querySelector("#trace-summary");
const evidenceContent = document.querySelector("#evidence-content");
const evidenceIndex = document.querySelector("#evidence-index");
const recoveryCard = document.querySelector("#recovery-card");
const toast = document.querySelector("#toast");
const compareButton = document.querySelector("#compare-button");
const shareButton = document.querySelector("#share-button");
const resetSelection = document.querySelector("#reset-selection");
const workspaceName = document.querySelector("#workspace-name");
const environmentLabel = document.querySelector("#environment-label");
const settingsButton = document.querySelector("#settings-button");
const settingsDialog = document.querySelector("#settings-dialog");
const settingsForm = document.querySelector("#settings-form");
const providerSelect = document.querySelector("#provider-select");
const providerLabel = document.querySelector("#provider-label");
const providerDescription = document.querySelector("#provider-description");
const workspaceNameInput = document.querySelector("#workspace-name-input");
const environmentNameInput = document.querySelector("#environment-name-input");
const settingsError = document.querySelector("#settings-error");
const recoverySection = document.querySelector("#recovery");
const reviewRecoveryButton = document.querySelector("#review-recovery");
const vscodeApi = typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : null;

const adapterRegistry = OpsAutopsyIntegrationSettings.createAdapterRegistry();
adapterRegistry.register({
  id: "demo",
  label: "Demo data",
  shortLabel: "Demo",
  description: "Fictional local incidents. No provider requests or credentials are used.",
  loadIncidents: async () => demoIncidents,
});

let selectedIncident = incidents[0];
let selectedEventIndex = 0;
let compareMode = false;
let integrationSettings = { ...OpsAutopsyIntegrationSettings.DEFAULT_SETTINGS };
let settingsLoadWarning = "";
let toastTimeout;
let nextExtensionRequestId = 0;
const pendingExtensionRequests = new Map();

if (vscodeApi) {
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (!message || typeof message.requestId !== "string") return;
    const pending = pendingExtensionRequests.get(message.requestId);
    if (!pending) return;
    if (message.type !== "settings:error"
      && message.type !== "settings:loaded"
      && message.type !== "settings:saved") {
      return;
    }

    pendingExtensionRequests.delete(message.requestId);
    window.clearTimeout(pending.timeoutId);
    if (message.type === "settings:error") {
      pending.reject(new Error(message.error || "VS Code preferences could not be saved."));
    } else if (message.type === "settings:loaded" || message.type === "settings:saved") {
      pending.resolve(message);
    }
  });
}

function requestExtension(type, payload = {}) {
  if (!vscodeApi) {
    return Promise.reject(new Error("VS Code settings are unavailable."));
  }

  const requestId = `ops-autopsy-${++nextExtensionRequestId}`;
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      pendingExtensionRequests.delete(requestId);
      reject(new Error("VS Code did not respond to the settings request."));
    }, 5000);
    pendingExtensionRequests.set(requestId, { resolve, reject, timeoutId });

    try {
      if (!vscodeApi.postMessage({ type, requestId, ...payload })) {
        window.clearTimeout(timeoutId);
        pendingExtensionRequests.delete(requestId);
        reject(new Error("The settings request could not be sent to VS Code."));
      }
    } catch (error) {
      window.clearTimeout(timeoutId);
      pendingExtensionRequests.delete(requestId);
      reject(error);
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function renderProviderOptions() {
  providerSelect.innerHTML = adapterRegistry.list().map((adapter) => `
    <option value="${escapeHtml(adapter.id)}">${escapeHtml(adapter.label)}</option>
  `).join("");
  providerSelect.value = integrationSettings.providerId;
  renderProviderSummary();
}

function renderProviderSummary() {
  const adapter = adapterRegistry.get(providerSelect.value);
  if (!adapter) {
    providerLabel.textContent = "Unavailable source";
    providerDescription.textContent = "This provider is not registered in the current extension.";
    return;
  }
  providerLabel.textContent = adapter.label;
  providerDescription.textContent = adapter.description;
}

function renderIntegrationSettings() {
  const adapter = adapterRegistry.get(integrationSettings.providerId);
  workspaceName.textContent = integrationSettings.workspaceName;
  environmentLabel.textContent = `${adapter.shortLabel} · ${integrationSettings.environmentName}`;
  providerSelect.value = integrationSettings.providerId;
  workspaceNameInput.value = integrationSettings.workspaceName;
  environmentNameInput.value = integrationSettings.environmentName;
  renderProviderSummary();
}

function getIncidentsForSettings(settings) {
  const adapter = adapterRegistry.get(settings.providerId);
  if (!adapter) throw new Error("The selected data source is unavailable.");
  return adapter.loadIncidents(settings);
}

function selectIncidentFromUrl() {
  const incident = incidents.find((item) => item.id === window.location.hash.slice(1));
  selectedIncident = incident || incidents[0];
}

function setAppState(state, message = "") {
  mainContent.dataset.appState = state;
  mainContent.setAttribute("aria-busy", String(state === "loading"));
  appState.dataset.state = state;
  appState.setAttribute("role", state === "error" ? "alert" : "status");
  appStateMessage.textContent = message;
  appState.hidden = state === "ready";
  retryLoadButton.hidden = state !== "error";
  emptySettingsButton.hidden = state !== "empty";
}

async function initializeIntegrationSettings() {
  setAppState("loading", "Loading incident data");
  renderProviderOptions();
  try {
    if (vscodeApi) {
      const response = await requestExtension("settings:get");
      integrationSettings = OpsAutopsyIntegrationSettings.normalizeSettings(
        response.settings,
        adapterRegistry,
      );
      settingsLoadWarning = response.warning || "";
    } else {
      integrationSettings = OpsAutopsyIntegrationSettings.loadSettings(
        window.localStorage,
        adapterRegistry,
      );
    }
  } catch (error) {
    incidents = [];
    selectedIncident = undefined;
    renderApp();
    setAppState("error", `Preferences could not be loaded: ${error.message}`);
    return;
  }

  try {
    incidents = await getIncidentsForSettings(integrationSettings);
    if (!Array.isArray(incidents)) {
      throw new TypeError("The selected source returned an invalid incident list.");
    }
  } catch (error) {
    incidents = [];
    selectedIncident = undefined;
    renderApp();
    setAppState("error", `Incident data could not be loaded: ${error.message}`);
    return;
  }

  selectIncidentFromUrl();
  setCompareMode(false);
  renderApp();
  renderIntegrationSettings();
  if (settingsLoadWarning) showToast(settingsLoadWarning);
}

function renderIncidentList() {
  incidentCount.textContent = incidents.length;
  incidentList.innerHTML = incidents.map((incident) => `
    <button class="incident-link ${incident.id === selectedIncident?.id ? "selected" : ""}" type="button" data-incident="${escapeHtml(incident.id)}" aria-current="${incident.id === selectedIncident?.id ? "true" : "false"}">
      <span class="incident-link-dot ${incident.status}" aria-hidden="true"></span>
      <span class="incident-link-copy">
        <strong>${escapeHtml(incident.title)}</strong>
        <small>${escapeHtml(incident.run)} · ${escapeHtml(incident.statusLabel)}</small>
      </span>
    </button>
  `).join("");
  incidentSelect.innerHTML = incidents.map((incident) => `
    <option value="${escapeHtml(incident.id)}">${escapeHtml(`${incident.title} · ${incident.run} · ${incident.statusLabel}`)}</option>
  `).join("");
  incidentSelect.value = selectedIncident?.id || "";

  datasetSummary.textContent = `${incidents.length} sample runs available`;
}

function renderRunMetrics() {
  const states = Object.entries(selectedIncident.runMetrics.states);
  const total = states.reduce((sum, [, count]) => sum + count, 0);
  const parts = states
    .filter(([, count]) => count > 0)
    .map(([label, count]) => `${count} ${label.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}`)
    .join(" · ");
  return `${total} ${selectedIncident.runMetrics.unit} · ${parts}`;
}

function renderHeader() {
  incidentTitle.textContent = selectedIncident.title;
  incidentContext.textContent = `${selectedIncident.branch} · ${selectedIncident.time} · ${selectedIncident.duration}`;
  incidentSubtitle.textContent = selectedIncident.summary;

  metadataRow.innerHTML = `
    <span class="meta-chip status-${selectedIncident.status}">${escapeHtml(selectedIncident.statusLabel)}</span>
    <span class="meta-chip">${escapeHtml(selectedIncident.run)}</span>
    <span class="meta-chip">${escapeHtml(selectedIncident.service)}</span>
  `;

  renderRunBanner();
}

function renderRunBanner() {
  if (selectedIncident.safeToRerun) {
    runBanner.className = "run-banner safe";
    runBanner.innerHTML = `
      <div class="run-banner-copy">
        <div>
          <strong>Retry is available</strong>
          <p>No environment changes; run #1820 passed on this commit.</p>
          <span class="run-metrics">${escapeHtml(renderRunMetrics())}</span>
        </div>
      </div>
      <span class="banner-label">RECOVERED</span>
    `;
    return;
  }

  const reason = selectedIncident.status === "critical"
    ? "A failed deploy may leave partial changes. Check the live service state."
    : "The run stopped before its outcome was confirmed. Check service state.";
  runBanner.className = "run-banner";
  runBanner.innerHTML = `
    <div class="run-banner-copy">
      <div>
        <strong>Do not retry yet</strong>
        <p>${escapeHtml(reason)}</p>
        <span class="run-metrics">${escapeHtml(renderRunMetrics())}</span>
      </div>
    </div>
    <span class="banner-label">${selectedIncident.status === "critical" ? "Live state unknown" : "Outcome unknown"}</span>
  `;
}

function renderTrace() {
  const events = selectedIncident.events;
  const visibleEvents = compareMode
    ? [...events, {
      type: "recovered",
      typeLabel: "Last successful run",
      symbol: "✓",
      title: "Previous healthy run",
      description: "Compare this incident with the last known successful execution.",
      time: selectedIncident.status === "critical" ? "13:58:02" : "Previous",
      evidenceTitle: "Last successful run is available for comparison",
      evidenceDescription: "This is a fictional comparison point for the prototype. Real run data would come from a connected provider.",
      evidence: `run: ${selectedIncident.status === "critical" ? "#1838" : "#1820"}\nresult: passed\nsource: demo data`,
      source: "comparison · demo fixture",
      sourceLocation: selectedIncident.repository,
    }]
    : events;

  if (selectedEventIndex >= visibleEvents.length) selectedEventIndex = 0;

  trace.innerHTML = visibleEvents.map((event, index) => {
    return `
      <div class="trace-step">
        <button class="event-card type-${event.type} ${index === selectedEventIndex ? "selected" : ""}" type="button" data-event-index="${index}" aria-pressed="${index === selectedEventIndex}" aria-label="${escapeHtml(`${event.typeLabel}: ${event.title}. ${event.description} ${event.time}`)}">
          <span class="event-time">${escapeHtml(event.time)}</span>
          <span class="event-marker" aria-hidden="true"></span>
          <span class="event-copy">
            <span class="event-type">${escapeHtml(event.typeLabel)}</span>
            <strong>${escapeHtml(event.title)}</strong>
          </span>
        </button>
      </div>
    `;
  }).join("");

  traceSummary.textContent = `${selectedIncident.repository} · ${selectedIncident.commit}`;
  renderEvidence(visibleEvents[selectedEventIndex], selectedEventIndex, visibleEvents.length);
}

function renderEvidence(event, index, total) {
  evidenceIndex.textContent = `Event ${index + 1} of ${total}`;
  evidenceContent.innerHTML = `
    <h3 class="evidence-event-title">${escapeHtml(event.evidenceTitle)}</h3>
    <p class="evidence-event-description">${escapeHtml(event.evidenceDescription)}</p>
    <div class="evidence-label">Source evidence</div>
    <div class="evidence-code"><pre>${escapeHtml(event.evidence)}</pre></div>
    <div class="evidence-source">
      <span class="source-copy">
        <strong>${escapeHtml(event.source)}</strong>
        <small>${escapeHtml(event.sourceLocation)}</small>
      </span>
    </div>
  `;
}

function renderRecovery() {
  const recovery = selectedIncident.recovery;
  recoveryCard.className = `recovery-card ${selectedIncident.safeToRerun ? "safe" : ""}`;
  recoveryCard.innerHTML = `
    <div class="recovery-status">
      <div>
        <strong>${escapeHtml(recovery.title)}</strong>
        <p>${escapeHtml(recovery.summary)}</p>
      </div>
    </div>
    <div class="recovery-detail">
      <strong>${escapeHtml(recovery.checkLabel)}</strong>
      <p><code>${escapeHtml(recovery.check)}</code></p>
      <ul>${recovery.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul>
    </div>
    <div class="recovery-detail ${selectedIncident.safeToRerun ? "safe" : ""}">
      <strong>${escapeHtml(recovery.finalLabel)}</strong>
      <p>${escapeHtml(recovery.final)}</p>
    </div>
  `;
}

function renderApp() {
  renderIncidentList();
  if (!selectedIncident) {
    setAppState("empty", "No incident runs are available for this source.");
    return;
  }
  renderHeader();
  renderTrace();
  renderRecovery();
  setAppState("ready");
}

function openSettings() {
  settingsError.hidden = true;
  settingsForm.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
  renderIntegrationSettings();
  settingsDialog.showModal();
}

function setCompareMode(enabled) {
  compareMode = enabled;
  compareButton.setAttribute("aria-pressed", String(compareMode));
  compareButton.innerHTML = compareMode
    ? '<span aria-hidden="true">⇄</span> Hide comparison'
    : '<span aria-hidden="true">⇄</span> Compare runs';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

incidentList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-incident]");
  if (!button) return;

  selectedIncident = incidents.find((incident) => incident.id === button.dataset.incident);
  if (!selectedIncident) return;
  selectedEventIndex = 0;
  setCompareMode(false);
  renderApp();
});

incidentSelect.addEventListener("change", () => {
  selectedIncident = incidents.find((incident) => incident.id === incidentSelect.value);
  if (!selectedIncident) return;
  selectedEventIndex = 0;
  setCompareMode(false);
  renderApp();
});

trace.addEventListener("click", (event) => {
  const button = event.target.closest("[data-event-index]");
  if (!button) return;
  selectedEventIndex = Number(button.dataset.eventIndex);
  renderTrace();
});

compareButton.addEventListener("click", () => {
  setCompareMode(!compareMode);
  renderTrace();
});

shareButton.addEventListener("click", async () => {
  const shareUrl = new URL(window.location.href);
  shareUrl.hash = selectedIncident.id;
  try {
    await navigator.clipboard.writeText(shareUrl.toString());
    showToast("Share link copied. It opens this demo incident.");
  } catch {
    showToast("Share links are unavailable in this browser context.");
  }
});

resetSelection.addEventListener("click", () => {
  selectedEventIndex = 0;
  renderTrace();
});

document.querySelector("#about-button").addEventListener("click", () => {
  showToast("Read-only incident analysis. All included incident data is fictional.");
});

settingsButton.addEventListener("click", openSettings);
emptySettingsButton.addEventListener("click", openSettings);
retryLoadButton.addEventListener("click", initializeIntegrationSettings);
reviewRecoveryButton.addEventListener("click", () => {
  recoverySection.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    block: "start",
  });
});

document.querySelector("#close-settings").addEventListener("click", () => settingsDialog.close());
document.querySelector("#cancel-settings").addEventListener("click", () => settingsDialog.close());
settingsDialog.addEventListener("click", (event) => {
  if (event.target === settingsDialog) settingsDialog.close();
});
providerSelect.addEventListener("change", renderProviderSummary);
settingsForm.addEventListener("input", () => {
  settingsError.hidden = true;
  settingsForm.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
});

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  settingsError.hidden = true;
  const submitButton = settingsForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const nextSettings = OpsAutopsyIntegrationSettings.normalizeSettings({
      providerId: providerSelect.value,
      workspaceName: workspaceNameInput.value,
      environmentName: environmentNameInput.value,
    }, adapterRegistry);
    const nextIncidents = await getIncidentsForSettings(nextSettings);
    if (!Array.isArray(nextIncidents) || nextIncidents.length === 0) {
      throw new Error("The selected data source returned no incidents.");
    }

    if (vscodeApi) {
      const response = await requestExtension("settings:save", { settings: nextSettings });
      integrationSettings = OpsAutopsyIntegrationSettings.normalizeSettings(
        response.settings,
        adapterRegistry,
      );
    } else {
      integrationSettings = OpsAutopsyIntegrationSettings.saveSettings(
        window.localStorage,
        adapterRegistry,
        nextSettings,
      );
    }
    incidents = nextIncidents;
    selectIncidentFromUrl();
    selectedEventIndex = 0;
    setCompareMode(false);
    renderApp();
    renderIntegrationSettings();
    settingsDialog.close();
    showToast(vscodeApi
      ? "Preferences saved in your VS Code user profile. Incident records are still fictional."
      : "Preferences saved in this browser. Incident records are still fictional.");
  } catch (error) {
    settingsError.textContent = error.message || "Preferences could not be saved.";
    settingsError.hidden = false;
    if (/Workspace/.test(error.message)) workspaceNameInput.setAttribute("aria-invalid", "true");
    if (/Environment/.test(error.message)) environmentNameInput.setAttribute("aria-invalid", "true");
    if (/data source/.test(error.message)) providerSelect.setAttribute("aria-invalid", "true");
  } finally {
    submitButton.disabled = false;
  }
});

window.addEventListener("hashchange", () => {
  const incident = incidents.find((item) => item.id === window.location.hash.slice(1));
  if (!incident || incident.id === selectedIncident?.id) return;
  selectedIncident = incident;
  selectedEventIndex = 0;
  setCompareMode(false);
  renderApp();
});

initializeIntegrationSettings();
}
