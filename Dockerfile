# Production image for Fly.io (and anywhere else you run containers).
FROM node:22-alpine AS runner

WORKDIR /app

# Tini-style init for clean SIGTERM handling (Discord.js disconnects more predictably).
RUN apk add --no-cache dumb-init

# Install production dependencies only (deterministic installs).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# App source (assets/, src/, scripts/, etc.)
COPY . .

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
# 256MB Fly VM: cap V8 heap so the process is less likely to thrash and spike CPU on GC under load.
ENV NODE_OPTIONS="--max-old-space-size=200"

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
