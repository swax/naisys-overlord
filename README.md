# Full Stack TypeScript Application

A modern full-stack application using Node.js/Fastify for the backend and React/Vite for the frontend, all with TypeScript support.

## Tech Stack

### Backend
- **Node.js** with **TypeScript**
- **Fastify** web framework
- **CORS** support
- Hot reload during development

### Frontend
- **React 18** with **TypeScript**
- **Vite** build tool
- **React Router** for routing
- **TanStack Query** for API calls
- Hot reload during development

## Project Structure

```
├── server/           # Backend API
│   ├── src/
│   │   ├── routes/   # API routes
│   │   └── server.ts # Main server file
│   ├── dist/         # Compiled JavaScript (production)
│   └── package.json
├── client/           # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   ├── dist/         # Built static files (production)
│   └── package.json
└── package.json      # Root workspace configuration
```

## Development

### Prerequisites
- Node.js 18+ 
- npm

### Setup
```bash
# Install all dependencies
npm run install:all

# Start development servers (both frontend and backend)
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:5173
- Frontend proxies `/api/*` requests to backend

### Individual Development
```bash
# Backend only
npm run dev --workspace=server

# Frontend only  
npm run dev --workspace=client
```

## Production

### Build
```bash
# Build both frontend and backend
npm run build
```

### Deploy
```bash
# Start production server (serves both API and built React app)
npm start
```

The production server:
- Serves the React app as static files
- Handles API routes under `/api/*`
- Runs on a single port (default: 3001)

## API Endpoints

- `GET /api/hello` - Returns a hello world message with timestamp

## Features

- ✅ TypeScript throughout the stack
- ✅ Hot reload in development
- ✅ Single server deployment in production
- ✅ API proxy during development
- ✅ React Router for SPA routing
- ✅ TanStack Query for server state
- ✅ CORS configured for development
- ✅ Static file serving in production