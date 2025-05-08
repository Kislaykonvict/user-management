#NestJS Backend Assignment – User and Document Management

This project provides a NestJS backend with APIs for::
- User management (registration, authentication, profiles)
- Admin controlled APIs for user operations.
- Document handling (upload, storage, retrieval)
- Built with TypeScript for robust server-side functionality


## Prerequisites

- Node.js v16+
- npm or yarn package manager
- TypeScript knowledge
- Database system (PostgreSQL/MongoDB)
- Docker (optional, for containerization)

## Clone the repository

```bash
git clone https://github.com/Kislaykonvict/user-management.git
cd user-management
```

## Install dependencies

```bash
npm install

```
create a .env file and copy the content from .env.docker file Replace the personal Postgres DB url.


## Install yarn 

```bash
yarn install 
```

## Run prisma 

```bash
npx prisma generate
yarn run prisma-all
```

## Run the project locally

```bash
yarn run start --watch
```

## Containerize with Docker

```bash
docker compose down -v
docker compose up --build
```

## API Endpoints for swagger

```bash
http://localhost:8000/api/
```


