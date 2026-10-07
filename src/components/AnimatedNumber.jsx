import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { useSimulation } from '../simulation/SimulationContext.jsx';

const defaultFormat = (v) => String(Math.round(v));

/**
 * Counts smoothly from the previous value to the new one.
 * Writes straight to the DOM node so counting does not re-render React.
 */
export default function AnimatedNumber({ value, format = defaultFormat, className = '' }) {
  const nodeRef = useRef(null);
  const previous = useRef(value);
  const formatRef = useRef(format);
  formatRef.current = format;
  const osReduced = useReducedMotion();
  const { settings } = useSimulation();
  const reduce = osReduced || settings.reduceMotion;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return undefined;
    const from = previous.current;
    previous.current = value;
    if (reduce || from === value) {
      node.textContent = formatRef.current(value);
      return undefined;
    }
    const controls = animate(from, value, {
      duration: 0.45,
      ease: 'easeOut',
      onUpdate: (v) => {
        node.textContent = formatRef.current(v);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span ref={nodeRef} className={`tabular ${className}`}>
      {format(value)}
    </span>
  );
}
