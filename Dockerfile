FROM node:22.14.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force
COPY src ./src
COPY bin ./bin

FROM node:22.14.0-alpine
WORKDIR /app

ARG DB_CONNECTION
ARG JWT_SECRET
ARG JWT_EXPIRES
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG FACEBOOK_APP_ID
ARG FACEBOOK_APP_SECRET

ENV DB_CONNECTION=$DB_CONNECTION \
    JWT_SECRET=$JWT_SECRET \
    JWT_EXPIRES=$JWT_EXPIRES \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    FACEBOOK_APP_ID=$FACEBOOK_APP_ID \
    FACEBOOK_APP_SECRET=$FACEBOOK_APP_SECRET

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/bin ./bin
COPY package*.json ./

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser
EXPOSE 3000

CMD ["node", "./bin/www"]