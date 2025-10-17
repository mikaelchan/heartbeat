# Heartbeat

A romantic web application for capturing shared moments, future plans, and heartfelt messages. Built with Vue 3 + TypeScript on the front end and an Express + MariaDB backend.

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MariaDB 10.11+ (or compatible MySQL server)

### Installation

```
npm install
```

This installs dependencies for both the client and server using npm workspaces.

### Environment

Create a `.env` file in `server/` with the following variables:

```
DATABASE_URL=mysql://heartbeat:heartbeat@localhost:3306/heartbeat
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

> ℹ️ If you're using Docker, you can start a MariaDB instance with `docker-compose -f docker-compose.mariadb.yml up -d`.

### Development

Run the client and server concurrently:

```
npm run dev
```

This will start:
- Vite dev server at `http://localhost:5173`
- Express API at `http://localhost:4000`

### Building for Production

```
npm run build
```

Outputs are generated in `client/dist`. Serve the static files with your preferred hosting solution and deploy the server separately.

## Project Structure

```
client/   # Vue 3 + TypeScript frontend
server/   # Express + MariaDB backend
```

## Testing

```
npm test
```

Currently runs type checks for both client and server.

## License

MIT
