FROM node:18

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE $PORT

CMD ["sh", "-c", "echo \"$GCP_KEY\" > gcp.key.json && npm run start:prod"]