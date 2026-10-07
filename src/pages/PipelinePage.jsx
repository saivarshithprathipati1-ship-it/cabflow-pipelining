import PageHeader from '../components/PageHeader.jsx';
import SimulationControls from '../components/SimulationControls.jsx';
import LiveStatus from '../components/LiveStatus.jsx';
import PipelineTimeline from '../components/PipelineTimeline.jsx';
import ComparisonCard from '../components/ComparisonCard.jsx';
import Pipeline from '../components/Pipeline.jsx';

export default function PipelinePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader title="Pipeline view">
        The space-time diagram professors draw on the board, generated live from the simulation.
      </PageHeader>
      <div className="space-y-5">
        <SimulationControls />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <PipelineTimeline windowSize={18} maxRows={16} title="Space-time diagram" />
            <section aria-label="Pipeline stages" className="panel p-4 sm:p-5">
              <Pipeline compact />
            </section>
          </div>
          <div className="space-y-5">
            <LiveStatus />
            <ComparisonCard />
          </div>
        </div>
      </div>
    </div>
  );
}
