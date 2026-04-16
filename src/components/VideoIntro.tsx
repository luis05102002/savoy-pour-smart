import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

const VIDEOS = ['/videos/video1.mp4', '/videos/video2.mp4', '/videos/video3.mp4'];
const DURATION_PER_VIDEO = 4000;
const CROSSFADE_MS = 1200;
const MAX_LOAD_WAIT = 12000; // Don't block forever on slow connections

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [nextVideo, setNextVideo] = useState<number | null>(null);
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Preload all videos — start sequence once ready or after timeout
  useEffect(() => {
    let readyCount = 0;
    const total = VIDEOS.length;
    let settled = false;

    const markReady = () => {
      if (settled) return;
      readyCount++;
      if (readyCount >= total) {
        settled = true;
        setReady(true);
      }
    };

    // Also set a max-wait timeout so slow connections don't freeze
    const fallbackTimer = setTimeout(() => {
      settled = true;
      setReady(true);
    }, MAX_LOAD_WAIT);

    VIDEOS.forEach((src, i) => {
      const el = videoRefs.current[i];
      if (!el) { markReady(); return; }
      if (el.readyState >= 3) {
        markReady();
      } else {
        el.addEventListener('canplaythrough', markReady, { once: true });
        el.addEventListener('error', markReady, { once: true });
      }
    });

    return () => clearTimeout(fallbackTimer);
  }, []);

  // Start music + first video once ready
  useEffect(() => {
    if (!ready) return;
    const audio = new Audio('/videos/intro-music.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    audio.play().catch(() => {});

    const first = videoRefs.current[0];
    if (first) first.play().catch(() => {});

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [ready]);

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
      setNextVideo(next);
      const nextEl = videoRefs.current[next];
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

  // Advance timer — only runs when ready and not exiting
  useEffect(() => {
    if (!ready || exiting) return;
    timerRef.current = setTimeout(advanceOrEnd, DURATION_PER_VIDEO);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentVideo, ready, exiting, advanceOrEnd]);

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
            preload="auto"
            muted
            playsInline
            loop
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

      {/* Loading spinner while videos buffer */}
      {!ready && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-display text-4xl gold-text-gradient tracking-[0.35em] uppercase drop-shadow-lg mb-4">
            Savoy
          </p>
          <div className="mt-4 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Cinematic overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--background) / 0.4) 0%, hsl(var(--background) / 0.1) 30%, hsl(var(--background) / 0.1) 70%, hsl(var(--background) / 0.6) 100%)',
        }}
      />

      {/* Progress bar */}
      {ready && (
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
      )}

      {/* Skip text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 0.6 : 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground text-[10px] tracking-[0.3em] uppercase font-body z-20"
      >
        Toca para entrar
      </motion.p>

      {/* Brand overlay — subtle during videos */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: ready ? 0.7 : 0, y: ready ? 0 : 30 }}
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