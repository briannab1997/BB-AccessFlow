const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "app.js"), "utf8");

const storage = new Map();
const context = {
  console,
  Blob,
  URL: {
    createObjectURL: () => "blob:test",
    revokeObjectURL: () => {}
  },
  setTimeout: () => {},
  localStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  },
  structuredClone: value => JSON.parse(JSON.stringify(value)),
  document: {
    getElementById: () => mockElement(),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => mockElement()
  }
};

function mockElement() {
  return {
    value: "",
    textContent: "",
    innerHTML: "",
    dataset: {},
    disabled: false,
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {}
    },
    addEventListener: () => {},
    click: () => {},
    closest: () => null,
    reset: () => {}
  };
}

vm.createContext(context);
vm.runInContext(`${source}\nthis.__accessFlow = { seedData, nextRequestId, statusClass, getEmployee };`, context);

const app = context.__accessFlow;

assert.equal(app.seedData.employees.length, 6, "seed data should include demo employees");
assert.equal(app.seedData.requests.length, 4, "seed data should include demo requests");
assert.equal(app.getEmployee("E-1042").name, "Maya Patel", "employee lookup should return the matching employee");
assert.equal(app.nextRequestId(), "REQ-2405", "next request id should follow the highest seeded request");
assert.equal(app.statusClass("Pending"), "status-pending", "status class should normalize status names");

for (const request of app.seedData.requests) {
  assert.match(request.id, /^REQ-\d+$/, "request ids should use the REQ prefix");
  assert.ok(app.getEmployee(request.employeeId), `${request.id} should reference an employee`);
  assert.ok(["Pending", "Approved", "Denied"].includes(request.status), `${request.id} should use a supported status`);
}

console.log("All AccessFlow tests passed.");
