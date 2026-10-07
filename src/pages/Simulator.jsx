import PageHeader from '../components/PageHeader.jsx';
import SimulationControls from '../components/SimulationControls.jsx';
import Pipeline from '../components/Pipeline.jsx';
import BookingForm from '../components/BookingForm.jsx';
import RequestQueue from '../components/RequestQueue.jsx';
import CompletedBookings from '../components/CompletedBookings.jsx';
import PipelineTimeline from '../components/PipelineTimeline.jsx';

export default function Simulator() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader title="Pipeline simulator">
        Requests leave the queue, move one stage per clock cycle, and are confirmed when they finish S5.
        Press Demo mode for an instant classroom run.
      </PageHeader>

      <div className="space-y-5">
        <SimulationControls />
        <Pipeline />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <BookingForm />
          <RequestQueue />
          <CompletedBookings />
        </div>
        <PipelineTimeline windowSize={14} maxRows={10} />
      </div>
    </div>
  );
}
