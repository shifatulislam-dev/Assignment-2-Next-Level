# Assignment 2

Internal Tech Issue & Feature Tracker is a backend API for software teams to report bugs, request features, and manage issue progress with role-based permissions.

**Live URL:** https://assignment-2-delta-ten.vercel.app  
**GitHub Repo:** https://github.com/shifatulislam-dev/Assignment-2-Next-Level

## Features

- User registration and login
- JWT-based authentication
- Role-based access control for `contributor` and `maintainer`
- Create, read, update, and delete issue records
- Contributors can update only their own open issues
- Maintainers can update any issue and delete issues
- Password hashing with `bcryptjs`
- PostgreSQL database integration
- Automatic table creation when the server starts
- Centralized error handling middleware

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT
- bcryptjs
- tsup
- Vercel

## Project Structure

```text
.
├── src/
│   ├── app.ts                         # Express app setup, middleware, and route mounting
│   ├── server.ts                      # Server entry point and database initialization
│   ├── config/
│   │   └── index.ts                   # Environment variable configuration
│   ├── db/
│   │   └── index.ts                   # PostgreSQL connection and table creation
│   ├── middleware/
│   │   ├── auth.ts                    # JWT authentication and role authorization
│   │   └── globalError.ts             # Global error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts     # Login request handler
│   │   │   ├── auth.route.ts          # Login route
│   │   │   └── auth.service.ts        # Login logic and JWT generation
│   │   ├── issues/
│   │   │   ├── issues.controller.ts   # Issue request handlers
│   │   │   ├── issues.interface.ts    # Issue interface
│   │   │   ├── issues.route.ts        # Issue routes
│   │   │   └── issues.service.ts      # Issue database logic
│   │   └── users/
│   │       ├── user.controller.ts     # User registration request handler
│   │       ├── user.interface.ts      # User interface
│   │       ├── user.route.ts          # Signup route
│   │       └── user.service.ts        # User registration logic
│   └── types/
│       └── index.ts                   # Shared role types and Express request typing
├── dist/                              # Production build output
├── package.json                       # Scripts and dependencies
├── tsconfig.json                      # TypeScript configuration
├── tsup.config.ts                     # Build configuration
└── vercel.json                        # Vercel deployment configuration
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/shifatulislam-dev/Assignment-2-Next-Level.git
cd Assignment-2-Next-Level
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env` file in the root directory.

```env
PORT=5000
DB_SECRET=your_postgresql_connection_string
TOKEN_SECRET=your_jwt_secret
```

### 4. Run the development server

```bash
npm run dev
```

The server will run on:

```text
http://localhost:5000
```

### 5. Build and run production

```bash
npm run build
npm start
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the TypeScript development server with watch mode |
| `npm run build` | Builds the project into the `dist` folder |
| `npm start` | Runs the compiled production server |
| `npm test` | Placeholder test script |

## Database Tables

The project creates the required tables automatically when the server starts.

### `users`

| Field | Type | Description |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `name` | `VARCHAR(20)` | User name |
| `email` | `VARCHAR(30)` | Unique user email |
| `password` | `TEXT` | Hashed password |
| `role` | `VARCHAR(15)` | `contributor` or `maintainer` |
| `created_at` | `TIMESTAMP` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | Update timestamp |

### `issues`

| Field | Type | Description |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `title` | `VARCHAR(150)` | Issue title |
| `description` | `TEXT` | Issue details, minimum 20 characters |
| `type` | `VARCHAR(20)` | `bug` or `feature_request` |
| `status` | `VARCHAR(20)` | `open`, `in_progress`, or `resolved` |
| `reporter_id` | `INT` | References `users.id` |
| `created_at` | `TIMESTAMP` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | Update timestamp |

## API Endpoints

Base URL:

```text
http://localhost:5000
```

Production URL:

```text
https://assignment-2-delta-ten.vercel.app
```

### Root

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Health check route |

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive an access token |

### Issues

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/issues` | Contributor, Maintainer | Create an issue |
| `GET` | `/api/issues` | Public | Get all issues |
| `GET` | `/api/issues/:id` | Public | Get a single issue |
| `PATCH` | `/api/issues/:id` | Contributor, Maintainer | Update an issue |
| `DELETE` | `/api/issues/:id` | Maintainer only | Delete an issue |

## Request Examples

### Signup

```json
{
  "name": "Sifat",
  "email": "sifat@example.com",
  "password": "password123",
  "role": "contributor"
}
```

The `role` field is optional. If no role is provided, the user is registered as a `contributor`.

### Login

```json
{
  "email": "sifat@example.com",
  "password": "password123"
}
```

### Create Issue

```json
{
  "title": "Login button is not working",
  "description": "The login button does not submit the form when clicked.",
  "type": "bug"
}
```

### Update Issue

```json
{
  "title": "Login form submit button is not working",
  "description": "The login button does not submit the form when clicked.",
  "type": "bug",
  "status": "in_progress"
}
```

## Authentication

Protected routes require a JWT access token in the request headers.

```text
Authorization: Bearer <accessToken>
```

After login, the API returns an `accessToken`. Use this token to create, update, or delete issues.

## Role Permissions

| Action | Contributor | Maintainer |
|---|---|---|
| Create issue | Yes | Yes |
| View all issues | Yes | Yes |
| View single issue | Yes | Yes |
| Update own open issue | Yes | Yes |
| Update any issue | No | Yes |
| Delete issue | No | Yes |

## Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "data": {}
}
```

## Deployment

The project is configured for Vercel deployment. The production server uses the compiled file from:

```text
dist/server.js
```

Before deploying, make sure the required environment variables are added to the Vercel project settings:

- `PORT`
- `DB_SECRET`
- `TOKEN_SECRET`

## Author

Md. Shifatul Islam
