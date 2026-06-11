'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function PageHeader({ title, description, breadcrumbs, action, className = "", containerClassName = "max-w-6xl px-6" }) {
  return (
    <div className={`relative pt-40 md:pt-48 pb-16 overflow-hidden ${className}`}>
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white/0 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-teal-400/10 rounded-full blur-[80px] pointer-events-none" />

      <div className={`container mx-auto relative z-10 ${containerClassName}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-semibold mb-6 flex-wrap">
              <Link href="/" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                <Home size={14} />
                <span>Beranda</span>
              </Link>
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight size={14} className="text-slate-400" />
                  {bc.href ? (
                    <Link href={bc.href} className="text-emerald-600 hover:text-emerald-700 transition-colors">
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="text-slate-500">{bc.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                {title}
              </h1>
              
              {/* Description */}
              {description && (
                <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            
            {/* Action */}
            {action && (
              <div className="shrink-0 mb-2">
                {action}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
