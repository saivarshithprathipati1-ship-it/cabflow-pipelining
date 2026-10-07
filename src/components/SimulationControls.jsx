import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Info, Pause, Play, RotateCcw, ShieldAlert, Sparkles, StepForward, X } from 'lucide-react';
import { SPEEDS } from '../simulation/pipeline.js';
import { useSimulation } from '../simulation/SimulationContext.jsx';
import Term from './Term.jsx';

const TONES = {
  info: { icon: Info, cls: 'border-pipe/40 bg-pipe/10 text-cyan-100' },
  success: { icon: BadgeCheck, cls: 'border-ok/40 bg-ok/10 text-green-100' },
  warning: { icon: ShieldAlert, cls: 'border-warn/40 bg-warn/10 text-amber-100' },
};

export function Notice() {
  const { state, actions } = useSimulation();
  const notice = state.notice;

  // Informational messages fade on their own; warnings stay until dismissed.
  useEffect(() => {
    if (!notice || notice.tone === 'warning') return undefined;
    const t = window.setTimeout(actions.dismissNotice, 7000);
    return () => window.clearTimeout(t);
  }, [notice, actions]);

  return (
    <div aria-live="polite" role="status">
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${TONES[notice.tone].cls}`}
          >
            {(() => {
              const Icon = TONES[notice.tone].icon;
              return <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />;
            })()}
            <span className="flex-1">{notice.text}</span>
            <button type="button" onClick={actions.dismissNotice} aria-label="Dismiss message" className="rounded p-0.5 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SpeedSelector() {
  const { state, actions } = useSimulation();
  return (
    <div role="radiogroup" aria-label="Simulation speed" className="inline-flex rounded-xl bg-ink/70 p-1 ring-1 ring-inset ring-slate-700">
      {SPEEDS.map((s) => {
        const on = state.speed === s.value;
        return (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={on}
            title={`${s.ms} ms per cycle`}
            onClick={() => actions.setSpeed(s.value)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold tabular transition-colors sm:px-3 ${
              on ? 'bg-pipe/20 text-pipe' : 'text-slate-400 hover:text-paper'
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/** Start / pause / step / reset, speed, demo mode and the big clock readout. */
export default function SimulationControls({ onDemo, showClock = true }) {
  const { state, actions, cycleMs } = useSimulation();
  const running = state.status === 'running';
  const hasWork = state.queue.length > 0 || state.pipeline.some(Boolean);

  const startLabel = running
    ? 'Pause'
    : state.status === 'paused'
      ? 'Resume'
      : 'Start';

  const runDemo = () => {
    actions.runDemo();
    onDemo?.();
  };

  return (
    <section aria-label="Simulation controls" className="panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        {showClock && (
          <div className="mr-2 flex items-center gap-3 border-r border-white/10 pr-4">
            <div>
              <div className="text-xs text-slate-400">
                <Term name="cycle" align="left">Pipeline clock</Term>
              </div>
              <div className="font-display text-3xl font-bold leading-none text-pipe tabular" aria-live="off">
                C{String(state.cycle).padStart(2, '0')}
              </div>
            </div>
            <span className="text-[11px] leading-tight text-slate-500 tabular">
              {cycleMs} ms
              <br />
              per cycle
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={running ? 'btn-pipe' : 'btn-cab'}
            onClick={running ? actions.pause : actions.start}
            aria-label={`${startLabel} simulation`}
          >
            {running ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {startLabel}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={actions.step}
            disabled={running || !hasWork}
            title="Advance exactly one clock cycle"
          >
            <StepForward size={16} aria-hidden="true" /> Step
          </button>
          <button type="button" className="btn-danger" onClick={actions.reset} disabled={state.nextId === 1}>
            <RotateCcw size={16} aria-hidden="true" /> Reset
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <SpeedSelector />
          <button type="button" className="btn-pipe" onClick={runDemo}>
            <Sparkles size={16} aria-hidden="true" /> Demo mode
          </button>
        </div>
      </div>
      <Notice />
    </section>
  );
}
