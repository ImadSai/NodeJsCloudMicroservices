# Build Project
FROM node:alpine as build-step

RUN mkdir -p /app

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN npm run build --prod

# Copy Build to project

FROM nginx:1.21.3-alpine

COPY --from=build-step /app/dist/front-end /usr/share/nginx/html
