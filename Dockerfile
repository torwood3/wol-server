FROM hypriot/rpi-node:boron

# Create app directory
WORKDIR /app

# Install app dependencies
ADD package.json /app
RUN npm install --production

ADD . /app

EXPOSE 8080

CMD ["npm","start"]
