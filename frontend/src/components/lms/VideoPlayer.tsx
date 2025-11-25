'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'plyr-react/plyr.css';

// Dynamic import Plyr to avoid SSR issues
const Plyr = dynamic(() => import('plyr-react'), { 
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading player...</div>
    </div>
  )
});

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
  startTime?: number;
}

export default function VideoPlayer({
  src,
  poster,
  onProgress,
  onComplete,
  autoPlay = false,
  startTime = 0,
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const player = playerRef.current?.plyr;
    
    if (!player || typeof player.on !== 'function') return;

    // Set start time if provided
    if (startTime > 0) {
      player.currentTime = startTime;
    }

    // Track progress every 5 seconds
    const trackProgress = () => {
      if (player && player.duration) {
        const progressPercent = (player.currentTime / player.duration) * 100;
        onProgress?.(progressPercent);
      }
    };

    // Setup event listeners
    const handleTimeUpdate = () => {
      trackProgress();
    };

    const handleEnded = () => {
      onProgress?.(100);
      onComplete?.();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };

    player.on('timeupdate', handleTimeUpdate);
    player.on('ended', handleEnded);

    // Track progress every 5 seconds
    progressIntervalRef.current = setInterval(trackProgress, 5000);

    return () => {
      // Safely remove event listeners
      try {
        if (player && typeof player.off === 'function') {
          player.off('timeupdate', handleTimeUpdate);
          player.off('ended', handleEnded);
        }
      } catch (error) {
        // Ignore errors if player is already destroyed
        console.warn('Error removing player event listeners:', error);
      }
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [onProgress, onComplete, startTime]);

  const videoSrc = {
    type: 'video' as const,
    sources: [
      {
        src: src,
        type: 'video/mp4',
      },
    ],
    poster: poster,
  };

  const plyrOptions = {
    controls: [
      'play-large',
      'restart',
      'rewind',
      'play',
      'fast-forward',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'captions',
      'settings',
      'pip',
      'airplay',
      'fullscreen',
    ],
    settings: ['captions', 'quality', 'speed'],
    speed: {
      selected: 1,
      options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    },
    quality: {
      default: 720,
      options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
    },
    autoplay: autoPlay,
    keyboard: {
      focused: true,
      global: true,
    },
  };

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black">
      <Plyr
        ref={playerRef}
        source={videoSrc}
        options={plyrOptions}
      />
    </div>
  );
}
