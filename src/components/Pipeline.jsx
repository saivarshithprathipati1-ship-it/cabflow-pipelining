import { Fragment, useMemo } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PipelineStage from './PipelineStage.jsx';
import { STAGES } from '../simulation/pipeline.js';
import { useSimulation } from '../simulation/SimulationContext.jsx';
import Term from './Term.jsx';

/** One sentence that says, in plain words, what the pipeline is doing right now. */
function describe(state, active) {
  if (state.cycle === 0) return 'Waiting for the first clock cycle. Add requests and press Start.';
  if (state.status === 'completed') return 'Pipeline drained. Every request has been confirmed.';
  if (active === 0) return 'Pipeline empty.';
  if (active === 1) return 'One request in flight.';
  return `${active} different requests are being processed at the same time, each in its own stage.`;
}

export default function Pipeline({ compact = false }) {
  const { state, cycleMs, moveDuration } = useSimulation();
  const mode = state.status === 'running' ? 'running' : state.manualStep ? 'full' : 'paused';
  const cycleKey = `${state.runId}-${state.cycle}-${cycleMs}`;
  const active = state.pipeline.filter(Boolean).length;
  const occupants = useMemo(
    () => state.pipeline.map((id) => (id ? state.requests[id] : null)),
    [state.pipeline, state.requests],
  );

  return (
    <section aria-labelledby={compact ? undefined : 'pipeline-heading'} className={compact ? '' : 'panel p-4 sm:p-6'}>
      {!compact && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="pipeline-heading" className="font-display text-xl font-semibold sm:text-2xl">
              Five-stage booking <Term name="pipelining">pipeline</Term>
            </h2>
            <p className="mt-1 text-sm text-slate-400" aria-live="polite">
              {describe(state, active)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">
              <Term name="cycle" align="right">Clock cycle</Term>
            </div>
            <div className="font-display text-4xl font-bold leading-none text-pipe tabular">
              {String(state.cycle).padStart(2, '0')}
            </div>
          </div>
        </div>
      )}

      <LayoutGroup id="booking-pipeline">
        <motion.div layoutScroll className="scroll-thin md:overflow-x-auto md:pb-2">
          <div role="list" className="flex flex-col gap-2 md:min-w-[860px] md:flex-row md:items-stretch md:gap-0">
            {STAGES.map((stage, i) => (
              <Fragment key={stage.key}>
                <div role="listitem" className="md:min-w-0 md:flex-1">
                  <PipelineStage
                    stage={stage}
                    index={i}
                    request={occupants[i]}
                    mode={mode}
                    cycleKey={cycleKey}
                    cycleMs={cycleMs}
                    moveDuration={moveDuration}
                    compact={compact}
                  />
                </div>
                {i < STAGES.length - 1 && (
                  <div aria-hidden="true" className="flex items-center justify-center md:w-7 md:shrink-0">
                    <ChevronRight
                      size={20}
                      className={`hidden md:block ${occupants[i] ? 'text-pipe' : 'text-slate-600'}`}
                    />
                    <ChevronDown size={18} className={`md:hidden ${occupants[i] ? 'text-pipe' : 'text-slate-600'}`} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </motion.div>
      </LayoutGroup>

      {/* The road under the stages: dashes move only while the clock runs. */}
      <div className="mt-3 hidden md:block" aria-hidden="true">
        <div className={`road-dash h-0.5 rounded ${state.status === 'running' ? 'is-moving' : ''}`} />
      </div>
    </section>
  );
}
