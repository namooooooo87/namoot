import React, { useState } from 'react';
import { Menu, Trees, X } from 'lucide-react';
import type { InstructorProfile } from '../types/portfolio';
import { resolveAssetUrl } from '../lib/assetUrl';

interface PublicLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  profile: InstructorProfile;
  characterImage?: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: '강사 소개', path: '/about' },
  { label: '강의 경력', path: '/lectures' },
  { label: '프로젝트', path: '/projects' },
  { label: '문의하기', path: '/contact' },
];

export function PublicLayout({
  currentPath,
  onNavigate,
  profile,
  characterImage,
  children,
}: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#242B22]">
      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-sm border-b border-[#E4DDD0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="inline-flex items-center gap-2 text-lg sm:text-xl font-display text-[#2E5A3E] hover:text-[#7A5638] transition-colors whitespace-nowrap shrink-0 text-left"
          >
            <Trees className="w-5 h-5 text-[#2E5A3E] shrink-0" />
            <span>{profile.name}</span>
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="주요 메뉴"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5B564D]"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                  isActive(item.path)
                    ? 'text-[#2E5A3E] font-semibold'
                    : 'text-[#5B564D] hover:text-[#242B22]'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-[#7A5638]" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNav('/admin')}
              className="hidden md:inline-flex items-center px-4 py-2 text-xs font-medium text-[#2E5A3E] bg-white border border-[#D4CBB8] rounded-xl hover:border-[#2E5A3E] hover:bg-[#EBF2EC] transition-colors whitespace-nowrap shrink-0"
            >
              관리자
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#5B564D] hover:text-[#242B22] rounded-xl"
              aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E4DDD0] bg-[#FAF7F0] px-4 py-4 space-y-1">
            <button
              type="button"
              onClick={() => handleNav('/')}
              className={`w-full text-left px-3 py-3 text-sm font-medium rounded-xl ${
                currentPath === '/' ? 'bg-[#EBF2EC] text-[#2E5A3E] font-semibold' : 'text-[#5B564D]'
              }`}
            >
              홈
            </button>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`w-full text-left px-3 py-3 text-sm font-medium rounded-xl ${
                  isActive(item.path) ? 'bg-[#EBF2EC] text-[#2E5A3E] font-semibold' : 'text-[#5B564D]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#E4DDD0] mt-2">
              <button
                type="button"
                onClick={() => handleNav('/admin')}
                className="w-full text-left px-3 py-3 text-sm font-medium text-[#2E5A3E] rounded-xl hover:bg-[#EBF2EC]"
              >
                관리자 페이지
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Warm Tree-Inspired Footer */}
      <footer className="border-t border-[#E4DDD0] bg-[#F3ECE1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {characterImage && (
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#D4CBB8] overflow-hidden shrink-0">
                <img
                  src={resolveAssetUrl(characterImage)}
                  alt="나무쌤 캐릭터"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain scale-[1.45]"
                />
              </div>
            )}
            <div className="space-y-1">
              <p className="text-base font-display text-[#2E5A3E]">{profile.name}</p>
              <p className="text-xs text-[#7A5638]">
                {profile.activityName || '청소년 교육 전문가 포트폴리오'}
                {profile.contact.email ? ` · ${profile.contact.email}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#5B564D]">
            <button
              type="button"
              onClick={() => handleNav('/about')}
              className="hover:text-[#2E5A3E] transition-colors whitespace-nowrap"
            >
              강사 소개
            </button>
            <button
              type="button"
              onClick={() => handleNav('/lectures')}
              className="hover:text-[#2E5A3E] transition-colors whitespace-nowrap"
            >
              강의 경력
            </button>
            <button
              type="button"
              onClick={() => handleNav('/projects')}
              className="hover:text-[#2E5A3E] transition-colors whitespace-nowrap"
            >
              프로젝트 아카이브
            </button>
            <button
              type="button"
              onClick={() => handleNav('/contact')}
              className="hover:text-[#2E5A3E] transition-colors whitespace-nowrap"
            >
              강의·협업 문의
            </button>
            <button
              type="button"
              onClick={() => handleNav('/admin')}
              className="text-[#2E5A3E] font-medium hover:underline whitespace-nowrap"
            >
              관리자 로그인
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
