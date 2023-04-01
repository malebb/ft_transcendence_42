# FROM node:latest
# # FROM node:19-alpine3.16

# WORKDIR /app

# COPY ./back ./
# COPY ../lib ../app-lib
# COPY ../.env ./


# # RUN npm install;
# # RUN npm install ../lib;

# # CMD ["npm", "run", "start:dev"]
# RUN yarn install;
# RUN yarn add ../app-lib;
# # RUN npx prisma generate

# CMD ["./scripts/launch-prod-docker.sh"]
# CMD [ "tail", "-f", "/dev/null" ]

FROM node:latest

WORKDIR /app

COPY ../lib ../app-lib
# COPY ../.env ./
RUN yarn add ../app-lib;
# COPY ./back/node_modules ./node_modules
# COPY ./back/package*.json ./
# COPY ./back/dist ./dist
# COPY ./back/prisma ./prisma

EXPOSE 3000

CMD [ "yarn", "install"]
ENTRYPOINT [ "yarn", "start:migrate:prod"]
