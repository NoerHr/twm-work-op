/**
 * SWIZ Workspace - Design Tokens
 * 
 * Centralized design system tokens for consistent styling across the application.
 * Based on Glass Aura design language with dark mode support.
 * 
 * @version 1.0.0
 * @date 2026-01-06
 */

export const DesignTokens = {
  /**
   * BORDER RADIUS SYSTEM
   * Consistent border radius values for all components
   */
  radius: {
    sm: 'rounded-lg',      // 0.5rem (8px)  - Small elements, chips, small buttons
    md: 'rounded-xl',      // 0.75rem (12px) - Default cards, medium buttons
    lg: 'rounded-2xl',     // 1rem (16px)    - Large cards, modals, panels
    pill: 'rounded-full',  // 9999px         - Pills, avatars, circular elements
  },

  /**
   * SPACING SCALE
   * T-shirt sizing for consistent spacing
   */
  spacing: {
    xs: '0.5rem',   // 2  - Tight spacing, compact elements
    sm: '0.75rem',  // 3  - Small gaps, related items
    md: '1rem',     // 4  - Default spacing, standard gaps
    lg: '1.5rem',   // 6  - Large spacing, section separators
    xl: '2rem',     // 8  - Extra large, major sections
    '2xl': '3rem',  // 12 - Huge spacing, page sections
  },

  /**
   * SPACING CLASSES (Tailwind)
   * Use these instead of arbitrary values
   */
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },

  padding: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },

  /**
   * COLOR PALETTE
   * Standardized color system for brand consistency
   */
  colors: {
    // PRIMARY BRAND COLOR (Indigo)
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',  // Main primary color
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },

    // ACCENT COLOR (Purple)
    accent: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',  // Main accent color
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },

    // SEMANTIC COLORS
    success: {
      light: '#34d399',  // emerald-400
      main: '#10b981',   // emerald-500
      dark: '#059669',   // emerald-600
    },

    warning: {
      light: '#fbbf24',  // amber-400
      main: '#f59e0b',   // amber-500
      dark: '#d97706',   // amber-600
    },

    error: {
      light: '#f87171',  // red-400
      main: '#ef4444',   // red-500
      dark: '#dc2626',   // red-600
    },

    info: {
      light: '#60a5fa',  // blue-400
      main: '#3b82f6',   // blue-500
      dark: '#2563eb',   // blue-600
    },
  },

  /**
   * SEMANTIC COLOR MAPPINGS
   * Use these for consistent color meanings across the app
   * 
   * @see /docs/COLOR_USAGE_GUIDE.md for detailed usage guidelines
   */
  semanticColors: {
    // Primary brand & main actions
    primary: 'indigo-600',
    primaryLight: 'indigo-500',
    primaryDark: 'indigo-700',
    
    // Accents & highlights
    accent: 'purple-500',
    accentDark: 'purple-600',
    
    // Workflow & logic-specific colors
    logic: 'purple-600',           // Logic operations, formulas, calculations
    workflow: 'purple-500',        // Workflow nodes, process indicators
    review: 'purple-600',          // Review states, approval flows
    
    // Status colors
    info: 'blue-500',              // Informational, planning, secondary actions
    success: 'emerald-500',        // Success, active, completed
    warning: 'amber-500',          // Warning, pending, needs attention
    error: 'red-500',              // Error, danger, blocked
    neutral: 'slate-600',          // Neutral, inactive, draft
    
    // State-specific mappings
    states: {
      draft: 'slate-500',
      pending: 'amber-500',
      active: 'blue-500',
      inReview: 'purple-600',
      completed: 'purple-500',     // Projects/complex completions
      success: 'emerald-500',      // Task/simple completions
      cancelled: 'red-500',
      onHold: 'amber-500',
      blocked: 'red-600',
    },
  },

  /**
   * BUTTON SIZES
   * Standardized button size system (from Custom Button.tsx)
   */
  button: {
    sizes: {
      sm: {
        padding: 'px-3 py-1.5',
        text: 'text-sm',
        radius: 'rounded-lg',
      },
      md: {
        padding: 'px-4 py-2',
        text: 'text-base',
        radius: 'rounded-xl',
      },
      lg: {
        padding: 'px-6 py-3',
        text: 'text-lg',
        radius: 'rounded-xl',
      },
    },
  },

  /**
   * GLASS EFFECTS
   * Predefined glass morphism styles
   */
  glass: {
    // Light glass effect (default cards)
    card: 'glass-card',
    
    // Stronger blur effect
    surface: 'glass-surface',
    
    // Maximum frosted effect
    frosted: 'glass-frosted',
    
    // Inline styles for custom cases (use sparingly)
    inline: {
      light: 'bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10',
      medium: 'bg-white/70 dark:bg-white/10 backdrop-blur-2xl border border-slate-200 dark:border-white/10',
      strong: 'bg-white/90 dark:bg-white/20 backdrop-blur-3xl border border-slate-200 dark:border-white/10',
    },
  },

  /**
   * TYPOGRAPHY SCALE
   * Consistent text sizing (inherited from globals.css)
   */
  typography: {
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'text-3xl font-bold tracking-tight',
    h3: 'text-2xl font-semibold tracking-tight',
    h4: 'text-lg font-semibold',
    body: 'text-base font-medium leading-relaxed',
    small: 'text-sm font-medium',
    tiny: 'text-xs font-medium',
  },

  /**
   * SHADOWS
   * Consistent shadow system
   */
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg shadow-slate-200/50 dark:shadow-black/50',
    xl: 'shadow-xl shadow-slate-200/50 dark:shadow-black/50',
    glass: 'shadow-glass',
    'glass-lg': 'shadow-glass-lg',
  },

  /**
   * Z-INDEX SCALE
   * Consistent layering system
   */
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    tooltip: 60,
  },

  /**
   * ANIMATION DURATIONS
   * Consistent timing for transitions
   */
  animation: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
} as const;

/**
 * USAGE GUIDELINES
 * 
 * 1. BORDER RADIUS:
 *    ✅ Use: className={DesignTokens.radius.md}
 *    ❌ Avoid: className="rounded-xl"
 * 
 * 2. SPACING:
 *    ✅ Use: className={DesignTokens.gap.md}
 *    ❌ Avoid: className="gap-4"
 * 
 * 3. COLORS:
 *    ✅ Use: bg-primary-600, text-accent-500
 *    ❌ Avoid: Random purple/indigo mixing
 * 
 * 4. GLASS EFFECTS:
 *    ✅ Use: <GlassCard variant="card">
 *    ❌ Avoid: Inline backdrop-blur styles
 * 
 * 5. BUTTONS:
 *    ✅ Use: <Button size="md" variant="primary">
 *    ❌ Avoid: Custom button styling
 */

export default DesignTokens;