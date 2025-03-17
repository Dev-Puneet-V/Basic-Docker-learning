FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose multiple ports
EXPOSE 3000
EXPOSE 3001

CMD ["npm", "start"]