/**
 * SWIZ Workspace - UI Component Library Index
 * 
 * Glass Aura Design System - Custom Components Only
 * 
 * This file exports ONLY the custom Glass Aura components for SWIZ Workspace.
 * All components follow the Glass Aura design language with consistent styling,
 * animations, and theming.
 * 
 * @example
 * ```tsx
 * // ✅ CORRECT - Import custom Glass Aura components
 * import { Button, Badge, GlassCard, Input } from '../ui';
 * 
 * // ✅ ALSO CORRECT - Direct imports (preferred for tree-shaking)
 * import { Button } from '../ui/Button';
 * import { Badge } from '../ui/Badge';
 * import { GlassCard } from '../ui/GlassCard';
 * ```
 * 
 * @see /docs/DESIGN_SYSTEM.md for usage guidelines
 * @see /config/design-tokens.ts for design tokens
 */

// ===== GLASS AURA CUSTOM COMPONENTS =====

/**
 * Button - Primary interactive element
 * Variants: primary, secondary, ghost, destructive, danger
 * Sizes: sm, md, lg
 */
export { Button } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';

/**
 * Badge - Status indicators and labels
 * Variants: default, success, warning, error, info, primary, secondary, danger
 */
export { Badge } from './Badge';
export type { BadgeVariant } from './Badge';

/**
 * GlassCard - Glass morphism container
 * Variants: surface, card, frosted, overlay
 * Features: hover effects, animations, blur backdrop
 */
export { GlassCard } from './GlassCard';
export type { GlassCardVariant } from './GlassCard';

/**
 * Input - Form input field
 * Features: error states, icons, Glass Aura styling
 */
export { Input } from './Input';

/**
 * LoadingSpinner - Loading states
 * Variants: spinner, dots, pulse, skeleton
 */
export { LoadingSpinner } from './LoadingSpinner';

/**
 * ConfirmDialog - Confirmation dialogs
 * Features: Glass Aura modal, confirm/cancel actions
 */
export { ConfirmDialog } from './ConfirmDialog';

// ===== UTILITY EXPORTS =====

/**
 * cn - Tailwind CSS class merger utility
 * Combines clsx and tailwind-merge for clean class handling
 */
export { cn } from './utils';

/**
 * useMobile - Mobile detection hook
 * Returns true if viewport is mobile size
 */
export { useMobile } from './use-mobile';

/**
 * USAGE NOTES:
 * 
 * 1. ALL COMPONENTS FOLLOW GLASS AURA DESIGN:
 *    - Glassmorphism effects (backdrop blur, transparency)
 *    - Consistent color palette (indigo/purple gradients)
 *    - Smooth animations (Motion/Framer Motion)
 *    - Dark mode support
 * 
 * 2. IMPORT PATTERNS:
 *    Prefer direct imports for better tree-shaking:
 *    ```tsx
 *    import { Button } from '../ui/Button';  // ✅ Best
 *    import { Button } from '../ui';         // ✅ Also OK
 *    ```
 * 
 * 3. CUSTOM vs SYSTEM COMPONENTS:
 *    - Custom components (PascalCase files): Button.tsx, Badge.tsx, etc.
 *    - System components (lowercase files): button.tsx, badge.tsx, etc.
 *    - ALWAYS use custom components for consistency
 *    - System components are Figma Make defaults (not styled for Glass Aura)
 * 
 * 4. EXTENDING COMPONENTS:
 *    To create new custom components:
 *    - Follow Glass Aura design tokens (/config/design-tokens.ts)
 *    - Use GlassCard as base for containers
 *    - Apply consistent hover/focus states
 *    - Support dark mode
 *    - Add to this index for easy imports
 */
