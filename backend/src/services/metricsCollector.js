import si from 'systeminformation';

/**
 * Get current system metrics
 */
export async function getCurrentMetrics() {
  try {
    const [cpu, mem, disk, uptime, load, networkStats] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.time(),
      si.currentLoad(),
      si.networkStats()
    ]);

    // Get primary disk (usually first mounted disk)
    const primaryDisk = disk.find(d => d.mount === '/') || disk[0] || {};

    return {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: parseFloat(cpu.currentLoad.toFixed(2)),
        cores: cpu.cpus.length,
        speed: cpu.cpus[0]?.speed || 0
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usagePercent: parseFloat(((mem.used / mem.total) * 100).toFixed(2))
      },
      disk: {
        total: primaryDisk.size || 0,
        used: primaryDisk.used || 0,
        free: primaryDisk.available || 0,
        usagePercent: parseFloat((primaryDisk.use || 0).toFixed(2))
      },
      uptime: uptime.uptime,
      loadAverage: [
        parseFloat(load.avgLoad.toFixed(2)),
        parseFloat(load.currentLoad.toFixed(2)),
        0
      ],
      network: {
        rx: networkStats[0]?.rx_sec || 0,
        tx: networkStats[0]?.tx_sec || 0
      }
    };
  } catch (error) {
    console.error('Error getting metrics:', error);
    throw error;
  }
}

/**
 * Get system information (static data)
 */
export async function getSystemInfo() {
  try {
    const [cpu, os, system, mem] = await Promise.all([
      si.cpu(),
      si.osInfo(),
      si.system(),
      si.mem()
    ]);

    return {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed
      },
      os: {
        platform: os.platform,
        distro: os.distro,
        release: os.release,
        arch: os.arch,
        hostname: os.hostname
      },
      system: {
        manufacturer: system.manufacturer,
        model: system.model
      },
      memory: {
        total: mem.total
      }
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    throw error;
  }
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
