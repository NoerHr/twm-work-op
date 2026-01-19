import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Users, TrendingUp, ChevronRight, Filter, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useAuthStore } from '../../store/authStore';
import { AssignmentCard } from './AssignmentCard';

type FilterType = 'all' | 'pending' | 'active' | 'completed';

export function MyAssignments() {
  const { assignments, fetchAssignments, setActiveAssignment } = useAssignmentStore();
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // REMOVED: Create Assignment button (Assignments created in Project Wizard)
  // Leaders and Admins only execute assignments, not create them

  useEffect(() => {
    const loadAssignments = async () => {
      setIsLoading(true);
      await fetchAssignments();
      setIsLoading(false);
    };
    loadAssignments();
  }, [fetchAssignments]);

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    // Filter by status
    const statusMatch = 
      filter === 'all' ? true :
      filter === 'pending' ? assignment.status === 'PENDING' :
      filter === 'active' ? assignment.status === 'ACTIVE' :
      filter === 'completed' ? assignment.status === 'COMPLETED' :
      true;

    // Filter by search query
    const searchMatch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  // Stats
  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'PENDING').length,
    active: assignments.filter(a => a.status === 'ACTIVE').length,
    completed: assignments.filter(a => a.status === 'COMPLETED').length
  };

  const handleAssignmentClick = (assignmentId: string) => {
    setActiveAssignment(assignmentId);
    navigate(`/my-assignments/${assignmentId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-white/60">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 dark:text-white mb-2">
            My Assignments
          </h1>
          <p className="text-slate-600 dark:text-white/60">
            Manage your delegated work packages and track progress
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('all')}
          className="cursor-pointer"
        >
          <GlassCard className={`p-4 ${filter === 'all' ? 'border-purple-500/50 bg-purple-500/5' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-white/60 mb-1">Total</p>
                <p className="text-2xl text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('pending')}
          className="cursor-pointer"
        >
          <GlassCard className={`p-4 ${filter === 'pending' ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-white/60 mb-1">Pending</p>
                <p className="text-2xl text-slate-900 dark:text-white">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('active')}
          className="cursor-pointer"
        >
          <GlassCard className={`p-4 ${filter === 'active' ? 'border-blue-500/50 bg-blue-500/5' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-white/60 mb-1">Active</p>
                <p className="text-2xl text-slate-900 dark:text-white">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('completed')}
          className="cursor-pointer"
        >
          <GlassCard className={`p-4 ${filter === 'completed' ? 'border-green-500/50 bg-green-500/5' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-white/60 mb-1">Completed</p>
                <p className="text-2xl text-slate-900 dark:text-white">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <ChevronRight className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Badges */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filter === 'active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filter === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Assignment Grid */}
      {filteredAssignments.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Briefcase className="w-16 h-16 text-slate-300 dark:text-white/20 mx-auto mb-4" />
          <h3 className="text-slate-900 dark:text-white mb-2">No assignments found</h3>
          <p className="text-sm text-slate-600 dark:text-white/60">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'You don\'t have any assignments in this category yet'
            }
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AssignmentCard
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}