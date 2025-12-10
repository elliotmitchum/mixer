# Use an official Node.js image
FROM node:20-alpine

# Enable Corepack (includes pnpm)
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /usr/src/app

EXPOSE 5173
