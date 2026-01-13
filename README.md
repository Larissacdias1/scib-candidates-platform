# SCIB Candidates Platform

Full-stack candidates management platform built with Angular and NestJS.

## Tech Stack

**Frontend:** Angular 17, Angular Material, RxJS, Reactive Forms

**Backend:** NestJS, TypeORM, SQLite, class-validator

## Features

- Candidate registration with Excel file upload
- Candidates list with filtering and actions
- Candidate detail view
- Responsive design (desktop, tablet, mobile)
- Server-side Excel processing

## Project Structure

```
├── frontend/
│   └── src/app/
│       ├── core/           # Services, state, models
│       ├── features/       # Feature components
│       └── shared/         # Reusable components
│
├── backend/
│   └── src/
│       └── candidates/     # CRUD module
│
└── .github/workflows/      # CI/CD
```

## Getting Started

**Requirements:** Node.js 18+, npm 9+

```bash
# Install dependencies
npm run install:all

# Start backend (http://localhost:3000)
cd backend && npm run start:dev

# Start frontend (http://localhost:4200)
cd frontend && npm start
```

## API Endpoints

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| GET    | /api/candidates     | List candidates    |
| GET    | /api/candidates/:id | Get by ID          |
| POST   | /api/candidates     | Create (multipart) |
| PUT    | /api/candidates/:id | Update             |
| DELETE | /api/candidates/:id | Delete             |

## Excel Format

| Column       | Type    | Values               |
| ------------ | ------- | -------------------- |
| seniority    | string  | junior, senior       |
| years        | number  | 0-50                 |
| availability | boolean | true, false, yes, no |

## Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

Test coverage includes:

- API service (HTTP calls, error handling)
- State management (store operations)
- Components (form validation, user interactions)

## License

Proprietary - Santander Corporate & Investment Banking
