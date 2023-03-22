FROM node:alpine
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
RUN yarn install
CMD ["yarn", "start:dev"]
