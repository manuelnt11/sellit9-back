FROM node:18

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN echo $GCP_KEY > gcp.key.json
RUN npm run build

EXPOSE $PORT

CMD ["npm", "run", "start:prod"]