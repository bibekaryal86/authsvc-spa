# STAGE 1: BUILD #
FROM node:24-alpine as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# STAGE 2: PRODUCTION DEPLOYMENT #
FROM nginx:1.29.4-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
