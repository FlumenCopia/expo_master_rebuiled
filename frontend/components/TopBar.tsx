'use client';

import React from 'react';
import Link from 'next/link';
import './TopBar.css';

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
  const variantClass = variant === 'solid' ? 'visitor-header topbar-solid' : variant === 'absolute' ? 'topbar-absolute' : 'topbar-transparent';

  return (
    <header className={`header topbar-header ${variantClass} ${className}`.trim()}>
      <div className="hdr-cont container mx-auto">
        <div className="header-conts flex items-center justify-between">
          {/* Logos on the Left */}
          <div className="hdr-logos flex items-center gap-4 md:gap-8">
            <Link href="/" className="inline-block flex-shrink-0">
              {/* eslint-disable-next-html-element-for-jsx */}
              <img
                src={logo1Path}
                alt="Masters Expo Logo"
                className="h-12 md:h-16 w-auto object-contain"
              />
            </Link>
            {logo2Path && (
              <img
                src={logo2Path}
                alt="Partner Logo"
                className="h-12 md:h-16 w-auto object-contain"
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
