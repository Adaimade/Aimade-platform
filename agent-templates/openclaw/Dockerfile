FROM node:22-slim

WORKDIR /app

RUN npm install -g openclaw

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
