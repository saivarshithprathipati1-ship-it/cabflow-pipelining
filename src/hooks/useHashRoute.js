import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export const ROUTES = ['home', 'dashboard', 'simulator', 'pipeline', 'analytics', 'about'];

const readRoute = () => {
  const name = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return ROUTES.includes(name) ? name : 'home';
};

/** Tiny hash router: keeps the back button working without extra dependencies. */
export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onChange = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((name) => {
    const target = name === 'home' ? '#/' : `#/${name}`;
    if (window.location.hash !== target) window.location.hash = target;
  }, []);

  return [route, navigate];
}

export const NavigationContext = createContext(() => {});
export const useNavigate = () => useContext(NavigationContext);
