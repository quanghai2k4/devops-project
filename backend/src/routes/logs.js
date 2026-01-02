import express from 'express';
import { readAccessLogs, readErrorLogs, getLogStats } from '../services/logWatcher.js';

const router = express.Router();

/**
 * GET /api/logs/access
 * Get recent access logs
 */
router.get('/access', (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = readAccessLogs(limit);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/logs/errors
 * Get recent error logs
 */
router.get('/errors', (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = readErrorLogs(limit);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/logs/stats
 * Get log statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const stats = getLogStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
