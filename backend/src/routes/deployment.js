import express from 'express';
import {
  getCurrentDeployment,
  updateDeployment,
  getDeploymentHistory,
  addToHistory,
  checkServicesHealth
} from '../services/deployment.js';

const router = express.Router();

/**
 * GET /api/deployment/current
 * Get current deployment information
 */
router.get('/current', (req, res, next) => {
  try {
    const deployment = getCurrentDeployment();
    res.json(deployment);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/deployment/history
 * Get deployment history
 */
router.get('/history', (req, res, next) => {
  try {
    const history = getDeploymentHistory();
    res.json(history);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/deployment/health
 * Check all services health
 */
router.get('/health', async (req, res, next) => {
  try {
    const health = await checkServicesHealth();
    res.json(health);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/deployment/update
 * Update deployment information
 */
router.post('/update', (req, res, next) => {
  try {
    const deployment = updateDeployment(req.body);
    addToHistory(deployment);
    res.json(deployment);
  } catch (error) {
    next(error);
  }
});

export default router;
