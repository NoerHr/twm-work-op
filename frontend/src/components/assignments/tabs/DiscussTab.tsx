import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { Assignment } from '../../../types/assignment';

interface DiscussTabProps {
  assignment: Assignment;
}

interface ChatMessage {
  id: string;
  author: string;
  role: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isCurrentUser?: boolean;
}

export function DiscussTab({ assignment }: DiscussTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      author: 'John Doe',
      role: 'Team Leader',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      message: 'I\'ve started working on the task breakdown. I think we should prioritize the design mockups first.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isCurrentUser: true
    },
    {
      id: '2',
      author: 'Alice Chen',
      role: 'Co-Leader',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      message: '@John Doe - Agreed! I can handle the technical feasibility checks in parallel. Should we set up a sync meeting?',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isCurrentUser: false
    },
    {
      id: '3',
      author: 'John Doe',
      role: 'Team Leader',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      message: 'Great idea! Let\'s sync tomorrow at 10 AM. I\'ll send a calendar invite.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isCurrentUser: true
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      author: 'John Doe', // Current user
      role: 'Team Leader',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      message: newMessage.trim(),
      timestamp: new Date(),
      isCurrentUser: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Auto-scroll to bottom when new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-slate-900 dark:text-white mb-2">
              Leader Discussion
            </h2>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Collaborate with other leaders assigned to this assignment. This is a private discussion channel.
            </p>
          </div>
        </div>

        {/* Participants */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-white/60">Participants:</span>
          <div className="flex items-center -space-x-2">
            {['John', 'Alice', 'Bob'].map((name, idx) => (
              <img
                key={name}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                alt={name}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900"
                title={name}
              />
            ))}
          </div>
          <Badge variant="outline" className="text-xs ml-2">
            3 Leaders
          </Badge>
        </div>
      </GlassCard>

      {/* Chat Container */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          {/* Messages Area - Fixed Height with Scroll */}
          <div className="h-[500px] overflow-y-auto pr-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <img
                  src={msg.avatar}
                  alt={msg.author}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />

                {/* Message Bubble */}
                <div className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {/* Author & Timestamp */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-900 dark:text-white">{msg.author}</span>
                    <span className="text-xs text-slate-500 dark:text-white/50">{formatTimestamp(msg.timestamp)}</span>
                  </div>

                  {/* Message Content */}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.isCurrentUser
                        ? 'bg-purple-500 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>

                  {/* Role Badge */}
                  <Badge variant="outline" className="text-xs mt-1">
                    {msg.role}
                  </Badge>
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input - Fixed at Bottom */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Use @ to mention)"
                rows={2}
                className="flex-1 px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="self-end bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-white/50 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Discussion Guidelines */}
      <GlassCard className="p-4 bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm text-slate-900 dark:text-white mb-1">Discussion Guidelines</h4>
            <ul className="text-xs text-slate-600 dark:text-white/60 space-y-1">
              <li>• This channel is only visible to leaders assigned to this assignment</li>
              <li>• Use @mentions to notify specific team members</li>
              <li>• Share updates, blockers, and coordinate task delegation</li>
              <li>• For project-wide discussions, use the Project Discussion tab</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
