
# Code-Splitting and Lazy-Loading Strategy

To meet the performance requirements of a large-scale enterprise system, we employ a "Just-In-Time" (JIT) loading strategy.

## 1. Route-Level Splitting
The two primary routes (`/home` and `/workspace`) are lazy-loaded. 
- A user landing on `/home` does not download the heavy logic required for the `/workspace` execution engine until they select a project.

## 2. Feature-Level Lazy Loading
Inside the `/workspace`:
- **Node Execution Components**: Since a deliverable may have 20+ different node types (Approval, Upload, Review, Calculation), we lazy-load each node's internal UI only when that node is selected in the right panel.
- **Chat**: The chat module is loaded independently of the node structure.

## 3. Strategic Pre-fetching
- While the user is browsing projects on the `/home` page, we pre-fetch core project metadata (the deliverable list) to ensure the `/workspace` transition feels instantaneous.

## 4. Bundle Governance
- We use Vite's manual chunks to separate heavy dependencies (like `d3` or `recharts`) into their own vendor bundles, preventing them from slowing down the initial app boot.
