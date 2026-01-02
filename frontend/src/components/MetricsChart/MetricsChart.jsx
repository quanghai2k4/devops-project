import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './MetricsChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function MetricsChart({ metricsHistory }) {
  const chartRef = useRef(null);

  // Prepare chart data
  const labels = metricsHistory.map((_, index) => {
    const secondsAgo = (metricsHistory.length - index - 1) * 2;
    return secondsAgo === 0 ? 'Now' : `-${secondsAgo}s`;
  });

  const cpuData = metricsHistory.map(m => m?.cpu?.usage || 0);
  const memoryData = metricsHistory.map(m => m?.memory?.usagePercent || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'CPU %',
        data: cpuData,
        borderColor: 'rgb(88, 166, 255)',
        backgroundColor: 'rgba(88, 166, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2
      },
      {
        label: 'Memory %',
        data: memoryData,
        borderColor: 'rgb(46, 160, 67)',
        backgroundColor: 'rgba(46, 160, 67, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#c9d1d9',
          font: {
            family: "'JetBrains Mono', 'Courier New', Courier, monospace"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(13, 17, 23, 0.95)',
        titleColor: '#58a6ff',
        bodyColor: '#c9d1d9',
        borderColor: '#30363d',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        titleFont: {
          family: "'JetBrains Mono', 'Courier New', Courier, monospace",
          size: 12
        },
        bodyFont: {
          family: "'JetBrains Mono', 'Courier New', Courier, monospace",
          size: 12
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(48, 54, 61, 0.5)',
          drawBorder: false
        },
        ticks: {
          color: '#8b949e',
          font: {
            family: "'JetBrains Mono', 'Courier New', Courier, monospace",
            size: 10
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(48, 54, 61, 0.5)',
          drawBorder: false
        },
        ticks: {
          color: '#8b949e',
          font: {
            family: "'JetBrains Mono', 'Courier New', Courier, monospace"
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    animation: {
      duration: 300
    }
  };

  return (
    <div className="metrics-chart-container">
      <div className="chart-header">
        <h2 className="chart-title">
          <span className="icon">📊</span>
          System Metrics History (Last 2 Minutes)
        </h2>
      </div>
      <div className="chart-wrapper">
        {metricsHistory.length > 0 ? (
          <Line ref={chartRef} data={data} options={options} />
        ) : (
          <div className="chart-placeholder">
            <p>Waiting for metrics data...</p>
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricsChart;
