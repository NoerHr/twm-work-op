import { useState } from 'react';
import { Download, Filter, Search, Calendar } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useIndicatorStore } from '../../store/indicatorStore';
import { format } from 'date-fns';
import type { IndicatorDataPoint, IndicatorLevel } from '../../types/indicator';

export function DataExplorer() {
  const indicators = useIndicatorStore((state) => state.indicators);
  const dataPoints = useIndicatorStore((state) => state.dataPoints);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<IndicatorLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Flatten all data points
  const allDataPoints: (IndicatorDataPoint & { indicatorName: string; level: IndicatorLevel })[] = [];
  dataPoints.forEach((points, indicatorId) => {
    const indicator = indicators.find((ind) => ind.id === indicatorId);
    if (indicator) {
      points.forEach((point) => {
        allDataPoints.push({
          ...point,
          indicatorName: indicator.name,
          level: indicator.level
        });
      });
    }
  });

  // Apply filters
  const filteredData = allDataPoints.filter((point) => {
    const matchesLevel = levelFilter === 'all' || point.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || point.status === statusFilter;
    const matchesSearch =
      point.indicatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.valueKey.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesStatus && matchesSearch;
  });

  // Sort by timestamp (newest first)
  const sortedData = [...filteredData].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      // Generate CSV
      const headers = ['Timestamp', 'Indicator', 'Level', 'Value Key', 'Value', 'Source', 'Status'];
      const rows = sortedData.map(point => [
        format(new Date(point.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        point.indicatorName,
        point.level,
        point.valueKey,
        point.value,
        point.source,
        point.status
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `indicators-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // PDF export would use a library like jsPDF
      alert('PDF export - Install jsPDF library to enable this feature');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'normal':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getLevelBadge = (level: IndicatorLevel) => {
    return level === 'project' ? 'primary' : level === 'assignment' ? 'warning' : 'secondary';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-slate-900 dark:text-white font-semibold mb-1">
              Data Explorer
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {sortedData.length} data point{sortedData.length !== 1 ? 's' : ''} • Raw data table
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-4 gap-3">
          {/* Search */}
          <div className="col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search indicators or values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Levels</option>
              <option value="project">Project</option>
              <option value="assignment">Assignment</option>
              <option value="operational">Operational</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="normal">Normal</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Indicator
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Value Key
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                      No data points found
                    </td>
                  </tr>
                ) : (
                  sortedData.map((point, index) => (
                    <tr
                      key={`${point.id}-${index}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {format(new Date(point.timestamp), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-medium">
                        {point.indicatorName}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={getLevelBadge(point.level) as any}>
                          {point.level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {point.valueKey}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-semibold">
                        {typeof point.value === 'number' ? point.value.toFixed(2) : point.value}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {point.source}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={getStatusBadge(point.status) as any}>
                          {point.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
