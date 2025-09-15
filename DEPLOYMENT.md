# Deployment Guide

## Production Deployment

### Environment Setup

1. **Server Requirements:**
   - Node.js 16+
   - MongoDB 4.4+
   - 2GB RAM minimum
   - SSL certificate for HTTPS

2. **Environment Variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://your-mongo-url/offer-church
   JWT_SECRET=your-super-secure-jwt-secret-key
   PORT=3001
   CLIENT_URL=https://your-domain.com
   ```

### Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN cd client && npm ci && npm run build
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

2. **Docker Compose:**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3001:3001"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/offer-church
         - NODE_ENV=production
       depends_on:
         - mongo
     
     mongo:
       image: mongo:4.4
       volumes:
         - mongo-data:/data/db
   
   volumes:
     mongo-data:
   ```

### Cloud Deployment Options

1. **Heroku:**
   - Add MongoDB Atlas addon
   - Set environment variables
   - Deploy with Git

2. **Digital Ocean:**
   - Use App Platform
   - Connect MongoDB cluster
   - Configure build settings

3. **AWS:**
   - Use Elastic Beanstalk
   - Connect to DocumentDB
   - Configure load balancer

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secret
- [ ] Configure CORS properly
- [ ] Use MongoDB authentication
- [ ] Set up rate limiting
- [ ] Enable file size limits
- [ ] Configure proper backup strategy

### Monitoring

- Set up application logging
- Monitor MongoDB performance
- Track API response times
- Set up error alerting
- Monitor file storage usage