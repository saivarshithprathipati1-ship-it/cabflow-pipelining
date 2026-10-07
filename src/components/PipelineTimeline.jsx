import { memo, useMemo } from 'react';
import { STAGES, STAGE_COUNT, stageAtCycle } from '../simulation/pipeline.js';
import { useSimulation } from '../simulation/SimulationContext.jsx';
import Term from './Term.jsx';

/**
 * CPU-style space-time diagram.
 * Rows are requests, columns are clock cycles, and each cell names the stage
 * the request occupied in that cycle. Reading down the highlighted column
 * shows up to five requests in five different stages at the same moment.
 *
 * Only a sliding window of cycles is rendered, so the diagram stays fast
 * no matter how long the simulation runs.
 */
function PipelineTimeline({ windowSize = 16, maxRows = 14, title = 'Pipeline timeline' }) {
  const { state, settings } = useSimulation();
  const { cycle, requests, completed, pipeline } = state;

  const { columns, rows } = useMemo(() => {
    // Requests that have entered the pipeline, oldest first.
    const inFlight = pipeline.filter(Boolean).reverse();
    const entered = [...completed].reverse().concat(inFlight).map((id) => requests[id]);

    const showUpcoming = settings.showUpcoming;
    const lastNeeded = Math.max(
      cycle,
      showUpcoming && inFlight.length ? requests[inFlight[0]].enterCycle + STAGE_COUNT - 1 : cycle,
    );
    const end = Math.max(lastNeeded, Math.min(windowSize, lastNeeded + 4), STAGE_COUNT + 3);
    const start = Math.max(1, end - windowSize + 1);
    const cols = [];
    for (let c = start; c <= end; c += 1) cols.push(c);

    const visible = entered.filter((r) => r.enterCycle + STAGE_COUNT - 1 >= start && r.enterCycle <= end);
    return { columns: cols, rows: visible.slice(-maxRows) };
  }, [cycle, requests, completed, pipeline, settings.showUpcoming, windowSize, maxRows]);

  const gridTemplate = `minmax(5.5rem, 6.5rem) repeat(${columns.length}, minmax(2.25rem, 1fr))`;

  return (
    <section aria-labelledby="timeline-heading" className="panel p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="timeline-heading" className="font-display text-xl font-semibold">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Each row is a booking request, each column is a <Term name="cycle">clock cycle</Term>. Read down the
            highlighted column: several requests sit in different stages in the same cycle. That overlap is pipelining.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs" aria-label="Stage colours">
          {STAGES.map((s) => (
            <li key={s.key} className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
              {s.key} {s.short}
            </li>
          ))}
        </ul>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 px-4 py-10 text-center">
          <p className="text-sm text-slate-300">The timeline fills in as soon as the first request enters S1.</p>
          <p className="mt-1 text-xs text-slate-500">Press Start or Demo mode to see the staircase pattern form.</p>
        </div>
      ) : (
        <div className="scroll-thin overflow-x-auto pb-1">
          <div role="table" aria-label="Request stage per clock cycle" className="min-w-max">
            <div role="row" className="grid gap-1" style={{ gridTemplateColumns: gridTemplate }}>
              <div role="columnheader" className="px-1 py-1 text-xs text-slate-500">
                Request
              </div>
              {columns.map((c) => (
                <div
                  key={c}
                  role="columnheader"
                  aria-current={c === cycle ? 'time' : undefined}
                  className={`rounded-md py-1 text-center font-display text-xs font-semibold tabular ${
                    c === cycle ? 'bg-pipe/20 text-pipe' : 'text-slate-500'
                  }`}
                >
                  C{c}
                </div>
              ))}
            </div>

            {rows.map((r) => (
              <div key={r.id} role="row" className="mt-1 grid gap-1" style={{ gridTemplateColumns: gridTemplate }}>
                <div role="rowheader" className="flex items-center px-1 font-display text-xs font-semibold tabular text-slate-200">
                  {r.id}
                </div>
                {columns.map((c) => {
                  const k = stageAtCycle(r, c);
                  const isNow = c === cycle;
                  if (k < 0) {
                    return (
                      <div
                        key={c}
                        role="cell"
                        className={`h-8 rounded-md ${isNow ? 'bg-pipe/[0.06]' : ''}`}
                      />
                    );
                  }
                  const stage = STAGES[k];
                  const future = c > cycle;
                  if (future && !settings.showUpcoming) {
                    return <div key={c} role="cell" className="h-8" />;
                  }
                  return (
                    <div
                      key={c}
                      role="cell"
                      aria-label={`${r.id} in ${stage.key} during cycle ${c}${future ? ' (upcoming)' : ''}`}
                      className={`grid h-8 place-items-center rounded-md font-display text-[11px] font-bold tabular ${
                        future ? 'border border-dashed' : 'cell-pop text-ink'
                      } ${isNow ? 'ring-2 ring-paper/80 ring-offset-1 ring-offset-ink' : ''}`}
                      style={
                        future
                          ? { borderColor: `${stage.color}55`, color: `${stage.color}99` }
                          : { background: stage.color }
                      }
                    >
                      {stage.key}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(PipelineTimeline);
