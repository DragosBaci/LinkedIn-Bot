import React from 'react';
import type { BotState } from '@/Common/Types/BotStatus';
import { BotStatus } from '@/Common/Types/BotStatus';

interface BotStatusDisplayProps {
  botState: BotState;
}

export const BotStatusDisplay: React.FC<BotStatusDisplayProps> = ({ botState }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case BotStatus.IDLE:
        return 'status-idle';
      case BotStatus.STARTING:
      case BotStatus.STOPPING:
        return 'status-transitioning';
      case BotStatus.RUNNING:
        return 'status-running';
      case BotStatus.ERROR:
        return 'status-error';
      default:
        return 'status-idle';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case BotStatus.IDLE:
        return '⚪';
      case BotStatus.STARTING:
      case BotStatus.STOPPING:
        return '🔄';
      case BotStatus.RUNNING:
        return '🟢';
      case BotStatus.ERROR:
        return '🔴';
      default:
        return '⚪';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="status-display">
      <div className="status-header">
        <h2>Bot Status</h2>
      </div>
      <div className={`status-content ${getStatusColor(botState.status)}`}>
        <div className="status-indicator">
          <span className="status-icon">{getStatusIcon(botState.status)}</span>
          <span className="status-text">{botState.status.toUpperCase()}</span>
        </div>
        <div className="status-message">
          <p>{botState.message}</p>
        </div>
        <div className="status-timestamp">
          <small>Last updated: {formatTimestamp(botState.timestamp)}</small>
        </div>
      </div>
    </div>
  );
};

