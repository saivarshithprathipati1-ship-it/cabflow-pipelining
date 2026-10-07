import { Activity, BadgeCheck, Gauge, Inbox, Timer, TrendingUp } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber.jsx';
import Term from './Term.jsx';
import { useSimulation } from '../simulation/SimulationContext.jsx';

/** Six headline metrics, all derived from live simulation state. */
export default function MetricsCards() {
  const { metrics: m } = useSimulation();

  const cards = [
    {
      label: 'Total requests',
      value: m.totalRequests,
      icon: Inbox,
      color: '#FFC107',
      foot: `${m.waitingCount} waiting · ${m.activeCount} in pipeline`,
    },
    {
      label: 'Completed bookings',
      value: m.completedCount,
      icon: BadgeCheck,
      color: '#22C55E',
      foot: m.totalRequests ? `${Math.round((m.completedCount / m.totalRequests) * 100)}% of all requests` : 'None yet',
    },
    {
      label: 'Clock cycle',
      term: 'cycle',
      value: m.cycle,
      icon: Timer,
      color: '#00D4FF',
      format: (v) => String(Math.round(v)).padStart(2, '0'),
      foot: `${m.elapsedCycles} fully finished`,
    },
    {
      label: 'Pipeline utilization',
      term: 'utilization',
      value: m.utilization * 100,
      icon: Gauge,
      color: '#6C8CFF',
      format: (v) => `${Math.round(v)}%`,
      foot: `${m.activeCount} of 5 stages busy · avg ${Math.round(m.avgUtilization * 100)}%`,
    },
    {
      label: 'Average latency',
      term: 'latency',
      value: m.avgLatency,
      icon: Activity,
      color: '#B57BFF',
      format: (v) => (v ? v.toFixed(1) : '—'),
      unit: 'cycles',
      foot: m.completedCount ? `incl. queue wait: ${m.avgResponse.toFixed(1)} cycles` : 'S1 entry → S5 finish',
    },
    {
      label: 'Throughput',
      term: 'throughput',
      value: m.throughput,
      icon: TrendingUp,
      color: '#F59E0B',
      format: (v) => v.toFixed(2),
      unit: 'req/cycle',
      foot: `${m.completedCount} done ÷ ${m.elapsedCycles} cycles`,
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Simulation metrics">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <li key={c.label} className="panel flex flex-col p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-400">
                {c.term ? <Term name={c.term} align="left">{c.label}</Term> : c.label}
              </span>
              <Icon size={16} style={{ color: c.color }} aria-hidden="true" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <AnimatedNumber
                value={c.value}
                format={c.format}
                className="font-display text-3xl font-bold leading-none text-paper"
              />
              {c.unit && <span className="text-xs text-slate-400">{c.unit}</span>}
            </div>
            <p className="mt-2 text-[11px] leading-snug text-slate-500 tabular">{c.foot}</p>
          </li>
        );
      })}
    </ul>
  );
}
