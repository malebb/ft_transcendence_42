#!/bin/bash

until npx prisma db push; do
    sleep 0.1
    echo "Trying to connect with PostgreSQL container..."
done

yarn start:dev