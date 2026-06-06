import Reveal from './Reveal';

export default function SectionTitle({ eyebrow, title, subtitle, center = true }) {
  return (
    <Reveal className={center ? 'text-center max-w-2xl mx-auto mb-12' : 'max-w-2xl mb-12'}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" /> {eyebrow}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-600 text-base md:text-lg leading-relaxed">{subtitle}</p>}
    </Reveal>
  );
}
