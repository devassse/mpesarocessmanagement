FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js and required packages
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update && apt-get install -y \
    nodejs \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install global packages
RUN npm install -g nodemon

ENV mongoURI=mongodb://mongo_instance:27017/mpesa_business_process_pdf
ENV wsServer=ws://sandbox_backend:3000


# Create required directories
RUN mkdir -p uploads output && \
    chmod 777 uploads output

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start the server
CMD [ "npm", "run", "dev" ]