import { useState } from 'react';
import { Code2, Workflow, TestTube2, Sparkles, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function DevQuickLinks() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      name: 'Components',
      path: '/admin/components',
      icon: Code2,
      color: 'from-blue-500 to-cyan-500',
      description: 'UI Component Library'
    },
    {
      name: 'Workflow Guide',
      path: '/workflow-guide',
      icon: Workflow,
      color: 'from-purple-500 to-pink-500',
      description: 'Project Creation Flow'
    },
    {
      name: 'Workflow Test',
      path: '/workflow-test',
      icon: TestTube2,
      color: 'from-green-500 to-emerald-500',
      description: 'End-to-End Testing'
    },
    {
      name: 'Assignment Demo',
      path: '/assignment-demo',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      description: 'Assignment Management UI'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-72 space-y-2"
          >
            {links.map((link, idx) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.path}
                  href={link.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="block glass-card p-4 rounded-2xl hover:scale-105 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-gradient-to-br ${link.color} rounded-xl`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all">
                        {link.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        {link.description}
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-2xl shadow-lg backdrop-blur-xl
          flex items-center justify-center transition-all
          ${isOpen
            ? 'bg-gradient-to-br from-purple-500 to-blue-500 rotate-45'
            : 'glass-card hover:shadow-2xl'
          }
        `}
      >
        <Sparkles className={`w-6 h-6 ${isOpen ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
      </motion.button>
    </div>
  );
}