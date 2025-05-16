FROM node:20-alpine

RUN npm install pm2 -g

RUN npm install -g nodemon

WORKDIR /backend

COPY package.json .

ENV PORT=3000
ENV SECRET=MySecret
ENV MONGO_URI=mongodb://mongo_instance:27017/mpesa_business_process
ENV PDF_SERVER_URL=http://pdf_conversion_service:4000
ENV FACE_SERVER_URL=http://face_comparison_service:5500
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

