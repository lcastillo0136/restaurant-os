FROM node:24.20.0-bookworm-slim

WORKDIR /workspace
ENV NODE_ENV=development

RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @restaurant-os/api build

USER node
EXPOSE 3000

CMD ["node", "apps/api/dist/main.js"]
