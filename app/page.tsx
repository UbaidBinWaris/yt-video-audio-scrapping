'use client';

import { useState } from 'react';
import Image from 'next/image';

type LoadingState = 'idle' | 'info' | 'video' | 'audio' | 'playlist-video' | 'playlist-audio';

interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  uploader: string;
  view_count: number;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadPlaylist, setDownloadPlaylist] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  const handleGetInfo = async () => {
    const cleanUrl = url.trim();
    
    if (!cleanUrl) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!cleanUrl.includes('youtube.com') && !cleanUrl.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading('info');
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/video-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setVideoInfo(data);
        setMessage('✓ Video information loaded successfully');
      } else {
        setError(data.error || 'Failed to fetch video info');
      }
    } catch (err) {
      setError('Failed to connect to backend. Make sure the Flask server is running.');
    } finally {
      setLoading('idle');
    }
  };

  const handleDownloadVideo = async () => {
    const cleanUrl = url.trim();
    
    if (!cleanUrl) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!cleanUrl.includes('youtube.com') && !cleanUrl.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(downloadPlaylist ? 'playlist-video' : 'video');
    setError('');
    setMessage(downloadPlaylist ? 
      '📥 Downloading playlist videos... This may take several minutes.' : 
      '📥 Downloading video... This may take a few minutes.');

    try {
      const endpoint = downloadPlaylist ? '/api/download-playlist-video' : '/api/download-video';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✓ ${downloadPlaylist ? 'Playlist videos' : 'Video'} downloaded: ${data.filename || data.message}`);
      } else {
        setError(data.error || 'Failed to download video');
      }
    } catch (err) {
      setError('Failed to connect to backend. Make sure the Flask server is running.');
    } finally {
      setLoading('idle');
    }
  };

  const handleDownloadAudio = async () => {
    const cleanUrl = url.trim();
    
    if (!cleanUrl) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!cleanUrl.includes('youtube.com') && !cleanUrl.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(downloadPlaylist ? 'playlist-audio' : 'audio');
    setError('');
    setMessage(downloadPlaylist ? 
      '🎵 Downloading playlist audio... This may take several minutes.' : 
      '🎵 Downloading audio... This may take a few minutes.');

    try {
      const endpoint = downloadPlaylist ? '/api/download-playlist-audio' : '/api/download-audio';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✓ ${downloadPlaylist ? 'Playlist audio' : 'Audio'} downloaded: ${data.filename || data.message}`);
      } else {
        setError(data.error || 'Failed to download audio');
      }
    } catch (err) {
      setError('Failed to connect to backend. Make sure the Flask server is running.');
    } finally {
      setLoading('idle');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <main className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12 pt-8 md:pt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎬 YouTube Downloader
          </h1>
          <p className="text-gray-300 text-base md:text-lg">
            Download YouTube videos and audio tracks easily
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 mb-6 md:mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              YouTube URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or playlist URL"
              className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading !== 'idle'}
            />
          </div>

          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="playlist"
              checked={downloadPlaylist}
              onChange={(e) => setDownloadPlaylist(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              disabled={loading !== 'idle'}
            />
            <label htmlFor="playlist" className="ml-2 text-sm font-medium text-white">
              Download entire playlist (if URL is a playlist)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleGetInfo}
              disabled={loading !== 'idle'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading === 'info' && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading === 'info' ? 'Loading...' : '📋 Get Info'}
            </button>
            <button
              onClick={handleDownloadVideo}
              disabled={loading !== 'idle'}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(loading === 'video' || loading === 'playlist-video') && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {(loading === 'video' || loading === 'playlist-video') ? 'Downloading...' : '🎥 Download Video'}
            </button>
            <button
              onClick={handleDownloadAudio}
              disabled={loading !== 'idle'}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(loading === 'audio' || loading === 'playlist-audio') && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {(loading === 'audio' || loading === 'playlist-audio') ? 'Downloading...' : '🎵 Download Audio'}
            </button>
          </div>

          {message && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200 flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 flex items-start gap-2">
              <span className="text-xl">⚠</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {videoInfo && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📺</span> Video Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {videoInfo.thumbnail && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                    <Image
                      src={videoInfo.thumbnail}
                      alt="Video thumbnail"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Title</p>
                  <p className="text-white font-semibold text-lg">{videoInfo.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Uploader</p>
                    <p className="text-white font-medium">{videoInfo.uploader}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Duration</p>
                    <p className="text-white font-medium">{formatDuration(videoInfo.duration)}</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Views</p>
                  <p className="text-white font-medium text-xl">
                    {videoInfo.view_count?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8 md:mt-12 text-gray-400 text-sm space-y-2">
          <p>🔧 Make sure your Flask backend is running on port 5000</p>
          <p>📁 Files are saved in backend/downloads folder</p>
        </div>
      </main>
    </div>
  );
}
