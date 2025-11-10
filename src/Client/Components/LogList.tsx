import React, { useState } from 'react';
import type { LogEntry } from '@/Common/Types/LogEntry';

interface LogListProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const LogList: React.FC<LogListProps> = ({ logs, onClear }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getLogIcon = (level: LogEntry['level']): string => {
    switch (level) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  };

  const getLogClass = (level: LogEntry['level']): string => {
    return `log-entry log-${level}`;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  // Filter logs based on advanced mode
  const filteredLogs = showAdvanced 
    ? logs 
    : logs.filter(log => !log.isAdvanced);

  return (
    <div className="log-list">
      <div className="log-header">
        <h2>Activity Log</h2>
        <div className="log-header-actions">
          <button 
            className={`btn-toggle ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
            title={showAdvanced ? 'Hide technical details' : 'Show technical details'}
          >
            {showAdvanced ? '🔧 Advanced' : '👤 Simple'}
          </button>
          <button className="btn-clear" onClick={onClear}>
            🗑️ Clear
          </button>
        </div>
      </div>
      <div className="log-content">
        {filteredLogs.length === 0 ? (
          <div className="log-empty">
            <p>No logs yet. Start the bot to see activity.</p>
          </div>
        ) : (
          <div className="log-entries">
            {filteredLogs.map((log) => (
              <div key={log.id} className={getLogClass(log.level)}>
                <span className="log-icon">{getLogIcon(log.level)}</span>
                <span className="log-time">{formatTime(log.timestamp)}</span>
                <span className="log-message">
                  {log.userMessage || log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
