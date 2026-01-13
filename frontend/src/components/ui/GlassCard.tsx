import { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'motion/react';

/**
 * SWIZ Workspace Glass Card Component
 * 
 * The signature component of the Glass Aura design language.
 * Provides glassmorphism effects with backdrop blur and subtle borders.
 * 
 * Features:
 * - 💎 4 glass effect variants
 * - 🎭 Optional hover animations
 * - ⚡ Fade-in animations
 * - 🌙 Optimized for dark mode
 * - 🎨 Customizable with Tailwind classes
 * 
 * @example
 * ```tsx
 * // Default card
 * <GlassCard className="p-6">
 *   Content here
 * </GlassCard>
 * 
 * // With hover effect
 * <GlassCard hover className="p-4">
 *   Clickable card
 * </GlassCard>
 * 
 * // With animation
 * <GlassCard animated variant="frosted" className="p-6">
 *   Animated card
 * </GlassCard>
 * ```
 * 
 * @see /docs/DESIGN_SYSTEM.md for usage guidelines
 * @see /styles/globals.css for glass utility classes
 */

export type GlassCardVariant = 'surface' | 'card' | 'frosted' | 'overlay';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  hover?: boolean;
  animated?: boolean;
  children: ReactNode;
  className?: string;
}

export function GlassCard({
  variant = 'card',
  hover = false,
  animated = false,
  children,
  className = '',
  ...props
}: GlassCardProps) {
  const variants = {
    surface: 'glass-surface',
    card: 'glass-card',
    frosted: 'glass-frosted',
    overlay: 'glass-card shadow-glass-lg'
  };
  
  const hoverStyles = hover ? 'hover:scale-[1.01] hover:shadow-lg cursor-pointer' : '';
  
  const baseClasses = `${variants[variant]} ${hoverStyles} transition-all duration-300 ${className}`;
  
  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={baseClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
}