# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=21.6.2
FROM node:${NODE_VERSION}-slim as base

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=9.1.1
RUN npm install -g pnpm@$PNPM_VERSION

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential openssl pkg-config python-is-python3

# Copy package.json and pnpm-lock.yaml to the container
COPY --link package.json pnpm-lock.yaml ./

# Install node modules
RUN pnpm install --frozen-lockfile

# Copy application code
COPY --link . .

# Generate Prisma Client
COPY --link prisma .
RUN npx prisma generate

# RUN npm run build
# Start the server by default, this can be overwritten at runtime
ENV PORT=4000
EXPOSE 4000

CMD ["npm", "run", "start"]
