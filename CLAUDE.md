# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Install all dependencies across workspaces
npm run install:all

# Start both frontend and backend development servers
npm run dev

# Build entire application for production
npm run build

# Start production server (serves both API and React app)
npm start
```

### Workspace-Specific Commands
```bash
# Backend only (TypeScript with hot reload)
npm run dev --workspace=server

# Frontend only (Vite dev server)
npm run dev --workspace=client

# Type checking
npm run type-check --workspace=server
npm run type-check --workspace=client

# Build server TypeScript to JavaScript
npm run build --workspace=server

# Build React app to static files
npm run build --workspace=client
```

## Architecture Overview

### Monorepo Structure
This is a TypeScript monorepo using npm workspaces with two main applications:
- `server/` - Fastify backend API
- `client/` - React frontend with Vite

### Development vs Production Architecture

**Development Mode:**
- Backend runs on `localhost:3001` using `tsx watch` for hot reload
- Frontend runs on `localhost:5173` using Vite dev server
- Vite proxies `/api/*` requests to backend via `vite.config.ts`
- CORS enabled for cross-origin requests

**Production Mode:**
- Single Fastify server serves both API and static React files
- Client builds to `client/dist/` static files
- Server serves React app from `server/src/server.ts:24-37`
- SPA routing handled via catch-all handler (`server/src/server.ts:31-37`)

### Key Integration Points

1. **API Communication**: Frontend uses centralized API client in `client/src/lib/api.ts` with shared TypeScript interfaces
2. **State Management**: TanStack Query handles server state, configured in `client/src/lib/queryClient.ts`
3. **Routing**: React Router provides SPA routing, with backend catch-all ensuring client-side routes work in production
4. **Static Serving**: In production, Fastify serves client build files while preserving API routes under `/api/*`

### TypeScript Setup
- Server uses ES modules with `tsx` for development and `tsc` for production builds
- Client uses Vite's TypeScript support with strict type checking
- Shared response interfaces between frontend and backend (e.g., `HelloResponse`)

### Environment Handling
- `NODE_ENV=production` switches server to production mode (static file serving, different CORS)
- Port configured via `PORT` environment variable (defaults to 3001)
- Host binding: `localhost` in development, `0.0.0.0` in production

## Apache Reverse Proxy Setup

This application is configured to run under the `/overlord/` path when using an Apache reverse proxy.

### Apache Configuration
```apache
ProxyPass /overlord/ http://localhost:3001/
ProxyPassReverse /overlord/ http://localhost:3001/
ProxyPreserveHost On
```

### Required Apache Modules
```bash
sudo a2enmod proxy proxy_http headers
```

### Application Configuration
- Vite base path set to `/overlord/` in `client/vite.config.ts`
- React Router basename set to `/overlord` in `client/src/App.tsx`
- All static assets and API calls work correctly under the proxied path