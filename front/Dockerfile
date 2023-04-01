# FROM node:19-alpine3.16
FROM node:latest

WORKDIR /app

# COPY ./front ./
COPY ../app-lib ../app-lib
COPY ./front/package.json ./
# RUN npm install;
# RUN npm install ../lib;

# CMD ["npm", "run", "start:dev"]
RUN npm install;
RUN npm install ../app-lib;

# CMD ["yarn", "install"]
CMD ["npm", "run", "build"]
# CMD [ "tail", "-f", "/dev/null" ]