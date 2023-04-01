#!/bin/bash

npx prisma generate

npx prisma migrate deploy

until npx prisma db push; do
    sleep 0.1
    echo "Trying to connect with PostgreSQL container..."
done

# sleep 1000
yarn start:prod