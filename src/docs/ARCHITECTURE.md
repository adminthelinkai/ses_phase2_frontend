
# High-Level Frontend Architecture

## 1. Deterministic Layout Philosophy
The EPCM system is designed as a **deterministic work environment**. Unlike consumer SaaS platforms that favor fluid, responsive, and often unpredictable layouts, this system prioritizes **predictability and persistence**.
- **Fixed Geometry**: The 3-panel workspace is the "cockpit" of the engineer. Its physical structure does not change based on user role or screen size (above 1280px).
- **Contextual Center**: The center panel is the only fluid area, functioning as a high-fidelity viewing port that switches between Chat (collaboration) and Node Execution (work).

## 2. Deliverable-Driven Execution Model
Architecture is centered on the **Deliverable** as the primary unit of data. 
- **Immutable Chains**: Every deliverable is born with a predefined, non-editable "Node Chain" (execution steps). 
- **Stateless Navigation**: Navigation through the right-side Node Structure panel updates the context of the center panel without reloading the application state, ensuring high-speed interaction for long working sessions.

## 3. Action-Based Role Security
Security and access control are implemented at the **Action Level**, not the **Layout Level**. 
- A single codebase and layout serve every user from "Designer" to "Head of SES".
- The UI checks permissions only to enable/disable or show/hide specific action buttons (Approve, Submit, Reject) within the node context.

## 4. Performance at Scale
To support 1000+ concurrent users and complex project trees:
- **Virtualization**: Large node trees are virtualized to prevent DOM bloating.
- **Granular Updates**: Real-time updates (via WebSockets) are scoped to the active deliverable to avoid global re-renders.
- **Memory Integrity**: Strict cleanup of listeners and subscriptions ensures stability over 8+ hour sessions.

---

### Assumptions
- **Assumption 1**: The backend provides a normalized API where Deliverables and Nodes are distinct entities with a parent-child relationship.
- **Assumption 2**: Project metadata (Logo, Project Name) is global and persistent throughout the session.
- **Assumption 3**: Authentication and role assignment are handled externally and provided as a JWT/Session context on initial load.
