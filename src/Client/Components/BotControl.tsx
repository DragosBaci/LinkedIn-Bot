import React from 'react';
import type { BotState } from '@/Common/Types/BotStatus';
import { BotStatus } from '@/Common/Types/BotStatus';

interface BotControlProps {
  botState: BotState;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const BotControl: React.FC<BotControlProps> = ({
  botState,
  isLoading,
  onStart,
  onStop
}) => {
  const canStart = botState.status === BotStatus.IDLE && !isLoading;
  const canStop = botState.status === BotStatus.RUNNING && !isLoading;

  return (
    <div className="bot-control">
      <div className="control-header">
        <h2>Controls</h2>
      </div>
      <div className="control-content">
        <div className="control-buttons">
          <button
            className="btn btn-start"
            onClick={onStart}
            disabled={!canStart}
          >
            {isLoading && botState.status === BotStatus.STARTING ? (
              <>
                <span className="spinner"></span>
                Starting...
              </>
            ) : (
              <>
                <span className="btn-icon">▶️</span>
                Start Bot
              </>
            )}
          </button>
          <button
            className="btn btn-stop"
            onClick={onStop}
            disabled={!canStop}
          >
            {isLoading && botState.status === BotStatus.STOPPING ? (
              <>
                <span className="spinner"></span>
                Stopping...
              </>
            ) : (
              <>
                <span className="btn-icon">⏹️</span>
                Stop Bot
              </>
            )}
          </button>
        </div>
        <div className="control-info">
          <div className="info-card">
            <h3>🚀 Quick Start</h3>
            <ol>
              <li>Click "Start Bot" to launch the LinkedIn bot</li>
              <li>A browser window will open with LinkedIn</li>
              <li>Monitor the status in real-time above</li>
              <li>Click "Stop Bot" when finished</li>
            </ol>
          </div>
          <div className="info-card">
            <h3>ℹ️ Information</h3>
            <ul>
              <li>The bot opens LinkedIn in a visible browser window</li>
              <li>Status updates automatically every second</li>
              <li>You can interact with the browser manually</li>
              <li>Stopping the bot closes the browser</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

