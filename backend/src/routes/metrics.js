import express from 'express';
import { getCurrentMetrics, getSystemInfo } from '../services/metricsCollector.js';

const router = express.Router();

/**
 * GET /api/metrics/current
 * Get current system metrics
 */
router.get('/current', async (req, res, next) => {
  try {
    const metrics = await getCurrentMetrics();
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/metrics/system-info
 * Get static system information
 */
router.get('/system-info', async (req, res, next) => {
  try {
    const systemInfo = await getSystemInfo();
    res.json(systemInfo);
  } catch (error) {
    next(error);
  }
});

export default router;
