import React, { useState } from 'react';
import type { LogEntry } from '@/Common/Types/LogEntry';
import { LogStats } from '@/Client/Components/LogStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/Client/Components/Ui/Card';
import { Button } from '@/Client/Components/Ui/Button';
import { Badge } from '@/Client/Components/Ui/Badge';
import { ScrollText, Trash2, Settings, User, Info, CheckCircle, AlertTriangle, XCircle, FilterX } from 'lucide-react';
import { cn } from '@/Client/Lib/Utils';

interface LogListProps {
  logs: LogEntry[];
  onClear: () => void;
}

interface LogIconProps {
  level: LogEntry['level'];
}

const LogIcon: React.FC<LogIconProps> = ({ level }) => {
  const iconClass = "w-4 h-4";
  switch (level) {
    case 'info':
      return <Info className={cn(iconClass, "text-blue-500")} strokeWidth={2} />;
    case 'success':
      return <CheckCircle className={cn(iconClass, "text-green-500")} strokeWidth={2} />;
    case 'warning':
      return <AlertTriangle className={cn(iconClass, "text-yellow-500")} strokeWidth={2} />;
    case 'error':
      return <XCircle className={cn(iconClass, "text-red-500")} strokeWidth={2} />;
    default:
      return <Info className={cn(iconClass, "text-gray-500")} strokeWidth={2} />;
  }
};

const getLogColorClass = (level: LogEntry['level']): string => {
  switch (level) {
    case 'info':
      return 'border-l-blue-500 bg-blue-50/30';
    case 'success':
      return 'border-l-green-500 bg-green-50/30';
    case 'warning':
      return 'border-l-yellow-500 bg-yellow-50/30';
    case 'error':
      return 'border-l-red-500 bg-red-50/30';
    default:
      return 'border-l-gray-500 bg-gray-50/30';
  }
};

const getBadgeVariant = (level: LogEntry['level']): "default" | "secondary" | "destructive" | "outline" => {
  switch (level) {
    case 'error':
      return 'destructive';
    case 'success':
      return 'default';
    default:
      return 'secondary';
  }
};

export const LogList: React.FC<LogListProps> = ({ logs, onClear }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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
  let filteredLogs = showAdvanced 
    ? logs 
    : logs.filter(log => !log.isAdvanced);

  // Apply type filter if active
  if (activeFilter) {
    filteredLogs = filteredLogs.filter(log => log.level === activeFilter);
  }

  return (
    <Card className="flex flex-col max-h-[800px]">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ScrollText className="w-5 h-5" />
            Activity Log
            {activeFilter && (
              <Badge variant="outline" className="text-xs ml-2">
                {activeFilter}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter(null)}
                title="Clear filter"
              >
                <FilterX className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant={showAdvanced ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? (
                <>
                  <Settings className="mr-1.5 h-3.5 w-3.5" />
                  Advanced
                </>
              ) : (
                <>
                  <User className="mr-1.5 h-3.5 w-3.5" />
                  Simple
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <LogStats 
        logs={logs} 
        showAdvanced={showAdvanced}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <CardContent className="flex-1 p-0 overflow-y-auto min-h-0">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p className="text-sm">
              {activeFilter 
                ? `No ${activeFilter} logs found. Click a stat card to change filter.`
                : 'No logs yet. Start the bot to see activity.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  'px-4 py-2.5 border-l-4 hover:bg-muted/30 transition-colors',
                  getLogColorClass(log.level)
                )}
              >
                <div className="flex items-center gap-2.5">
                  <LogIcon level={log.level} />
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {formatTime(log.timestamp)}
                  </span>
                  <Badge variant={getBadgeVariant(log.level)} className="text-[10px] px-1.5 py-0 h-5">
                    {log.level}
                  </Badge>
                  <p className="text-sm text-foreground flex-1 min-w-0">
                    {log.userMessage || log.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
