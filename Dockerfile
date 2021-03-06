FROM mcr.microsoft.com/playwright:v1.17.1-focal

# Create app dir
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Build in production mode.
RUN npm ci --only=production

COPY main.js .env.js ./

CMD [ "node", "main.js" ]
