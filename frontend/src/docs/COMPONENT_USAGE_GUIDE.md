# 🚀 SWIZ Workspace - Component Usage Quick Start

**For:** New developers and contributors  
**Updated:** January 6, 2026

---

## ⚡ TL;DR (Too Long; Didn't Read)

```tsx
// ✅ DO THIS
import { Button, Badge, GlassCard } from '../ui/Button';
import { Button, Badge, GlassCard } from '../ui/Badge';
import { Button, Badge, GlassCard } from '../ui/GlassCard';

// ❌ DON'T DO THIS
import { Button } from '../ui/button';  // Wrong! Lowercase = system file
import { Badge } from '../ui/badge';    // Wrong! Lowercase = system file
```

**Golden Rule:** Capital letters = Custom components (USE THESE!)

---

## 🎯 Why Two Sets of Components?

SWIZ Workspace runs in Figma Make environment which includes **shadcn/ui** system files:
- `/components/ui/button.tsx` (lowercase) - Shadcn system file ⚠️
- `/components/ui/badge.tsx` (lowercase) - Shadcn system file ⚠️
- `/components/ui/card.tsx` (lowercase) - Shadcn system file ⚠️

We also have **custom Glass Aura components**:
- `/components/ui/Button.tsx` (capital B) - Our custom component ✅
- `/components/ui/Badge.tsx` (capital B) - Our custom component ✅
- `/components/ui/GlassCard.tsx` (capital G) - Our custom component ✅

**ALWAYS use the custom components (capital letters)** because:
- ✨ Designed for Glass Aura aesthetic
- 🌙 Better dark mode support
- ⚡ Loading states built-in
- 🎭 Smooth animations
- 💎 Glassmorphism effects

---

## 📦 Component Cheat Sheet

### Button

```tsx
import { Button } from '../ui/Button';

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="danger">Danger Zone</Button>

// Loading state
<Button isLoading={loading}>Saving...</Button>

// With icon
<Button icon={<Plus className="w-4 h-4" />}>Add New</Button>
```

---

### Badge

```tsx
import { Badge } from '../ui/Badge';

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">In Progress</Badge>

// Highlighted badges
<Badge variant="primary">Featured</Badge>
<Badge variant="default">Draft</Badge>
<Badge variant="secondary">Archived</Badge>
```

---

### GlassCard

```tsx
import { GlassCard } from '../ui/GlassCard';

// Basic card
<GlassCard className="p-6">
  <h3>Card Title</h3>
  <p>Card content</p>
</GlassCard>

// With hover effect
<GlassCard hover className="p-4">
  Clickable card
</GlassCard>

// With animation
<GlassCard animated variant="frosted" className="p-6">
  Animated card
</GlassCard>

// Variants
<GlassCard variant="surface">Light glass</GlassCard>
<GlassCard variant="card">Default glass (default)</GlassCard>
<GlassCard variant="frosted">Strong frosted</GlassCard>
<GlassCard variant="overlay">Overlay with shadow</GlassCard>
```

---

### Input

```tsx
import { Input } from '../ui/Input';

<Input 
  type="text"
  placeholder="Enter value"
  className="w-full"
/>
```

---

## 🎨 Styling Guidelines

### Colors

```tsx
// PRIMARY (Indigo) - Main actions, primary elements
bg-indigo-600
text-indigo-600
border-indigo-500/20

// ACCENT (Purple) - Highlights, accents
bg-purple-500
text-purple-500
border-purple-500/20

// SUCCESS (Emerald)
bg-emerald-500
text-emerald-600

// WARNING (Amber)
bg-amber-500
text-amber-600

// ERROR (Red)
bg-red-500
text-red-600

// INFO (Blue)
bg-blue-500
text-blue-600
```

---

### Border Radius

```tsx
rounded-lg      // Small elements (8px)
rounded-xl      // Medium cards (12px) - DEFAULT
rounded-2xl     // Large panels (16px)
rounded-full    // Avatars, pills
```

---

### Spacing

```tsx
// Gaps
gap-2   // Tight (0.5rem)
gap-3   // Small (0.75rem)
gap-4   // Medium (1rem) - DEFAULT
gap-6   // Large (1.5rem)
gap-8   // Extra large (2rem)

// Padding
p-2, p-3, p-4, p-6, p-8  // Same scale

// Vertical spacing
space-y-2, space-y-4, space-y-6  // Stack elements
```

---

## 🏗️ Common Patterns

### Card with Header & Actions

```tsx
<GlassCard className="p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-slate-900 dark:text-white font-semibold">
      Card Title
    </h3>
    <Badge variant="success">Active</Badge>
  </div>

  {/* Content */}
  <p className="text-slate-600 dark:text-white/60 mb-6">
    Card description here
  </p>

  {/* Actions */}
  <div className="flex items-center gap-3">
    <Button variant="primary" size="sm">Confirm</Button>
    <Button variant="secondary" size="sm">Cancel</Button>
  </div>
</GlassCard>
```

---

### List Item

```tsx
<div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-xl">
  <img 
    src={avatar}
    className="w-10 h-10 rounded-full"
  />
  <div className="flex-1">
    <div className="text-slate-900 dark:text-white font-semibold">
      {name}
    </div>
    <div className="text-sm text-slate-600 dark:text-white/60">
      {role}
    </div>
  </div>
  <Badge variant="primary">Online</Badge>
</div>
```

---

### Modal Dialog

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <GlassCard variant="frosted" className="max-w-md w-full p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Modal Title</h2>
      <button onClick={onClose}>
        <X className="w-5 h-5" />
      </button>
    </div>
    
    <p className="mb-6">Modal content</p>
    
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={onConfirm}>Confirm</Button>
    </div>
  </GlassCard>
</div>
```

---

### Form Field

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-slate-700 dark:text-white/80">
    Project Name
  </label>
  <Input 
    type="text"
    placeholder="Enter project name"
    className="w-full"
  />
  <p className="text-xs text-slate-500 dark:text-white/50">
    This will be visible to all team members
  </p>
</div>
```

---

## 🚫 Common Mistakes

### ❌ WRONG: Using lowercase imports
```tsx
import { Button } from '../ui/button';  // This is shadcn!
```

### ✅ CORRECT: Using capital letter imports
```tsx
import { Button } from '../ui/Button';  // This is our custom component!
```

---

### ❌ WRONG: Mixing purple and indigo randomly
```tsx
<Button className="bg-purple-600">  // Should use indigo for primary
```

### ✅ CORRECT: Consistent color usage
```tsx
<Button variant="primary">  // Uses indigo-600 gradient
```

---

### ❌ WRONG: Arbitrary spacing values
```tsx
<div className="gap-5 p-7">  // Not in design system
```

### ✅ CORRECT: Design system spacing
```tsx
<div className="gap-4 p-6">  // Standard values
```

---

### ❌ WRONG: Inline glass styles
```tsx
<div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-slate-200">
  // Too verbose!
</div>
```

### ✅ CORRECT: Using GlassCard
```tsx
<GlassCard className="p-6">
  // Clean and consistent!
</GlassCard>
```

---

## 📚 Additional Resources

- **Design System:** `/docs/DESIGN_SYSTEM.md`
- **Design Tokens:** `/config/design-tokens.ts`
- **Consistency Audit:** `/CONSISTENCY_AUDIT_REPORT.md`
- **Component Index:** `/components/ui/index.ts`

---

## 💡 Pro Tips

1. **Use VS Code autocomplete** - Type `Button` and let autocomplete suggest `./Button.tsx`
2. **Import from index** - Use `import { Button } from '@/components/ui'` when possible
3. **Check existing components** - Look at similar components for patterns
4. **Dark mode always** - Test your component in both light and dark modes
5. **Glass effects** - Use GlassCard for all card-like containers

---

## 🆘 Need Help?

If you're unsure which component to use:

1. Check `/docs/DESIGN_SYSTEM.md` for guidelines
2. Look at existing implementations in similar pages
3. When in doubt, use the **custom components** (capital letters)

**Remember:** Custom components (Button, Badge, GlassCard) are your friends! 🎉
