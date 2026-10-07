import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Simulator from './pages/Simulator.jsx';
import PipelinePage from './pages/PipelinePage.jsx';
import Analytics from './pages/Analytics.jsx';
import About from './pages/About.jsx';
import { SimulationProvider, useSimulation } from './simulation/SimulationContext.jsx';
import { NavigationContext, useHashRoute } from './hooks/useHashRoute.js';

const PAGES = {
  home: Landing,
  dashboard: Dashboard,
  simulator: Simulator,
  pipeline: PipelinePage,
  analytics: Analytics,
  about: About,
};

function Shell() {
  const [route, navigate] = useHashRoute();
  const { settings } = useSimulation();
  const Page = PAGES[route] ?? Landing;

  return (
    <NavigationContext.Provider value={navigate}>
      <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
        <div className={`flex min-h-screen flex-col overflow-x-clip ${settings.reduceMotion ? 'reduce-motion' : ''}`}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-cab focus:px-3 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          <Navbar route={route} onNavigate={navigate} />
          <main id="main" className="flex-1">
            <Page />
          </main>
          <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
            CABFLOW · a Computer Organization and Architecture case study on instruction pipelining
          </footer>
        </div>
      </MotionConfig>
    </NavigationContext.Provider>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <Shell />
    </SimulationProvider>
  );
}
