# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Set environment variables for React build
ARG REACT_APP_AI_AGENT_URL=http://localhost:8080
ENV REACT_APP_AI_AGENT_URL=$REACT_APP_AI_AGENT_URL
ENV REACT_APP_BANK_URL=http://localhost:80

RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]