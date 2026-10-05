# AccessPresent AI

A browser-based presentation tool that lets you control your slides with **hand
gestures** instead of a clicker or keyboard. Upload a PDF, turn on your
webcam, and navigate, point, pause, and get live captions — all running
on-device, with no backend server.

## Features

- **Gesture control** — thumbs up/down to move between slides, an open
  palm/fist to resume/pause control, and an extended index finger to drive an
  on-slide virtual pointer. Detection runs locally via
  [MediaPipe Hand Landmarker](https://developers.google.com/mediapipe).
- **PDF upload & rendering** — drop in any PDF exported from PowerPoint,
  Google Slides, etc. and it's rendered slide-by-slide with
  [pdf.js](https://mozilla.github.io/pdf.js/).
- **Slide search** — jump straight to any slide by searching the text on it.
- **Live captions** — real-time speech-to-text overlay using the browser's
  Web Speech API (Chrome/Edge only).
- **"I'm Stuck" rescue cue** — instantly suggests what to say next, built
  from the current slide's own text, no network call needed.
- **Pace tracker** — optional total-time target with a live, color-coded
  per-slide time budget.
- **Gesture setup/calibration page** — practice and test every gesture
  before presenting.
- **Adjustable settings** — gesture sensitivity, action cooldown, pointer
  size, camera mirroring, and more, persisted locally between sessions.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [@mediapipe/tasks-vision](https://developers.google.com/mediapipe) for hand
  tracking
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) for PDF rendering/parsing
- [lucide-react](https://lucide.dev/) for icons

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later (includes npm)
- A webcam (for gesture control) and a Chromium-based browser (Chrome or
  Edge) for the best experience — live captions specifically require
  Chrome/Edge, as Firefox and Safari don't support the Web Speech API yet.

## Getting started

Clone the repo and install dependencies:

```bash
git clone https://github.com/say-uu/AccessPresent-AI.git
cd AccessPresent-AI
npm install
```

`npm install` also runs a `postinstall` script that copies the MediaPipe WASM
runtime into `public/mediapipe/wasm`, which the app needs at runtime.

Start the dev server:

```bash
npm run dev
```

This prints a local URL (typically `http://localhost:5173`) — open it in
your browser. When you reach the Presentation or Gesture Setup page, allow
camera (and, if you enable captions, microphone) access when prompted.

## Available scripts

| Command           | What it does                                      |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Starts the Vite dev server with hot reload         |
| `npm run build`    | Builds a production bundle into `dist/`            |
| `npm run preview`  | Serves the production build locally for a final check |
| `npm run lint`     | Runs Oxlint over the codebase                      |

## Project structure

```
src/
  components/    UI building blocks, grouped by feature (gesture, pdf, presentation, …)
  context/        App-wide state: the loaded presentation and user settings
  hooks/          useWebcam, useGestureEngine, useLiveCaptions
  pages/          Home, Upload, GestureSetup, Presentation, HowItWorks
  utils/          Hand-pose geometry, gesture constants, PDF loading, slide text extraction
```

## Notes

- Gesture recognition and PDF parsing run entirely in the browser — no
  presentation content is uploaded to a server.
- Only PDF files are supported as input (max 50MB); export slides to PDF
  from PowerPoint, Google Slides, or Keynote before uploading.
