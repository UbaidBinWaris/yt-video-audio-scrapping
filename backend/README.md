# YouTube Video/Audio Scrapper Backend

Flask backend for downloading YouTube videos and audio files.

## Features

- Download YouTube videos in best quality (MP4)
- Download audio only (MP3)
- Get video information without downloading
- List all downloaded files
- Serve downloaded files
- CORS enabled for frontend integration

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- ffmpeg (for audio conversion)

### Installing FFmpeg

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract and add to PATH

**Or using chocolatey:**
```bash
choco install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the Flask server:
```bash
python app.py
```

The server will run on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET /health
```
Returns server status.

### 2. Get Video Information
```
POST /api/video-info
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```
Returns video metadata without downloading.

### 3. Download Video
```
POST /api/download-video
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```
Downloads video in best quality (MP4 format).

### 4. Download Audio
```
POST /api/download-audio
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```
Downloads audio only (MP3 format).

### 5. List Downloads
```
GET /api/downloads
```
Returns list of all downloaded files.

### 6. Download File
```
GET /api/download-file/<filename>
```
Serves a specific downloaded file.

## File Structure

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── .gitignore         # Git ignore file
├── README.md          # This file
└── downloads/         # Downloaded files (auto-created)
```

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:
- 200: Success
- 400: Bad request (missing parameters)
- 404: File not found
- 500: Server error

## Notes

- Downloaded files are saved in the `downloads/` directory
- The `downloads/` directory is automatically created if it doesn't exist
- FFmpeg is required for audio conversion to MP3
- CORS is enabled for all origins (adjust in production)
