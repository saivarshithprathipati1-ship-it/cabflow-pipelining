import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity as BarIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import MetricsCards from '../components/MetricsCards.jsx';
import SimulationControls from '../components/SimulationControls.jsx';
import Term from '../components/Term.jsx';
import { useSimulation } from '../simulation/SimulationContext.jsx';
import { latencyRows } from '../simulation/metrics.js';

const WINDOW = 60; // cycles kept on screen so long runs stay fast

const axis = { stroke: '#475569', fontSize: 11, tickLine: false };
const grid = { stroke: 'rgba(148,163,184,0.12)', strokeDasharray: '3 3' };
const tooltipStyle = {
  contentStyle: {
    background: '#0d1426',
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: 10,
    fontSize: 12,
    color: '#F8FAFC',
  },
  labelStyle: { color: '#94a3b8' },
  cursor: { fill: 'rgba(148,163,184,0.08)', stroke: 'rgba(148,163,184,0.3)' },
};

function ChartPanel({ title, term, caption, children, className = '' }) {
  return (
    <section className={`panel p-4 sm:p-5 ${className}`}>
      <h2 className="panel-title">{term ? <Term name={term} align="left">{title}</Term> : title}</h2>
      <p className="mb-4 mt-1 text-xs text-slate-400">{caption}</p>
      <div className="h-56 sm:h-64">{children}</div>
    </section>
  );
}

export default function Analytics() {
  const { state, metrics } = useSimulation();

  const history = useMemo(
    () =>
      state.history.slice(-WINDOW).map((h) => ({
        ...h,
        label: `C${h.cycle}`,
        throughput: Number(h.throughput.toFixed(3)),
      })),
    [state.history],
  );
  const latency = useMemo(() => latencyRows(state, 30), [state]);

  const empty = history.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader title="Analytics">
        Every chart is drawn from the simulation history: one data point per finished clock cycle and one bar per
        confirmed booking.
      </PageHeader>

      <div className="space-y-5">
        <SimulationControls />
        <MetricsCards />

        {empty ? (
          <div className="panel flex flex-col items-center px-6 py-16 text-center">
            <BarIcon size={28} className="text-slate-500" aria-hidden="true" />
            <p className="mt-3 font-display text-lg font-semibold">No cycles recorded yet</p>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              Charts appear after the first clock cycle finishes. Press Demo mode above to generate 10 requests and
              watch the data arrive.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartPanel
              title="Requests completed per clock cycle"
              caption="Bars: bookings confirmed in that cycle. Line: running total. Nothing completes during the 4-cycle fill."
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={history} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="label" {...axis} minTickGap={12} />
                  <YAxis yAxisId="l" allowDecimals={false} domain={[0, 1]} {...axis} />
                  <YAxis yAxisId="r" orientation="right" allowDecimals={false} {...axis} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="l" dataKey="completedInCycle" name="Completed this cycle" fill="#22C55E" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Line yAxisId="r" type="monotone" dataKey="completedTotal" name="Total completed" stroke="#FFC107" strokeWidth={2} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel
              title="Pipeline utilization"
              term="utilization"
              caption={`Busy stages ÷ 5 in each cycle. Ramps up while filling, holds at 100% when full, ramps down while draining. Average: ${Math.round(metrics.avgUtilization * 100)}%.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="utilFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="label" {...axis} minTickGap={12} />
                  <YAxis domain={[0, 100]} unit="%" {...axis} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, 'Utilization']} />
                  <Area type="stepAfter" dataKey="utilization" stroke="#00D4FF" strokeWidth={2} fill="url(#utilFill)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel
              title="Throughput"
              term="throughput"
              caption="Completed ÷ elapsed cycles, after each cycle. It climbs towards the ideal of 1 booking per cycle as the pipeline stays full."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="label" {...axis} minTickGap={12} />
                  <YAxis domain={[0, 1]} {...axis} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`${v} req/cycle`, 'Throughput']} />
                  <ReferenceLine y={1} stroke="#22C55E" strokeDasharray="4 4" label={{ value: 'ideal', fill: '#22C55E', fontSize: 11, position: 'insideTopRight' }} />
                  <Line type="monotone" dataKey="throughput" stroke="#F59E0B" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel
              title="Active and waiting requests"
              caption="Active: requests inside the 5 stages. Waiting: requests still in the queue at the end of that cycle."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="label" {...axis} minTickGap={12} />
                  <YAxis allowDecimals={false} {...axis} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="stepAfter" dataKey="active" name="Active in pipeline" stroke="#B57BFF" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="stepAfter" dataKey="waiting" name="Waiting in queue" stroke="#FFC107" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="completedTotal" name="Completed" stroke="#22C55E" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel
              className="lg:col-span-2"
              title="Latency per confirmed booking"
              term="latency"
              caption={
                latency.length
                  ? `Purple: cycles inside the pipeline (always 5, the number of stages). Yellow: cycles spent waiting in the queue first. Average latency ${metrics.avgLatency.toFixed(1)} cycles; average total response ${metrics.avgResponse.toFixed(1)} cycles.`
                  : 'Bars appear when the first booking is confirmed at the end of cycle 5.'
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latency} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="id" {...axis} minTickGap={8} />
                  <YAxis allowDecimals={false} {...axis} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="latency" stackId="t" name="Latency (S1→S5)" fill="#B57BFF" isAnimationActive={false} />
                  <Bar dataKey="wait" stackId="t" name="Queue wait" fill="#FFC107" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  {latency.length > 0 && (
                    <ReferenceLine y={metrics.avgLatency} stroke="#F8FAFC" strokeDasharray="4 4" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>
        )}
      </div>
    </div>
  );
}
