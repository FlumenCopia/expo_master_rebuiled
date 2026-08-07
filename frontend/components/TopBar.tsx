'use client';

import React from 'react';
import Link from 'next/link';

interface TopBarProps {
  logo1Path?: string;
  logo2Path?: string;
  contactHref?: string;
  variant?: 'solid' | 'absolute' | 'transparent';
  className?: string;
}

export default function TopBar({
  logo1Path = '/assets/logo/logo.png',
  logo2Path = '/assets/logo/1.png',
  contactHref = '/#cnct',
  variant = 'solid',
  className = '',
}: TopBarProps) {
  const getHeaderClass = () => {
    let base = 'header w-full transition-all duration-300';
    if (variant === 'solid') {
      base += ' visitor-header bg-[#00252e] relative py-3 px-4 md:px-8';
    } else if (variant === 'absolute') {
      base += ' absolute top-[30px] left-0 right-0 z-10 py-3 px-4 md:px-8';
    } else {
      base += ' bg-transparent relative py-3 px-4 md:px-8';
    }
    return `${base} ${className}`.trim();
  };

  return (
    <header className={getHeaderClass()}>
      <div className="hdr-cont container mx-auto">
        <div className="header-conts flex items-center justify-between">
          {/* Logos on the Left */}
          <div className="hdr-logos flex items-center gap-4 md:gap-8">
            <Link href="/" className="inline-block flex-shrink-0">
              {/* eslint-disable-next-html-element-for-jsx */}
              <img
                src={logo1Path}
                alt="Masters Expo Logo"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </Link>
            {logo2Path && (
              <img
                src={logo2Path}
                alt="Partner Logo"
                className="h-10 md:h-12 w-auto object-contain"
              />
            )}
          </div>

          {/* Contact Button on the Right */}
          <div className="pg-cnt-btn">
            <Link href={contactHref}>
              <div className="ind-cnct-btn">
                <p className="px-6 py-2 bg-gradient-to-r from-[#7fee00] to-[#95c841] text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm md:text-base cursor-pointer m-0">
                  Contact
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
