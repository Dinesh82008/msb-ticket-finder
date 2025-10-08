FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install || yarn install --frozen-lockfile || true
COPY . .
EXPOSE 5173
ENV VITE_API_TARGET=http://server:5050
CMD ["npm", "run", "dev"]
