import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CarTaxiFront } from 'lucide-react';
import { STAGES } from '../simulation/pipeline.js';
import { useSimulation } from '../simulation/SimulationContext.jsx';

const BEAT_MS = 1300;

/**
 * Hero animation: a five-gate road where a new cab enters every beat and
 * every cab already on the road advances one gate. It is the pipeline idea
 * itself, shown before any text explains it.
 */
export default function HeroLane() {
  const osReduced = useReducedMotion();
  const { settings } = useSimulation();
  const still = osReduced || settings.reduceMotion;
  const [beat, setBeat] = useState(5);

  useEffect(() => {
    if (still) return undefined;
    const id = window.setInterval(() => setBeat((b) => b + 1), BEAT_MS);
    return () => window.clearInterval(id);
  }, [still]);

  // Request n sits in stage (beat - n). Keep the five on the road.
  const cabs = [];
  for (let n = beat - 4; n <= beat; n += 1) cabs.push({ n, stage: beat - n });

  return (
    <div className="relative" aria-hidden="true">
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {STAGES.map((s, i) => {
          const lit = cabs.some((c) => c.stage === i);
          return (
            <div key={s.key} className="text-center">
              <div className="font-display text-xs font-bold sm:text-sm" style={{ color: s.color }}>
                {s.key}
              </div>
              <div className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-xs">{s.short}</div>
              <div
                className="mx-auto mt-2 h-1 w-10 rounded-full transition-opacity duration-500 sm:w-16"
                style={{ background: s.color, opacity: lit ? 1 : 0.25 }}
              />
            </div>
          );
        })}
      </div>

      <div className="relative mt-3 h-20 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141c33] to-[#0d1426] sm:h-24">
        {/* gate posts */}
        {STAGES.map((s, i) => (
          <div
            key={s.key}
            className="absolute inset-y-0 w-px bg-white/10"
            style={{ left: `${((i + 1) / 5) * 100}%` }}
          />
        ))}
        <div className={`road-dash absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 ${still ? '' : 'is-moving'}`} />
        <AnimatePresence initial={false}>
          {cabs.map(({ n, stage }) => (
            <motion.div
              key={n}
              className="absolute top-1/2 -translate-y-1/2"
              initial={{ left: '-12%', opacity: 0 }}
              animate={{ left: `${(stage / 5) * 100 + 1.5}%`, opacity: 1 }}
              exit={{ left: '104%', opacity: 0 }}
              transition={{ duration: still ? 0 : 0.7, ease: [0.3, 0.75, 0.25, 1] }}
              style={{ width: '17%' }}
            >
              <div
                className={`flex items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[10px] font-bold text-ink sm:gap-1.5 sm:text-xs ${
                  stage === 4 ? 'bg-ok' : 'bg-cab'
                }`}
              >
                <CarTaxiFront size={14} className="shrink-0" />
                <span className="font-display tabular">REQ-{String(n).padStart(3, '0')}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="mt-2 text-right font-display text-xs text-slate-500 tabular">clock cycle {beat}</p>
    </div>
  );
}
