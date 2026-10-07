import { forwardRef, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Calculator, CarTaxiFront, MapPin, Search, ShieldCheck } from 'lucide-react';
import { shortPlace } from '../data/bookings.js';

export const STAGE_ICONS = [ShieldCheck, MapPin, Search, Calculator, BadgeCheck];

/**
 * The request "cab" inside a stage. The shared layoutId lets Framer Motion
 * physically glide the same token from one stage card to the next.
 */
const RequestToken = forwardRef(function RequestToken({ request, stageIndex, isFinal, moveDuration, compact }, ref) {
  return (
    <motion.div
      ref={ref}
      layoutId={`token-${request.id}`}
      initial={stageIndex === 0 ? { opacity: 0, x: -28, scale: 0.92 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, y: -10, transition: { duration: 0.25 } }}
      transition={{ layout: { duration: moveDuration, ease: [0.25, 0.8, 0.25, 1] }, duration: 0.3 }}
      className={`relative z-10 w-full rounded-xl border px-3 py-2 ${
        isFinal ? 'border-ok/50 bg-ok/10 shadow-glow-ok' : 'border-cab/40 bg-cab/[0.08] shadow-glow-cab'
      }`}
    >
      <div className="flex items-center gap-2">
        <CarTaxiFront size={compact ? 15 : 17} className={isFinal ? 'text-ok' : 'text-cab'} aria-hidden="true" />
        <span className="font-display text-sm font-bold tracking-wide tabular">{request.id}</span>
      </div>
      {!compact && (
        <p className="mt-1 truncate text-xs text-slate-300" title={`${request.pickup} → ${request.destination}`}>
          {request.passenger} · {shortPlace(request.pickup)} → {shortPlace(request.destination)}
        </p>
      )}
    </motion.div>
  );
});

function StatusLabel({ occupied, isFinal, mode }) {
  if (!occupied) return <span className="text-slate-500">Empty</span>;
  if (mode === 'paused') return <span className="text-warn">Paused</span>;
  if (mode === 'full') return <span className={isFinal ? 'text-ok' : 'text-pipe'}>{isFinal ? 'Confirmed' : 'Stage done'}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 ${isFinal ? 'text-ok' : 'text-pipe'}`}>
      <span className={`live-dot is-on ${isFinal ? 'bg-ok' : 'bg-pipe'}`} />
      {isFinal ? 'Confirming' : 'Processing'}
    </span>
  );
}

/**
 * One pipeline stage card.
 *  mode: 'running' (progress animating) | 'paused' | 'full' (after a manual step)
 */
function PipelineStage({ stage, index, request, mode, cycleKey, cycleMs, moveDuration, compact }) {
  const Icon = STAGE_ICONS[index];
  const isFinal = index === 4;
  const occupied = Boolean(request);
  const token = request ? (
    <RequestToken
      key={request.id}
      request={request}
      stageIndex={index}
      isFinal={isFinal}
      moveDuration={moveDuration}
      compact={compact}
    />
  ) : null;
  const progressClass = mode === 'running' ? 'is-running' : mode === 'paused' ? 'is-paused' : 'is-full';

  const frame = !occupied
    ? 'border-slate-700/60 bg-panel/40'
    : isFinal
      ? 'border-ok/50 bg-ok/[0.06] shadow-glow-ok'
      : 'border-pipe/45 bg-pipe/[0.05] shadow-glow';

  return (
    <article
      aria-label={`${stage.key} ${stage.name}: ${request ? `${request.id}, ${mode === 'running' ? 'processing' : 'held'}` : 'empty'}`}
      className={`relative flex h-full flex-col rounded-2xl border p-3 backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-300 ${frame} ${compact ? 'min-h-[150px]' : 'min-h-[214px] sm:p-4'}`}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <span
            className="font-display text-xs font-bold tabular"
            style={{ color: occupied ? stage.color : '#64748b' }}
          >
            {stage.key}
          </span>
          <h3 className={`font-display font-semibold leading-tight ${compact ? 'text-sm' : 'text-[15px]'} ${occupied ? 'text-paper' : 'text-slate-400'}`}>
            {stage.name}
          </h3>
        </div>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{ background: occupied ? `${stage.color}22` : 'rgba(100,116,139,0.12)', color: occupied ? stage.color : '#64748b' }}
          aria-hidden="true"
        >
          <Icon size={16} />
        </span>
      </header>

      <div className="relative my-3 flex flex-1 items-center">
        {/* Empty slot outline stays put; the token glides over it. */}
        <div className="absolute inset-0 rounded-xl border border-dashed border-slate-700/70" aria-hidden="true" />
        {isFinal ? (
          // Only S5 tokens truly leave the pipeline, so only S5 plays an exit animation.
          <AnimatePresence mode="popLayout" initial={false}>
            {token}
          </AnimatePresence>
        ) : (
          token
        )}
        {!request && (
          <span className="relative w-full text-center text-xs text-slate-600">no request</span>
        )}
      </div>

      <footer>
        {occupied ? (
          <div key={cycleKey} className={`cycle-progress ${progressClass}`} style={{ '--cycle-ms': `${cycleMs}ms` }}>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/60">
              <div className="bar h-full rounded-full" style={{ background: isFinal ? '#22C55E' : stage.color }} />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs font-medium">
              <StatusLabel occupied={occupied} isFinal={isFinal} mode={mode} />
              <span className="pct tabular text-slate-400" aria-hidden="true" />
            </div>
          </div>
        ) : (
          <div>
            <div className="h-1.5 rounded-full bg-slate-800" />
            <div className="mt-1.5 text-xs font-medium">
              <StatusLabel occupied={false} />
            </div>
          </div>
        )}
        {!compact && <p className="mt-2 hidden text-[11px] leading-snug text-slate-500 lg:block">{stage.task}</p>}
      </footer>
    </article>
  );
}

export default memo(PipelineStage);
