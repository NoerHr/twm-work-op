# 🎨 SWIZ Workspace - Color Usage Guide

**Version:** 1.0.0  
**Last Updated:** January 6, 2026  
**Purpose:** Semantic color system for consistent UI

---

## 📚 Table of Contents

1. [Color Philosophy](#color-philosophy)
2. [Primary Brand Colors](#primary-brand-colors)
3. [Semantic Color System](#semantic-color-system)
4. [Usage Examples](#usage-examples)
5. [Do's and Don'ts](#dos-and-donts)
6. [Quick Reference](#quick-reference)

---

## 🎯 Color Philosophy

SWIZ Workspace uses a **semantic color system** where colors have specific meanings:

- **Indigo** = Primary brand identity, main actions
- **Purple** = Logic/workflow operations, review states, accents
- **Blue** = Information, secondary actions
- **Emerald** = Success, completion, active states
- **Amber** = Warning, pending, caution
- **Red** = Error, danger, blocked states

**Key Principle:** Colors should communicate meaning, not just aesthetics.

---

## 💎 Primary Brand Colors

### Indigo-600 (Primary)
**When to use:**
- ✅ Primary action buttons
- ✅ Main navigation active states
- ✅ Core feature highlights
- ✅ Brand elements

**Examples:**
```tsx
// Primary button
<Button variant="primary">  // Uses indigo-600 gradient
  Create Project
</Button>

// Active navigation
className="text-indigo-600 dark:text-indigo-400"

// Brand gradient
className="from-indigo-600 to-purple-600"
```

---

### Purple-500/600 (Accent & Logic)
**When to use:**
- ✅ Logic operations (calculations, formulas)
- ✅ Workflow/process indicators
- ✅ Review states
- ✅ Accent highlights
- ✅ "In Progress" badges
- ✅ Featured/highlighted content

**Examples:**
```tsx
// Logic-related elements
<Calculator className="text-purple-600 dark:text-purple-400" />

// Review status
<Badge variant="outline" className="bg-purple-500/10 text-purple-600">
  In Review
</Badge>

// Workflow nodes
<div className="border-purple-500/30 bg-purple-500/10">
  Logic Block
</div>

// Step indicators
<div className="bg-purple-500 text-white">
  Step 2
</div>
```

**Why Purple for Logic?**
- Purple represents transformation and creativity
- Distinct from action colors (indigo) and info colors (blue)
- Creates visual hierarchy for workflow elements

---

## 🎨 Semantic Color System

### Blue-500 (Information)
**Purpose:** Informational states, secondary actions

```tsx
// Info badge
<Badge variant="info">Planning</Badge>

// Info messages
<div className="bg-blue-500/10 text-blue-600">
  <Info /> Tip: You can drag nodes to rearrange
</div>

// Secondary states
<Badge variant="outline" className="bg-blue-500/10 text-blue-500">
  Change Pending
</Badge>
```

---

### Emerald-500 (Success)
**Purpose:** Success states, completion, active

```tsx
// Success badge
<Badge variant="success">Active</Badge>
<Badge variant="success">Completed</Badge>

// Success message
<div className="bg-emerald-500/10 text-emerald-600">
  <CheckCircle /> Project approved!
</div>

// Active state
<div className="border-emerald-500/20 bg-emerald-500/10">
  Running
</div>
```

---

### Amber-500 (Warning)
**Purpose:** Warning states, pending, needs attention

```tsx
// Warning badge
<Badge variant="warning">Pending</Badge>
<Badge variant="warning">Awaiting Review</Badge>

// Warning message
<div className="bg-amber-500/10 text-amber-600">
  <AlertTriangle /> Action required
</div>

// Pending state
<Badge className="bg-amber-500/10 text-amber-600">
  Needs Approval
</Badge>
```

---

### Red-500 (Error/Danger)
**Purpose:** Error states, destructive actions, blocked

```tsx
// Error badge
<Badge variant="error">Failed</Badge>
<Badge variant="danger">Blocked</Badge>

// Destructive action
<Button variant="destructive">
  Delete Project
</Button>

// Error message
<div className="bg-red-500/10 text-red-600">
  <X /> Task failed
</div>

// Blocked state
<Badge className="bg-red-500/10 text-red-600">
  Blocked
</Badge>
```

---

## 📋 Usage Examples

### Status Badges (Assignment States)

```tsx
const statusColors = {
  DRAFT: 'bg-slate-500/10 text-slate-600',           // Draft, inactive
  PENDING: 'bg-amber-500/10 text-amber-600',         // Pending approval
  ACTIVE: 'bg-blue-500/10 text-blue-600',            // Active, in progress
  IN_REVIEW: 'bg-purple-500/10 text-purple-600',     // Under review
  COMPLETED: 'bg-emerald-500/10 text-emerald-600',   // Successfully completed
  CANCELLED: 'bg-red-500/10 text-red-600'            // Cancelled, failed
};
```

**Why this mapping?**
- **Slate:** Neutral, not started
- **Amber:** Waiting for action
- **Blue:** Currently working
- **Purple:** Being reviewed/evaluated
- **Emerald:** Successfully done
- **Red:** Stopped/failed

---

### Project Status Colors

```tsx
const projectStatusColors = {
  draft: 'bg-slate-500/10 text-slate-600',           // Not started
  pending_approval: 'bg-amber-500/10 text-amber-600',// Awaiting decision
  approved: 'bg-purple-500/10 text-purple-600',      // Approved, ready to start
  setup: 'bg-purple-500/10 text-purple-600',         // Being configured
  planning: 'bg-blue-500/10 text-blue-600',          // Planning phase
  execution: 'bg-emerald-500/10 text-emerald-600',   // Active execution
  completed: 'bg-purple-500/10 text-purple-600',     // Completed successfully
  'on-hold': 'bg-amber-500/10 text-amber-600',       // Paused
  cancelled: 'bg-red-500/10 text-red-600'            // Cancelled
};
```

**Why purple for completed projects?**
- Projects are complex workflows
- Purple emphasizes the achievement
- Different from task completion (emerald)

---

### Icon Colors by Context

```tsx
// Workflow/Logic Icons
<Calculator className="text-purple-600 dark:text-purple-400" />
<Network className="text-purple-600 dark:text-purple-400" />
<GitBranch className="text-purple-600 dark:text-purple-400" />

// Action Icons
<Plus className="text-indigo-600 dark:text-indigo-400" />
<Settings className="text-indigo-600 dark:text-indigo-400" />

// Info Icons
<Info className="text-blue-600 dark:text-blue-400" />
<HelpCircle className="text-blue-600 dark:text-blue-400" />

// Success Icons
<CheckCircle className="text-emerald-600 dark:text-emerald-400" />
<Check className="text-emerald-600 dark:text-emerald-400" />

// Warning Icons
<AlertTriangle className="text-amber-600 dark:text-amber-400" />
<Clock className="text-amber-600 dark:text-amber-400" />

// Error Icons
<XCircle className="text-red-600 dark:text-red-400" />
<AlertOctagon className="text-red-600 dark:text-red-400" />
```

---

### Button Colors

```tsx
// Primary action (indigo)
<Button variant="primary">Save Changes</Button>
// → Uses gradient: from-indigo-600 to-purple-600

// Secondary action (glass)
<Button variant="secondary">Cancel</Button>
// → Uses bg-white/50 dark:bg-white/10

// Destructive action (red)
<Button variant="destructive">Delete</Button>
// → Uses bg-red-500/10 border-red-500/20

// Dangerous action (red gradient)
<Button variant="danger">Permanently Delete</Button>
// → Uses gradient: from-red-600 to-red-700

// Ghost button (transparent)
<Button variant="ghost">View Details</Button>
// → Uses text-slate-600 hover:bg-slate-100
```

---

### Card/Panel Colors

```tsx
// Default glass card
<GlassCard className="p-6">
  // → Uses glass-card class (white/50 with blur)
</GlassCard>

// Info card
<GlassCard className="p-4 bg-blue-500/5 border-blue-500/20">
  <Info className="text-blue-600" />
  Information content
</GlassCard>

// Success card
<GlassCard className="p-4 bg-emerald-500/5 border-emerald-500/20">
  <Check className="text-emerald-600" />
  Success message
</GlassCard>

// Warning card
<GlassCard className="p-4 bg-amber-500/5 border-amber-500/20">
  <AlertTriangle className="text-amber-600" />
  Warning message
</GlassCard>

// Logic/workflow card
<GlassCard className="p-4 bg-purple-500/5 border-purple-500/20">
  <Calculator className="text-purple-600" />
  Logic configuration
</GlassCard>
```

---

## ✅ Do's and Don'ts

### ✅ DO:

**Use semantic colors consistently:**
```tsx
// ✅ CORRECT - Purple for logic
<div className="bg-purple-500/10 border-purple-500/20">
  <Calculator className="text-purple-600" />
  Formula Builder
</div>

// ✅ CORRECT - Indigo for primary action
<Button variant="primary">Create New Project</Button>

// ✅ CORRECT - Blue for info
<Badge variant="info">In Planning</Badge>

// ✅ CORRECT - Emerald for success
<Badge variant="success">Completed</Badge>
```

**Use opacity for backgrounds:**
```tsx
// ✅ CORRECT - Subtle backgrounds
className="bg-purple-500/10"  // 10% opacity
className="bg-blue-500/20"    // 20% opacity
className="border-purple-500/30"  // 30% border opacity
```

**Use dark mode variants:**
```tsx
// ✅ CORRECT - Light and dark variants
className="text-purple-600 dark:text-purple-400"
className="bg-blue-500/10 dark:bg-blue-500/20"
```

---

### ❌ DON'T:

**Mix purple and indigo for primary actions:**
```tsx
// ❌ WRONG - Don't use purple for primary buttons
<button className="bg-purple-600">Primary Action</button>

// ✅ CORRECT - Use indigo for primary
<Button variant="primary">Primary Action</Button>
```

**Use random colors without meaning:**
```tsx
// ❌ WRONG - What does violet mean?
<Badge className="bg-violet-500">Status</Badge>

// ✅ CORRECT - Use semantic colors
<Badge variant="info">Status</Badge>
```

**Forget dark mode:**
```tsx
// ❌ WRONG - Only works in light mode
className="text-purple-600"

// ✅ CORRECT - Works in both modes
className="text-purple-600 dark:text-purple-400"
```

**Use full opacity backgrounds:**
```tsx
// ❌ WRONG - Too heavy
className="bg-purple-500"

// ✅ CORRECT - Subtle with opacity
className="bg-purple-500/10"
```

---

## 📖 Quick Reference

### Color Decision Tree

```
Is it a primary action/feature?
  └─ YES → Use Indigo-600
  └─ NO → Continue...

Is it logic/workflow/review related?
  └─ YES → Use Purple-500/600
  └─ NO → Continue...

Is it informational?
  └─ YES → Use Blue-500
  └─ NO → Continue...

Is it a success state?
  └─ YES → Use Emerald-500
  └─ NO → Continue...

Is it a warning/pending?
  └─ YES → Use Amber-500
  └─ NO → Continue...

Is it an error/danger?
  └─ YES → Use Red-500
  └─ NO → Use Slate-600 (neutral)
```

---

### Color Palette Cheat Sheet

| Color | Hex | Use Case | Example |
|-------|-----|----------|---------|
| **Indigo-600** | `#4f46e5` | Primary brand, main actions | Primary buttons, active nav |
| **Purple-500** | `#a855f7` | Logic, workflow, accents | Formula builder, review state |
| **Purple-600** | `#9333ea` | Logic emphasis, highlights | Active workflow node |
| **Blue-500** | `#3b82f6` | Information, secondary | Info messages, planning state |
| **Emerald-500** | `#10b981` | Success, active, complete | Success badges, completed |
| **Amber-500** | `#f59e0b` | Warning, pending | Pending approval, needs action |
| **Red-500** | `#ef4444` | Error, danger, blocked | Error messages, delete actions |
| **Slate-600** | `#475569` | Neutral, inactive | Draft, disabled states |

---

### Common Patterns

```tsx
// Primary Action Button
<Button variant="primary" className="from-indigo-600 to-purple-600">

// Logic/Workflow Indicator
className="bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400"

// Info Message
className="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"

// Success State
className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"

// Warning State
className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"

// Error State
className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"

// Neutral/Inactive
className="bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400"
```

---

## 💡 Pro Tips

1. **When in doubt, check existing patterns:**
   - Look at similar components in the codebase
   - Follow the semantic meaning
   - Ask: "What does this color communicate?"

2. **Test in both light and dark modes:**
   - Always add dark mode variants
   - Use `dark:text-purple-400` instead of `dark:text-purple-600`
   - Lighter shades work better on dark backgrounds

3. **Use opacity for backgrounds:**
   - `/10` for very subtle
   - `/20` for noticeable but light
   - `/30` for borders
   - Never go above `/50` for backgrounds

4. **Keep borders lighter than backgrounds:**
   ```tsx
   bg-purple-500/10 border-purple-500/20  ✅ Good
   bg-purple-500/20 border-purple-500/10  ❌ Wrong
   ```

5. **Icon colors should match text:**
   ```tsx
   <div className="text-purple-600 dark:text-purple-400">
     <Calculator className="w-5 h-5" />  {/* Inherits color */}
     Formula Builder
   </div>
   ```

---

## 📚 Related Documentation

- **Design System:** `/docs/DESIGN_SYSTEM.md`
- **Design Tokens:** `/config/design-tokens.ts`
- **Component Guide:** `/docs/COMPONENT_USAGE_GUIDE.md`

---

**Remember:** Colors communicate meaning. Use them intentionally! 🎨
