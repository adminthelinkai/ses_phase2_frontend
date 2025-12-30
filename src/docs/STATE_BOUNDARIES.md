
# State Management Boundaries

We enforce a strict separation between **Server State**, **UI State**, and **Local Component State**.

## 1. Server State (TanStack Query)
**Location**: `src/api/`
**Responsibilities**:
- Project lists, Deliverable structures, Node data.
- User roles and department metadata.
- **Rule**: If the data comes from the DB, it lives here. Never sync server data into Zustand.

## 2. Global UI State (Zustand)
**Location**: `src/state/`
**Responsibilities**:
- `activeProjectId`: Which project is the app currently focused on.
- `activeNodeId`: Which node is currently viewed in the center panel.
- `isRightPanelCollapsed`: User UI preferences.
- **Rule**: Keep this as thin as possible. If it doesn't need to be shared across the 3 panels, it doesn't belong here.

## 3. Local Component State (`useState`)
**Location**: Individual components.
**Responsibilities**:
- Form input values before submission.
- Hover states, temporary toggles (dropdowns).
- **Rule**: Keep state as close to the usage as possible to prevent unnecessary re-renders of the large 3-panel layout.

## 4. What NEVER goes Global
- **Full Project Trees**: Never load the entire project hierarchy into a global state. Always fetch per-deliverable.
- **Chat History**: Chat should be managed by its own scoped provider or server-state hook.
