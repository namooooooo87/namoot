import React, { useState } from 'react';
import {
  LayoutDashboard,
  UserCircle,
  BookOpen,
  FolderKanban,
  Home,
  Layers,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import type { AuthStatusPayload } from '../types/portfolio';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: AuthStatusPayload['user'];
  onLogout: () => Promise<void>;
  children: React.ReactNode;
}

const ADMIN_NAV = [
  { label: '대시보드', path: '/admin', icon: LayoutDashboard },
  { label: '강사 정보 관리', path: '/admin/profile', icon: UserCircle },
  { label: '강의 경력 관리', path: '/admin/lectures', icon: BookOpen },
  { label: '프로젝트 관리', path: '/admin/projects', icon: FolderKanban },
  { label: '메인 페이지 관리', path: '/admin/home', icon: Home },
  { label: '콘텐츠 통합 관리', path: '/admin/contents', icon: Layers },
];

export function AdminLayout({
  currentPath,
  onNavigate,
  user,
  onLogout,
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentItem =
    ADMIN_NAV.find((item) => item.path === currentPath) || ADMIN_NAV[0];

  const handleNav = (path: string) => {
    setSidebarOpen(false);
    onNavigate(path);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1D241E] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E3DDD3] flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 border-b border-[#E3DDD3] flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNav('/admin')}
            className="text-sm font-bold text-[#1D241E] tracking-tight whitespace-nowrap"
          >
            포트폴리오 관리자
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-neutral-500 hover:text-[#1D241E]"
            aria-label="사이드바 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="관리자 메뉴">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#2D4F38] text-white'
                    : 'text-neutral-700 hover:bg-[#F4F1EA] hover:text-[#1D241E]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E3DDD3] space-y-3">
          {user && (
            <div className="px-1">
              <p className="text-xs font-semibold text-[#1D241E] truncate">{user.name}</p>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#1D241E] bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg hover:border-[#2D4F38] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              공개 페이지 보기
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E3DDD3] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-neutral-700 hover:text-[#1D241E]"
              aria-label="관리자 메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-neutral-400 hidden sm:inline">Admin</span>
              <span className="text-neutral-300 hidden sm:inline">/</span>
              <span className="font-semibold text-[#1D241E] truncate">{currentItem.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2D4F38] bg-[#FAF8F4] border border-[#E3DDD3] rounded-md hover:border-[#2D4F38] transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">사이트 미리보기</span>
              <span className="sm:hidden">사이트</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
