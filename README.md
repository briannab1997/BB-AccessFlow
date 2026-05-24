# AccessFlow

AccessFlow is a mock enterprise access request system for HR and IT approval workflows. It models the type of internal business software used to request system access, review approvals, track status, and keep an audit history.

Live demo: https://briannab1997.github.io/BB-AccessFlow/

## Features

- Role views for Employee, Manager, and Admin
- Access request form with employee, system, access level, and justification fields
- Manager/Admin approval queue
- Request dashboard with status metrics
- Searchable and filterable request table
- Employee directory with department and manager details
- Audit log for submitted, approved, and denied requests
- CSV export for request reporting
- Demo reset for repeatable walkthroughs
- Responsive layout for desktop and mobile

## Why This Project

AccessFlow was built to show practical enterprise software skills: workflow state, data accuracy, role-based views, auditability, reporting, and clear UI for repeat business processes.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser localStorage

## Run Locally

```bash
npm start
```

Then open:

```text
http://localhost:8000
```

## Test

```bash
npm test
```

## Project Structure

```text
.
├── css/
│   └── style.css
├── js/
│   └── app.js
├── tests/
│   └── app.test.js
├── index.html
├── package.json
└── README.md
```

## Portfolio Summary

AccessFlow is a mock enterprise workflow app that demonstrates role-based request handling, approval state management, audit logging, searchable records, and CSV reporting for HR/IT access requests.
