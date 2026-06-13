# ⚡ P2P Web Share

Direct browser-to-browser file transfer. No server storage. Completely private.

## Features
- Drag and drop file upload
- Unique room link generation  
- Direct P2P transfer via WebRTC
- Real-time progress bar
- No file data passes through server
- Graceful disconnect handling

## Tech Stack
- Frontend: HTML, CSS, JavaScript, WebRTC
- Backend: Node.js, Express.js, Socket.io
- Protocol: WebRTC Data Channels

## Installation
npm install
node server.js

## How to Use
1. Open http://localhost:3001
2. Drag and drop a file (max 50MB)
3. Click Generate Share Link
4. Share link with receiver
5. Receiver opens link and clicks Join
6. File transfers directly browser to browser

## Project Structure
P2P-FileShare/
├── public/index.html
├── server.js
├── package.json
└── README.md

## MARS Open Projects 2026
P2P Web Share - Web Development Track