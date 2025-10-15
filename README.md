# Heartbeat

A romantic web application for capturing shared moments, future plans, and heartfelt messages. Built with Vue 3 + TypeScript on the front end and an Express + MongoDB backend.

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB instance

### Installation

```
npm install
```

This installs dependencies for both the client and server using npm workspaces.

### Environment

Create a `.env` file in `server/` with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/heartbeat
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

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
server/   # Express + MongoDB backend
```

## Testing

```
npm test
```

Currently runs type checks for both client and server.

## License

MIT
