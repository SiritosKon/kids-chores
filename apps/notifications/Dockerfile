FROM docker.io/library/node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY apps/notifications/package.json apps/notifications/
RUN npm ci --workspace packages/contracts --workspace apps/notifications --include-workspace-root
COPY packages/contracts packages/contracts
COPY apps/notifications apps/notifications
RUN npm run build --workspace packages/contracts \
  && npm run build --workspace apps/notifications \
  && mkdir -p apps/notifications/node_modules

FROM docker.io/library/node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/contracts/package.json packages/contracts/
COPY --from=build /app/packages/contracts/dist packages/contracts/dist
COPY --from=build /app/apps/notifications/package.json apps/notifications/
COPY --from=build /app/apps/notifications/node_modules apps/notifications/node_modules
COPY --from=build /app/apps/notifications/dist apps/notifications/dist
WORKDIR /app/apps/notifications
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
