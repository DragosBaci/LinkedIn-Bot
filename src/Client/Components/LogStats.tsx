import React from 'react';
import type { LogEntry } from '@/Common/Types/LogEntry';
import { Card, CardContent } from '@/Client/Components/Ui/Card';
import { BarChart3, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/Client/Lib/Utils';

interface LogStatsProps {
  logs: LogEntry[];
  showAdvanced: boolean;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  colorClass: string;
  filterType: string | null;
  isActive: boolean;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  value, 
  label, 
  colorClass, 
  isActive, 
  onClick 
}) => (
  <Card 
    className={cn(
      'shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden',
      isActive && 'ring-2 ring-primary shadow-lg scale-105'
    )}
    onClick={onClick}
  >
    <CardContent className="p-3 flex items-center gap-2.5">
      <div className="flex-shrink-0">
        <Icon className={cn('w-7 h-7', colorClass)} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn('text-xl font-bold', colorClass)}>{value}</div>
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide truncate">
          {label}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const LogStats: React.FC<LogStatsProps> = ({ 
  logs, 
  showAdvanced, 
  activeFilter,
  onFilterChange 
}) => {
  // Filter logs based on advanced mode
  const filteredLogs = showAdvanced 
    ? logs 
    : logs.filter(log => !log.isAdvanced);

  const stats = {
    total: filteredLogs.length,
    info: filteredLogs.filter(log => log.level === 'info').length,
    success: filteredLogs.filter(log => log.level === 'success').length,
    warning: filteredLogs.filter(log => log.level === 'warning').length,
    error: filteredLogs.filter(log => log.level === 'error').length,
  };

  const handleFilterClick = (filter: string | null) => {
    // Toggle filter: if clicking the same filter, clear it
    onFilterChange(activeFilter === filter ? null : filter);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
      <StatCard 
        icon={BarChart3} 
        value={stats.total} 
        label="Total" 
        colorClass="text-gray-600"
        filterType={null}
        isActive={activeFilter === null}
        onClick={() => handleFilterClick(null)}
      />
      <StatCard 
        icon={Info} 
        value={stats.info} 
        label="Info" 
        colorClass="text-blue-500"
        filterType="info"
        isActive={activeFilter === 'info'}
        onClick={() => handleFilterClick('info')}
      />
      <StatCard 
        icon={CheckCircle} 
        value={stats.success} 
        label="Success" 
        colorClass="text-green-500"
        filterType="success"
        isActive={activeFilter === 'success'}
        onClick={() => handleFilterClick('success')}
      />
      <StatCard 
        icon={AlertTriangle} 
        value={stats.warning} 
        label="Warning" 
        colorClass="text-yellow-500"
        filterType="warning"
        isActive={activeFilter === 'warning'}
        onClick={() => handleFilterClick('warning')}
      />
      <StatCard 
        icon={XCircle} 
        value={stats.error} 
        label="Error" 
        colorClass="text-red-500"
        filterType="error"
        isActive={activeFilter === 'error'}
        onClick={() => handleFilterClick('error')}
      />
    </div>
  );
};
