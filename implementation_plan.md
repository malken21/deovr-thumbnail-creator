# Implementation Plan - VR180 Thumbnail Creator

**Role:** Architect / Lead Engineer
**Executor:** Claude Code ("The Carpenter")

This document outlines the technical specifics for building the DeoVR Thumbnail Creator application. Follow strict adherence to the tech stack and architectural decisions.

## 1. Project Initialization & Configuration

### Tech Stack
- **Runtime:** Electron (Latest)
- **Bundler:** Vite
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS (v3.4+)
- **UI Library:** shadcn/ui (Radix Primitives)
- **Icons:** Lucide React
- **3D Engine:** Three.js + React Three Fiber (R3F)

### Setup Commands (Reference)
The executor should run these commands to scaffold the project:
```bash
# Scaffold Electron + Vite + React + TS
npm create @quick-start/electron my-app -- --template react-ts
cd my-app
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui & dependencies
npm install -D @types/node
npm install tailwind-merge clsx class-variance-authority lucide-react
npx shadcn-ui@latest init
# (Select "Slate" or "Zinc" as base color, global css location, etc.)

# Install 3D deps
npm install three @types/three @react-three/fiber @react-three/drei
```

## 2. Architecture & Data Model

### State Management
Use **Zustand** for a lightweight, global store.

**File:** `src/store/useStore.ts`
```typescript
import { create } from 'zustand';

export type ProjectionType = 'VR180_SBS' | 'VR360_EQUI' | 'FLAT';

interface ViewerState {
  videoPath: string | null;
  projection: ProjectionType;
  yaw: number;   // -180 to 180 (or radians)
  pitch: number; // -90 to 90
  fov: number;   // 30 (zoom in) to 110 (wide)
  isPlaying: boolean;
  eye: 'left' | 'right';
  
  // Actions
  setVideoPath: (path: string) => void;
  setProjection: (type: ProjectionType) => void;
  setYaw: (val: number) => void;
  setPitch: (val: number) => void;
  setFov: (val: number) => void;
  togglePlay: () => void;
}

export const useStore = create<ViewerState>((set) => ({
    // ... initial state
}));
```

### Component Structure
```text
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx       # 3-column grid container
│   │   ├── SidebarLeft.tsx    # File input, Video controls
│   │   └── SidebarRight.tsx   # Transformation sliders
│   ├── viewer/
│   │   ├── SceneContainer.tsx # Canvas entry point
│   │   ├── VideoSphere.tsx    # The 3D geometry logic (VR180/360)
│   │   └── OverlayGuide.tsx   # The HTML/CSS 5:3 guide
│   └── ui/                    # shadcn components
├── hooks/
│   └── useVideoTexture.ts     # Helper to manage HTMLVideoElement -> VideoTexture
├── electron/
│   └── main.ts                # IPC handlers for file protocol/drag-and-drop
└── App.tsx
```

## 3. Implementation Details

### A. Video Loader (Electron IPC)
Browser security prevents direct file access from the path.
**Strategy:**
1.  **Renderer:** On 'drop' event, extract `File.path`.
2.  **Challenge:** Web browsers in Electron might sanitize the path.
3.  **Solution:**
    *   Disable `webSecurity` in `main.ts` (Dev only/Caution) OR allow `file://` protocol.
    *   Better: Send path to Main process via IPC, Main process validates/reads, or simply pass the `file://` URL to the video src if `webSecurity: false` is set for the designated window (common for local media apps).
    *   *Decision:* For a local "tool" app, setting `webSecurity: false` or registering a custom file protocol `media://` is best. Let's start with `webSecurity: false` for the prototype to ensure `video.src = "file:///..."` works immediately.

### B. WebGL Viewer Logic
**File:** `src/components/viewer/VideoSphere.tsx`

*   **VR180 (SBS-Left):**
    *   `SphereGeometry(500, 60, 40, Math.PI / 2, Math.PI)` -> Creates a half-sphere.
    *   `scale={[-1, 1, 1]}` -> Invert normals to see inside.
    *   `rotation={[0, -Math.PI / 2, 0]}` -> Align center.
    *   `texture.repeat.set(0.5, 1)` -> Take half horizontal width.
    *   `texture.offset.set(0, 0)` -> Left eye (0.0 to 0.5).

*   **VR360:**
    *   `SphereGeometry(500, 60, 40)` -> Full sphere.
    *   `scale={[-1, 1, 1]}`
    *   `texture.repeat.set(1, 1)`

*   **Flat:**
    *   `PlaneGeometry(16/9 * scale, 1 * scale)`
    *   Place at `z = -10` (arbitrary distance), ensure camera looks at it.

### C. The "DeoVR" Guide Overlay
A simple absolute positioned `div` over the Canvas.
```tsx
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <div 
    className="border border-white/30 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
    style={{
       width: '1200px', 
       height: '720px', 
       transform: 'scale(0.8)' // Dynamic scaling needed to fit screen?
    }}
  />
</div>
```
*Note:* The "Shadow" trick (`0_0_0_9999px`) creates a dimming effect outside the selection area.

## 4. Execution Steps for "The Carpenter"

1.  **Init Core:** Run the scaffolding commands.
2.  **UI Library:** Run `shadcn-ui init` and add `slider`, `button`, `card`.
3.  **Layout:** Create the `AppShell` with rigid dimensions (e.g., `h-screen w-screen overflow-hidden`).
4.  **Viewer Base:** Set up the `Canvas` and `OrbitControls`.
5.  **Video Integration:** Build the Drag & Drop area. When file is dropped, store path in Zustand. Pass path to `VideoTexture`.
6.  **Geometry Switching:** Create the conditional rendering in `VideoSphere` based on `projection` state.
7.  **Controls Wiring:** Connect the right sidebar sliders to Z, Y, FOV state.

## 5. Definition of Done
- [ ] App starts.
- [ ] Drop a VR180 file -> Plays (Left eye).
- [ ] Sidebar Sliders -> Move camera.
- [ ] Visual Guide -> Shows 1200x720 crop area.
