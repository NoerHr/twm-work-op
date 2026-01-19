import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, CheckCircle, Package, BarChart3, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { Badge } from './ui/badge';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useResourceStore } from '../store/resourceStore';
import { useIndicatorStore } from '../store/indicatorStore';

interface GlobalSearchProps {
  onClose: () => void;
}

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const resources = useResourceStore((state) => state.resources);
  const indicators = useIndicatorStore((state) => state.indicators);

  useEffect(() => {
    const currentRef = document.querySelector<HTMLInputElement>('#search-input');
    currentRef?.focus();
  }, []);

  // Search across all entities
  const searchResults = query.trim() ? {
    projects: projects.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    tasks: tasks.filter(t => 
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    resources: resources.filter(r => 
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    indicators: indicators.filter(i => 
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
  } : { projects: [], tasks: [], resources: [], indicators: [] };

  const allResults = [
    ...searchResults.projects.map(p => ({ type: 'project', data: p })),
    ...searchResults.tasks.map(t => ({ type: 'task', data: t })),
    ...searchResults.resources.map(r => ({ type: 'resource', data: r })),
    ...searchResults.indicators.map(i => ({ type: 'indicator', data: i })),
  ];

  const totalResults = allResults.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(totalResults, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalResults) % Math.max(totalResults, 1));
      } else if (e.key === 'Enter' && totalResults > 0) {
        e.preventDefault();
        handleSelectResult(allResults[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, totalResults, allResults]);

  const handleSelectResult = (result: any) => {
    const { type, data } = result;
    
    switch (type) {
      case 'project':
        navigate('/projects');
        break;
      case 'task':
        navigate('/tasks');
        break;
      case 'resource':
        navigate('/resources');
        break;
      case 'indicator':
        navigate('/indicators');
        break;
    }
    
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <Package className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      case 'resource': return <TrendingUp className="w-4 h-4" />;
      case 'indicator': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'text-purple-500';
      case 'task': return 'text-blue-500';
      case 'resource': return 'text-green-500';
      case 'indicator': return 'text-amber-500';
      default: return 'text-slate-500';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'project': return 'Project';
      case 'task': return 'Task';
      case 'resource': return 'Resource';
      case 'indicator': return 'Indicator';
      default: return type;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-slate-200 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-white/40" />
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search projects, tasks, resources, indicators..."
                className="w-full pl-12 pr-12 py-3 bg-white/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    const currentRef = document.querySelector<HTMLInputElement>('#search-input');
                    currentRef?.focus();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {!query.trim() ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-slate-300 dark:text-white/20 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-white/50 text-sm">
                  Start typing to search across all modules
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="text-xs">Projects</Badge>
                  <Badge variant="secondary" className="text-xs">Tasks</Badge>
                  <Badge variant="secondary" className="text-xs">Resources</Badge>
                  <Badge variant="secondary" className="text-xs">Indicators</Badge>
                </div>
              </div>
            ) : totalResults === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-slate-600 dark:text-white/60">
                  No results found for "<span className="font-semibold">{query}</span>"
                </p>
                <p className="text-sm text-slate-500 dark:text-white/50 mt-2">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <div className="p-2">
                {/* Projects */}
                {searchResults.projects.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-white/50 font-semibold uppercase">
                      Projects ({searchResults.projects.length})
                    </div>
                    {searchResults.projects.map((project, index) => {
                      const globalIndex = allResults.findIndex(r => r.type === 'project' && r.data.id === project.id);
                      return (
                        <button
                          key={project.id}
                          onClick={() => handleSelectResult({ type: 'project', data: project })}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                            globalIndex === selectedIndex
                              ? 'bg-purple-500/10 border border-purple-500/30'
                              : 'hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${getTypeColor('project')}`}>
                              {getIcon('project')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-slate-900 dark:text-white font-medium truncate">
                                  {project.name}
                                </p>
                                <Badge variant="secondary" className="text-xs">{getTypeBadge('project')}</Badge>
                              </div>
                              {project.description && (
                                <p className="text-sm text-slate-600 dark:text-white/60 truncate">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tasks */}
                {searchResults.tasks.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-white/50 font-semibold uppercase">
                      Tasks ({searchResults.tasks.length})
                    </div>
                    {searchResults.tasks.map((task, index) => {
                      const globalIndex = allResults.findIndex(r => r.type === 'task' && r.data.id === task.id);
                      return (
                        <button
                          key={task.id}
                          onClick={() => handleSelectResult({ type: 'task', data: task })}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                            globalIndex === selectedIndex
                              ? 'bg-purple-500/10 border border-purple-500/30'
                              : 'hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${getTypeColor('task')}`}>
                              {getIcon('task')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-slate-900 dark:text-white font-medium truncate">
                                  {task.title}
                                </p>
                                <Badge variant="secondary" className="text-xs">{getTypeBadge('task')}</Badge>
                              </div>
                              {task.description && (
                                <p className="text-sm text-slate-600 dark:text-white/60 truncate">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Resources */}
                {searchResults.resources.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-white/50 font-semibold uppercase">
                      Resources ({searchResults.resources.length})
                    </div>
                    {searchResults.resources.map((resource, index) => {
                      const globalIndex = allResults.findIndex(r => r.type === 'resource' && r.data.id === resource.id);
                      return (
                        <button
                          key={resource.id}
                          onClick={() => handleSelectResult({ type: 'resource', data: resource })}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                            globalIndex === selectedIndex
                              ? 'bg-purple-500/10 border border-purple-500/30'
                              : 'hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${getTypeColor('resource')}`}>
                              {getIcon('resource')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-slate-900 dark:text-white font-medium truncate">
                                  {resource.name}
                                </p>
                                <Badge variant="secondary" className="text-xs">{getTypeBadge('resource')}</Badge>
                              </div>
                              {resource.description && (
                                <p className="text-sm text-slate-600 dark:text-white/60 truncate">
                                  {resource.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Indicators */}
                {searchResults.indicators.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-white/50 font-semibold uppercase">
                      Indicators ({searchResults.indicators.length})
                    </div>
                    {searchResults.indicators.map((indicator, index) => {
                      const globalIndex = allResults.findIndex(r => r.type === 'indicator' && r.data.id === indicator.id);
                      return (
                        <button
                          key={indicator.id}
                          onClick={() => handleSelectResult({ type: 'indicator', data: indicator })}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                            globalIndex === selectedIndex
                              ? 'bg-purple-500/10 border border-purple-500/30'
                              : 'hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${getTypeColor('indicator')}`}>
                              {getIcon('indicator')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-slate-900 dark:text-white font-medium truncate">
                                  {indicator.name}
                                </p>
                                <Badge variant="secondary" className="text-xs">{getTypeBadge('indicator')}</Badge>
                              </div>
                              {indicator.description && (
                                <p className="text-sm text-slate-600 dark:text-white/60 truncate">
                                  {indicator.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {totalResults > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-white/50">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded">↑</kbd>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded">Enter</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded">Esc</kbd>
                  Close
                </span>
              </div>
              <span>{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}