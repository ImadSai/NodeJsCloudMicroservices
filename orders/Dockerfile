# ---- Base Node ----
FROM node:alpine as base

WORKDIR /app

COPY package.json .

RUN npm install -g npm@7.20.6

RUN npm install --production --legacy-peer-deps

# ---- Server ----
FROM base

COPY . .

CMD [ "npm", "start" ]
