/** CABFLOW mark: a cab sitting on a five-segment pipeline track. */
export default function Logo({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#111827" stroke="rgba(148,163,184,0.25)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={6 + i * 6} y="28" width="4.5" height="3" rx="1" fill={i < 4 ? '#00D4FF' : '#22C55E'} opacity={0.35 + i * 0.15} />
      ))}
      <path d="M11 22.5v-3.2c0-.9.5-1.7 1.3-2.1l2.4-4c.4-.7 1.1-1.2 2-1.2h6.6c.8 0 1.6.5 2 1.2l2.4 4c.8.4 1.3 1.2 1.3 2.1v3.2c0 .8-.7 1.5-1.5 1.5H12.5c-.8 0-1.5-.7-1.5-1.5Z" fill="#FFC107" />
      <rect x="16.5" y="9" width="7" height="2.4" rx="1" fill="#FFC107" />
      <path d="M15.6 17l1.7-2.9c.1-.2.3-.3.6-.3h4.3c.2 0 .4.1.6.3l1.7 2.9h-8.9Z" fill="#0B1020" opacity=".85" />
      <circle cx="15" cy="24.2" r="2.1" fill="#0B1020" />
      <circle cx="25" cy="24.2" r="2.1" fill="#0B1020" />
    </svg>
  );
}
