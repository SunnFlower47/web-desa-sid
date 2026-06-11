import React from 'react';

export default function SectionTitle({ title, subtitle, centered = false }) {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
      {subtitle && (
        <span className="inline-block py-1 px-3 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold tracking-widest uppercase mb-3 border border-emerald-100">
          {subtitle}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
        {title}
      </h2>
      <div className={`h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full mt-4 ${centered ? 'mx-auto w-24' : 'w-24'}`} />
    </div>
  );
}
