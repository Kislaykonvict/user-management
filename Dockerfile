# Use Node.js base image
FROM node:18-bullseye-slim

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

COPY prisma ./prisma
RUN npx prisma generate


# Build the project
RUN npm run build

# Expose port 8000
EXPOSE 8000

# Start the app (assuming dist/main is your entry)
CMD ["node", "dist/src/main.js"]
