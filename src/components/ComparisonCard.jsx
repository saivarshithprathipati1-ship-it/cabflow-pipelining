import { useSimulation } from '../simulation/SimulationContext.jsx';
import { theoreticalCycles } from '../simulation/metrics.js';
import Term from './Term.jsx';

/** Sequential vs pipelined cycle count for the requests created so far. */
export default function ComparisonCard() {
  const { metrics } = useSimulation();
  const n = Math.max(metrics.totalRequests, 1);
  const t = theoreticalCycles(n);
  const pipelinedPct = (t.pipelined / t.sequential) * 100;

  return (
    <section aria-labelledby="compare-heading" className="panel p-4 sm:p-5">
      <h2 id="compare-heading" className="panel-title">Sequential vs pipelined</h2>
      <p className="mt-1 text-xs text-slate-400">
        Cycles needed to finish {metrics.totalRequests ? `the ${n} requests created so far` : 'one request'}.
      </p>

      <dl className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <dt className="text-slate-300">Sequential · one request at a time</dt>
            <dd className="font-semibold tabular text-red-300">{t.sequential} cycles</dd>
          </div>
          <div className="h-3 rounded-full bg-bad/70" />
          <p className="mt-1 text-[11px] text-slate-500 tabular">n × k = {n} × 5</p>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <dt className="text-slate-300">Pipelined · stages overlap</dt>
            <dd className="font-semibold tabular text-green-300">{t.pipelined} cycles</dd>
          </div>
          <div className="h-3 rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-ok transition-[width] duration-500" style={{ width: `${pipelinedPct}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-slate-500 tabular">k + (n − 1) = 5 + {n - 1}</p>
        </div>
      </dl>

      <div className="mt-4 flex items-baseline justify-between rounded-xl bg-ink/60 px-4 py-3">
        <span className="text-sm text-slate-300">
          <Term name="speedup" align="left">Speedup</Term>
        </span>
        <span className="font-display text-2xl font-bold text-cab tabular">{t.speedup.toFixed(2)}×</span>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        As n grows the speedup approaches 5×, the number of stages.
      </p>
    </section>
  );
}
