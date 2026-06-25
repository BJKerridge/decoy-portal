'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  createContext,
} from 'react';


// ==========================================
// CONSTANTS & DATA
// ==========================================

const NAV_LINKS = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Telemetry', href: '#telemetry' },
  { label: 'Settings', href: '#settings' },
];

interface DailyRevenue { date: string; income: number }
interface DailyAllocation { date: string; sovereignty: number; telemetry: number; api: number }

const DAILY_REVENUE: DailyRevenue[] = [
  { date: 'Mon', income: 12000 },
  { date: 'Tue', income: 19500 },
  { date: 'Wed', income: 14000 },
  { date: 'Thu', income: 28000 },
  { date: 'Fri', income: 16500 },
  { date: 'Sat', income: 22000 },
  { date: 'Sun', income: 31000 },
];

const DAILY_ALLOCATION: DailyAllocation[] = [
  { date: 'Mon', sovereignty: 50, telemetry: 30, api: 20 },
  { date: 'Tue', sovereignty: 40, telemetry: 40, api: 20 },
  { date: 'Wed', sovereignty: 60, telemetry: 25, api: 15 },
  { date: 'Thu', sovereignty: 35, telemetry: 45, api: 20 },
  { date: 'Fri', sovereignty: 55, telemetry: 25, api: 20 },
];

const HEATMAP_ROWS = [
  [0, 2, 5, 1, 0, 14, 24],
  [6, 18, 12, 4, 19, 1, 0],
  [2, 0, 16, 22, 15, 8, 3],
];

const SYSTEM_NODES = [
  { id: 'node-alpha-us-east',  env: 'Production-Main',  perf: 94, status: 'Online',    statusColor: 'emerald' },
  { id: 'node-beta-eu-west',   env: 'Staging-Fallback', perf: 42, status: 'Throttled', statusColor: 'amber'   },
  { id: 'node-gamma-ap-south', env: 'Legacy-Archive',   perf: 0,  status: 'Offline',   statusColor: 'slate'   },
] as const;

const TIMELINE_EVENTS = [
  {
    timestamp: 'Just now',
    title: 'Deploy Hook Executed',
    body: (<>Vercel pipelines synchronized branch changes inside <code className="text-slate-300 font-mono text-[11px] bg-slate-950 px-1 py-0.5 rounded">origin/main</code> production targets.</>),
    titleColor: 'text-white',
    hoverColor: 'group-hover:bg-cyan-400 group-hover:ring-cyan-500/20',
  },
  {
    timestamp: '42 minutes ago',
    title: 'Database Optimization Required',
    body: 'Query indices exceeded planned lookup budgets across localized production shards.',
    titleColor: 'text-amber-400',
    hoverColor: 'group-hover:bg-amber-400 group-hover:ring-amber-500/20',
  },
];

const ALLOCATION_LEGEND = [
  { color: 'bg-cyan-500',   label: 'Sovereignty', pct: '55%', textColor: 'text-slate-950' },
  { color: 'bg-indigo-500', label: 'Telemetry',   pct: '25%', textColor: 'text-white'     },
  { color: 'bg-purple-500', label: 'API Gateway', pct: '12%', textColor: 'text-white'     },
  { color: 'bg-slate-800',  label: 'Unallocated', pct: '8%',  textColor: 'text-slate-500' },
];

interface CarouselCard {
  id: string;
  num: string;
  color: string;          // icon bg+text classes
  accentBorder: string;   // selected ring colour
  title: string;
  tag: string;
  body: string;
  detail: {
    metric: string;
    metricLabel: string;
    description: string;
    bullets: string[];
  };
  imageSrc?: string;
  imageStyles?: string;
}

const CAROUSEL_CARDS: CarouselCard[] = [
  {
    id: 'c01', num: '01', color: 'bg-cyan-500/10 text-cyan-400',     accentBorder: 'border-cyan-500/60',
    title: 'Flexbox & Grid',      tag: 'Layout',
    body: 'Manage directional flows, alignments, and multi-column systems across viewports.',
    detail: { metric: '12', metricLabel: 'utility classes', description: 'Flexbox and Grid utilities cover every alignment, gap, and flow scenario without a single line of custom CSS.', bullets: ['flex, flex-col, flex-wrap', 'grid-cols-{n}, col-span-{n}', 'place-items, justify-*, align-*'] },
  },
  {
    id: 'c02', num: '02', color: 'bg-indigo-500/10 text-indigo-400', accentBorder: 'border-indigo-500/60',
    title: 'Arbitrary Values',    tag: 'Escape Hatch',
    body: 'Break out of the design system safely using bracket notation for one-off values.',
    detail: { metric: '∞', metricLabel: 'possible values', description: 'Bracket notation lets you use any CSS value inline without touching a config file. Great for pixel-perfect edge cases.', bullets: ['top-[17px], w-[342px]', 'bg-[#1a1a2e], text-[13px]', 'grid-cols-[1fr_2fr_1fr]'] },
  },
  {
    id: 'c03', num: '03', color: 'bg-emerald-500/10 text-emerald-400', accentBorder: 'border-emerald-500/60',
    title: 'Spacing & Sizing',    tag: 'Foundation',
    body: 'Proportional padding, margins, gaps, heights and widths keep visual rhythm consistent.',
    detail: { metric: '4px', metricLabel: 'base unit', description: 'All spacing utilities are multiples of 4px, creating a consistent vertical and horizontal rhythm across the entire UI.', bullets: ['p-{n}, m-{n}, gap-{n}', 'h-{n}, w-{n}, size-{n}', 'space-x-{n}, space-y-{n}'] },
    imageSrc: '/Tritanium.png', 
    imageStyles: 'absolute -right-8 -bottom-6 h-28 w-auto object-contain opacity-80 group-hover/card:scale-105 group-hover/card:opacity-100 transition-all duration-300',
  },
  {
    id: 'c04', num: '04', color: 'bg-amber-500/10 text-amber-400',   accentBorder: 'border-amber-500/60',
    title: 'Typography',          tag: 'Text',
    body: 'Control tracking, leading, font weights and antialiasing globally or contextually.',
    detail: { metric: '9', metricLabel: 'font sizes', description: 'From text-xs to text-9xl, paired with weight, tracking, and leading controls for precise typographic hierarchy.', bullets: ['font-{weight}, tracking-{n}', 'leading-{n}, text-{size}', 'antialiased, font-mono'] },
  },
  {
    id: 'c05', num: '05', color: 'bg-purple-500/10 text-purple-400', accentBorder: 'border-purple-500/60',
    title: 'Responsive Design',   tag: 'Breakpoints',
    body: 'Mobile-first breakpoint prefixes apply utilities at sm, md, lg, xl, and 2xl.',
    detail: { metric: '5', metricLabel: 'breakpoints', description: 'Every utility can be prefixed with a breakpoint modifier. Styles apply from that breakpoint upward, mobile-first.', bullets: ['sm: ≥640px, md: ≥768px', 'lg: ≥1024px, xl: ≥1280px', '2xl: ≥1536px'] },
  },
  {
    id: 'c06', num: '06', color: 'bg-rose-500/10 text-rose-400',     accentBorder: 'border-rose-500/60',
    title: 'Dark Mode',           tag: 'Theming',
    body: 'Toggle dark variants with the dark: prefix, driven by class or media query.',
    detail: { metric: '2', metricLabel: 'strategies', description: 'Dark mode can be driven by a .dark class on the root element, or by the prefers-color-scheme media query.', bullets: ['dark:bg-slate-900', 'dark:text-white', 'dark:border-slate-700'] },
  },
  {
    id: 'c07', num: '07', color: 'bg-sky-500/10 text-sky-400',       accentBorder: 'border-sky-500/60',
    title: 'Hover & Focus',       tag: 'States',
    body: 'Pseudo-class variants apply styles on interaction without any JavaScript.',
    detail: { metric: '20+', metricLabel: 'state variants', description: 'State variants like hover:, focus:, active:, and visited: work on any utility, keeping interaction styles colocated.', bullets: ['hover:bg-*, focus:ring-*', 'active:scale-*, disabled:opacity-*', 'focus-visible:outline-*'] },
  },
  {
    id: 'c08', num: '08', color: 'bg-teal-500/10 text-teal-400',     accentBorder: 'border-teal-500/60',
    title: 'Group & Peer',        tag: 'Relational',
    body: 'Style children based on parent state, or siblings based on adjacent element state.',
    detail: { metric: '2', metricLabel: 'relational modifiers', description: 'group and peer unlock CSS relational patterns — parent controls child, sibling controls sibling — all in markup.', bullets: ['group/group-hover:*', 'peer/peer-checked:*', 'peer-invalid:visible'] },
  },
  {
    id: 'c09', num: '09', color: 'bg-fuchsia-500/10 text-fuchsia-400', accentBorder: 'border-fuchsia-500/60',
    title: 'Transitions',         tag: 'Motion',
    body: 'Hardware-accelerated transitions with duration, easing, and delay controls.',
    detail: { metric: '7', metricLabel: 'timing functions', description: 'Transition utilities pair with duration and ease modifiers. motion-reduce: ensures accessibility for users with vestibular disorders.', bullets: ['transition-all, transition-colors', 'duration-{n}, ease-in-out', 'motion-reduce:transition-none'] },
  },
  {
    id: 'c10', num: '10', color: 'bg-orange-500/10 text-orange-400', accentBorder: 'border-orange-500/60',
    title: 'Gradients',           tag: 'Visuals',
    body: 'Linear and radial gradients with from/via/to colour stops and direction control.',
    detail: { metric: '8', metricLabel: 'directions', description: 'Gradient utilities in v4 use the bg-linear-to-{dir} syntax. Radial gradients and conic gradients are also supported.', bullets: ['bg-linear-to-br from-* to-*', 'bg-radial from-* via-* to-*', 'via-* for midpoint control'] },
  },
  {
    id: 'c11', num: '11', color: 'bg-lime-500/10 text-lime-400',     accentBorder: 'border-lime-500/60',
    title: 'Filters & Backdrop',  tag: 'Effects',
    body: 'Blur, brightness, contrast, and backdrop-filter utilities for layered depth.',
    detail: { metric: '10+', metricLabel: 'filter types', description: 'CSS filter utilities like blur-*, brightness-*, and contrast-* compose cleanly. backdrop-blur-* creates frosted glass layers.', bullets: ['blur-{n}, brightness-{n}', 'backdrop-blur-{n}', 'drop-shadow-*'] },
  },
  {
    id: 'c12', num: '12', color: 'bg-pink-500/10 text-pink-400',     accentBorder: 'border-pink-500/60',
    title: 'CSS Variables',       tag: 'Tokens',
    body: 'v4 uses native CSS custom properties as design tokens, no JS config required.',
    detail: { metric: '100%', metricLabel: 'native CSS', description: 'Tailwind v4 is built entirely on native CSS custom properties. Every colour, space, and radius is a --tw-* variable you can override.', bullets: ['var(--tw-color-*)', '--tw-spacing-* overrides', 'Cascade layer control'] },
  },
];

const HEAT_CLASSES = [
  'bg-slate-950 border border-slate-900/50',
  'bg-cyan-950/40 border border-cyan-950/60',
  'bg-cyan-900/60 border border-cyan-900/40',
  'bg-cyan-700',
  'bg-cyan-600',
  'bg-cyan-500',
];


// ==========================================
// FADE ANIMATION SYSTEM
// ==========================================

/**
 * Context shared between Section and FadeItem.
 * Section sets `visible` (triggered by IntersectionObserver) and `baseDelayMs`.
 * Each FadeItem reads these and its own `index` prop to derive its stagger delay.
 */
interface FadeContextValue {
  visible: boolean;
  baseDelayMs: number;
  enabled: boolean;
}

const FadeContext = createContext<FadeContextValue>({ visible: true, baseDelayMs: 200, enabled: false });

interface SectionProps {
  children: React.ReactNode;
  fadeIn?: boolean;
  baseDelayMs?: number;
  className?: string;
  id?: string;
}

/**
 * Section — triggers the shared fade context when scrolled into view.
 * Does NOT attempt to clone or traverse children; that's FadeItem's job.
 */
export function Section({ children, fadeIn = false, baseDelayMs = 200, className = '', id }: SectionProps) {
  const [visible, setVisible] = useState(!fadeIn);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!fadeIn) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(entry.target); } },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [fadeIn]);

  return (
    <FadeContext.Provider value={{ visible, baseDelayMs, enabled: fadeIn }}>
      <section ref={ref} className={`space-y-6 ${className}`} id={id}>
        {children}
      </section>
    </FadeContext.Provider>
  );
}

interface FadeItemProps {
  children: React.ReactNode;
  index: number;          // stagger position — 0, 1, 2 …
  className?: string;     // forwarded to the wrapper div
}

/**
 * FadeItem — an explicit wrapper that owns the opacity/translate animation.
 * Wraps exactly one logical child (a card, a grid, a heading block, etc).
 * Works with any content — custom components, DOM elements, charts, anything.
 */
function FadeItem({ children, index, className = '' }: FadeItemProps) {
  const { visible, baseDelayMs, enabled } = useContext(FadeContext);

  if (!enabled) return <div className={className}>{children}</div>;

  const delay = visible ? `${index * baseDelayMs}ms` : '0ms';

  return (
    <div
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
}


// ==========================================
// LAYOUT PRIMITIVES
// ==========================================

/** Inner content rail — constrains width and adds horizontal padding. */
function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

/** Standard dark card shell used throughout the dashboard. */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/30 p-6 ${className}`}>
      {children}
    </div>
  );
}

/** Small eyebrow label above a card title. */
function CardEyebrow({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{children}</span>;
}

/** Consistent section heading + sub-copy block. */
function SectionHeader({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
      <p className="text-sm text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function Divider() {
  return <hr className="border-slate-800" />;
}


// ==========================================
// STATUS BADGE
// ==========================================

const STATUS_STYLES: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  amber:   'bg-amber-500/10  text-amber-400  ring-amber-500/20',
  slate:   'bg-slate-800     text-slate-400  ring-slate-700',
};

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ${STATUS_STYLES[color]}`}>
      {label}
    </span>
  );
}


// ==========================================
// HEATMAP HELPERS
// ==========================================

function heatClass(jobs: number): string {
  if (jobs === 0)  return HEAT_CLASSES[0];
  if (jobs <= 2)   return HEAT_CLASSES[1];
  if (jobs <= 6)   return HEAT_CLASSES[2];
  if (jobs <= 12)  return HEAT_CLASSES[3];
  if (jobs <= 18)  return HEAT_CLASSES[4];
  return HEAT_CLASSES[5];
}


// ==========================================
// CHART: LINE CHART
// ==========================================

function DailyLineChart() {
  const max  = Math.max(...DAILY_REVENUE.map(d => d.income));
  const step = 100 / (DAILY_REVENUE.length - 1);

  const points = DAILY_REVENUE.map((item, i) => ({
    x: i * step,
    y: 90 - (item.income / max) * 75,
    ...item,
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  let areaD = `M ${points[0].x} 100 L ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i], p1 = points[i + 1];
    const seg = ` C ${p0.x + step / 2} ${p0.y}, ${p1.x - step / 2} ${p1.y}, ${p1.x} ${p1.y}`;
    pathD += seg;
    areaD += seg;
  }
  areaD += ` L ${points[points.length - 1].x} 100 Z`;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardEyebrow>Performance Metrics</CardEyebrow>
        <h3 className="text-base font-semibold text-white mt-0.5">Daily Ingress Revenue</h3>
        <p className="text-xs text-slate-400 mt-1">Dynamic SVG mapping computing custom arrays from database tracking loops.</p>
      </div>

      <div className="mt-8 relative w-full h-44">
        {[0, 25, 50, 75, 100].map(p => (
          <div key={p} className={`absolute inset-x-0 border-b ${p === 100 ? 'border-slate-800' : 'border-slate-800/40'}`} style={{ top: `${p}%` }} />
        ))}

        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgb(99,102,241)"  stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(99,102,241)"  stopOpacity="0"   />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#lineAreaGradient)" />
          <path d={pathD} fill="none" stroke="rgb(129,140,248)" strokeWidth="1.75" strokeLinecap="round" />
        </svg>

        {points.map((pt, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 group/node" style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
            <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border-2 border-indigo-400 hover:bg-cyan-400 hover:scale-125 hover:border-white transition-all cursor-pointer relative z-10">
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover/node:flex flex-col items-center bg-slate-950 border border-slate-800 font-mono text-[9px] px-2 py-0.5 rounded shadow-2xl whitespace-nowrap text-white">
                <span className="font-bold text-cyan-400">£{(pt.income / 1000).toFixed(1)}k</span>
                <span className="text-[8px] text-slate-500">{pt.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-3 px-1">
        {DAILY_REVENUE.map((d, i) => <span key={i}>{d.date}</span>)}
      </div>
    </Card>
  );
}


// ==========================================
// CHART: STACKED BAR
// ==========================================

function StackedBarChart() {
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardEyebrow>Regional Volumetrics</CardEyebrow>
        <h3 className="text-base font-semibold text-white mt-0.5">Stacked Bar Distribution</h3>
        <p className="text-xs text-slate-400 mt-1">Calculates relative height percentages directly out of structural allocation arrays.</p>
      </div>

      <div className="mt-8 flex items-end justify-between h-44 gap-3 px-1">
        {DAILY_ALLOCATION.map((item, i) => {
          const total = item.sovereignty + item.telemetry + item.api;
          const pct = (v: number) => `${(v / total) * 100}%`;
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full flex flex-col rounded-t-md overflow-hidden bg-slate-950 border border-slate-900/40 h-full justify-end">
                <div className="w-full bg-purple-500 hover:bg-purple-400 transition-colors duration-150" style={{ height: pct(item.api) }}        title={`API Gateway: ${item.api}`} />
                <div className="w-full bg-indigo-500 hover:bg-indigo-400 transition-colors duration-150" style={{ height: pct(item.telemetry) }}   title={`Telemetry Stream: ${item.telemetry}`} />
                <div className="w-full bg-cyan-500   hover:bg-cyan-400   transition-colors duration-150" style={{ height: pct(item.sovereignty) }} title={`Sovereignty Index: ${item.sovereignty}`} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2 group-hover:text-slate-300">{item.date}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}


// ==========================================
// SECTION COMPONENTS
// ==========================================

function TypographySection() {
  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="0. Typography System & Font Scaling"
          description="Demonstrating utility scale configurations, tracking, weights, and leading attributes."
        />
      </FadeItem>

      <FadeItem index={1}>
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 divide-y divide-slate-800/60">
          <div className="space-y-4">
            <CardEyebrow>Font Size Matrix</CardEyebrow>
            <div className="space-y-2">
              <p className="text-5xl font-black tracking-tighter text-white">text-5xl tracking-tighter</p>
              <p className="text-3xl font-extrabold tracking-tight text-slate-200">text-3xl tracking-tight</p>
              <p className="text-xl font-semibold tracking-normal text-slate-300">text-xl tracking-normal</p>
              <p className="text-base font-normal text-slate-400 leading-relaxed">text-base leading-relaxed: General fallback system context structure.</p>
              <p className="text-xs font-medium text-cyan-400 font-mono">text-xs font-mono: system metrics execution output</p>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <CardEyebrow>Weight Variations</CardEyebrow>
              <p className="font-light   text-slate-400 text-sm mt-1">font-light text</p>
              <p className="font-normal  text-slate-300 text-sm mt-1">font-normal text</p>
              <p className="font-medium  text-slate-200 text-sm mt-1">font-medium text</p>
              <p className="font-bold    text-white     text-sm mt-1">font-bold text</p>
              <p className="font-black   text-white     text-sm mt-1">font-black text</p>
            </div>
            <div>
              <CardEyebrow>Tracking (Letter-Spacing)</CardEyebrow>
              <p className="tracking-tighter text-sm text-white font-bold mt-1">tracking-tighter analytics</p>
              <p className="tracking-tight   text-sm text-white font-bold mt-1">tracking-tight analytics</p>
              <p className="tracking-normal  text-sm text-white font-bold mt-1">tracking-normal analytics</p>
              <p className="tracking-wide    text-sm text-white font-bold mt-1">tracking-wide analytics</p>
              <p className="tracking-widest  text-sm text-cyan-400 font-mono uppercase mt-1">tracking-widest nodes</p>
            </div>
            <div>
              <CardEyebrow>Family Mono Samples</CardEyebrow>
              <p className="font-mono text-xs text-indigo-400 bg-slate-950 px-2 py-1 rounded w-fit border border-slate-900">node-alpha-ingress-ok</p>
              <p className="font-mono text-[11px] text-slate-400 mt-2 block">0x7FFF5FBFF5D0 stack reference</p>
            </div>
          </div>
        </div>
      </FadeItem>
    </Section>
  );
}

function LayoutSection() {
  const cards = [
    { num: '01', color: 'bg-cyan-500/10 text-cyan-400',      title: 'Flexbox & Grid',   body: 'Effortlessly manage directional flows, alignments, and multi-column systems across viewports.' },
    { num: '02', color: 'bg-indigo-500/10 text-indigo-400',  title: 'Arbitrary Values',  body: (<>Need a hyper-specific layout? Use notations like <code className="text-indigo-300 text-xs bg-slate-950 px-1 py-0.5 rounded">top-[17px]</code>.</>) },
    { num: '03', color: 'bg-emerald-500/10 text-emerald-400',title: 'Spacing & Sizing',  body: 'Strictly proportional padding, margins, gaps, heights, and widths keep visual balance predictable.' },
    { num: '04', color: 'bg-amber-500/10 text-amber-400',    title: 'Typography',        body: 'Control tracking, leading, font weights, and antialiasing features globally or contextually.' },
  ];

  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="1. Core Layouts & Responsive Grid"
          description="Testing responsive breakpoints (sm, md, lg, xl) and CSS Grid positioning."
        />
      </FadeItem>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ num, color, title, body }, i) => (
          <FadeItem key={num} index={i + 1}>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xs backdrop-blur-md transition-all hover:border-slate-700">
              <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center font-bold text-lg mb-4`}>{num}</div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{body}</p>
            </div>
          </FadeItem>
        ))}
      </div>
    </Section>
  );
}

// ==========================================
// CARD CAROUSEL WITH EXPANDABLE DETAIL PANEL
// ==========================================

function CardCarouselSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = CAROUSEL_CARDS.find(c => c.id === selectedId) ?? null;

  const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
  if (scrollRef.current) {
    // Scrolls by roughly 2 cards at a time (w-52 = 208px + gaps)
    const scrollAmount = direction === 'left' ? -450 : 450;
    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  }
};

  function handleCardClick(id: string) {
    setSelectedId(prev => (prev === id ? null : id));
  }

  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="1b. Scrollable Card Carousel"
          description="12 cards in a horizontal scroll rail with edge fades. Select any card to expand its detail panel below."
        />
      </FadeItem>

      <FadeItem index={1}>
  {/* THE MAIN CONTAINER FRAME */}
  <div className="group relative w-full rounded-2xl overflow-hidden bg-slate-950/20 p-1">
    
    {/* ----------------------------------------------------------------
        Programmatic Navigation Arrow Buttons
       ---------------------------------------------------------------- */}
    {/* Left Chevron Button */}
    <button
      onClick={() => scroll('left')}
      className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-white hover:border-slate-700 backdrop-blur-md transition-all duration-200 opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-xl focus:outline-hidden"
      aria-label="Scroll Left"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    {/* Right Chevron Button */}
    <button
      onClick={() => scroll('right')}
      className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-white hover:border-slate-700 backdrop-blur-md transition-all duration-200 opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-xl focus:outline-hidden"
      aria-label="Scroll Right"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    {/* ----------------------------------------------------------------
        Scroll Rail Container with Clean Inline CSS Masking
        This completely replaces the manual mask elements and avoids layout leaks.
       ---------------------------------------------------------------- */}
    <div
      ref={scrollRef}
      className="overflow-x-auto touch-pan-x select-none scrollbar-hide"
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        /* This linear mask means: Keep content 100% solid in the middle, 
          but fade smoothly to transparent on the outer 5% edges.
        */
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
      }}
    >
      {/* THE INNER TRACK:
        Using `px-12` pushes the first card out by 48px. 
        On page load, it sits 100% inside the "Solid Black" safety zone of our mask.
        As soon as you scroll left or right, cards smoothly fade away right at the layout edge.
      */}
      <div className="flex gap-4 px-12 py-3">
      {CAROUSEL_CARDS.map((card) => {
  const isActive = selectedId === card.id;
  return (
    <button
      key={card.id}
      onClick={() => handleCardClick(card.id)}
      className={[
        'group/card flex-none w-52 rounded-xl border p-5 text-left snap-start relative overflow-hidden',
        'transition-all duration-200 cursor-pointer focus:outline-hidden',
        'bg-slate-900/50 backdrop-blur-md shadow-xs',
        isActive
          ? `${card.accentBorder} bg-slate-900 shadow-lg`
          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/80',
      ].join(' ')}
    >
      {/* ----------------------------------------------------------------
          1. BACKGROUND IMAGE ASSET (LAYER 10)
          Slid all the way back into the card layout frame.
         ---------------------------------------------------------------- */}
      {card.imageSrc && (
        <img 
          src={card.imageSrc} 
          alt="" 
          className="absolute -right-5 -bottom-4 h-24 w-auto object-contain z-10 pointer-events-none opacity-50 group-hover/card:opacity-80 group-hover/card:scale-105 transition-all duration-300"
          draggable="false" 
        />
      )}

      {/* ----------------------------------------------------------------
          2. CONTENT TEXT WRAPPER (LAYER 30)
          We add `block` here to force the button's interior children to 
          behave as rigid elements, allowing `z-30` to pull them cleanly over the image.
         ---------------------------------------------------------------- */}
      <div className="relative z-30 block w-full h-full pointer-events-none">
        
        {/* Icon + tag row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`h-9 w-9 rounded-lg ${card.color} flex items-center justify-center font-bold text-sm bg-slate-950/40 backdrop-blur-xs`}>
            {card.num}
          </div>
          <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${
            isActive
              ? `${card.color} border-current/30 bg-slate-950/50`
              : 'text-slate-500 border-slate-800 bg-slate-950/20'
          }`}>
            {card.tag}
          </span>
        </div>

        {/* Title Heading */}
        <h3 className={`text-sm font-semibold leading-tight mb-1.5 transition-colors ${isActive ? 'text-white' : 'text-slate-200 group-hover/card:text-white'}`}>
          {card.title}
        </h3>
        
        {/* Body Paragraph */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          {card.body}
        </p>

        {/* Selection indicator pip */}
        <div className={`mt-4 h-0.5 rounded-full transition-all duration-300 ${isActive ? `${card.color.split(' ')[1]} opacity-100 w-full bg-current` : 'w-0 opacity-0'}`} />
      </div>

    </button>
  );
})}
        
        {/* End buffer matching the initial tracking layout offset */}
        <div className="flex-none w-8 shrink-0" />
      </div>
    </div>
  </div>
</FadeItem>

      {/* ── Expandable detail panel ── */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          selected ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {selected && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">

              {/* Left: big metric */}
              <div className={`rounded-xl border p-5 text-center min-w-[110px] ${selected.accentBorder} bg-slate-950/60`}>
                <span className={`block text-3xl font-black font-mono ${selected.color.split(' ')[1]}`}>
                  {selected.detail.metric}
                </span>
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1 leading-tight">
                  {selected.detail.metricLabel}
                </span>
              </div>

              {/* Right: description + bullets */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-mono font-semibold ${selected.color.split(' ')[1]}`}>
                      {selected.num} / {selected.title}
                    </span>
                    <span className="text-xs font-mono text-slate-600">—</span>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{selected.tag}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{selected.detail.description}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">Example classes</span>
                  <ul className="space-y-1.5">
                    {selected.detail.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className={`h-1 w-1 rounded-full flex-none ${selected.color.split(' ')[1]} bg-current`} />
                        <code className="text-xs font-mono text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{b}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

function InteractivitySection() {
  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="2. Interactivity & Micro-Transitions"
          description={<>Testing pseudo-classes (<code className="text-slate-300">hover</code>, <code className="text-slate-300">focus-within</code>, <code className="text-slate-300">group</code>) paired with hardware-accelerated transitions.</>}
        />
      </FadeItem>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Button states */}
        <FadeItem index={1}>
          <Card className="flex flex-col justify-between items-start gap-4">
            <CardEyebrow>Pseudo-Classes & States</CardEyebrow>
            <div className="space-y-3 w-full">
              <button className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 active:scale-[0.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500">
                Interactive Button
              </button>
              <button className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm border border-slate-700 hover:bg-slate-700/70 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden transition-all">
                Focus Ring Test
              </button>
            </div>
          </Card>
        </FadeItem>

        {/* Group hover */}
        <FadeItem index={2}>
          <div className="group relative rounded-xl border border-slate-800 bg-slate-900/30 p-6 overflow-hidden cursor-pointer transition-colors hover:bg-slate-900/70">
            <CardEyebrow>Group Hover Relationships</CardEyebrow>
            <div className="mt-4 space-y-2">
              <h4 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">Parent Container Hover</h4>
              <p className="text-sm text-slate-400">Hovering anywhere inside this card triggers state variations in the child elements below.</p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300">
                  Discover changes &rarr;
                </span>
              </div>
            </div>
          </div>
        </FadeItem>

        {/* Peer modifier */}
        <FadeItem index={3}>
          <Card>
            <CardEyebrow>Peer Sibling Modifiers</CardEyebrow>
            <div className="mt-4 space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Enter invalid email..."
                  defaultValue="invalid-email-format"
                  className="peer w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden transition-colors invalid:border-pink-500 invalid:text-pink-400"
                />
                <p className="invisible peer-invalid:visible mt-1.5 text-xs text-pink-500 font-medium">
                  Please specify a valid email syntax.
                </p>
              </div>
            </div>
          </Card>
        </FadeItem>
      </div>
    </Section>
  );
}

function VisualsSection() {
  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="3. Advanced Visuals & Effects"
          description="Evaluating new Tailwind v4 linear gradient paths, backdrops, transitions, and clip matching."
        />
      </FadeItem>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <FadeItem index={1}>
          <div className="h-40 rounded-xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 flex flex-col justify-end shadow-lg shadow-indigo-500/10">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Linear Gradient</span>
            <span className="text-lg font-bold text-white">to-br syntax</span>
          </div>
        </FadeItem>

        <FadeItem index={2}>
          <div className="relative h-40 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <div className="absolute inset-0 bg-radial from-cyan-500/30 via-transparent to-transparent animate-pulse" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-900/40 backdrop-blur-md border-t border-white/10 p-4 flex items-center justify-between w-full">
              <span className="text-xs font-mono text-slate-300">Backdrop Blur Matrix</span>
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
        </FadeItem>

        <FadeItem index={3}>
          <div className="h-40 rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 cursor-pointer">
            <CardEyebrow>Transform & Translate</CardEyebrow>
            <p className="text-sm text-slate-300">Subtle scale shifts combined with dynamic shadow casting over modern UI wrappers.</p>
          </div>
        </FadeItem>
      </div>
    </Section>
  );
}

function DataTableSection() {
  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="4. Complex Component Composition"
          description="Simulating practical systems architecture components leveraging flex layouts, alignments, and specific states."
        />
      </FadeItem>

      <FadeItem index={1}>
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-xs">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">Mock System Nodes</h3>
              <p className="text-xs text-slate-400">Simulated status records tracking operations environment layouts.</p>
            </div>
            <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-md text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All Systems Nominal
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {['Cluster Node', 'Environment Zone', 'Performance Index', 'Operational Status'].map((h, i) => (
                    <th key={h} className={`px-6 py-3 ${i === 3 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {SYSTEM_NODES.map(node => (
                  <tr key={node.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-white text-xs font-semibold">{node.id}</td>
                    <td className="px-6 py-4">{node.env}</td>
                    <td className="px-6 py-4">
                      <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${node.perf > 0 ? 'bg-cyan-500' : 'bg-slate-700'}`} style={{ width: `${node.perf}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge label={node.status} color={node.statusColor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeItem>
    </Section>
  );
}

function FormsSection() {
  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="5. Custom Forms & Switch States"
          description="Testing layout transitions, focus rings, and conditional styling driven by native HTML selectors."
        />
      </FadeItem>

      <FadeItem index={1}>
        <div className="max-w-xl rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-6">
          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
              <input type="checkbox" className="peer h-5 w-5 appearance-none rounded-md border border-slate-700 bg-slate-950 checked:bg-cyan-500 checked:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 transition-all" />
              <svg className="absolute h-3 w-3 text-slate-950 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Enable Advanced Telemetry</span>
              <p className="text-xs text-slate-400 mt-0.5">Aggregates system exceptions and distribution layout metrics automatically.</p>
            </div>
          </label>

          {/* Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              <span className="text-sm font-medium text-slate-200">Maintenance Mode</span>
              <p className="text-xs text-slate-400 mt-0.5">Redirects raw edge requests to static cluster layers.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 outline-hidden peer-focus:ring-2 peer-focus:ring-cyan-500/50" />
            </label>
          </div>
        </div>
      </FadeItem>
    </Section>
  );
}

function TimelineSection() {
  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="6. Vertical Timeline Pattern"
          description="Utilises absolute positioning bounds alongside precise border alignment structures."
        />
      </FadeItem>

      <div className="relative border-l border-slate-800 ml-3 space-y-8 py-2">
        {TIMELINE_EVENTS.map((event, i) => (
          <FadeItem key={i} index={i + 1}>
            <div className="relative pl-8 group">
              <div className={`absolute -left-[6px] top-1.5 h-3 w-3 rounded-full border border-slate-900 bg-slate-700 ${event.hoverColor} group-hover:ring-4 transition-all`} />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-slate-500">{event.timestamp}</span>
                <h4 className={`text-sm font-semibold ${event.titleColor}`}>{event.title}</h4>
                <p className="text-xs text-slate-400 max-w-md">{event.body}</p>
              </div>
            </div>
          </FadeItem>
        ))}
      </div>
    </Section>
  );
}

function OverlayCardsSection() {
  const cards = [
    {
      badge: 'Active Session',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      dot: true,
      bg: <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_100%)] opacity-40 group-hover:opacity-60 transition-opacity" />,
      title: 'Isolated Workspaces',
      body: 'Spin up ephemeral sandbox states complete with virtual micro-engines instantaneously.',
    },
    {
      badge: 'Security Layer',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      dot: false,
      bg: <div className="absolute inset-0 -z-10 bg-radial from-purple-500/10 via-transparent to-transparent opacity-50 group-hover:scale-110 transition-transform duration-700" />,
      title: 'End-to-End Keys',
      body: 'Data payloads are signed via local hardware cryptographic chains prior to ingress execution.',
    },
  ];

  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="7. Graphic Overlay Cards"
          description="Demonstrates parent aspect-ratio tracking, flex layout layering, and mixed blend filters."
        />
      </FadeItem>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cards.map(({ badge, badgeColor, dot, bg, title, body }, i) => (
          <FadeItem key={title} index={i + 1}>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between group">
              {bg}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono px-2.5 py-0.5 rounded-sm border ${badgeColor}`}>{badge}</span>
                {dot && <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">{body}</p>
              </div>
            </div>
          </FadeItem>
        ))}
      </div>
    </Section>
  );
}

function AnalyticsDashboardSection() {
  return (
    <Section fadeIn baseDelayMs={150}>
      <FadeItem index={0}>
        <SectionHeader
          title="8. Quad-Grid Analytics Dashboard"
          description="A highly structured 2×2 layout matrix evaluating pure CSS layouts, SVG vector coordinate streams, and component tracking loops."
        />
      </FadeItem>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Heatmap */}
        <FadeItem index={1}>
          <Card className="flex flex-col justify-between">
            <div>
              <CardEyebrow>Cron Execution Logs</CardEyebrow>
              <h3 className="text-base font-semibold text-white mt-0.5">Node Activity Density</h3>
              <p className="text-xs text-slate-400 mt-1">Grid matrix array mapping scheduling loops and pipeline load spikes.</p>
            </div>
            <div className="my-auto pt-6">
              <div className="grid grid-cols-7 gap-1.5 w-fit mx-auto">
                {HEATMAP_ROWS.map((row, ri) =>
                  row.map((jobs, ci) => (
                    <div
                      key={`${ri}-${ci}`}
                      className={`h-3.5 w-3.5 rounded-xs ${heatClass(jobs)} ${ri === 0 && ci === 6 ? 'animate-pulse' : ''}`}
                      title={`${jobs} job${jobs !== 1 ? 's' : ''}`}
                    />
                  ))
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-4 max-w-[140px] mx-auto">
                <span>Less</span>
                <div className="flex gap-0.5">
                  {HEAT_CLASSES.slice(0, 4).map((cls, i) => (
                    <span key={i} className={`h-2 w-2 rounded-xs ${cls.split(' ')[0]}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </Card>
        </FadeItem>

        {/* Allocation bar */}
        <FadeItem index={2}>
          <Card className="flex flex-col justify-between">
            <div>
              <CardEyebrow>Resource Apportionment</CardEyebrow>
              <h3 className="text-base font-semibold text-white mt-0.5">Metrics Inventory</h3>
              <p className="text-xs text-slate-400 mt-1">Single-track composite visualisation analysing distribution layers.</p>
            </div>
            <div className="space-y-5 my-auto pt-6">
              <div className="h-8 w-full bg-slate-950 rounded-lg overflow-hidden flex p-1 border border-slate-800">
                {ALLOCATION_LEGEND.map(({ color, pct, textColor }) => (
                  <div key={pct} className={`h-full ${color} flex items-center justify-center min-w-4 text-[10px] font-bold ${textColor}`} style={{ width: pct }}>{pct}</div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                {ALLOCATION_LEGEND.map(({ color, label, pct, textColor }) => (
                  <div key={label} className={`flex items-center gap-2 ${textColor === 'text-slate-500' ? 'text-slate-500' : 'text-slate-300'}`}>
                    <span className={`h-2 w-2 rounded-xs ${color}`} />
                    {label} ({pct})
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </FadeItem>

        {/* Line chart — custom component, FadeItem wraps it cleanly */}
        <FadeItem index={3}>
          <DailyLineChart />
        </FadeItem>

        {/* Stacked bar — same */}
        <FadeItem index={4}>
          <StackedBarChart />
        </FadeItem>
      </div>
    </Section>
  );
}


// ==========================================
// NAVIGATION
// ==========================================

function StickyHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-cyan-500 shadow-xs shadow-cyan-500/50" />
            <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
              DECOY<span className="text-cyan-400">.UI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">
                {link.label}
              </a>
            ))}
          </nav>

          <button
            onClick={() => setIsOpen(o => !o)}
            className="relative md:hidden flex h-10 w-10 flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 focus:outline-hidden z-50"
            aria-label="Toggle Navigation Menu"
          >
            <div className="space-y-1.5 w-5">
              <span className={`block h-0.5 w-5 bg-current transform transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-5 bg-current transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-current transform transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 md:hidden pointer-events-none transition-all duration-300 ${isOpen ? 'pointer-events-auto' : ''}`}>
        <div onClick={() => setIsOpen(false)} className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        <aside className={`absolute right-0 top-0 h-full w-64 border-l border-slate-800 bg-slate-950 p-6 pt-24 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <nav className="flex flex-col gap-6">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} onClick={() => setIsOpen(false)} className="text-sm font-mono text-slate-300 hover:text-cyan-400 border-b border-slate-900 pb-2 transition-colors uppercase tracking-wider">
                {link.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}


// ==========================================
// PAGE ROOT
// ==========================================

export default function TailwindDemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-900 font-sans antialiased">
      <StickyHeader />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-slate-800 bg-linear-to-b from-slate-900 to-slate-950 px-6 py-16 text-center sm:px-12 sm:py-24">
        <div className="absolute top-0 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 ring-1 ring-cyan-400/20 ring-inset mb-4">
            Tailwind v4 + Next.js 16
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Tailwind Feature Showcase
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400 max-w-xl mx-auto">
            A utility-first interactive laboratory testing layouts, micro-interactions, responsive design, and component architecture.
          </p>
        </div>
      </header>

      {/*
        MAIN LAYOUT PATTERN
        ─────────────────────────────────────────────────────────────────────
        Each section slot is a full-width <div> — background colours applied
        here bleed edge-to-edge. Content is constrained by <Container> inside.

        To give a section a full-width background, just add a bg-* class to
        the outer div, e.g.:
          <div className="py-16 bg-slate-900 border-y border-slate-800">
        ─────────────────────────────────────────────────────────────────────
      */}
      <main>

        <div className="py-12">
          <Container>
            <TypographySection />
          </Container>
        </div>

        <Divider />

        <div className="py-12">
          <Container>
            <LayoutSection />
          </Container>
        </div>

        <Divider />

        <div className="py-12">
          <Container>
            <CardCarouselSection />
          </Container>
        </div>

        <Divider />

        <div className="py-12">
          <Container>
            <InteractivitySection />
          </Container>
        </div>

        <Divider />

        <div className="py-12">
          <Container>
            <VisualsSection />
          </Container>
        </div>

        <Divider />

        {/* ── Section 4: full-width lighter background ── */}
        <div className="py-12 bg-slate-900 border-y border-slate-800/80">
          <Container>
            <DataTableSection />
          </Container>
        </div>

        <div className="py-12">
          <Container>
            <FormsSection />
          </Container>
        </div>

        <Divider />

        <div className="py-12">
          <Container>
            <TimelineSection />
          </Container>
        </div>

        <Divider />

        <div className="py-12">
          <Container>
            <OverlayCardsSection />
          </Container>
        </div>

        <Divider />

        <div className="py-12">
          <Container>
            <AnalyticsDashboardSection />
          </Container>
        </div>

      </main>

      <footer className="mt-24 border-t border-slate-800 py-8 text-center text-xs text-slate-500 font-mono">
        decoy-ui sandbox • configured via Next.js + Tailwind CSS
      </footer>
    </div>
  );
}