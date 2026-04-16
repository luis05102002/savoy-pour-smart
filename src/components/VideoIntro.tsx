import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const videos = ['/videos/video1.mp4', '/videos/video2.mp4', '/videos/video3.mp4'];

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [nextVideo, setNextVideo] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Force autoplay without controls
  const handleVideoRef = useCallback((el: HTMLVideoElement | null, idx: number) => {
    videoRefs.current[idx] = el;
    if (el) {
      el.removeAttribute('controls');
      el.play().catch(() => {});
    }
  }, []);

  const advanceOrEnd = useCallback(() => {
    if (currentVideo < videos.length - 1) {
      const next = currentVideo + 1;
      setNextVideo(next);
      // Start next video playing before transition
      const nextEl = videoRefs.current[next];
      if (nextEl) {
        nextEl.currentTime = 0;
        nextEl.play().catch(() => {});
      }
      // After crossfade, make next the current
      setTimeout(() => {
        setCurrentVideo(next);
        setNextVideo(null);
      }, 1000);
    } else {
      onComplete();
    }
  }, [currentVideo, onComplete]);

  useEffect(() => {
    timerRef.current = setTimeout(advanceOrEnd, 4000);
    return () => clearTimeout(timerRef.current);
  }, [currentVideo, advanceOrEnd]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background overflow-hidden cursor-pointer"
      onClick={onComplete}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* All videos stacked, crossfade via opacity */}
      {videos.map((src, i) => (
        <video
          key={i}
          ref={(el) => handleVideoRef(el, i)}
          src={src}
          autoPlay
          muted
          playsInline
          loop
          controls={false}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: i === currentVideo ? 1 : i === nextVideo ? 1 : 0,
            zIndex: i === nextVideo ? 2 : i === currentVideo ? 1 : 0,
          }}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/80 z-10" />

      {/* Progress dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {videos.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentVideo
                ? 'w-8 bg-primary'
                : i < currentVideo
                ? 'w-1.5 bg-primary/60'
                : 'w-1.5 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Skip */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onComplete}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground/60 text-xs tracking-widest uppercase font-body hover:text-foreground transition-colors z-20"
      >
        Toca para entrar
      </motion.button>

      {/* Brand overlay */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p className="font-display text-3xl gold-text-gradient tracking-[0.3em] uppercase">
          Savoy
        </p>
        <p className="text-muted-foreground/70 text-xs tracking-[0.4em] mt-1 font-body uppercase">
          by PG
        </p>
      </motion.div>
    </motion.div>
  );
};

export default VideoIntro;
