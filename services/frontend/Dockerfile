FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_AUTH_URL
ARG VITE_ASSESSMENT_URL
ARG VITE_THERAPIST_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_ASSESSMENT_URL=$VITE_ASSESSMENT_URL
ENV VITE_THERAPIST_URL=$VITE_THERAPIST_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK NONE
