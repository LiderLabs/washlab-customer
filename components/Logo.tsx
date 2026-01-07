"use client"

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <Image 
        src="/assets/washlab-logo.png" 
        alt="WashLab - Life made simple" 
        className={cn(sizeClasses[size], 'w-auto')}
        height={size === 'sm' ? 32 : size === 'md' ? 40 : 56}
        width={size === 'sm' ? 120 : size === 'md' ? 150 : 200}
      />
    </div>
  );
};

