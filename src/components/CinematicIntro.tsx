import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CinematicIntro.css';

const SPEED = 1;
const D_WORD_IN = 0.4 / SPEED;
const HOLD_WORD = 0.28 / SPEED;
const D_SUBTITLE_IN = 0.5 / SPEED;
const HOLD_AFTER_SUBTITLE = 0.35 / SPEED;
const DURATION_FADEOUT = 0.9 / SPEED;

const DELAY_1 = 0.2 / SPEED; // "no"
const DELAY_2 = DELAY_1 + D_WORD_IN + HOLD_WORD; // "pienses"
const DELAY_3 = DELAY_2 + D_WORD_IN + HOLD_WORD; // "solo"
const DELAY_4 = DELAY_3 + D_WORD_IN + HOLD_WORD; // "elige"
const DELAY_5 = DELAY_4 + D_WORD_IN + HOLD_WORD; // "Tu próxima..."
const DELAY_FADEOUT = DELAY_5 + D_SUBTITLE_IN + HOLD_AFTER_SUBTITLE;
const TOTAL_INTRO = DELAY_FADEOUT + DURATION_FADEOUT;

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState<'playing' | 'exiting' | 'done'>('playing');

  useEffect(() => {
    const tExit = setTimeout(() => {
      setPhase('exiting');
    }, DELAY_FADEOUT * 1000);

    const tDone = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, TOTAL_INTRO * 1000);

    return () => {
      clearTimeout(tExit);
      clearTimeout(tDone);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <motion.div
      className="cinematic-intro"
      initial={{ opacity: 1 }}
      animate={{
        opacity: phase === 'exiting' ? 0 : 1,
      }}
      transition={{
        duration: DURATION_FADEOUT,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="cinematic-intro__content">
        <AnimatePresence>
          <motion.p
            className="cinematic-intro__line cinematic-intro__line--word"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D_WORD_IN, delay: DELAY_1, ease: [0.22, 1, 0.36, 1] }}
          >
            no
          </motion.p>
          <motion.p
            className="cinematic-intro__line cinematic-intro__line--word"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D_WORD_IN, delay: DELAY_2, ease: [0.22, 1, 0.36, 1] }}
          >
            pienses
          </motion.p>
          <motion.p
            className="cinematic-intro__line cinematic-intro__line--word"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D_WORD_IN, delay: DELAY_3, ease: [0.22, 1, 0.36, 1] }}
          >
            solo
          </motion.p>
          <motion.p
            className="cinematic-intro__line cinematic-intro__line--word"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D_WORD_IN, delay: DELAY_4, ease: [0.22, 1, 0.36, 1] }}
          >
            elige
          </motion.p>
          <motion.p
            className="cinematic-intro__line cinematic-intro__line--subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D_SUBTITLE_IN, delay: DELAY_5, ease: [0.22, 1, 0.36, 1] }}
          >
            Tu próxima película en 60 segundos.
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
