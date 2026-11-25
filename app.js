const incidents = [
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
    summary: "Task definition registration failed after an empty secret reference made it into the deployment config.",
    safeToRerun: false,
    recovery: {
      title: "Do not rerun yet",
      summary: "The deployment stopped after making partial changes. Confirm the current service state before retrying.",
      checkLabel: "BLOCKING CONDITION",
      check: "service state is unknown",
      actions: [
        "Verify the live service and task definition revision.",
        "Populate the missing secret reference in the release config.",
      ],
      finalLabel: "AUTOMATED ACTIONS",
      final: "None. This analysis is read-only.",
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
        evidence: "3 steps succeeded\n1 step failed\n2 steps skipped\nLive state: not verified",
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
    summary: "An interrupted infrastructure apply left the final resource state unconfirmed.",
    safeToRerun: false,
    recovery: {
      title: "Inspect before retrying",
      summary: "The runner lost its connection during apply. Reconcile actual resources with the saved plan first.",
      checkLabel: "BLOCKING CONDITION",
      check: "apply outcome not confirmed",
      actions: [
        "Refresh the remote state and inspect the affected resource.",
        "Generate a new plan before starting another apply.",
      ],
      finalLabel: "AUTOMATED ACTIONS",
      final: "None. This analysis is read-only.",
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
    summary: "A flaky integration test timed out; a later run passed without code changes.",
    safeToRerun: true,
    recovery: {
      title: "Rerun appears safe",
      summary: "The later run passed and no deployment or infrastructure changes were made by the failed run.",
      checkLabel: "VERIFIED CONDITION",
      check: "no partial changes detected",
      actions: [
        "The same commit passed on run #1820.",
        "No environment mutations were recorded.",
      ],
      finalLabel: "RECOMMENDATION",
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

const incidentList = document.querySelector("#incident-list");
const incidentCount = document.querySelector("#incident-count");
const incidentTitle = document.querySelector("#incident-title");
const incidentSubtitle = document.querySelector("#incident-subtitle");
const breadcrumbCurrent = document.querySelector("#breadcrumb-current");
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

let selectedIncident = incidents[0];
let selectedEventIndex = 0;
let compareMode = false;
let toastTimeout;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function renderIncidentList() {
  incidentCount.textContent = incidents.length;
  incidentList.innerHTML = incidents.map((incident) => `
    <button class="incident-link ${incident.id === selectedIncident.id ? "selected" : ""}" type="button" data-incident="${incident.id}" aria-current="${incident.id === selectedIncident.id ? "true" : "false"}">
      <span class="incident-link-dot ${incident.status}" aria-hidden="true"></span>
      <span class="incident-link-copy">
        <strong>${escapeHtml(incident.title)}</strong>
        <small>${escapeHtml(incident.run)} · ${escapeHtml(incident.statusLabel)}</small>
      </span>
    </button>
  `).join("");
}

function renderHeader() {
  incidentTitle.textContent = selectedIncident.title;
  breadcrumbCurrent.textContent = selectedIncident.title;
  incidentSubtitle.textContent = selectedIncident.summary;

  metadataRow.innerHTML = `
    <span class="meta-chip status-${selectedIncident.status}"><span class="meta-icon">${selectedIncident.status === "resolved" ? "✓" : selectedIncident.status === "warning" ? "!" : "×"}</span>${escapeHtml(selectedIncident.statusLabel)}</span>
    <span class="meta-chip"><span class="meta-icon">◈</span>${escapeHtml(selectedIncident.service)}</span>
    <span class="meta-chip">${escapeHtml(selectedIncident.run)}</span>
    <span class="meta-chip"><span class="meta-icon">⑂</span>${escapeHtml(selectedIncident.branch)}</span>
    <span class="meta-chip"><span class="meta-icon">◷</span>${escapeHtml(selectedIncident.time)}</span>
    <span class="meta-chip">${escapeHtml(selectedIncident.duration)}</span>
  `;

  renderRunBanner();
}

function renderRunBanner() {
  if (selectedIncident.safeToRerun) {
    runBanner.className = "run-banner safe";
    runBanner.innerHTML = `
      <div class="run-banner-copy">
        <span class="run-icon" aria-hidden="true">✓</span>
        <div>
          <strong>Rerun appears safe</strong>
          <p>Evidence shows no environment mutations, and run <code>#1820</code> passed on the same commit.</p>
        </div>
      </div>
      <span class="banner-label">RECOVERED</span>
    `;
    return;
  }

  const reason = selectedIncident.status === "critical"
    ? "Partial changes may remain active. Reconcile live state before retrying."
    : "The result of the apply is unknown. Refresh state before retrying.";
  runBanner.className = "run-banner";
  runBanner.innerHTML = `
    <div class="run-banner-copy">
      <span class="run-icon" aria-hidden="true">!</span>
      <div>
        <strong>Rerun not recommended yet</strong>
        <p>${escapeHtml(reason)} See the recovery check below.</p>
      </div>
    </div>
    <span class="banner-label">STATE UNVERIFIED</span>
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
    const connector = index < visibleEvents.length - 1
      ? `<span class="trace-connector ${event.type === "failed" ? "dashed" : ""}" aria-hidden="true"></span>`
      : "";
    return `
      <div class="trace-step">
        <button class="event-card type-${event.type} ${index === selectedEventIndex ? "selected" : ""}" type="button" data-event-index="${index}" aria-pressed="${index === selectedEventIndex}" aria-label="${escapeHtml(`${event.typeLabel}: ${event.title}. ${event.description} ${event.time}`)}">
          <span class="event-meta">
            <span class="event-type">${escapeHtml(event.typeLabel)}</span>
            <span class="event-status" aria-hidden="true">${escapeHtml(event.symbol)}</span>
          </span>
          <strong>${escapeHtml(event.title)}</strong>
          <span class="event-time">${escapeHtml(event.time)}</span>
        </button>
        ${connector}
      </div>
    `;
  }).join("");

  traceSummary.textContent = `${visibleEvents.length} events · ${selectedIncident.repository} · ${selectedIncident.commit}`;
  renderEvidence(visibleEvents[selectedEventIndex], selectedEventIndex, visibleEvents.length);
}

function renderEvidence(event, index, total) {
  evidenceIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  evidenceContent.innerHTML = `
    <h3 class="evidence-event-title">${escapeHtml(event.evidenceTitle)}</h3>
    <p class="evidence-event-description">${escapeHtml(event.evidenceDescription)}</p>
    <div class="evidence-label">SOURCE EVIDENCE</div>
    <div class="evidence-code"><pre>${escapeHtml(event.evidence)}</pre></div>
    <div class="evidence-source">
      <span class="source-icon" aria-hidden="true">⌘</span>
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
      <span class="recovery-status-icon" aria-hidden="true">${selectedIncident.safeToRerun ? "✓" : "!"}</span>
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
  renderHeader();
  renderTrace();
  renderRecovery();
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

document.querySelector(".help-button").addEventListener("click", () => {
  showToast("Ops Autopsy is a read-only demo. Every incident and log shown here is fictional.");
});

window.addEventListener("hashchange", () => {
  const incident = incidents.find((item) => item.id === window.location.hash.slice(1));
  if (!incident || incident.id === selectedIncident.id) return;
  selectedIncident = incident;
  selectedEventIndex = 0;
  setCompareMode(false);
  renderApp();
});

const initialIncident = incidents.find((incident) => incident.id === window.location.hash.slice(1));
if (initialIncident) selectedIncident = initialIncident;
setCompareMode(false);
renderApp();
