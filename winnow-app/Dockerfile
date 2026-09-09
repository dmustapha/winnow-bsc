FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm i --fetch-retries=5 --fetch-timeout=120000
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DB_PATH=/app/data/winnow.db
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/node_modules/tsx ./node_modules/tsx
COPY --from=build /app/seed ./seed
EXPOSE 3000
CMD ["sh", "-c", "export HOSTNAME=0.0.0.0; mkdir -p /app/data && [ -f /app/data/winnow.db ] || cp /app/seed/winnow-seed.db /app/data/winnow.db; node server.js"]
