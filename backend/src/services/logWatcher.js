import fs from 'fs';
import path from 'path';
import config from '../config/index.js';

/**
 * Read and parse Nginx access logs
 */
export function readAccessLogs(limit = 50) {
  try {
    // Check if log file exists
    if (!fs.existsSync(config.nginxAccessLog)) {
      return {
        logs: [],
        total: 0,
        error: 'Log file not found'
      };
    }

    const logContent = fs.readFileSync(config.nginxAccessLog, 'utf-8');
    const lines = logContent.trim().split('\n').filter(line => line);
    
    // Get last N lines
    const recentLines = lines.slice(-limit);
    
    // Parse Nginx log format (combined format)
    const logs = recentLines.map(line => parseAccessLog(line)).filter(Boolean);
    
    return {
      logs: logs.reverse(), // Most recent first
      total: lines.length
    };
  } catch (error) {
    console.error('Error reading access logs:', error);
    return {
      logs: [],
      total: 0,
      error: error.message
    };
  }
}

/**
 * Read and parse Nginx error logs
 */
export function readErrorLogs(limit = 20) {
  try {
    if (!fs.existsSync(config.nginxErrorLog)) {
      return {
        logs: [],
        total: 0,
        error: 'Error log file not found'
      };
    }

    const logContent = fs.readFileSync(config.nginxErrorLog, 'utf-8');
    const lines = logContent.trim().split('\n').filter(line => line);
    
    const recentLines = lines.slice(-limit);
    const logs = recentLines.map(line => parseErrorLog(line)).filter(Boolean);
    
    return {
      logs: logs.reverse(),
      total: lines.length
    };
  } catch (error) {
    console.error('Error reading error logs:', error);
    return {
      logs: [],
      total: 0,
      error: error.message
    };
  }
}

/**
 * Get log statistics
 */
export function getLogStats() {
  try {
    const accessLogs = readAccessLogs(1000); // Get last 1000 for stats
    
    if (!accessLogs.logs || accessLogs.logs.length === 0) {
      return {
        totalRequests: 0,
        statusCodes: {},
        topPaths: []
      };
    }

    const statusCodes = {};
    const paths = {};
    
    accessLogs.logs.forEach(log => {
      // Count status codes
      statusCodes[log.status] = (statusCodes[log.status] || 0) + 1;
      
      // Count paths
      paths[log.path] = (paths[log.path] || 0) + 1;
    });

    // Get top 10 paths
    const topPaths = Object.entries(paths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    return {
      totalRequests: accessLogs.logs.length,
      statusCodes,
      topPaths
    };
  } catch (error) {
    console.error('Error getting log stats:', error);
    return {
      totalRequests: 0,
      statusCodes: {},
      topPaths: [],
      error: error.message
    };
  }
}

/**
 * Parse Nginx access log line (combined format)
 * Format: $remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"
 */
function parseAccessLog(line) {
  try {
    // Simple regex for Nginx combined log format
    const regex = /^(\S+) - (\S+) \[([^\]]+)\] "(\S+) ([^\s]+) ([^"]+)" (\d+) (\d+) "([^"]*)" "([^"]*)"/;
    const match = line.match(regex);
    
    if (!match) {
      return null;
    }

    return {
      ip: match[1],
      user: match[2] === '-' ? null : match[2],
      timestamp: match[3],
      method: match[4],
      path: match[5],
      protocol: match[6],
      status: parseInt(match[7]),
      size: parseInt(match[8]),
      referer: match[9] === '-' ? null : match[9],
      userAgent: match[10]
    };
  } catch (error) {
    console.error('Error parsing access log:', error);
    return null;
  }
}

/**
 * Parse Nginx error log line
 */
function parseErrorLog(line) {
  try {
    // Nginx error log format: date time [level] pid#tid: *cid message
    const regex = /^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)/;
    const match = line.match(regex);
    
    if (!match) {
      return {
        timestamp: new Date().toISOString(),
        level: 'unknown',
        message: line
      };
    }

    return {
      timestamp: match[1],
      level: match[2],
      message: match[3]
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: line
    };
  }
}

/**
 * Watch log file for changes (for real-time updates)
 */
export function watchLogFile(logPath, callback) {
  try {
    let lastSize = fs.existsSync(logPath) ? fs.statSync(logPath).size : 0;

    const watcher = fs.watch(logPath, (eventType) => {
      if (eventType === 'change') {
        const currentSize = fs.statSync(logPath).size;
        
        if (currentSize > lastSize) {
          // File grew, read new content
          const stream = fs.createReadStream(logPath, {
            start: lastSize,
            end: currentSize
          });

          let newData = '';
          stream.on('data', chunk => {
            newData += chunk.toString();
          });

          stream.on('end', () => {
            const newLines = newData.trim().split('\n').filter(line => line);
            newLines.forEach(line => {
              const parsedLog = parseAccessLog(line);
              if (parsedLog) {
                callback(parsedLog);
              }
            });
          });

          lastSize = currentSize;
        }
      }
    });

    return watcher;
  } catch (error) {
    console.error('Error watching log file:', error);
    return null;
  }
}
