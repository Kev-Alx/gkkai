FROM node:22.9.0-slim

RUN apt update && apt install -y openssl curl

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN npm cache clean --force
RUN pnpm install

COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV development

EXPOSE 3000

CMD ["pnpm", "run", "dev"]