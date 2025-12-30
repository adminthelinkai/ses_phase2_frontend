
# Folder and File Structure

The project follows a **strict modular architecture** designed for developer onboarding and long-term maintainability.

```
src/
├── app/           # Entry point, Global Providers (Query, Router, Auth), Global Routes.
├── layout/        # The persistent "Shell". Handles the 3-panel split. Zero business logic.
├── modules/       # Isolated feature-sets.
│   ├── home/      # Project discovery and selection logic.
│   ├── workspace/ # The execution engine.
│   └── chat/      # Communication sub-system.
├── components/    # Reusable UI primitives (Buttons, Inputs, Cards). No business state.
├── design-system/ # Design tokens (#1e5b8b), Typography scales, and Tailwind config extensions.
├── state/         # UI-only state (Zustand). Active project ID, active node ID, panel toggles.
├── api/           # Data fetching layer (TanStack Query hooks). Mappings to backend endpoints.
├── realtime/      # WebSocket logic for status changes and cross-discipline alerts.
├── types/         # Global TypeScript definitions for Deliverables, Nodes, Roles, and Departments.
└── utils/         # Pure helper functions (date formatting, calculation logic).
```

### Why this structure exists:
- **app/**: Centralizes the "plumbing" so developers don't have to hunt for providers.
- **layout/**: Decouples the physical layout from the logic. If the layout needs to change (unlikely), it won't break the features.
- **modules/**: Allows team-based isolation. CSA and Electrical teams can work on the same "Workspace" module without side effects.
- **design-system/**: Prevents "CSS Drift". No developer should ever write a hex code; they must use tokens.
