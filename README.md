# Docker Todo Application

A simple todo application to demonstrate Docker concepts using a full-stack application (React + Node.js + MongoDB).

## Project Structure

```
├── frontend/          # React application
├── backend/           # Node.js API
├── database/          # MongoDB data
├── docker-compose.yml # Docker services configuration
└── README.md         # This file
```

## Docker Core Concepts

### 1. Image vs Container

- **Image**: A blueprint/template (like a class in programming)

  - Read-only
  - Contains code, runtime, dependencies
  - Used to create containers

- **Container**: Running instance of an image (like an object of a class)
  - Read-write
  - Has its own state
  - Can be started, stopped, deleted

Example:

```bash
# One image, multiple containers
docker run -d --name todo-app1 -p 3000:3000 backend-image
docker run -d --name todo-app2 -p 3001:3000 backend-image
```

### 2. Dockerfile vs docker-compose.yml

#### Dockerfile

- Purpose: Builds ONE image
- Location: One per service (`frontend/Dockerfile`, `backend/Dockerfile`)
- Example:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### docker-compose.yml

- Purpose: Orchestrates multiple containers
- Location: Root directory
- Manages:
  - Services
  - Networks
  - Volumes
  - Environment variables

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "5174:5174"
  backend:
    build: ./backend
    ports:
      - "3000:3000"
  database:
    image: mongo:latest
```

### 3. Volumes

- Purpose: Persistent data storage
- Example: MongoDB data persists even if container is deleted

```yaml
volumes:
  - mongodb_data:/data/db # Host:Container mapping
```

## Setup & Running

### Prerequisites

1. Install Docker Desktop
2. Clone this repository

```bash
git clone <repository-url>
cd <repository-name>
```

### Running the Application

1. **Start all services**:

```bash
docker compose up --build
```

2. **Stop all services**:

```bash
docker compose down
```

3. **View logs**:

```bash
docker compose logs -f
```

### Accessing Services

- Frontend: http://localhost:5174
- Backend API: http://localhost:3000
- MongoDB: localhost:27017

## Useful Docker Commands

### Images

```bash
# List images
docker images

# Remove image
docker rmi <image-name>

# Build image
docker build -t <image-name> .
```

### Containers

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop container
docker stop <container-name>

# Remove container
docker rm <container-name>
```

### Volumes

```bash
# List volumes
docker volume ls

# Remove volume
docker volume rm <volume-name>
```

### Docker Compose

```bash
# Start services
docker compose up

# Start and rebuild services
docker compose up --build

# Stop services
docker compose down

# View logs
docker compose logs

# View service status
docker compose ps
```

## Development

### Frontend (React + Vite)

- Port: 5174
- Hot reload enabled
- Dependencies managed in `frontend/package.json`

### Backend (Node.js + Express)

- Port: 3000 (API)
- Port: 3001 (WebSocket)
- Dependencies in `backend/package.json`

### Database (MongoDB)

- Port: 27017
- Data persisted in named volume
- Accessible via `mongodb://database:27017/myapp`

## Troubleshooting

1. **Port conflicts**:

   - Error: "port is already allocated"
   - Solution: Change port mapping in docker-compose.yml

2. **Container not starting**:

   - Check logs: `docker compose logs <service-name>`
   - Ensure all required files exist

3. **Data persistence issues**:
   - Verify volume configuration
   - Check volume exists: `docker volume ls`

## Understanding docker compose up --build

### What it does:

1. **Build Stage** (--build flag)

   ```bash
   # Creates/Updates these images:
   learning-project-1-frontend:latest
   learning-project-1-backend:latest
   # Downloads if not present:
   mongo:latest
   ```

2. **Create Stage**

   ```bash
   # Creates containers:
   frontend-container  → from frontend image
   backend-container   → from backend image
   database-container  → from mongo image
   ```

3. **Start Stage**
   ```bash
   # Starts in order:
   1. database (mongodb)
   2. backend  (depends on database)
   3. frontend (depends on backend)
   ```

### Common Scenarios:

1. **First Time Run**:

   ```bash
   docker compose up --build
   # - Builds all images
   # - Creates containers
   # - Starts everything
   ```

2. **After Code Changes**:

   ```bash
   docker compose up --build
   # - Rebuilds images with new code
   # - Recreates containers
   # - Starts everything
   ```

3. **No Code Changes**:
   ```bash
   docker compose up
   # - Uses existing images
   # - Creates containers
   # - Starts everything
   ```
