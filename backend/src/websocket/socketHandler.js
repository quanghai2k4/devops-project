import config from '../config/index.js';
import { getCurrentMetrics } from '../services/metricsCollector.js';
import { watchLogFile } from '../services/logWatcher.js';

let metricsInterval = null;
let logWatcher = null;

/**
 * Setup WebSocket event handlers
 */
export function setupWebSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Send initial metrics
    getCurrentMetrics()
      .then(metrics => {
        socket.emit('metrics:update', metrics);
      })
      .catch(err => {
        console.error('Error sending initial metrics:', err);
      });

    // Handle metrics subscription
    socket.on('subscribe:metrics', () => {
      console.log(`📊 Client ${socket.id} subscribed to metrics`);
      
      // Start sending metrics updates
      const interval = setInterval(async () => {
        try {
          const metrics = await getCurrentMetrics();
          socket.emit('metrics:update', metrics);
        } catch (error) {
          console.error('Error sending metrics:', error);
          socket.emit('error', { message: 'Failed to fetch metrics' });
        }
      }, config.metricsInterval);

      // Store interval ID on socket for cleanup
      socket.data.metricsInterval = interval;
    });

    // Handle logs subscription
    socket.on('subscribe:logs', () => {
      console.log(`📝 Client ${socket.id} subscribed to logs`);
      
      // Setup log file watcher if not already watching
      if (!socket.data.logWatcher) {
        try {
          socket.data.logWatcher = watchLogFile(config.nginxAccessLog, (logEntry) => {
            socket.emit('log:new', logEntry);
          });
        } catch (error) {
          console.error('Error setting up log watcher:', error);
          socket.emit('error', { message: 'Failed to watch log files' });
        }
      }
    });

    // Handle unsubscribe from metrics
    socket.on('unsubscribe:metrics', () => {
      console.log(`🔕 Client ${socket.id} unsubscribed from metrics`);
      
      if (socket.data.metricsInterval) {
        clearInterval(socket.data.metricsInterval);
        socket.data.metricsInterval = null;
      }
    });

    // Handle unsubscribe from logs
    socket.on('unsubscribe:logs', () => {
      console.log(`🔕 Client ${socket.id} unsubscribed from logs`);
      
      if (socket.data.logWatcher) {
        socket.data.logWatcher.close();
        socket.data.logWatcher = null;
      }
    });

    // Handle unsubscribe from all
    socket.on('unsubscribe:all', () => {
      console.log(`🔕 Client ${socket.id} unsubscribed from all`);
      
      if (socket.data.metricsInterval) {
        clearInterval(socket.data.metricsInterval);
        socket.data.metricsInterval = null;
      }
      
      if (socket.data.logWatcher) {
        socket.data.logWatcher.close();
        socket.data.logWatcher = null;
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      
      // Cleanup intervals and watchers
      if (socket.data.metricsInterval) {
        clearInterval(socket.data.metricsInterval);
      }
      
      if (socket.data.logWatcher) {
        socket.data.logWatcher.close();
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Handle server-side errors
  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err);
  });

  console.log('🔌 WebSocket server initialized');
}

/**
 * Broadcast message to all connected clients
 */
export function broadcastToAll(io, event, data) {
  io.emit(event, data);
}

/**
 * Broadcast deployment update
 */
export function broadcastDeploymentUpdate(io, deployment) {
  io.emit('deployment:update', deployment);
}
