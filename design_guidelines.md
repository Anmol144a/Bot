# Discord Bot Management Interface Design Guidelines

## Design Approach
**Reference-Based Approach**: Gaming/Entertainment platform inspired by Discord's dark theme aesthetic and modern gaming interfaces like Steam, with emphasis on data visualization and control panels.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary**:
- Background: 220 13% 9% (Dark charcoal)
- Surface: 220 13% 13% (Elevated dark)
- Primary accent: 235 86% 65% (Discord blurple)
- Success: 120 60% 50% (Green for wins/success)
- Danger: 0 65% 55% (Red for losses/errors)
- Warning: 45 90% 60% (Amber for alerts)
- Text primary: 0 0% 95% (Near white)
- Text secondary: 0 0% 70% (Muted gray)

### B. Typography
**Primary**: Inter or system fonts via Google Fonts
**Accent**: JetBrains Mono for code/data displays
**Hierarchy**: 
- Headers: 24px-32px bold
- Body: 14px-16px regular
- Captions: 12px-14px medium

### C. Layout System
**Tailwind spacing primitives**: 2, 4, 6, 8, 12, 16 units
- Consistent p-4, m-6, gap-8 patterns
- Grid layouts with col-span-* for responsive design

### D. Component Library

**Navigation**:
- Vertical sidebar with collapsible sections
- Active states with accent color left border
- Icon + text labels with proper spacing

**Data Displays**:
- Cards with subtle borders and shadows
- Tables with alternating row colors
- Real-time status indicators with animated dots
- Progress bars for level advancement

**Forms & Controls**:
- Dark input fields with focus rings
- Toggle switches for bot status
- Dropdown menus with search functionality

**Gaming Elements**:
- Canvas-rendered game states embedded in cards
- Live betting interfaces with confirmation dialogs
- Leaderboards with rank badges and user avatars

**Overlays**:
- Modal dialogs for configuration
- Toast notifications for real-time events
- Confirmation prompts for critical actions

### E. Visual Hierarchy

**Dashboard Layout**:
- Main content area with sidebar navigation
- Key metrics in prominent cards at top
- Real-time activity feeds in dedicated sections
- Game management in tabbed interfaces

**Status Indicators**:
- Online/offline states with colored dots
- Connection health with signal strength icons
- Game state badges with appropriate colors

**Data Visualization**:
- Simple bar charts for user levels
- Live activity logs with timestamps
- Balance displays with currency formatting

## Gaming-Specific Features

**Game Interfaces**:
- Embedded canvas elements for game visualization
- Interactive betting controls with amount validation
- Real-time multiplier displays with animations
- Level progression bars with reward indicators

**User Management**:
- Avatar displays in circular frames
- Role badges matching Discord hierarchy
- Activity tracking with visual timelines

## Accessibility & Performance
- High contrast ratios for text readability
- Keyboard navigation support
- Optimized canvas rendering for smooth game displays
- Responsive design for various screen sizes