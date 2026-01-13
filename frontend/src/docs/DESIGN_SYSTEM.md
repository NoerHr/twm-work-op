# 🎨 SWIZ Workspace - Design System Documentation

**Version:** 1.0.0  
**Last Updated:** January 6, 2026  
**Status:** ✅ Standardized

---

## 📚 Table of Contents

1. [Component Library](#component-library)
2. [Design Tokens](#design-tokens)
3. [Component Usage Guidelines](#component-usage-guidelines)
4. [Common Patterns](#common-patterns)
5. [Do's and Don'ts](#dos-and-donts)

---

## 🧩 Component Library

### **IMPORTANT: Which Components to Use**

SWIZ Workspace has **TWO sets of UI components**:

#### ✅ **Custom Components** (USE THESE!)
Located in `/components/ui/` with **Capital Letters**:

```typescript
✅ Button.tsx     - Custom Glass Aura styled button
✅ Badge.tsx      - Custom badge with 8 semantic variants  
✅ GlassCard.tsx  - Custom glass morphism card
✅ Input.tsx      - Custom glass input field
```

**Why use custom components?**
- ✨ Built specifically for Glass Aura design language
- 🎭 Better animations and transitions
- 🌙 Optimized dark mode support
- 💎 Glassmorphism effects built-in
- ⚡ Loading states and better UX

#### ⚠️ **Shadcn Components** (System Files - Don't Import Directly!)
Located in `/components/ui/` with **lowercase letters**:

```typescript
⚠️ button.tsx   - Shadcn UI (system file, NOT used)
⚠️ badge.tsx    - Shadcn UI (system file, NOT used)
⚠️ card.tsx     - Shadcn UI (system file, NOT used)
```

**These are protected system files** from Figma Make environment.  
**DO NOT import or use these!** They have different APIs and will cause inconsistencies.

---

## 🎨 Design Tokens

Import design tokens from `/config/design-tokens.ts`:

```typescript
import { DesignTokens } from '@/config/design-tokens';
```

### Border Radius System

```typescript
// ✅ CORRECT
<div className={DesignTokens.radius.sm}>  // rounded-lg
<div className={DesignTokens.radius.md}>  // rounded-xl
<div className={DesignTokens.radius.lg}>  // rounded-2xl
<div className={DesignTokens.radius.pill}> // rounded-full

// ❌ WRONG
<div className="rounded-md">  // Don't use arbitrary values
<div className="rounded-3xl"> // Not in design system
```

### Spacing Scale

```typescript
// ✅ CORRECT
<div className={DesignTokens.gap.md}>    // gap-4
<div className={DesignTokens.padding.lg}> // p-6

// ❌ WRONG
<div className="gap-5">  // Not in scale
<div className="p-7">    // Not in scale
```

### Color Palette

```typescript
// PRIMARY ACTIONS (Indigo)
✅ bg-indigo-600        // Primary buttons, main actions
✅ text-indigo-600      // Primary text, links
✅ border-indigo-500/20 // Primary borders with opacity

// ACCENTS (Purple)
✅ bg-purple-500        // Accent elements, highlights
✅ text-purple-500      // Accent text
✅ border-purple-500/20 // Accent borders

// SEMANTIC
✅ bg-emerald-500       // Success states
✅ bg-amber-500         // Warning states
✅ bg-red-500           // Error states
✅ bg-blue-500          // Info states

// ❌ WRONG - Mixing colors randomly
❌ bg-purple-600        // Should be indigo-600 for primary
❌ bg-violet-500        // Not in palette
❌ bg-fuchsia-500       // Not in palette
```

---

## 📦 Component Usage Guidelines

### Button Component

**Import:**
```typescript
import { Button } from '../ui/Button';  // ✅ Capital B
```

**Usage:**
```tsx
// Primary action button
<Button variant="primary" size="md">
  Create Project
</Button>

// Secondary button
<Button variant="secondary" size="sm">
  Cancel
</Button>

// Destructive action
<Button variant="destructive" size="lg">
  Delete Account
</Button>

// With loading state
<Button variant="primary" isLoading={loading}>
  Saving...
</Button>

// With icon
<Button variant="primary" icon={<Plus className="w-4 h-4" />}>
  Add New
</Button>
```

**Available Props:**
```typescript
variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'danger'
size?: 'sm' | 'md' | 'lg'
isLoading?: boolean
icon?: ReactNode
disabled?: boolean
```

---

### Badge Component

**Import:**
```typescript
import { Badge } from '../ui/Badge';  // ✅ Capital B
```

**Usage:**
```tsx
// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">In Progress</Badge>

// Custom badges
<Badge variant="primary">New</Badge>
<Badge variant="secondary">Draft</Badge>
```

**Available Variants:**
```typescript
variant?: 
  | 'default'   // Gray/neutral
  | 'success'   // Green - completed, active
  | 'warning'   // Amber - pending, caution
  | 'error'     // Red - failed, blocked
  | 'danger'    // Red - critical (alias for error)
  | 'info'      // Blue - informational
  | 'primary'   // Indigo - highlighted
  | 'secondary' // Gray - muted
```

---

### GlassCard Component

**Import:**
```typescript
import { GlassCard } from '../ui/GlassCard';
```

**Usage:**
```tsx
// Default card
<GlassCard className="p-6">
  Content here
</GlassCard>

// With variants
<GlassCard variant="surface" className="p-4">
  Light glass effect
</GlassCard>

<GlassCard variant="frosted" className="p-6">
  Strong frosted effect
</GlassCard>

// With hover effect
<GlassCard hover className="p-4">
  Clickable card
</GlassCard>

// With animation
<GlassCard animated className="p-6">
  Animated entrance
</GlassCard>
```

**Available Props:**
```typescript
variant?: 'surface' | 'card' | 'frosted' | 'overlay'
hover?: boolean      // Adds hover scale effect
animated?: boolean   // Adds fade-in animation
className?: string   // Additional Tailwind classes
```

---

### Input Component

**Import:**
```typescript
import { Input } from '../ui/Input';
```

**Usage:**
```tsx
<Input 
  type="text"
  placeholder="Enter project name"
  className="w-full"
/>

<Input 
  type="email"
  placeholder="email@example.com"
  disabled
/>
```

---

## 🎯 Common Patterns

### Card with Header and Content

```tsx
<GlassCard className="p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-slate-900 dark:text-white">
      Card Title
    </h3>
    <Badge variant="success">Active</Badge>
  </div>

  {/* Content */}
  <div className={DesignTokens.gap.md}>
    <p className="text-slate-600 dark:text-white/60">
      Card content goes here
    </p>
  </div>

  {/* Footer Actions */}
  <div className="flex items-center gap-3 mt-6">
    <Button variant="primary" size="sm">
      Confirm
    </Button>
    <Button variant="secondary" size="sm">
      Cancel
    </Button>
  </div>
</GlassCard>
```

### List Item with Avatar

```tsx
<div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-xl">
  {/* Avatar */}
  <img 
    src={user.avatar}
    className="w-10 h-10 rounded-full"
    alt={user.name}
  />
  
  {/* Info */}
  <div className="flex-1">
    <div className="text-slate-900 dark:text-white font-semibold">
      {user.name}
    </div>
    <div className="text-sm text-slate-600 dark:text-white/60">
      {user.role}
    </div>
  </div>

  {/* Badge */}
  <Badge variant="primary">Online</Badge>
</div>
```

### Modal/Dialog Pattern

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <GlassCard variant="frosted" className="max-w-md w-full p-6 m-4">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Modal Title
      </h2>
      <button 
        onClick={onClose}
        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Content */}
    <div className="mb-6">
      Modal content
    </div>

    {/* Actions */}
    <div className="flex items-center justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        Confirm
      </Button>
    </div>
  </GlassCard>
</div>
```

---

## ✅ Do's and Don'ts

### Components

#### ✅ DO:
```tsx
// Use custom components with capital letters
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';

// Use consistent variants
<Button variant="primary">Save</Button>
<Badge variant="success">Active</Badge>
```

#### ❌ DON'T:
```tsx
// Don't use shadcn components (lowercase)
import { Button } from '../ui/button';  // ❌ Wrong!
import { Badge } from '../ui/badge';    // ❌ Wrong!

// Don't create custom button styles
<button className="px-4 py-2 bg-purple-600">  // ❌ Wrong!
```

---

### Colors

#### ✅ DO:
```tsx
// Use standardized palette
<div className="bg-indigo-600 text-white">      // Primary
<div className="bg-purple-500 text-white">      // Accent
<div className="bg-emerald-500 text-white">     // Success
<div className="text-slate-600 dark:text-white/60">  // Muted text
```

#### ❌ DON'T:
```tsx
// Don't mix purple/indigo randomly
<div className="bg-purple-600">  // Should be indigo-600 for primary
<div className="bg-violet-500">  // Not in palette
<div className="bg-pink-600">    // Use purple-500 instead
```

---

### Spacing

#### ✅ DO:
```tsx
// Use design tokens
<div className={DesignTokens.gap.md}>           // gap-4
<div className={DesignTokens.padding.lg}>       // p-6
<div className="space-y-4">                     // Vertical spacing
```

#### ❌ DON'T:
```tsx
// Don't use arbitrary values
<div className="gap-5">   // Not in scale
<div className="p-7">     // Not in scale
<div className="space-y-5">  // Use space-y-4 or space-y-6
```

---

### Border Radius

#### ✅ DO:
```tsx
// Use standardized radius
<div className="rounded-lg">    // Small (8px)
<div className="rounded-xl">    // Medium (12px)
<div className="rounded-2xl">   // Large (16px)
<div className="rounded-full">  // Pills/avatars
```

#### ❌ DON'T:
```tsx
// Don't use non-standard values
<div className="rounded-md">    // Use rounded-lg instead
<div className="rounded-3xl">   // Not in system
<div className="rounded">       // Too small, use rounded-lg
```

---

### Glass Effects

#### ✅ DO:
```tsx
// Use GlassCard component
<GlassCard variant="card" className="p-6">
  Content
</GlassCard>

// Or use utility classes
<div className="glass-card p-6">
  Content
</div>
```

#### ❌ DON'T:
```tsx
// Don't write inline glass styles
<div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10">
  // Too verbose! Use GlassCard instead
</div>
```

---

## 🚀 Quick Reference

### Most Used Patterns

```tsx
// Primary Button
<Button variant="primary" size="md">Action</Button>

// Success Badge
<Badge variant="success">Complete</Badge>

// Glass Card
<GlassCard className="p-6">Content</GlassCard>

// Input Field
<Input type="text" placeholder="Enter value" />

// Avatar
<img src={avatar} className="w-10 h-10 rounded-full" />

// Section Spacing
<div className="space-y-6">...</div>

// Flex Layout
<div className="flex items-center gap-3">...</div>

// Grid Layout
<div className="grid grid-cols-3 gap-4">...</div>
```

---

## 📝 Changelog

### Version 1.0.0 (2026-01-06)
- ✅ Initial design system documentation
- ✅ Standardized component usage
- ✅ Created design tokens
- ✅ Defined color palette
- ✅ Established spacing scale
- ✅ Documented common patterns

---

**For Questions:** Refer to `/config/design-tokens.ts` for implementation details  
**For Updates:** Submit design system change requests to the team
