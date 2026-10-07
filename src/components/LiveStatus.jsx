import { STAGES } from '../simulation/pipeline.js';
import { useSimulation } from '../simulation/SimulationContext.jsx';
import { fmt } from '../simulation/metrics.js';
import Term from './Term.jsx';

const STATUS_TEXT = {
  idle: 'Not started',
  running: 'Running',
  paused: 'Paused',
  completed: 'Drained',
};

/** Compact table-like readout of what every stage holds in the current cycle. */
export default function LiveStatus() {
  const { state, metrics } = useSimulation();
  const running = state.status === 'running';

  return (
    <section aria-labelledby="live-heading" className="panel p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 id="live-heading" className="panel-title">Live pipeline status</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
          <span className={`live-dot ${running ? 'is-on bg-ok' : state.status === 'paused' ? 'bg-warn' : 'bg-slate-500'}`} />
          {STATUS_TEXT[state.status]}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between rounded-xl bg-ink/60 px-4 py-3">
        <div>
          <div className="text-xs text-slate-400">Clock cycle</div>
          <div className="font-display text-4xl font-bold leading-none text-pipe tabular">
            {String(state.cycle).padStart(2, '0')}
          </div>
        </div>
        <div className="text-right text-xs text-slate-400 tabular">
          <div>{metrics.waitingCount} waiting</div>
          <div>{metrics.completedCount} confirmed</div>
        </div>
      </div>

      <ul className="mt-3 divide-y divide-white/5" aria-label="Stage occupancy this cycle">
        {STAGES.map((stage, i) => {
          const id = state.pipeline[i];
          return (
            <li key={stage.key} className="flex items-center gap-3 py-2">
              <span
                className="w-7 font-display text-sm font-bold tabular"
                style={{ color: id ? stage.color : '#475569' }}
              >
                {stage.key}
              </span>
              <span className="flex-1 truncate text-sm text-slate-400">{stage.name}</span>
              <span className={`font-display text-sm font-semibold tabular ${id ? 'text-paper' : 'text-slate-600'}`}>
                {id ?? '—'}
              </span>
              <span
                className={`w-16 rounded-md px-1.5 py-0.5 text-center text-[10px] font-bold ${
                  id
                    ? running
                      ? 'bg-ok/15 text-green-300'
                      : 'bg-warn/15 text-amber-300'
                    : 'bg-slate-700/40 text-slate-500'
                }`}
              >
                {id ? (running ? 'Active' : 'Held') : 'Idle'}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-slate-400">
            <Term name="utilization" align="left">Utilization</Term> this cycle
          </span>
          <span className="font-semibold tabular">{fmt.pct(metrics.utilization)}</span>
        </div>
        <div className="flex gap-1" aria-hidden="true">
          {STAGES.map((stage, i) => (
            <div
              key={stage.key}
              className="h-2 flex-1 rounded-full transition-colors duration-300"
              style={{ background: state.pipeline[i] ? stage.color : 'rgba(71,85,105,0.4)' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
