# DeoVR Thumbnail Creator

A desktop app for creating VR180/VR360 video thumbnails with ease.

## Why I Built This

As a VR content creator, I found making thumbnails frustrating:

- Opening heavy image editing software just for a thumbnail? Tedious.
- VR180 SBS videos aren't flat like YouTube thumbnails - cropping them properly is a pain.
- I just wanted to pick a frame, add some text and stamps, and export. That's it.

So I built this tool. I'm not an engineer - this was made through vibe coding with AI assistance.

## Features

- **VR180/VR360 Preview** - View your video in proper equirectangular projection
- **Frame Capture** - Scrub through video and pick the perfect moment
- **Text Overlays** - Add titles with customizable fonts, colors, and effects
- **Stamp Library** - Built-in VR180, VR360, 4K, 8K badges + custom stamp uploads
- **11 Themes** - Dark, Light, OLED, Cyber Neon, and more
- **Multi-language** - English, Japanese, Korean, Chinese, Spanish
- **Export** - Save as PNG with all overlays baked in

## Download

Check the [Releases](../../releases) page for the latest builds:

- **macOS**: `.dmg` or `.zip` (ARM64 / Apple Silicon)
- **Windows**: `.exe` installer or portable `.exe`

## Usage

1. Drag & drop your VR video file (or click to browse)
2. Use the timeline to find the frame you want
3. Add text overlays and stamps as needed
4. Adjust camera angle if desired
5. Click "Export Thumbnail" and choose where to save

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package for macOS
npm run package:mac

# Package for Windows
npm run package:win
```

## Tech Stack

- Electron
- React 19
- TypeScript
- Vite
- Three.js (for VR rendering)
- Tailwind CSS
- Zustand (state management)

## License

ISC
