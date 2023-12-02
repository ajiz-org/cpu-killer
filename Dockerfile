# Build stage
FROM node:20-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/.next ./.next
COPY package*.json ./
RUN npm install next
EXPOSE 3000
CMD ["npm", "start"]
