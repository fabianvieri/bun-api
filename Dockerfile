ARG BUN_VERSION=1.1.42
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY --link bun.lockb package.json ./
RUN bun install --ci

COPY --link . .
RUN bun run build

FROM base

COPY --from=build /app/dist /app/.env /app/

EXPOSE 3000

CMD [ "bun", "index.js" ]