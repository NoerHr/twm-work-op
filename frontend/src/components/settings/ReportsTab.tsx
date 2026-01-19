import { useState } from 'react';
import { FileText, Download, Calendar, Filter, CheckCircle, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { useAuthStore } from '../../store/authStore';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'project' | 'task' | 'resource' | 'governance';
  format: ('pdf' | 'excel' | 'csv')[];
  allowedRoles: string[];
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'project-summary',
    name: 'Project Summary Report',
    description: 'Comprehensive overview of all active projects with status, budget, and timeline',
    icon: <FileText className="w-5 h-5" />,
    category: 'project',
    format: ['pdf', 'excel'],
    allowedRoles: ['Admin', 'BOD', 'PM']
  },
  {
    id: 'task-performance',
    name: 'Task Performance Report',
    description: 'Detailed analysis of task completion rates, delays, and contributor productivity',
    icon: <CheckCircle className="w-5 h-5" />,
    category: 'task',
    format: ['pdf', 'excel', 'csv'],
    allowedRoles: ['Admin', 'PM', 'Leader']
  },
  {
    id: 'resource-utilization',
    name: 'Resource Utilization Report',
    description: 'Track resource type usage, budget allocation, and cost analysis across projects',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'resource',
    format: ['pdf', 'excel'],
    allowedRoles: ['Admin', 'BOD', 'PM']
  },
  {
    id: 'governance-audit',
    name: 'Governance Audit Report',
    description: 'BOD approval history, decision timeline, and compliance tracking',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'governance',
    format: ['pdf', 'excel'],
    allowedRoles: ['Admin', 'BOD']
  },
  {
    id: 'team-workload',
    name: 'Team Workload Report',
    description: 'Analyze team capacity, assignment distribution, and workload balance',
    icon: <Users className="w-5 h-5" />,
    category: 'task',
    format: ['pdf', 'excel'],
    allowedRoles: ['Admin', 'PM', 'Leader']
  }
];

export function ReportsTab() {
  const user = useAuthStore((state) => state.user);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter reports based on user role
  const availableReports = REPORT_TEMPLATES.filter(report => 
    user && report.allowedRoles.includes(user.role)
  );

  const handleGenerateReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    setIsGenerating(true);
    const report = REPORT_TEMPLATES.find(r => r.id === reportId);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    toast.success('Report Generated', {
      description: `${report?.name} has been generated and will download shortly`,
      icon: <Download className="w-5 h-5" />
    });
    
    // In production: Trigger actual download
    // const blob = await generateReport(reportId, format, dateRange);
    // downloadFile(blob, `${reportId}-${Date.now()}.${format}`);
  };

  const getCategoryColor = (category: ReportTemplate['category']) => {
    const colors = {
      project: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      task: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      resource: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      governance: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };
    return colors[category];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-slate-900 dark:text-white mb-2">Reports</h2>
        <p className="text-slate-600 dark:text-white/60 text-sm">
          Generate and export detailed reports about your projects and operations
        </p>
      </div>

      {/* Date Range Filter */}
      <GlassCard className="p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-purple-400" />
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 dark:text-white/60 block mb-1">From</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-white/60 block mb-1">To</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Report Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {availableReports.map((report) => (
          <GlassCard 
            key={report.id} 
            className={`p-5 rounded-xl transition-all cursor-pointer hover:scale-[1.02] ${
              selectedTemplate === report.id ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setSelectedTemplate(report.id)}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`p-3 rounded-lg ${getCategoryColor(report.category)}`}>
                {report.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-slate-900 dark:text-white font-medium">
                    {report.name}
                  </h3>
                  <Badge variant="outline" className="capitalize text-xs">
                    {report.category}
                  </Badge>
                </div>
                
                <p className="text-slate-600 dark:text-white/60 text-sm mb-3">
                  {report.description}
                </p>

                {/* Format Options */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {report.format.map((format) => (
                    <button
                      key={format}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFormat(format as any);
                      }}
                      className={`px-2 py-1 rounded text-xs transition-all ${
                        selectedFormat === format && selectedTemplate === report.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-300 dark:hover:bg-white/20'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Generate Button */}
                {selectedTemplate === report.id && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateReport(report.id, selectedFormat);
                    }}
                    variant="primary"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                    isLoading={isGenerating}
                  >
                    <Download className="w-4 h-4" />
                    Generate Report
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Empty State */}
      {availableReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-400 dark:text-white/20 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-white/60">
            No reports available for your role
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="glass-card p-4 rounded-xl border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Filter className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-slate-900 dark:text-white font-medium text-sm mb-1">
              Custom Date Ranges
            </h4>
            <p className="text-slate-600 dark:text-white/60 text-xs">
              Select your desired date range above to filter report data. Reports will include all activity within the selected period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}