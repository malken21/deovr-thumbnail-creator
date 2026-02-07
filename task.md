# Task List: VR180 Thumbnail Creator

## Phase 1: Foundation Setup
- [ ] Initialize Electron + Vite + React + TypeScript project <!-- id: 0 -->
- [ ] Install and configure Tailwind CSS <!-- id: 1 -->
- [ ] Install and configure shadcn/ui (and utilities: clsx, tailwind-merge) <!-- id: 2 -->
- [ ] Initialize shadcn components (slider, button, card, select, input, tabs) <!-- id: 3 -->
- [ ] Configure Dark Theme (zinc-950 background) <!-- id: 4 -->
- [ ] Define TypeScript configuration and paths <!-- id: 5 -->

## Phase 2: Core Architecture & State
- [ ] Create `src/types/app.ts` with explicit types (`ViewerState`, `ProjectionType`) <!-- id: 6 -->
- [ ] Set up State Management (Zustand or Context) for `ViewerState` <!-- id: 7 -->
- [ ] Define Constants (Target Resolution 1200x720, default camera values) <!-- id: 8 -->

## Phase 3: Layout & UI Shell
- [ ] Implement Main Layout (Left Sidebar, Main Canvas, Right Sidebar) <!-- id: 9 -->
- [ ] Build Left Sidebar (File Input UI) <!-- id: 10 -->
- [ ] Build Right Sidebar (Transformation Controls: Yaw, Pitch, FOV components) <!-- id: 11 -->

## Phase 4: Video Loader & IPC
- [ ] Implement Electron IPC handlers for file access <!-- id: 12 -->
- [ ] direct file path access logic in Main Process <!-- id: 13 -->
- [ ] Create Drag & Drop Zone component <!-- id: 14 -->
- [ ] Implement hidden HTML5 Video element for texture source <!-- id: 15 -->

## Phase 5: WebGL Viewer (R3F)
- [ ] Install Three.js and React Three Fiber ecosystem (`three`, `@react-three/fiber`, `@react-three/drei`) <!-- id: 16 -->
- [ ] Create `Viewer3D` component <!-- id: 17 -->
- [ ] Implement Scene Setup (Black background, Camera) <!-- id: 18 -->
- [ ] Implement `VR180_SBS` Geometry & UV Mapping (Half Sphere, Left Eye crop) <!-- id: 19 -->
- [ ] Implement `VR360_EQUI` Geometry & UV Mapping <!-- id: 20 -->
- [ ] Implement `FLAT` Geometry <!-- id: 21 -->
- [ ] configure OrbitControls (inverted rotation, restricted zoom/pan) <!-- id: 22 -->

## Phase 6: Threading & Polish
- [ ] Implement "DeoVR Overlay Guide" (5:3 Aspect Ratio Frame) <!-- id: 23 -->
- [ ] Wire up UI controls (sliders) to 3D Scene state <!-- id: 24 -->
- [ ] Verify "Definition of Done" criteria <!-- id: 25 -->
