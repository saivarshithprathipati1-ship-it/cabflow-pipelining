import { ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SimulationControls from '../components/SimulationControls.jsx';
import MetricsCards from '../components/MetricsCards.jsx';
import Pipeline from '../components/Pipeline.jsx';
import BookingForm from '../components/BookingForm.jsx';
import RequestQueue from '../components/RequestQueue.jsx';
import ComparisonCard from '../components/ComparisonCard.jsx';
import { useNavigate } from '../hooks/useHashRoute.js';
import { useSimulation } from '../simulation/SimulationContext.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useSimulation();
  const active = state.pipeline.filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader title="Dashboard">
        Create booking requests, start the clock and watch every metric update from the live simulation.
      </PageHeader>

      <div className="space-y-5">
        <SimulationControls />
        <MetricsCards />

        <section aria-labelledby="dash-pipeline" className="panel p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id="dash-pipeline" className="panel-title">Pipeline at a glance</h2>
              <p className="text-xs text-slate-400 tabular">
                Cycle {state.cycle} · {active} of 5 stages busy
              </p>
            </div>
            <button type="button" className="btn-ghost py-2" onClick={() => navigate('simulator')}>
              Open full simulator <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          <Pipeline compact />
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <BookingForm />
          <RequestQueue />
          <ComparisonCard />
        </div>
      </div>
    </div>
  );
}
