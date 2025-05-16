FROM node:20-alpine

WORKDIR /frontend

ENV HOSTLINK=https://localhost:3000

COPY ./package.json .

RUN yarn install

COPY . .

EXPOSE 8080

CMD ["yarn", "dev"]
