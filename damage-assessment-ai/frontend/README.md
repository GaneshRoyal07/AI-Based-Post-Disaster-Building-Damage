# Frontend - Building Damage Assessment React App

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will start on `http://localhost:3000`

## Build

```bash
npm run build
```

## Configuration

The frontend connects to the backend API at `http://localhost:8000`.

Make sure the backend is running before starting the frontend:
```bash
cd ../backend
uvicorn app.main:app --reload
```

## Features

- **Image Upload**: Select and upload building images
- **Real-time Analysis**: See damage assessment results
- **Damage Classification**: 
  - Destroyed (Red)
  - Major Damage (Orange)
  - Minor Damage (Yellow)
  - No Damage (Green)
- **Annotated Images**: View YOLO detection boxes
- **Recommendations**: Get actionable next steps
