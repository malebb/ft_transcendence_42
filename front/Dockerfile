# FROM node:19-alpine3.16
FROM node:latest

WORKDIR /app

COPY ./front ./
COPY ../lib ../app-lib

# RUN npm install;
# RUN npm install ../lib;

# CMD ["npm", "run", "start:dev"]
RUN yarn install;
RUN yarn add ../app-lib;

CMD ["yarn", "start"]
# CMD [ "tail", "-f", "/dev/null" ]