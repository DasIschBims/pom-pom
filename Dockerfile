# Stage 0 - Install dependencies
FROM node:18 as dependencies
WORKDIR /usr/src/app

# Copy package.json and install app dependencies
COPY package.json ./
COPY /prisma ./prisma

RUN npm install --omit=dev

################################################
# Stage 1 - Build app
FROM dependencies as build

# Copy app source
COPY . .

# Build app
RUN npm run build

################################################
# Stage 2 - Run app
FROM node:18 as run
WORKDIR /usr/src/app

# Copy files
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/.env ./.env
COPY --from=build /usr/src/app/prisma ./prisma

# Change NODE_ENV to prod inside .env if not already set
RUN sed -i 's/NODE_ENV=.*/NODE_ENV=prod/g' .env

# Install netcat to wait for database
RUN apt-get update && apt-get install -y netcat-traditional

# Add a script to wait for the database
COPY wait-for.sh ./wait-for.sh
RUN chmod +x ./wait-for.sh

# Generate prisma client
RUN npm run prisma:generate

# Start app
CMD /bin/sh -c "./wait-for.sh pompom-database 3306 && npx prisma migrate deploy && npm run start:prod"