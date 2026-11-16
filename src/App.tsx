import { useCallback, useEffect, useState } from 'react';
import { api } from './lib/api';
import type {
  AdminBootstrapPayload,
  AuthStatusPayload,
  PublicBootstrapPayload,
} from './types/portfolio';
import { FeedbackProvider, useFeedback } from './components/ToastProvider';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/AdminLayout';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { LecturesPage } from './pages/public/LecturesPage';
import { LectureDetailPage } from './pages/public/LectureDetailPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { ContactPage } from './pages/public/ContactPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { AdminLecturesPage } from './pages/admin/AdminLecturesPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminHomeSettingsPage } from './pages/admin/AdminHomeSettingsPage';
import { AdminContentsPage } from './pages/admin/AdminContentsPage';

function PortfolioRouterApp() {
  const { showToast } = useFeedback();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');
  const [publicData, setPublicData] = useState<PublicBootstrapPayload | null>(null);
  const [adminData, setAdminData] = useState<AdminBootstrapPayload | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatusPayload>({
    authenticated: false,
    hasAdmin: true,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useCallback((to: string) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
    }
    setCurrentPath(to);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setError(null);
      const [pub, auth] = await Promise.all([
        api.getPublicBootstrap(),
        api.getAuthStatus(),
      ]);
      setPublicData(pub);
      setAuthStatus(auth);
      if (auth.authenticated) {
        const adm = await api.getAdminBootstrap();
        setAdminData(adm);
      } else {
        setAdminData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleLogout = async () => {
    try {
      await api.logout();
      setAuthStatus((prev) => ({ ...prev, authenticated: false, user: null }));
      setAdminData(null);
      showToast('로그아웃되었습니다.');
      navigate('/');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '로그아웃 실패', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center p-6">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-[#2E5A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#5B564D]">포트폴리오 데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error || !publicData) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-6 bg-white border border-[#E4DDD0] rounded-2xl text-center space-y-4">
          <h1 className="font-display text-lg text-[#1E2E21]">페이지를 불러올 수 없습니다</h1>
          <p className="text-sm text-neutral-600">{error || '서버와 연결하지 못했습니다.'}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadAll();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2D4F38] rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // Admin Route Handling
  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin/');
  if (isAdminRoute) {
    if (!authStatus.authenticated || currentPath === '/admin/login') {
      if (authStatus.authenticated && currentPath === '/admin/login' && adminData) {
        return (
          <AdminLayout
            currentPath="/admin"
            onNavigate={navigate}
            user={authStatus.user}
            onLogout={handleLogout}
          >
            <AdminDashboardPage data={adminData} onRefresh={loadAll} onNavigate={navigate} />
          </AdminLayout>
        );
      }
      return (
        <AdminLoginPage
          hasAdmin={authStatus.hasAdmin}
          onAuthenticated={loadAll}
          onNavigate={navigate}
        />
      );
    }

    if (!adminData) {
      return (
        <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center">
          <p className="text-sm text-neutral-500">관리자 데이터를 불러오는 중입니다...</p>
        </div>
      );
    }

    const renderAdminPage = () => {
      switch (currentPath) {
        case '/admin':
          return (
            <AdminDashboardPage data={adminData} onRefresh={loadAll} onNavigate={navigate} />
          );
        case '/admin/profile':
          return (
            <AdminProfilePage
              key={adminData.profile.updatedAt}
              initialProfile={adminData.profile}
              onRefresh={loadAll}
            />
          );
        case '/admin/lectures':
          return (
            <AdminLecturesPage
              lectures={adminData.lectures}
              categories={adminData.categories}
              onRefresh={loadAll}
            />
          );
        case '/admin/projects':
          return (
            <AdminProjectsPage
              projects={adminData.projects}
              categories={adminData.categories}
              onRefresh={loadAll}
            />
          );
        case '/admin/home':
          return (
            <AdminHomeSettingsPage
              key={adminData.siteSettings.updatedAt}
              initialSettings={adminData.siteSettings}
              lectures={adminData.lectures}
              projects={adminData.projects}
              onRefresh={loadAll}
            />
          );
        case '/admin/contents':
          return (
            <AdminContentsPage
              lectures={adminData.lectures}
              projects={adminData.projects}
              categories={adminData.categories}
              onRefresh={loadAll}
              onNavigate={navigate}
            />
          );
        default:
          return (
            <AdminDashboardPage data={adminData} onRefresh={loadAll} onNavigate={navigate} />
          );
      }
    };

    return (
      <AdminLayout
        currentPath={currentPath}
        onNavigate={navigate}
        user={authStatus.user}
        onLogout={handleLogout}
      >
        {renderAdminPage()}
      </AdminLayout>
    );
  }

  // Public Route Handling
  const renderPublicPage = () => {
    if (currentPath === '/') {
      return (
        <HomePage
          profile={publicData.profile}
          siteSettings={publicData.siteSettings}
          lectures={publicData.lectures}
          projects={publicData.projects}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath === '/about') {
      return (
        <AboutPage
          profile={publicData.profile}
          characterImage={publicData.siteSettings.characterImage}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath === '/lectures') {
      return (
        <LecturesPage
          lectures={publicData.lectures}
          categories={publicData.categories}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath.startsWith('/lectures/')) {
      const id = decodeURIComponent(currentPath.slice('/lectures/'.length));
      const lecture = publicData.lectures.find((l) => l.id === id);
      return <LectureDetailPage lecture={lecture} onNavigate={navigate} />;
    }
    if (currentPath === '/projects') {
      return (
        <ProjectsPage
          projects={publicData.projects}
          categories={publicData.categories}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath.startsWith('/projects/')) {
      const id = decodeURIComponent(currentPath.slice('/projects/'.length));
      const project = publicData.projects.find((p) => p.id === id);
      return <ProjectDetailPage project={project} onNavigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return (
        <ContactPage
          profile={publicData.profile}
          characterImage={publicData.siteSettings.characterImage}
        />
      );
    }

    return (
      <HomePage
        profile={publicData.profile}
        siteSettings={publicData.siteSettings}
        lectures={publicData.lectures}
        projects={publicData.projects}
        onNavigate={navigate}
      />
    );
  };

  return (
    <PublicLayout
      currentPath={currentPath}
      onNavigate={navigate}
      profile={publicData.profile}
      characterImage={publicData.siteSettings.characterImage}
    >
      {renderPublicPage()}
    </PublicLayout>
  );
}

export default function App() {
  return (
    <FeedbackProvider>
      <PortfolioRouterApp />
    </FeedbackProvider>
  );
}
