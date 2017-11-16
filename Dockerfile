FROM node:8.9.1-alpine

MAINTAINER Marius Lundgård <studio@mariuslundgard.com>

# Change timezone
RUN apk add --update tzdata
ENV TZ=Europe/Oslo

# Install node modules
RUN mkdir /tmp/npm
COPY package.json package-lock.json README.md /tmp/npm/
RUN cd /tmp/npm && npm install --no-progress --loglevel error

# Set working dir
WORKDIR /usr/src/app
ADD . /usr/src/app

# Copy cached node modules
RUN cp -a /tmp/npm/node_modules .

# Build application
RUN npm run build

# Prune dependencies and clean cache
RUN npm prune --production
RUN npm cache clean --force

# Clean APK cache
RUN rm -rf /var/cache/apk/*

CMD ["npm", "start"]

EXPOSE 3000
