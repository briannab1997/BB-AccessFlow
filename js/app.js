const STORAGE_KEY = "accessflow_demo_state";

const seedData = {
  role: "employee",
  employees: [
    { id: "E-1042", name: "Maya Patel", department: "Human Resources", title: "HR Coordinator", manager: "Daniel Brooks", location: "Greenville, SC" },
    { id: "E-1188", name: "Jordan Ellis", department: "Payroll", title: "Payroll Analyst", manager: "Daniel Brooks", location: "Charlotte, NC" },
    { id: "E-1225", name: "Alicia Reed", department: "Benefits", title: "Benefits Specialist", manager: "Priya Shah", location: "Remote" },
    { id: "E-1309", name: "Noah Kim", department: "Finance", title: "Reporting Analyst", manager: "Priya Shah", location: "Atlanta, GA" },
    { id: "E-1417", name: "Brianna Lee", department: "IT Support", title: "Service Desk Tech", manager: "Daniel Brooks", location: "Greer, SC" },
    { id: "E-1560", name: "Camila Torres", department: "Operations", title: "Operations Lead", manager: "Marcus Green", location: "Columbia, SC" }
  ],
  requests: [
    {
      id: "REQ-2401",
      employeeId: "E-1042",
      system: "PeopleSoft HR",
      access: "Read Only",
      status: "Approved",
      submitted: "2026-05-17",
      reason: "Needs employee profile lookup access for onboarding support.",
      decidedBy: "Daniel Brooks"
    },
    {
      id: "REQ-2402",
      employeeId: "E-1188",
      system: "Payroll Portal",
      access: "Reporting",
      status: "Pending",
      submitted: "2026-05-20",
      reason: "Needs weekly payroll reconciliation reports for department audits.",
      decidedBy: ""
    },
    {
      id: "REQ-2403",
      employeeId: "E-1225",
      system: "Benefits Admin",
      access: "Standard User",
      status: "Pending",
      submitted: "2026-05-21",
      reason: "Needs benefits eligibility lookup access during open enrollment.",
      decidedBy: ""
    },
    {
      id: "REQ-2404",
      employeeId: "E-1309",
      system: "Data Warehouse",
      access: "Administrator",
      status: "Denied",
      submitted: "2026-05-22",
      reason: "Requested elevated reporting permissions for ad hoc finance data pulls.",
      decidedBy: "Priya Shah"
    }
  ],
  auditLog: [
    { time: "2026-05-17 09:15", actor: "Daniel Brooks", action: "Approved REQ-2401 for Maya Patel" },
    { time: "2026-05-20 14:35", actor: "Jordan Ellis", action: "Submitted REQ-2402 for Payroll Portal reporting access" },
    { time: "2026-05-21 10:05", actor: "Alicia Reed", action: "Submitted REQ-2403 for Benefits Admin standard access" },
    { time: "2026-05-22 16:10", actor: "Priya Shah", action: "Denied REQ-2404 due to elevated access level" }
  ]
};

let state = loadState();
let currentView = "dashboard";

const pageTitle = document.getElementById("page-title");
const toast = document.getElementById("toast");
const requestSearch = document.getElementById("request-search");
const statusFilter = document.getElementById("status-filter");
const employeeSearch = document.getElementById("employee-search");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seedData);

  try {
    return JSON.parse(saved);
  } catch {
    return structuredClone(seedData);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getEmployee(employeeId) {
  return state.employees.find(employee => employee.id === employeeId);
}

function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function formatAuditTime(date = new Date()) {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function nextRequestId() {
  const max = state.requests.reduce((highest, request) => {
    const number = Number(request.id.replace("REQ-", ""));
    return Number.isNaN(number) ? highest : Math.max(highest, number);
  }, 2400);
  return `REQ-${max + 1}`;
}

function statusClass(status) {
  return `status-${status.toLowerCase()}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function setView(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach(section => section.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  pageTitle.textContent = {
    dashboard: "Dashboard",
    requests: "Requests",
    employees: "Employees",
    audit: "Audit Log"
  }[view];
}

function setRole(role) {
  state.role = role;
  saveState();
  document.querySelectorAll(".role-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.role === role);
  });
  render();
  showToast(`Viewing as ${role}`);
}

function addAudit(actor, action) {
  state.auditLog.unshift({
    time: formatAuditTime(),
    actor,
    action
  });
}

function submitRequest(event) {
  event.preventDefault();
  const employeeId = document.getElementById("employee-select").value;
  const employee = getEmployee(employeeId);
  const request = {
    id: nextRequestId(),
    employeeId,
    system: document.getElementById("system-select").value,
    access: document.getElementById("access-select").value,
    status: "Pending",
    submitted: formatDate(),
    reason: document.getElementById("reason-input").value.trim(),
    decidedBy: ""
  };

  state.requests.unshift(request);
  addAudit(employee.name, `Submitted ${request.id} for ${request.system} ${request.access} access`);
  saveState();
  event.target.reset();
  render();
  showToast("Access request submitted");
}

function decideRequest(requestId, status) {
  const request = state.requests.find(item => item.id === requestId);
  if (!request || request.status !== "Pending") return;

  const employee = getEmployee(request.employeeId);
  const actor = state.role === "admin" ? "AccessFlow Admin" : employee.manager;
  request.status = status;
  request.decidedBy = actor;
  addAudit(actor, `${status} ${request.id} for ${employee.name}`);
  saveState();
  render();
  showToast(`${request.id} ${status.toLowerCase()}`);
}

function resetDemo() {
  state = structuredClone(seedData);
  saveState();
  render();
  showToast("Demo data reset");
}

function exportCsv() {
  const rows = [
    ["Request ID", "Employee", "Department", "System", "Access", "Status", "Submitted", "Decided By"],
    ...state.requests.map(request => {
      const employee = getEmployee(request.employeeId);
      return [
        request.id,
        employee.name,
        employee.department,
        request.system,
        request.access,
        request.status,
        request.submitted,
        request.decidedBy
      ];
    })
  ];

  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "accessflow-requests.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("CSV exported");
}

function renderMetrics() {
  const totals = {
    requests: state.requests.length,
    pending: state.requests.filter(request => request.status === "Pending").length,
    approved: state.requests.filter(request => request.status === "Approved").length,
    employees: state.employees.length
  };

  document.getElementById("metrics-grid").innerHTML = [
    ["Total Requests", totals.requests],
    ["Pending Review", totals.pending],
    ["Approved", totals.approved],
    ["Employees", totals.employees]
  ].map(([label, value]) => `
    <article class="metric">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join("");
}

function renderStatusBars() {
  const statuses = ["Pending", "Approved", "Denied"];
  const total = Math.max(state.requests.length, 1);
  const colors = {
    Pending: "#f59e0b",
    Approved: "#22c55e",
    Denied: "#ef4444"
  };

  document.getElementById("status-bars").innerHTML = statuses.map(status => {
    const count = state.requests.filter(request => request.status === status).length;
    const percent = Math.round((count / total) * 100);
    return `
      <div class="status-row">
        <div class="status-meta">
          <span>${status}</span>
          <span>${count} request${count === 1 ? "" : "s"}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${percent}%; background: ${colors[status]}"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderEmployeeSelect() {
  document.getElementById("employee-select").innerHTML = state.employees.map(employee => `
    <option value="${employee.id}">${employee.name} - ${employee.department}</option>
  `).join("");
}

function renderApprovals() {
  const pending = state.requests.filter(request => request.status === "Pending");
  const canApprove = state.role === "manager" || state.role === "admin";

  document.getElementById("approval-list").innerHTML = pending.length ? pending.map(request => {
    const employee = getEmployee(request.employeeId);
    return `
      <article class="approval-card">
        <div>
          <h4>${request.id} - ${employee.name}</h4>
          <p>${employee.department} needs <strong>${request.access}</strong> access to <strong>${request.system}</strong>.</p>
          <p>${request.reason}</p>
        </div>
        <div class="approval-actions">
          <button class="approve-btn" data-decision="Approved" data-request="${request.id}" ${canApprove ? "" : "disabled"}>Approve</button>
          <button class="deny-btn" data-decision="Denied" data-request="${request.id}" ${canApprove ? "" : "disabled"}>Deny</button>
        </div>
      </article>
    `;
  }).join("") : `<p class="empty-state">No pending requests.</p>`;
}

function filteredRequests() {
  const query = requestSearch.value.trim().toLowerCase();
  const status = statusFilter.value;

  return state.requests.filter(request => {
    const employee = getEmployee(request.employeeId);
    const text = `${request.id} ${employee.name} ${employee.department} ${request.system} ${request.access}`.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesStatus = status === "All" || request.status === status;
    return matchesQuery && matchesStatus;
  });
}

function renderRequestsTable() {
  const rows = filteredRequests();
  document.getElementById("requests-table").innerHTML = rows.length ? rows.map(request => {
    const employee = getEmployee(request.employeeId);
    return `
      <tr>
        <td>${request.id}</td>
        <td>${employee.name}</td>
        <td>${employee.department}</td>
        <td>${request.system}</td>
        <td>${request.access}</td>
        <td><span class="status-pill ${statusClass(request.status)}">${request.status}</span></td>
        <td>${request.submitted}</td>
      </tr>
    `;
  }).join("") : `<tr><td colspan="7">No requests match the current filters.</td></tr>`;
}

function renderEmployees() {
  const query = employeeSearch.value.trim().toLowerCase();
  const employees = state.employees.filter(employee => {
    const text = `${employee.name} ${employee.department} ${employee.title} ${employee.manager}`.toLowerCase();
    return !query || text.includes(query);
  });

  document.getElementById("employee-grid").innerHTML = employees.map(employee => `
    <article class="employee-card">
      <h4>${employee.name}</h4>
      <p>${employee.title}</p>
      <p>${employee.location}</p>
      <div class="employee-meta">
        <span class="chip">${employee.id}</span>
        <span class="chip">${employee.department}</span>
        <span class="chip">Mgr: ${employee.manager}</span>
      </div>
    </article>
  `).join("");
}

function renderAudit() {
  document.getElementById("audit-list").innerHTML = state.auditLog.map(item => `
    <article class="audit-item">
      <span class="audit-time">${item.time}</span>
      <div>
        <h4>${item.actor}</h4>
        <p>${item.action}</p>
      </div>
    </article>
  `).join("");
}

function render() {
  document.querySelectorAll(".role-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.role === state.role);
  });

  renderMetrics();
  renderStatusBars();
  renderEmployeeSelect();
  renderApprovals();
  renderRequestsTable();
  renderEmployees();
  renderAudit();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelectorAll(".role-btn").forEach(button => {
  button.addEventListener("click", () => setRole(button.dataset.role));
});

document.getElementById("request-form").addEventListener("submit", submitRequest);
document.getElementById("btn-reset").addEventListener("click", resetDemo);
document.getElementById("btn-export").addEventListener("click", exportCsv);
requestSearch.addEventListener("input", renderRequestsTable);
statusFilter.addEventListener("change", renderRequestsTable);
employeeSearch.addEventListener("input", renderEmployees);

document.getElementById("approval-list").addEventListener("click", event => {
  const button = event.target.closest("button[data-request]");
  if (!button || button.disabled) return;
  decideRequest(button.dataset.request, button.dataset.decision);
});

setView(currentView);
render();
