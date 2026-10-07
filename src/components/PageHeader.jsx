/** Consistent page title block. */
export default function PageHeader({ title, children, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {children && <p className="mt-2 max-w-2xl text-slate-400">{children}</p>}
      </div>
      {action}
    </div>
  );
}
