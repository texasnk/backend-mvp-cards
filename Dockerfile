FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends poppler-utils \
  && rm -rf /var/lib/apt/lists/*

COPY package.json tsconfig.json jest.config.ts ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

