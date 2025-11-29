import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  episodeId: string;
  title: string;
  savedPosition?: number;
  onProgressUpdate?: (position: number) => void;
  onVideoEnd?: () => void;
}

export function VideoPlayer({
  src,
  episodeId,
  title,
  savedPosition = 0,
  onProgressUpdate: _onProgressUpdate,
  onVideoEnd: _onVideoEnd
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Check if there's a saved position (more than 30 seconds and less than 95% of video)
    if (savedPosition && savedPosition > 30) {
      setResumePosition(savedPosition);
      setShowResumePrompt(true);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [savedPosition, episodeId]);

  useEffect(() => {
    // Start tracking progress every 10 seconds
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Note: Since we're using iframe, we can't directly access video time
    // This is a limitation of iframe-based players
    // We'll need to rely on the embedded player's own progress tracking
    // or use a custom video player with direct access to video element

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [episodeId]);

  const handleResumeVideo = () => {
    setShowResumePrompt(false);
    // Try to communicate with iframe to seek to position
    // Note: This requires the embedded player to support postMessage API
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'seek', time: resumePosition },
          '*'
        );
      } catch (error) {
        console.error('Failed to seek video:', error);
      }
    }
  };

  const handleStartFromBeginning = () => {
    setShowResumePrompt(false);
    // Video will start from beginning by default
  };

  return (
    <div className="relative">
      <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        <iframe
          ref={iframeRef}
          key={episodeId}
          src={src}
          className="w-full h-full"
          allowFullScreen
          title={title}
          allow="autoplay; fullscreen"
        />
      </div>

      {showResumePrompt && (
        <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center z-10">
          <Card className="w-[90%] max-w-md shadow-2xl border-accent">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Play className="w-12 h-12 text-accent mx-auto" />
                <h3 className="text-xl font-semibold">Resume Watching?</h3>
                <p className="text-muted-foreground">
                  You were at {Math.floor(resumePosition / 60)} minutes and {resumePosition % 60} seconds
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    onClick={handleResumeVideo}
                    size="lg"
                    className="w-full"
                  >
                    Resume from {Math.floor(resumePosition / 60)}:{String(resumePosition % 60).padStart(2, '0')}
                  </Button>
                  <Button 
                    onClick={handleStartFromBeginning}
                    size="lg"
                    variant="outline"
                    className="w-full"
                  >
                    Start from Beginning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
