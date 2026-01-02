import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Subscribe to metrics updates
  subscribeToMetrics(callback) {
    if (!this.socket) this.connect();
    
    this.socket.emit('subscribe:metrics');
    this.socket.on('metrics:update', callback);
  }

  // Unsubscribe from metrics
  unsubscribeFromMetrics() {
    if (!this.socket) return;
    
    this.socket.emit('unsubscribe:metrics');
    this.socket.off('metrics:update');
  }

  // Subscribe to logs
  subscribeToLogs(callback) {
    if (!this.socket) this.connect();
    
    this.socket.emit('subscribe:logs');
    this.socket.on('log:new', callback);
  }

  // Unsubscribe from logs
  unsubscribeFromLogs() {
    if (!this.socket) return;
    
    this.socket.emit('unsubscribe:logs');
    this.socket.off('log:new');
  }

  // Subscribe to deployment updates
  subscribeToDeployment(callback) {
    if (!this.socket) this.connect();
    
    this.socket.on('deployment:update', callback);
  }

  // Unsubscribe from deployment
  unsubscribeFromDeployment() {
    if (!this.socket) return;
    
    this.socket.off('deployment:update');
  }

  // Unsubscribe from everything
  unsubscribeAll() {
    if (!this.socket) return;
    
    this.socket.emit('unsubscribe:all');
    this.socket.off('metrics:update');
    this.socket.off('log:new');
    this.socket.off('deployment:update');
  }

  // Listen for errors
  onError(callback) {
    if (!this.socket) this.connect();
    
    this.socket.on('error', callback);
  }
}

// Export singleton instance
export default new WebSocketService();
