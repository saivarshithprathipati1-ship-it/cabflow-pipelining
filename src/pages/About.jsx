import { Play } from 'lucide-react';
import { STAGES } from '../simulation/pipeline.js';
import { STAGE_ICONS } from '../components/PipelineStage.jsx';
import { useNavigate } from '../hooks/useHashRoute.js';

const SECTIONS = [
  ['problem', 'Problem statement'],
  ['scenario', 'Real-world scenario'],
  ['concept', 'COA concept'],
  ['understanding', 'Understanding pipelining'],
  ['architecture', 'Pipeline architecture'],
  ['stages', 'Five processing stages'],
  ['comparison', 'Sequential vs pipelined'],
  ['benefits', 'Benefits of pipelining'],
  ['method', 'Simulation methodology'],
  ['metrics', 'Performance metrics'],
  ['objective', 'Project objective'],
];

/** Small space-time diagram used for the sequential vs pipelined comparison. */
function MiniDiagram({ mode, requests = 3 }) {
  const k = STAGES.length;
  const total = mode === 'sequential' ? requests * k : k + requests - 1;
  const startOf = (r) => (mode === 'sequential' ? r * k : r);
  const cols = Array.from({ length: total }, (_, i) => i);

  return (
    <div className="scroll-thin overflow-x-auto">
      <div
        role="table"
        aria-label={`${mode} processing of ${requests} requests: ${total} cycles`}
        className="grid min-w-max gap-1"
        style={{ gridTemplateColumns: `4.5rem repeat(${total}, 1.75rem)` }}
      >
        <div role="columnheader" />
        {cols.map((c) => (
          <div key={c} role="columnheader" className="text-center font-display text-[10px] text-slate-500 tabular">
            {c + 1}
          </div>
        ))}
        {Array.from({ length: requests }, (_, r) => (
          <div role="row" key={r} className="contents">
            <div role="rowheader" className="flex items-center font-display text-xs font-semibold tabular">
              REQ-{String(r + 1).padStart(3, '0')}
            </div>
            {cols.map((c) => {
              const s = c - startOf(r);
              const stage = s >= 0 && s < k ? STAGES[s] : null;
              return (
                <div
                  key={c}
                  role="cell"
                  className="grid h-7 place-items-center rounded font-display text-[10px] font-bold text-ink"
                  style={{ background: stage ? stage.color : 'rgba(51,65,85,0.25)' }}
                >
                  {stage ? stage.key : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({ id, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28">
      <h2 id={`${id}-h`} className="font-display text-2xl font-semibold">
        {title}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

const QA = [
  [
    'What is pipelining?',
    'Pipelining splits a task into a fixed sequence of stages and lets different tasks occupy different stages at the same time, like an assembly line. A CPU uses it to overlap fetch, decode, execute, memory access and write-back of consecutive instructions.',
  ],
  [
    'Why is it useful?',
    'Without it, each stage sits idle while the other stages work on the current task. With it, every stage is busy every cycle once the pipeline is full, so far more work finishes in the same time.',
  ],
  [
    'How does cab booking represent pipelining?',
    'Every booking needs the same five operations in the same order. Treating each operation as a stage means S1 can validate passenger 6 while S3 searches a driver for passenger 4 and S5 confirms passenger 2.',
  ],
  [
    'What is a pipeline stage?',
    'One step of the workflow with its own dedicated worker. It holds at most one request per cycle and hands its result to the next stage at the end of the cycle.',
  ],
  [
    'What is a clock cycle?',
    'The fixed time slot in which every stage does its work. At the end of each cycle, all requests move forward together by exactly one stage.',
  ],
  [
    'What is throughput?',
    'How many requests finish per cycle: completed requests divided by elapsed cycles. A full 5-stage pipeline finishes one booking every cycle instead of one every five.',
  ],
  [
    'What is latency?',
    'How long one request takes from entering S1 to finishing S5. Pipelining does not shorten this: it is still 5 cycles. It improves throughput, not the latency of a single request.',
  ],
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-sm text-slate-400">Computer Organization and Architecture · Case study</p>
        <h1 className="mt-2 font-display text-5xl font-bold">
          CAB<span className="text-cab">FLOW</span>
        </h1>
        <p className="mt-2 font-display text-xl text-slate-200">Pipelined Online Cab Booking Simulator</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1 border-l border-white/10 text-sm">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }} className="-ml-px block border-l border-transparent py-1 pl-4 text-slate-400 hover:border-pipe hover:text-paper">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-12">
          <Block id="problem" title="Problem statement">
            <p>
              Online cab platforms receive bursts of booking requests at peak hours, after events, at stations and at
              airports. If the system finishes every operation for one request before starting the next, each new
              passenger waits for everyone ahead of them to be fully processed, and the response time grows with the
              length of the queue.
            </p>
          </Block>

          <Block id="scenario" title="Real-world scenario">
            <p>
              Imagine ten students leaving SRM University at the same moment, each booking a cab to a different part
              of Chennai. Each booking must be validated, its locations resolved, a driver found, a fare computed and
              the booking confirmed. These five operations always happen in the same order and use different parts of
              the system.
            </p>
          </Block>

          <Block id="concept" title="COA concept: pipelining">
            <p>
              Instruction pipelining in a processor divides instruction execution into stages so that several
              instructions are in progress at once. CABFLOW applies the same organisation to booking requests: the
              workflow becomes a linear five-stage pipeline driven by a single clock.
            </p>
          </Block>

          <Block id="understanding" title="Understanding pipelining">
            <dl className="space-y-4">
              {QA.map(([q, a]) => (
                <div key={q} className="rounded-xl border border-white/10 bg-panel/50 p-4">
                  <dt className="font-display font-semibold text-paper">{q}</dt>
                  <dd className="mt-1.5 text-slate-300">{a}</dd>
                </div>
              ))}
            </dl>
          </Block>

          <Block id="architecture" title="Pipeline architecture">
            <p>
              The pipeline is an array of five registers, one per stage. On every clock edge the engine performs one
              atomic update:
            </p>
            <ol className="list-decimal space-y-1 pl-6 text-slate-300">
              <li>The request in S5 is confirmed and leaves the pipeline.</li>
              <li>S4 → S5, S3 → S4, S2 → S3 and S1 → S2 move together.</li>
              <li>The oldest waiting request enters S1.</li>
            </ol>
            <p>
              Because the whole shift happens in one step, no stage can ever hold two requests and no request can skip
              a stage. There are no hazards in this model, so the pipeline never stalls.
            </p>
          </Block>

          <Block id="stages" title="Five processing stages">
            <ul className="grid gap-3 sm:grid-cols-2">
              {STAGES.map((s, i) => {
                const Icon = STAGE_ICONS[i];
                return (
                  <li key={s.key} className="flex gap-3 rounded-xl border border-white/10 bg-panel/50 p-4">
                    <Icon size={20} style={{ color: s.color }} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-display font-semibold">
                        <span style={{ color: s.color }}>{s.key}</span> {s.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">{s.task}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Block>

          <Block id="comparison" title="Sequential vs pipelined processing">
            <p>Three requests, five stages. Each square is one clock cycle.</p>
            <div className="space-y-6 rounded-2xl border border-white/10 bg-panel/50 p-4 sm:p-5">
              <div>
                <p className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-red-200">Sequential: one request at a time</span>
                  <span className="text-slate-400 tabular">3 × 5 = 15 cycles</span>
                </p>
                <MiniDiagram mode="sequential" />
              </div>
              <div>
                <p className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-green-200">Pipelined: stages overlap</span>
                  <span className="text-slate-400 tabular">5 + 3 − 1 = 7 cycles</span>
                </p>
                <MiniDiagram mode="pipelined" />
              </div>
            </div>
            <p>
              Each request still needs 5 cycles in both cases. Pipelining wins by overlapping them: after the first
              request finishes, a new one finishes every single cycle. For n requests on k stages the speedup is
              n·k ÷ (k + n − 1), which approaches k as n grows.
            </p>
          </Block>

          <Block id="benefits" title="Benefits of pipelining">
            <ul className="list-disc space-y-1 pl-6">
              <li>Higher throughput: up to one confirmed booking per cycle instead of one per five cycles.</li>
              <li>Better resource use: every stage works on something every cycle once the pipeline is full.</li>
              <li>Shorter waiting for passengers in a burst, because the queue drains five times faster.</li>
              <li>Simple scaling: a slow stage can be identified and improved on its own.</li>
            </ul>
          </Block>

          <Block id="method" title="Simulation methodology">
            <p>
              The simulator is a client-side discrete-time model written in React. A single timer generates clock
              cycles at the selected speed (2000, 1000, 500 or 250 ms). Each tick calls a pure reducer that performs
              the shift described above, so the screen always reflects the true engine state. Booking data uses mock
              Chennai locations; fares are base fare plus a per-kilometre rate for the cab type.
            </p>
            <p>
              Requests are generated by the form or in bursts of 5 and 10. Demo mode resets the engine, queues ten
              requests and starts the clock immediately.
            </p>
          </Block>

          <Block id="metrics" title="Performance metrics">
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ['Clock cycle', 'Number of simulation cycles elapsed.'],
                ['Latency', 'Cycles from entering S1 to completing S5: finish − enter + 1.'],
                ['Throughput', 'Completed requests ÷ elapsed cycles.'],
                ['Utilization', 'Active stages ÷ 5, per cycle and averaged over the run.'],
                ['Completed requests', 'Requests that have finished S5.'],
                ['Active requests', 'Requests currently inside the five stages.'],
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl border border-white/10 bg-panel/50 p-4">
                  <dt className="font-display font-semibold">{t}</dt>
                  <dd className="mt-1 text-sm text-slate-400">{d}</dd>
                </div>
              ))}
            </dl>
          </Block>

          <Block id="objective" title="Project objective">
            <p>
              To show, through a familiar everyday system, how dividing work into overlapping stages raises throughput
              without changing the time any single job takes, and to let anyone see multiple requests in different
              pipeline stages at the same moment.
            </p>
            <button type="button" className="btn-cab mt-2" onClick={() => navigate('simulator')}>
              <Play size={16} aria-hidden="true" /> Try it in the simulator
            </button>
          </Block>
        </div>
      </div>
    </div>
  );
}
