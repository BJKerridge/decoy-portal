'use client';

import React, { useEffect, useRef, useState, Children, isValidElement, cloneElement } from 'react';

// ==========================================
// DATA MODELS & TYPES
// ==========================================
interface DailyRevenue {
    date: string;
    income: number;
  }
  
  interface DailyAllocation {
    date: string;
    sovereignty: number;
    telemetry: number;
    api: number;
  }

  



  // Mock Input Data: Income per day over a business week
  const dailyRevenueData: DailyRevenue[] = [
    { date: 'Mon', income: 12000 },
    { date: 'Tue', income: 19500 },
    { date: 'Wed', income: 14000 },
    { date: 'Thu', income: 28000 }, // Peak Day
    { date: 'Fri', income: 16500 },
    { date: 'Sat', income: 22000 },
    { date: 'Sun', income: 31000 }, // Absolute Peak
  ];
  
  // Mock Input Data: Stacked structural distributions per day
  const dailyAllocationData: DailyAllocation[] = [
    { date: 'Mon', sovereignty: 50, telemetry: 30, api: 20 },
    { date: 'Tue', sovereignty: 40, telemetry: 40, api: 20 },
    { date: 'Wed', sovereignty: 60, telemetry: 25, api: 15 },
    { date: 'Thu', sovereignty: 35, telemetry: 45, api: 20 },
    { date: 'Fri', sovereignty: 55, telemetry: 25, api: 20 },
  ];

// ==========================================
// HELPER COMPONENT: SCROLL FADE ANIMATOR (STAGGERED)
// ==========================================
interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    fadeIn?: boolean;
    baseDelayMs?: number;
  }
  
  export function Section({ 
    children, 
    fadeIn = false, 
    baseDelayMs = 200, 
    className = '', 
    ...props 
  }: SectionProps) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      if (!fadeIn) {
        setIsIntersecting(true);
        return;
      }
  
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
      );
  
      if (sectionRef.current) observer.observe(sectionRef.current);
      return () => observer.disconnect();
    }, [fadeIn]);
  
    const animationClasses = "transform transition-all duration-1000 ease-out motion-reduce:transition-none motion-reduce:transform-none";
    const visibilityClasses = isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';
  
    let globalIndex = 0;
  
    const renderAndAnimateChildren = (node: React.ReactNode): React.ReactNode => {
      return Children.map(node, (child) => {
        if (!isValidElement<{ style?: React.CSSProperties; className?: string; children?: React.ReactNode }>(child)) {
          return child;
        }
  
        // 1. ONLY bypass the structural grid layout wrapper.
        // Do NOT bypass 'group' cards here—we want the whole card box to fade in!
        if (child.props.className?.includes('grid')) {
          return cloneElement(child, {
            children: renderAndAnimateChildren(child.props.children)
          });
        }
  
        const delay = fadeIn && isIntersecting ? `${globalIndex * baseDelayMs}ms` : '0ms';
        globalIndex++;
  
        // 2. Check if the element has a restrictive transition utility like 'transition-colors'
        const hasSpecificTransition = child.props.className?.includes('transition-') && 
                                     !child.props.className?.includes('transition-all');
  
        return cloneElement(child, {
          style: {
            ...child.props.style,
            transitionDelay: delay,
            // 3. Force 'all' inline to override Tailwind's class-order limits,
            // allowing opacity, transform, and hover shifts to run concurrently.
            ...(hasSpecificTransition ? { transitionProperty: 'all' } : {}),
          },
          className: `${child.props.className || ''} ${fadeIn ? `${animationClasses} ${visibilityClasses}` : ''}`.trim(),
        });
      });
    };
  
    return (
      <section ref={sectionRef} className={`space-y-6 ${className}`} {...props}>
        {renderAndAnimateChildren(children)}
      </section>
    );
  }
  
  // ==========================================
  // CARD 3: DYNAMIC LINE CHART COMPONENT
  // ==========================================
  function DynamicDailyLineChart() {
    const maxIncome = Math.max(...dailyRevenueData.map((d) => d.income));
    
    // Calculate relative SVG coordinate path string based on input array length
    const widthStep = 100 / (dailyRevenueData.length - 1);
    
    // Map points to SVG coordinates (X: 0-100, Y: 10-85 to leave padding for tooltips)
    const points = dailyRevenueData.map((item, index) => {
      const x = index * widthStep;
      const y = 90 - (item.income / maxIncome) * 75; 
      return { x, y, ...item };
    });
  
    // Generate a smooth Cubic Bezier path string from coordinates
    let pathD = `M ${points[0].x} ${points[0].y}`;
    let areaD = `M ${points[0].x} 100 L ${points[0].x} ${points[0].y}`;
  
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      // Control points for smooth bezier interpolation curves
      const cpX1 = p0.x + widthStep / 2;
      const cpY1 = p0.y;
      const cpX2 = p1.x - widthStep / 2;
      const cpY2 = p1.y;
  
      const segment = ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      pathD += segment;
      areaD += segment;
    }
  
    areaD += ` L ${points[points.length - 1].x} 100 Z`;
  
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Performance Metrics</span>
          <h3 className="text-base font-semibold text-white mt-0.5">Daily Ingress Revenue</h3>
          <p className="text-xs text-slate-400 mt-1">Dynamic SVG mapping computing custom arrays from database tracking loops.</p>
        </div>
  
        {/* Chart Canvas */}
        <div className="mt-8 relative w-full h-44">
          {/* Horizontal Guide Rules */}
          <div className="absolute inset-x-0 top-0 border-b border-slate-800/40" />
          <div className="absolute inset-x-0 top-1/4 border-b border-slate-800/40" />
          <div className="absolute inset-x-0 top-2/4 border-b border-slate-800/40" />
          <div className="absolute inset-x-0 top-3/4 border-b border-slate-800/40" />
          <div className="absolute inset-x-0 bottom-0 border-b border-slate-800" />
  
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dynamicCurveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
  
            {/* Area Fill */}
            <path d={areaD} fill="url(#dynamicCurveGradient)" />
  
            {/* Core Stroke Line */}
            <path d={pathD} fill="none" stroke="rgb(129, 140, 248)" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
  
          {/* Dynamic Tooltip Anchor Points mapping array indices to inline style values */}
          {points.map((pt, idx) => (
            <div 
              key={idx}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/node"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border-2 border-indigo-400 hover:bg-cyan-400 hover:scale-125 hover:border-white transition-all cursor-pointer relative z-10">
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover/node:flex flex-col items-center bg-slate-950 border border-slate-800 font-mono text-[9px] px-2 py-0.5 rounded shadow-2xl whitespace-nowrap text-white">
                  <span className="font-bold text-cyan-400">£{(pt.income / 1000).toFixed(1)}k</span>
                  <span className="text-[8px] text-slate-500">{pt.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Axis Labels generated via array map context */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-3 px-1">
          {dailyRevenueData.map((d, i) => <span key={i}>{d.date}</span>)}
        </div>
      </div>
    );
  }
  
  // ==========================================
  // CARD 4: DYNAMIC STACKED BAR COMPONENT
  // ==========================================
  function DynamicDailyStackedBarChart() {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Regional Volumetrics</span>
          <h3 className="text-base font-semibold text-white mt-0.5">Stacked Bar Distribution</h3>
          <p className="text-xs text-slate-400 mt-1">Calculates relative height percentages directly out of structural allocation arrays.</p>
        </div>
  
        {/* Column Matrix Wrapper */}
        <div className="mt-8 flex items-end justify-between h-44 gap-3 px-1 relative">
          {dailyAllocationData.map((item, index) => {
            const totalValue = item.sovereignty + item.telemetry + item.api;
            
            // Compute scale fractions safely out of 100% boundary
            const sovPct = (item.sovereignty / totalValue) * 100;
            const telPct = (item.telemetry / totalValue) * 100;
            const apiPct = (item.api / totalValue) * 100;
  
            return (
              <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex flex-col rounded-t-md overflow-hidden bg-slate-950 border border-slate-900/40 h-full justify-end">
                  {/* Segment A: API Gateway */}
                  <div 
                    className="w-full bg-purple-500 hover:bg-purple-400 transition-colors duration-150" 
                    style={{ height: `${apiPct}%` }}
                    title={`API Gateway: ${item.api}`}
                  />
                  {/* Segment B: Telemetry */}
                  <div 
                    className="w-full bg-indigo-500 hover:bg-indigo-400 transition-colors duration-150" 
                    style={{ height: `${telPct}%` }}
                    title={`Telemetry Stream: ${item.telemetry}`}
                  />
                  {/* Segment C: Sovereignty */}
                  <div 
                    className="w-full bg-cyan-500 hover:bg-cyan-400 transition-colors duration-150" 
                    style={{ height: `${sovPct}%` }}
                    title={`Sovereignty Index: ${item.sovereignty}`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-2 group-hover:text-slate-300">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

export default function TailwindDemoPage() {

    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
      { label: 'Dashboard', href: '#dashboard' },
      { label: 'Analytics', href: '#analytics' },
      { label: 'Telemetry', href: '#telemetry' },
      { label: 'Settings', href: '#settings' },
    ];
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-900 font-sans antialiased">

        {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand/Logo */}
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-cyan-500 shadow-xs shadow-cyan-500/50" />
            <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
              DECOY<span className="text-cyan-400">.UI</span>
            </span>
          </div>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile Burger Menu Button (Hidden on Desktop) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative md:hidden flex h-10 w-10 flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 focus:outline-hidden z-50"
            aria-label="Toggle Navigation Menu"
          >
            {/* Animated Burger Lines */}
            <div className="space-y-1.5 w-5">
              <span 
                className={`block h-0.5 w-5 bg-current transform transition-transform duration-300 ease-in-out ${
                  isOpen ? 'rotate-45 translate-y-2' : ''
                }`} 
              />
              <span 
                className={`block h-0.5 w-5 bg-current transition-opacity duration-300 ease-in-out ${
                  isOpen ? 'opacity-0' : ''
                }`} 
              />
              <span 
                className={`block h-0.5 w-5 bg-current transform transition-transform duration-300 ease-in-out ${
                  isOpen ? '-rotate-45 -translate-y-2' : ''
                }`} 
              />
            </div>
          </button>

        </div>
      </header>

      {/* MOBILE NAVIGATION SLIDE-OUT PANEL */}
      <div 
        className={`fixed inset-0 z-40 md:hidden pointer-events-none transition-all duration-300 ${
          isOpen ? 'pointer-events-auto' : ''
        }`}
      >
        {/* Backdrop Tint overlay */}
        <div 
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sliding Navigation Drawer */}
        <aside 
          className={`absolute right-0 top-0 h-full w-64 border-l border-slate-800 bg-slate-950 p-6 pt-24 shadow-2xl transition-transform duration-300 ease-in-out transform ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-mono text-slate-300 hover:text-cyan-400 border-b border-slate-900 pb-2 transition-colors uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
      
      {/* Header / Hero Section */}
      <header className="relative overflow-hidden border-b border-slate-800 bg-linear-to-b from-slate-900 to-slate-950 px-6 py-16 text-center sm:px-12 sm:py-24">
        {/* Glow effect decorative background element */}
        <div className="absolute top-0 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 ring-1 ring-cyan-400/20 ring-inset mb-4">
            Tailwind v4 + Next.js 16
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-500">
            Tailwind Feature Showcase
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400 max-w-xl mx-auto">
            A utility-first interactive laboratory testing layouts, micro-interactions, responsive design, and component architecture.
          </p>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">

         {/* SECTION 0: TYPOGRAPHY SHOWCASE */}
          <Section className="space-y-6" fadeIn baseDelayMs={200}>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">0. Typography System & Font Scaling</h2>
              <p className="text-sm text-slate-400 mt-1">Demonstrating utility scale configurations, tracking, weights, and leading attributes.</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6 divide-y divide-slate-800/60">
              {/* Sizing Matrix */}
              <div className="space-y-4">
                <span className="text-xs font-mono text-slate-500 block">FONT SIZE MATRIX</span>
                <div className="space-y-2">
                  <p className="text-5xl font-black tracking-tighter text-white">text-5xl tracking-tighter</p>
                  <p className="text-3xl font-extrabold tracking-tight text-slate-200">text-3xl tracking-tight</p>
                  <p className="text-xl font-semibold tracking-normal text-slate-300">text-xl tracking-normal</p>
                  <p className="text-base font-normal text-slate-400 leading-relaxed">text-base leading-relaxed: General fallback system context structure.</p>
                  <p className="text-xs font-medium text-cyan-400 font-mono">text-xs font-mono: system metrics execution output</p>
                </div>
              </div>

              {/* Weight / Type Matrix */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs font-mono text-slate-500 block mb-2">WEIGHT VARIATIONS</span>
                  <p className="font-light text-slate-400 text-sm">font-light text</p>
                  <p className="font-normal text-slate-300 text-sm mt-1">font-normal text</p>
                  <p className="font-medium text-slate-200 text-sm mt-1">font-medium text</p>
                  <p className="font-bold text-white text-sm mt-1">font-bold text</p>
                  <p className="font-black text-white text-sm mt-1">font-black text</p>
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-500 block mb-2">TRACKING (LETTER-SPACING)</span>
                  <p className="tracking-tighter text-sm text-white font-bold">tracking-tighter analytics</p>
                  <p className="tracking-tight text-sm text-white font-bold mt-1">tracking-tight analytics</p>
                  <p className="tracking-normal text-sm text-white font-bold mt-1">tracking-normal analytics</p>
                  <p className="tracking-wide text-sm text-white font-bold mt-1">tracking-wide analytics</p>
                  <p className="tracking-widest text-sm text-cyan-400 font-mono uppercase mt-1">tracking-widest nodes</p>
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-500 block mb-2">FAMILY MONO SAMPLES</span>
                  <p className="font-mono text-xs text-indigo-400 bg-slate-950 px-2 py-1 rounded w-fit border border-slate-900">node-alpha-ingress-ok</p>
                  <p className="font-mono text-[11px] text-slate-400 mt-2 block">0x7FFF5FBFF5D0 stack reference</p>
                </div>
              </div>
            </div>
          </Section>

        <hr className="border-slate-800" />
        
        {/* Section 1: Core Layouts & Grids */}
        <Section className="space-y-6" fadeIn baseDelayMs={200}>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">1. Core Layouts & Responsive Grid</h2>
            <p className="text-sm text-slate-400 mt-1">Testing responsive breakpoints (sm, md, lg, xl) and CSS Grid positioning.</p>
          </div>
          
          
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* Card 1 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xs backdrop-blur-md transition-all hover:border-slate-700">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">01</div>
              <h3 className="text-base font-semibold text-white">Flexbox & Grid</h3>
              <p className="mt-2 text-sm text-slate-400">Effortlessly manage directional flows, alignments, and multi-column systems across viewports.</p>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xs backdrop-blur-md transition-all hover:border-slate-700">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg mb-4">02</div>
              <h3 className="text-base font-semibold text-white">Arbitrary Values</h3>
              <p className="mt-2 text-sm text-slate-400">Need a hyper-specific layout? Escape the design system safely using notations like <code className="text-indigo-300 text-xs bg-slate-950 px-1 py-0.5 rounded">top-[17px]</code>.</p>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xs backdrop-blur-md transition-all hover:border-slate-700">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">03</div>
              <h3 className="text-base font-semibold text-white">Spacing & Sizing</h3>
              <p className="mt-2 text-sm text-slate-400">Strictly proportional padding, margins, gaps, heights, and widths keep visual balance predictable.</p>
            </div>

            {/* Card 4 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xs backdrop-blur-md transition-all hover:border-slate-700">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">04</div>
              <h3 className="text-base font-semibold text-white">Typography</h3>
              <p className="mt-2 text-sm text-slate-400">Control tracking, leading, font weights, and antialiasing features globally or contextually.</p>
            </div>

          </div>

          
        </Section>

        <hr className="border-slate-800" />

  
  {/* Section 2: Interactive States & Transitions */}
        <Section className="space-y-6" fadeIn baseDelayMs={200}>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">2. Interactivity & Micro-Transitions</h2>
            <p className="text-sm text-slate-400 mt-1">Testing pseudo-classes (<code className="text-slate-300">hover</code>, <code className="text-slate-300">focus-within</code>, <code className="text-slate-300">group</code>) paired with hardware-accelerated transitions.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Interactive Button Panel */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between items-start gap-4">
              <span className="text-xs font-mono text-slate-500">PSEUDO-CLASSES & STATES</span>
              <div className="space-y-3 w-full">
                <button className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 active:scale-[0.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500">
                  Interactive Button
                </button>
                <button className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm border border-slate-700 hover:bg-slate-700/70 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden transition-all">
                  Focus Ring Test
                </button>
              </div>
            </div>

            {/* Group Hover Effect */}
            <div className="group relative rounded-xl border border-slate-800 bg-slate-900/30 p-6 overflow-hidden cursor-pointer transition-colors hover:bg-slate-900/70">
              <span className="text-xs font-mono text-slate-500">GROUP HOVER RELATIONSHIPS</span>
              <div className="mt-4 space-y-2">
                <h4 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  Parent Container Hover
                </h4>
                <p className="text-sm text-slate-400">
                  Hovering anywhere inside this card triggers state variations in the child elements below.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300">
                    Discover changes &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* Peer Form Handling */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
              <span className="text-xs font-mono text-slate-500">PEER SIBLING MODIFIERS</span>
              <div className="mt-4 space-y-3">
                <div>
                  <input 
                    type="email" 
                    id="peer-test"
                    placeholder="Enter invalid email..." 
                    className="peer w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden transition-colors invalid:border-pink-500 invalid:text-pink-400"
                    defaultValue="invalid-email-format"
                  />
                  <p className="invisible peer-invalid:visible mt-1.5 text-xs text-pink-500 font-medium">
                    Please specify a valid email syntax.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <hr className="border-slate-800" />

        {/* Section 3: Gradients, Filters, Effects */}
        <Section className="space-y-6" fadeIn baseDelayMs={200}>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">3. Advanced Visuals & Effects</h2>
            <p className="text-sm text-slate-400 mt-1">Evaluating new Tailwind v4 linear gradient paths, backdrops, transitions, and clip matching.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Native Gradients */}
            <div className="h-40 rounded-xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 flex flex-col justify-end shadow-lg shadow-indigo-500/10">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">Linear Gradient</span>
              <span className="text-lg font-bold text-white">to-br syntax</span>
            </div>

            {/* Combined Filters and Blur */}
            <div className="relative h-40 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-radial from-cyan-500/30 via-transparent to-transparent animate-pulse" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-900/40 backdrop-blur-md border-t border-white/10 p-4 flex items-center justify-between w-full">
                <span className="text-xs font-mono text-slate-300">Backdrop Blur Matrix</span>
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>

            {/* Complex Shadows and Transformations */}
            <div className="h-40 rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 cursor-pointer">
              <span className="text-xs font-mono text-slate-500">TRANSFORM & TRANSLATE</span>
              <p className="text-sm text-slate-300">Subtle scale shifts combined with dynamic shadow casting over modern UI wrappers.</p>
            </div>
          </div>
        </Section>

        <hr className="border-slate-800" />

        {/* Section 4: Complex Layout Pattern (Data Table / Status Monitoring) */}
        <Section className="space-y-6" fadeIn baseDelayMs={200}>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">4. Complex Component Composition</h2>
            <p className="text-sm text-slate-400 mt-1">Simulating practical systems architecture components leveraging flex layouts, alignments, and specific states.</p>
          </div>

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
                    <th className="px-6 py-3">Cluster Node</th>
                    <th className="px-6 py-3">Environment Zone</th>
                    <th className="px-6 py-3">Performance Index</th>
                    <th className="px-6 py-3 text-right">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-white text-xs font-semibold">node-alpha-us-east</td>
                    <td className="px-6 py-4">Production-Main</td>
                    <td className="px-6 py-4">
                      <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-cyan-500 h-1.5 rounded-full w-[94%]" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">Online</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-white text-xs font-semibold">node-beta-eu-west</td>
                    <td className="px-6 py-4">Staging-Fallback</td>
                    <td className="px-6 py-4">
                      <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-cyan-500 h-1.5 rounded-full w-[42%]" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20">Throttled</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-white text-xs font-semibold">node-gamma-ap-south</td>
                    <td className="px-6 py-4">Legacy-Archive</td>
                    <td className="px-6 py-4">
                      <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-slate-700 h-1.5 rounded-full w-0" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-700">Offline</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <hr className="border-slate-800" />

        {/* Section 5: Complex Forms & Toggle Interaction */}
        <Section className="space-y-6" fadeIn baseDelayMs={200}>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">5. Custom Forms & Switch States</h2>
            <p className="text-sm text-slate-400 mt-1">Testing layout transitions, focus rings, and conditional styling driven by native HTML selectors.</p>
          </div>

          <div className="max-w-xl rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-6">
            {/* Custom Checkbox Group */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input 
                  type="checkbox" 
                  className="peer h-5 w-5 appearance-none rounded-md border border-slate-700 bg-slate-950 checked:bg-cyan-500 checked:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
                {/* Custom checkmark icon shown only when input is checked */}
                <svg className="absolute h-3 w-3 text-slate-950 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Enable Advanced Telemetry</span>
                <p className="text-xs text-slate-400 mt-0.5">Aggregates system exceptions and distribution layout metrics automatically.</p>
              </div>
            </label>

            {/* Custom Toggle Switch */}
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
        </Section>

        <hr className="border-slate-800" />

        {/* Section 6: Dynamic Metric Activity Feeds */}
        <Section className="space-y-6" fadeIn baseDelayMs={200}>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">6. Vertical Timeline Pattern</h2>
            <p className="text-sm text-slate-400 mt-1">Utilizes absolute positioning bounds alongside precise border alignment structures.</p>
          </div>

          <div className="relative border-l border-slate-800 ml-3 space-y-8 py-2">
            {/* Timeline Item 1 */}
            <div className="relative pl-8 group">
              {/* Timeline Indicator Indicator Pin */}
              <div className="absolute -left-[6px] top-1.5 h-3 w-3 rounded-full border border-slate-900 bg-slate-700 group-hover:bg-cyan-400 group-hover:ring-4 group-hover:ring-cyan-500/20 transition-all" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-slate-500">Just now</span>
                <h4 className="text-sm font-semibold text-white">Deploy Hook Executed</h4>
                <p className="text-xs text-slate-400 max-w-md">Vercel pipelines synchronized branch changes inside <code className="text-slate-300 font-mono text-[11px] bg-slate-950 px-1 py-0.5 rounded">origin/main</code> production targets.</p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative pl-8 group">
              <div className="absolute -left-[6px] top-1.5 h-3 w-3 rounded-full border border-slate-900 bg-slate-700 group-hover:bg-amber-400 group-hover:ring-4 group-hover:ring-amber-500/20 transition-all" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-slate-500">42 minutes ago</span>
                <h4 className="text-sm font-semibold text-amber-400">Database Optimization Required</h4>
                <p className="text-xs text-slate-400 max-w-md">Query indices exceeded planned lookup budgets across localized production shards.</p>
              </div>
            </div>
          </div>
        </Section>

        <hr className="border-slate-800" />

        {/* Section 7: Card Overlay Graphics */}
        <Section className="space-y-6" fadeIn baseDelayMs={200}>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">7. Graphic Overlay Cards</h2>
            <p className="text-sm text-slate-400 mt-1">Demonstrates parent aspect-ratio tracking, flex layout layering, and mixed blend filters.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Visual Callout Card */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between group">
              {/* Complex background lighting grid */}
              <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_100%)] opacity-40 group-hover:opacity-60 transition-opacity" />
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-sm border border-cyan-500/20">Active Session</span>
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Isolated Workspaces</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Spin up ephemeral sandbox states complete with virtual micro-engines instantaneously.</p>
              </div>
            </div>

            {/* Accent Visual Card */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between group">
              <div className="absolute inset-0 -z-10 bg-radial from-purple-500/10 via-transparent to-transparent opacity-50 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-sm border border-purple-500/20">Security Layer</span>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">End-to-End Keys</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Data payloads are signed via local hardware cryptographic chains prior to ingress execution.</p>
              </div>
            </div>
          </div>
        </Section>

        <hr className="border-slate-800" />

{/* Section 8: Quad-Grid Analytics Dashboard */}
<Section className="space-y-6" fadeIn baseDelayMs={200}>
  <div>
    <h2 className="text-2xl font-bold tracking-tight text-white">8. Quad-Grid Analytics Dashboard</h2>
    <p className="text-sm text-slate-400 mt-1">A highly structured 2x2 layout matrix evaluating pure CSS layouts, SVG vector coordinate streams, and component tracking loops.</p>
  </div>

  {/* 2x2 Dashboard Matrix Grid */}
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    
    {/* CARD 1 [TOP-LEFT]: Node Activity Density Heatmap */}
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between">
      <div>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Cron Execution Logs</span>
        <h3 className="text-base font-semibold text-white mt-0.5">Node Activity Density</h3>
        <p className="text-xs text-slate-400 mt-1">Grid matrix array mapping scheduling loops and pipeline load spikes.</p>
      </div>

      <div className="my-auto pt-6">
        <div className="grid grid-cols-7 gap-1.5 w-fit mx-auto">
          {/* Row 1 */}
          <div className="h-3.5 w-3.5 rounded-xs bg-slate-950 border border-slate-900/50" title="0 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-950/40 border border-cyan-950/60" title="2 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-900/60 border border-cyan-900/40" title="5 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-950/40 border border-cyan-950/60" title="1 job" />
          <div className="h-3.5 w-3.5 rounded-xs bg-slate-950 border border-slate-900/50" title="0 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-700" title="14 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-500 animate-pulse" title="24 jobs (Peak)" />
          
          {/* Row 2 */}
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-900/60 border border-cyan-900/40" title="6 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-600" title="18 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-700" title="12 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-900/60 border border-cyan-900/40" title="4 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-600" title="19 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-950/40 border border-cyan-950/60" title="1 job" />
          <div className="h-3.5 w-3.5 rounded-xs bg-slate-950 border border-slate-900/50" title="0 jobs" />

          {/* Row 3 */}
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-950/40 border border-cyan-950/60" title="2 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-slate-950 border border-slate-900/50" title="0 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-600" title="16 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-500" title="22 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-700" title="15 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-900/60 border border-cyan-900/40" title="8 jobs" />
          <div className="h-3.5 w-3.5 rounded-xs bg-cyan-950/40 border border-cyan-950/60" title="3 jobs" />
        </div>
        
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-4 max-w-[140px] mx-auto">
          <span>Less</span>
          <div className="flex gap-0.5">
            <span className="h-2 w-2 rounded-xs bg-slate-950 border border-slate-900" />
            <span className="h-2 w-2 rounded-xs bg-cyan-900/60" />
            <span className="h-2 w-2 rounded-xs bg-cyan-700" />
            <span className="h-2 w-2 rounded-xs bg-cyan-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>

    {/* CARD 2 [TOP-RIGHT]: Metrics Inventory (Horizontal Allocator) */}
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between">
      <div>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Resource Apportionment</span>
        <h3 className="text-base font-semibold text-white mt-0.5">Metrics Inventory</h3>
        <p className="text-xs text-slate-400 mt-1">Single-track composite visualization analyzing distribution layers.</p>
      </div>

      <div className="space-y-5 my-auto pt-6">
        <div className="h-8 w-full bg-slate-950 rounded-lg overflow-hidden flex p-1 border border-slate-800">
          <div className="h-full bg-cyan-500 rounded-l-md flex items-center justify-center min-w-4 text-[10px] font-bold text-slate-950" style={{ width: '55%' }}>55%</div>
          <div className="h-full bg-indigo-500 flex items-center justify-center min-w-4 text-[10px] font-bold text-white" style={{ width: '25%' }}>25%</div>
          <div className="h-full bg-purple-500 flex items-center justify-center min-w-4 text-[10px] font-bold text-white" style={{ width: '12%' }}>12%</div>
          <div className="h-full bg-slate-800 rounded-r-md flex items-center justify-center min-w-2 text-[9px] font-medium text-slate-500" style={{ width: '8%' }}>8%</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-slate-300"><span className="h-2 w-2 rounded-xs bg-cyan-500" /> Sovereignty (55%)</div>
          <div className="flex items-center gap-2 text-slate-300"><span className="h-2 w-2 rounded-xs bg-indigo-500" /> Telemetry (25%)</div>
          <div className="flex items-center gap-2 text-slate-300"><span className="h-2 w-2 rounded-xs bg-purple-500" /> API Gateway (12%)</div>
          <div className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-xs bg-slate-800" /> Unallocated (8%)</div>
        </div>
      </div>
    </div>

    {/* CARD 3 [BOTTOM-LEFT]: Multi-Point Smooth Curved Trend Line Chart */}
<div>
  <DynamicDailyLineChart />
</div>

{/* CARD 4 [BOTTOM-RIGHT]: Vertical Stacked Bar Graph */}
<div>
  <DynamicDailyStackedBarChart />
</div>

  </div>
</Section>

      </main>

      {/* Footer Element */}
      <footer className="mt-24 border-t border-slate-800 py-8 text-center text-xs text-slate-500 font-mono">
        decoy-ui sandbox • configured via Next.js + Tailwind CSS
      </footer>
    </div>
  );
}