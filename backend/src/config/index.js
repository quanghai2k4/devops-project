import dotenv from 'dotenv';

dotenv.config();

export default {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Metrics
  metricsInterval: parseInt(process.env.METRICS_INTERVAL) || 2000,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Nginx Logs
  nginxAccessLog: process.env.NGINX_ACCESS_LOG || '/var/log/nginx/access.log',
  nginxErrorLog: process.env.NGINX_ERROR_LOG || '/var/log/nginx/error.log',
  
  // Deployment
  deploymentFile: process.env.DEPLOYMENT_FILE || './data/deployment.json',
};
