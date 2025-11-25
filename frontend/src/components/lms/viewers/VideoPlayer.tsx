'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VideoPlayerProps {
  url: string;
  title?: string;
  thumbnail?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

export function VideoPlayer({
  url,
  title,
  thumbnail,
  autoPlay = false,
  controls = true,
  className,
}: VideoPlayerProps) {
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            src={url}
            poster={thumbnail}
            autoPlay={autoPlay}
            controls={controls}
            className="w-full h-full object-contain"
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              setPlayed(video.currentTime / video.duration);
            }}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              setDuration(video.duration);
            }}
          />
        </div>

        {/* Video metadata */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatTime(played * duration)} / {formatTime(duration)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
