# SWIZ Workspace - Enterprise Project Management System

## 🎯 Overview
SWIZ Workspace adalah sistem manajemen proyek enterprise yang lengkap dengan Role-Based Access Control (RBAC), workflow management, resource allocation, dan analytics yang comprehensive.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[README.md](./README.md)** | Complete system documentation (this file) |
| **[QUICK_START.md](./QUICK_START.md)** | 5-minute getting started guide |
| **[CHANGELOG.md](./CHANGELOG.md)** | Version history and updates |
| **[CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)** | Cleanup and optimization details |
| **[Attributions.md](./Attributions.md)** | Open source licenses |

> 💡 **First time?** Start with [QUICK_START.md](./QUICK_START.md)

## ✨ Key Features

### 🔐 Authentication & RBAC
- **5 User Roles**: Admin, BOD, PM, Leader, Contributor
- Role-based navigation dan UI capabilities
- Protected routes dan access control
- Demo mode dengan role switcher

### 📊 Core Modules

#### 1. **Projects Module**
- **4-Phase Workflow**: Drafting → Governance → Setup → Activation
- Project Creation Wizard (5 steps)
- Portfolio Dashboard dengan statistics
- Active Project Dashboard
- Project Workspace untuk monitoring

#### 2. **Governance Module** (BOD Only)
- Review Dashboard untuk approval requests
- Gate Review Interface
- Decision History tracking
- Portfolio Overview untuk BOD

#### 3. **Assignment Management**
- Premium glass morphism design
- Smart filtering & sorting
- Multiple view modes (by-stage, by-leader, by-priority)
- My Assignments page untuk Leaders
- Animated stats cards

#### 4. **Task Management**
- Draggable Kanban Board (react-dnd)
- Workflow Designer dengan visual canvas
- Task Monitoring Dashboard
- Batch processing
- Task execution modal

#### 5. **Resource Management**
- Resource Type Builder dengan schema editor
- Resource Pool management
- Allocation Matrix dengan conflict detection
- Instance management
- Resource inheritance

#### 6. **Indicators & Analytics**
- Indicator Builder dengan logic studio
- Analytics Dashboard
- Data Explorer
- Widget Library (KPI, Gauge, TimeSeries, Alert)
- Visual workflow canvas
- Manual data entry

#### 7. **Automation** (Admin Only)
- Workflow automation rules
- Trigger-based actions
- System integration

## 🛠 Tech Stack
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4.0
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Drag & Drop**: react-dnd
- **State**: Zustand
- **Date**: date-fns
- **Notifications**: Sonner

## 🎨 Design System
- **Glass Aura Theme**: Dark mode dengan glassmorphism effects
- **Animated Background**: 3 floating gradient blobs
- **Premium Components**: Custom GlassCard, Button, Badge
- **Responsive**: Mobile-first design

## 📁 Project Structure
```
/
├── components/
│   ├── analytics/          # Analytics & indicators
│   ├── assignments/        # Assignment management
│   ├── dashboard/          # Dashboard views
│   ├── governance/         # BOD review interfaces
│   ├── layout/            # Layout components (Sidebar, TopBar)
│   ├── projects/          # Project management
│   ├── resources/         # Resource management
│   ├── tasks/             # Task management
│   ├── ui/                # Reusable UI components
│   ├── users/             # User management
│   └── workflow/          # Workflow builder
├── pages/                 # Page components
│   ├── Analytics.tsx
│   ├── Approvals.tsx
│   ├── AssignmentDemo.tsx
│   ├── Automation.tsx
│   ├── Dashboard.tsx
│   ├── Indicators.tsx
│   ├── Login.tsx
│   ├── MyAssignments.tsx
│   ├── Projects.tsx
│   ├── Resources.tsx
│   ├── Settings.tsx
│   ├── Tasks.tsx
│   └── UserManagement.tsx
├── store/                 # Zustand state management
│   ├── authStore.ts
│   ├── automationStore.ts
│   ├── governanceStore.ts
│   ├── indicatorStore.ts
│   ├── projectStore.ts
│   ├── resourceStore.ts
│   ├── taskStore.ts
│   ├── themeStore.ts
│   └── userStore.ts
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
└── App.tsx               # Main application

```

## 🚀 Quick Start

### Demo Login Credentials
```
Admin:
- Email: admin@swiz.com
- Password: admin123

BOD:
- Email: bod@swiz.com
- Password: bod123

PM:
- Email: pm@swiz.com
- Password: pm123

Leader:
- Email: leader@swiz.com
- Password: leader123

Contributor:
- Email: contributor@swiz.com
- Password: contributor123
```

### Access by Role

| Module | Admin | BOD | PM | Leader | Contributor |
|--------|-------|-----|----|----|-------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projects | ✅ | ✅ | ✅ | ✅ | ❌ |
| My Assignments | ❌ | ❌ | ❌ | ✅ | ✅ |
| Tasks | ✅ | ❌ | ✅ | ✅ | ✅ |
| Resources | ✅ | ❌ | ✅ | ❌ | ❌ |
| Indicators | ✅ | ✅ | ✅ | ✅ | ❌ |
| Analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approvals | ✅ | ✅ | ❌ | ❌ | ❌ |
| Automation | ✅ | ❌ | ❌ | ❌ | ❌ |
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🔄 Project Workflow

### Phase 1: DRAFTING
**PM creates project proposal**
1. Open Project Creation Wizard
2. Fill Details & Collaboration
3. Build Workflow with stages & gates
4. Assign Leaders to stages
5. Define Indicators (project & assignment level)
6. Review & Submit

### Phase 2: GOVERNANCE
**BOD reviews & approves**
1. BOD receives notification
2. Review project in Approvals page
3. Review gates in Gate Review Interface
4. Make decision (approve/reject/request changes)
5. System moves to Setup phase

### Phase 3: SETUP
**PM & Leaders configure technical details**
1. Set up indicators
2. Configure resources
3. Map resource allocation
4. Finalize configurations
5. Mark setup complete

### Phase 4: ACTIVATION
**System auto-starts project**
1. Project becomes active
2. Tasks are generated
3. Leaders can view assignments
4. Team starts execution

## 📊 Data Flow

### localStorage Keys
- `swiz-auth`: Authentication state
- `swiz-users`: User database
- `swiz-projects`: All projects
- `swiz-governance`: Approval requests & decisions
- `swiz-tasks`: Task instances
- `swiz-resources`: Resource types & instances
- `swiz-allocations`: Resource allocations
- `swiz-indicators`: Indicator definitions
- `swiz-automation`: Automation rules
- `swiz-theme`: Theme settings

## 🐛 Bug Fixes Applied
- ✅ Fixed date conversion errors (localStorage date strings → Date objects)
- ✅ Fixed project visibility for all roles
- ✅ Fixed drag & drop in task board
- ✅ Fixed gate review modal interactions
- ✅ Fixed resource type builder

## 🎯 Latest Updates
- ✅ Assignment Management UI dengan premium design
- ✅ My Assignments page untuk Leaders
- ✅ Cleaned up duplicate files
- ✅ Removed outdated documentation
- ✅ Streamlined codebase

## 📝 Important Notes
- All dates are stored as ISO strings in localStorage
- Always wrap date strings with `new Date()` when comparing
- Use role switcher for testing different user perspectives
- Demo data is generated on first load

## 🔧 Development Guidelines
1. **Component Structure**: Use functional components with hooks
2. **State Management**: Use Zustand stores for global state
3. **Styling**: Use Tailwind CSS classes, avoid inline styles
4. **Types**: Define proper TypeScript types in `/types`
5. **Glass Effect**: Use GlassCard component for consistent design

## 📱 Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- All major components are responsive

## 🎨 Color Palette
- **Primary**: Purple gradients
- **Secondary**: Pink, Blue, Cyan
- **Background**: Slate with glass effects
- **Text**: White with opacity variations

## 🚧 Future Enhancements
- Real-time collaboration
- File attachments
- Advanced reporting
- Email notifications
- API integration
- Multi-language support

---

**Version**: 2.0  
**Last Updated**: December 2024  
**Status**: Production Ready ✅