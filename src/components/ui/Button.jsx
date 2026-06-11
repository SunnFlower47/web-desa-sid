'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import Link from 'next/link';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon = null,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  href = null,
  ...props 
}) {
  const baseStyles = "relative font-bold inline-flex items-center justify-center gap-2.5 transition-all overflow-hidden cursor-pointer";
  
  const variants = {
    primary: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/40",
    secondary: "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800",
    danger: "bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600",
    ghost: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    outline: "border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50",
  };

  const sizes = {
    sm: "h-10 px-5 text-xs rounded-xl",
    md: "h-12 px-6 text-sm rounded-2xl",
    lg: "h-14 px-8 text-base rounded-2xl",
  };

  const isDisabled = disabled || isLoading;

  const content = (
    <>
      {/* Shine effect for primary/secondary */}
      {(variant === 'primary' || variant === 'secondary' || variant === 'danger') && (
        <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}
      
      {isLoading && <Loader2 className="animate-spin" size={size === 'sm' ? 16 : 20} />}
      
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      <span>{children}</span>
      
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </>
  );

  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClasses} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      className={buttonClasses}
      {...props}
    >
      {content}
    </motion.button>
  );
}
