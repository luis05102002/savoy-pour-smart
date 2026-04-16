import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

const VIDEOS = ['/videos/video1.mp4', '/videos/video2.mp4', '/videos/video3.mp4'];
const DURATION_PER_VIDEO = 2500;
const CROSSFADE_MS = 600;

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [nextVideo, setNextVideo] = useState<number | null>(null);
  const [exiting, setExiting] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const startedRef = useRef(false);

  // Start video 1 and music immediately — don't wait for other videos
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const first = videoRefs.current[0];
    if (first) {
      first.play().catch(() => {});
    }

    const audio = new Audio('/videos/intro-music.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Preload next video while current one plays
  useEffect(() => {
    const nextIdx = currentVideo + 1;
    if (nextIdx >= VIDEOS.length) return;
    const nextEl = videoRefs.current[nextIdx];
    if (nextEl && nextEl.readyState < 2) {
      nextEl.load();
    }
  }, [currentVideo]);

  const handleComplete = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    const audio = audioRef.current;
    if (audio) {
      let vol = audio.volume;
      const fade = setInterval(() => {
        vol -= 0.05;
        if (vol <= 0) {
          clearInterval(fade);
          audio.pause();
        } else {
          audio.volume = vol;
        }
      }, 50);
    }
    setTimeout(onComplete, 800);
  }, [onComplete, exiting]);

  const advanceOrEnd = useCallback(() => {
    if (currentVideo < VIDEOS.length - 1) {
      const next = currentVideo + 1;
      const nextEl = videoRefs.current[next];

      // If next video isn't buffered enough, wait up to 2s then skip
      if (nextEl && nextEl.readyState < 3) {
        const waitMs = 1500;
        const waitTimer = setTimeout(() => {
          if (nextEl.readyState >= 2) {
            // Ready enough now, play it
            nextEl.currentTime = 0;
            nextEl.play().catch(() => {});
            setNextVideo(next);
            setTimeout(() => {
              setCurrentVideo(next);
              setNextVideo(null);
            }, CROSSFADE_MS);
          } else {
            // Still not ready, skip this video
            advanceOrEndSkipping(next);
          }
        }, waitMs);
        // Store timer so we can clean up
        return () => clearTimeout(waitTimer);
      }

      setNextVideo(next);
      if (nextEl) {
        nextEl.currentTime = 0;
        nextEl.play().catch(() => {});
      }
      setTimeout(() => {
        setCurrentVideo(next);
        setNextVideo(null);
      }, CROSSFADE_MS);
    } else {
      handleComplete();
    }
  }, [currentVideo, handleComplete]);

  // Helper to skip unavailable videos
  const advanceOrEndSkipping = useCallback((skipIdx: number) => {
    // If the video we want to skip to is also the last, just end
    if (skipIdx >= VIDEOS.length - 1) {
      handleComplete();
      return;
    }
    // Otherwise advance state past the skipped video
    setCurrentVideo(skipIdx + 1);
    setNextVideo(null);
    const afterSkip = videoRefs.current[skipIdx + 1];
    if (afterSkip) {
      afterSkip.currentTime = 0;
      afterSkip.play().catch(() => {});
    }
  }, [handleComplete]);

  // Advance timer — doesn't need "ready" gate, plays immediately
  useEffect(() => {
    if (exiting) return;
    timerRef.current = setTimeout(advanceOrEnd, DURATION_PER_VIDEO);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentVideo, exiting, advanceOrEnd]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background overflow-hidden cursor-pointer"
      onClick={handleComplete}
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Videos stacked for crossfade */}
      {VIDEOS.map((src, i) => {
        const isActive = i === currentVideo;
        const isNext = i === nextVideo;
        return (
          <video
            key={src}
            ref={(el) => { videoRefs.current[i] = el; }}
            src={src}
            preload={i === 0 ? 'auto' : 'metadata'}
            muted
            playsInline
            loop={i === currentVideo && i === VIDEOS.length - 1}
            controls={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isActive || isNext ? 1 : 0,
              zIndex: isNext ? 2 : isActive ? 1 : 0,
              transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
              transform: isNext ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        );
      })}

      {/* Cinematic overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--background) / 0.4) 0%, hsl(var(--background) / 0.1) 30%, hsl(var(--background) / 0.1) 70%, hsl(var(--background) / 0.6) 100%)',
        }}
      />

      {/* Progress bar */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {VIDEOS.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full overflow-hidden bg-muted-foreground/20"
            style={{ width: i === currentVideo ? 32 : 6, transition: 'width 0.5s ease' }}
          >
            {i === currentVideo && (
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: DURATION_PER_VIDEO / 1000, ease: 'linear' }}
                key={`bar-${currentVideo}`}
              />
            )}
            {i < currentVideo && <div className="h-full w-full bg-primary/60 rounded-full" />}
          </div>
        ))}
      </div>

      {/* Skip text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground text-[10px] tracking-[0.3em] uppercase font-body z-20"
      >
        Toca para entrar
      </motion.p>

      {/* Brand overlay — subtle during videos */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
      >
        <p className="font-display text-4xl gold-text-gradient tracking-[0.35em] uppercase drop-shadow-lg">
          Savoy
        </p>
        <div className="art-deco-line w-16 my-2" />
        <p className="text-muted-foreground/70 text-[11px] tracking-[0.5em] font-body uppercase">
          by PG
        </p>
      </motion.div>
    </motion.div>
  );
};

export default VideoIntro;