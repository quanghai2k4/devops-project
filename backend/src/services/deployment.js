import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get current deployment information
 */
export function getCurrentDeployment() {
  try {
    const deploymentPath = path.resolve(config.deploymentFile);
    
    if (!fs.existsSync(deploymentPath)) {
      return {
        version: 'unknown',
        deployedAt: null,
        commitHash: null,
        deployedBy: null,
        error: 'Deployment file not found'
      };
    }

    const data = fs.readFileSync(deploymentPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading deployment info:', error);
    return {
      version: 'unknown',
      deployedAt: null,
      commitHash: null,
      deployedBy: null,
      error: error.message
    };
  }
}

/**
 * Update deployment information
 */
export function updateDeployment(deploymentData) {
  try {
    const deploymentPath = path.resolve(config.deploymentFile);
    const dir = path.dirname(deploymentPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      version: deploymentData.version || 'v1.0.0',
      deployedAt: new Date().toISOString(),
      commitHash: deploymentData.commitHash || null,
      deployedBy: deploymentData.deployedBy || 'manual',
      ...deploymentData
    };

    fs.writeFileSync(deploymentPath, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error updating deployment info:', error);
    throw error;
  }
}

/**
 * Get deployment history
 */
export function getDeploymentHistory() {
  try {
    const historyPath = path.resolve('./data/deployment-history.json');
    
    if (!fs.existsSync(historyPath)) {
      return [];
    }

    const data = fs.readFileSync(historyPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading deployment history:', error);
    return [];
  }
}

/**
 * Add to deployment history
 */
export function addToHistory(deployment) {
  try {
    const historyPath = path.resolve('./data/deployment-history.json');
    const dir = path.dirname(historyPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let history = [];
    if (fs.existsSync(historyPath)) {
      const data = fs.readFileSync(historyPath, 'utf-8');
      history = JSON.parse(data);
    }

    // Add new deployment to history
    history.unshift(deployment);
    
    // Keep only last 20 deployments
    history = history.slice(0, 20);

    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    return history;
  } catch (error) {
    console.error('Error adding to deployment history:', error);
    throw error;
  }
}

/**
 * Check service health
 */
export async function checkServicesHealth() {
  const services = {
    backend: { 
      status: 'running', 
      port: config.port, 
      uptime: process.uptime() 
    },
    frontend: { status: 'unknown' },
    nginx: { status: 'unknown' }
  };

  // Check if frontend index.html exists
  try {
    const frontendPath = '/var/www/html/index.html';
    if (fs.existsSync(frontendPath)) {
      services.frontend = { status: 'running' };
    } else {
      services.frontend = { status: 'error' };
    }
  } catch (error) {
    services.frontend = { status: 'error' };
  }

  // Check Nginx by checking systemctl status
  try {
    const result = execSync('systemctl is-active nginx 2>/dev/null || echo "inactive"', { encoding: 'utf-8' });
    if (result.trim() === 'active') {
      services.nginx = { status: 'running' };
    } else {
      services.nginx = { status: 'inactive' };
    }
  } catch (error) {
    // If systemctl not available, check if nginx process exists
    try {
      const result = execSync('pgrep -x nginx >/dev/null 2>&1 && echo "running" || echo "stopped"', { encoding: 'utf-8' });
      if (result.trim() === 'running') {
        services.nginx = { status: 'running' };
      } else {
        services.nginx = { status: 'stopped' };
      }
    } catch (err) {
      services.nginx = { status: 'unknown' };
    }
  }

  return services;
}
