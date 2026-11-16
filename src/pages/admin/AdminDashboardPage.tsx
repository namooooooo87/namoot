import { ArrowRight, CheckCircle2, Mail, Plus, Trash2 } from 'lucide-react';
import type { AdminBootstrapPayload } from '../../types/portfolio';
import { api } from '../../lib/api';
import { useFeedback } from '../../components/ToastProvider';

interface AdminDashboardPageProps {
  data: AdminBootstrapPayload;
  onRefresh: () => Promise<void>;
  onNavigate: (path: string) => void;
}

export function AdminDashboardPage({
  data,
  onRefresh,
  onNavigate,
}: AdminDashboardPageProps) {
  const { showToast, confirm } = useFeedback();

  const totalLectures = data.lectures.length;
  const totalProjects = data.projects.length;
  const publishedCount =
    data.lectures.filter((l) => l.isPublished).length +
    data.projects.filter((p) => p.isPublished).length;
  const draftCount = totalLectures + totalProjects - publishedCount;
  const unreadInquiries = data.inquiries.filter((i) => i.status === 'unread').length;

  const recentActivities = [
    ...data.lectures.map((l) => ({
      id: l.id,
      type: '강의 경력' as const,
      title: l.title,
      category: l.field,
      isPublished: l.isPublished,
      isSample: l.isSample,
      updatedAt: l.updatedAt,
      editPath: '/admin/lectures',
    })),
    ...data.projects.map((p) => ({
      id: p.id,
      type: '프로젝트' as const,
      title: p.title,
      category: p.category,
      isPublished: p.isPublished,
      isSample: p.isSample,
      updatedAt: p.updatedAt,
      editPath: '/admin/projects',
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const handleToggleInquiry = async (id: string, current: 'unread' | 'reviewed') => {
    try {
      await api.updateInquiryStatus(id, current === 'unread' ? 'reviewed' : 'unread');
      await onRefresh();
      showToast('문의 상태가 변경되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '상태 변경 실패', 'error');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    const ok = await confirm({
      title: '문의 내역 삭제',
      description: '이 문의 내역을 영구적으로 삭제하시겠습니까?',
      confirmLabel: '삭제',
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.deleteInquiry(id);
      await onRefresh();
      showToast('문의 내역이 삭제되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '삭제 실패', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D241E]">대시보드</h1>
          <p className="mt-1 text-sm text-neutral-500">
            포트폴리오 콘텐츠 현황과 최근 활동, 수신된 문의를 한눈에 확인합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/admin/lectures')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#2D4F38] rounded-lg hover:bg-[#213B2A] transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            신규 강의 등록
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/admin/projects')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1D241E] bg-white border border-[#E3DDD3] rounded-lg hover:border-[#2D4F38] transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            신규 프로젝트 등록
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#E3DDD3] rounded-xl">
          <p className="text-xs text-neutral-500">전체 강의 경력</p>
          <p className="mt-2 text-2xl font-bold text-[#1D241E] tabular-nums">{totalLectures}건</p>
        </div>
        <div className="p-5 bg-white border border-[#E3DDD3] rounded-xl">
          <p className="text-xs text-neutral-500">전체 프로젝트</p>
          <p className="mt-2 text-2xl font-bold text-[#1D241E] tabular-nums">{totalProjects}건</p>
        </div>
        <div className="p-5 bg-white border border-[#E3DDD3] rounded-xl">
          <p className="text-xs text-neutral-500">공개 / 비공개 콘텐츠</p>
          <p className="mt-2 text-2xl font-bold text-[#1D241E] tabular-nums">
            {publishedCount} <span className="text-sm font-normal text-neutral-400">/ {draftCount}</span>
          </p>
        </div>
        <div className="p-5 bg-white border border-[#E3DDD3] rounded-xl">
          <p className="text-xs text-neutral-500">미확인 문의</p>
          <p className="mt-2 text-2xl font-bold text-[#2D4F38] tabular-nums">{unreadInquiries}건</p>
        </div>
      </div>

      {/* Quick Links & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-[#E3DDD3] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E3DDD3] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1D241E]">최근 등록 및 수정 활동</h2>
            <button
              type="button"
              onClick={() => onNavigate('/admin/contents')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#2D4F38] hover:underline"
            >
              전체 콘텐츠 관리
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">등록된 활동이 없습니다.</div>
          ) : (
            <div className="divide-y divide-[#E3DDD3]">
              {recentActivities.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#FAF8F4]"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                      <span className="font-semibold text-[#2D4F38]">{item.type}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={item.isPublished ? 'text-[#2D4F38]' : 'text-[#D97706]'}>
                        {item.isPublished ? '공개' : '비공개'}
                      </span>
                      {item.isSample && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-neutral-400">초기 샘플</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#1D241E] truncate">{item.title}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-neutral-400 tabular-nums hidden sm:inline">
                      {new Date(item.updatedAt).toLocaleDateString('ko-KR')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.editPath)}
                      className="text-xs font-medium text-[#2D4F38] hover:underline whitespace-nowrap"
                    >
                      관리
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-white border border-[#E3DDD3] rounded-xl space-y-3">
            <h2 className="text-sm font-bold text-[#1D241E]">콘텐츠 관리 바로가기</h2>
            <div className="space-y-2">
              {[
                { label: '강사 프로필 · 학력 · 자격증', path: '/admin/profile' },
                { label: '강의 경력 등록 · 수정', path: '/admin/lectures' },
                { label: '프로젝트 아카이브 관리', path: '/admin/projects' },
                { label: '메인 화면 문구 · 순서 편집', path: '/admin/home' },
                { label: '카테고리 및 통합 필터 관리', path: '/admin/contents' },
              ].map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => onNavigate(link.path)}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-[#1D241E] bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg hover:border-[#2D4F38] flex items-center justify-between transition-colors"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries Section */}
      <div className="bg-white border border-[#E3DDD3] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E3DDD3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#2D4F38]" />
            <h2 className="text-sm font-bold text-[#1D241E]">수신된 강의 및 협업 문의</h2>
          </div>
          <span className="text-xs text-neutral-500 tabular-nums">총 {data.inquiries.length}건</span>
        </div>

        {data.inquiries.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            아직 접수된 온라인 문의가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-[#E3DDD3]">
            {data.inquiries.map((inq) => (
              <div key={inq.id} className="p-5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span
                      className={`font-semibold ${
                        inq.status === 'unread' ? 'text-[#2D4F38]' : 'text-neutral-500'
                      }`}
                    >
                      {inq.status === 'unread' ? '신규 문의' : '확인 완료'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#1D241E]">{inq.name}</span>
                    {inq.organization && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{inq.organization}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{inq.email}</span>
                    {inq.phone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{inq.phone}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {new Date(inq.createdAt).toLocaleString('ko-KR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleInquiry(inq.id, inq.status)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#FAF8F4] border border-[#E3DDD3] rounded-md hover:border-[#2D4F38]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {inq.status === 'unread' ? '확인 완료 표시' : '미확인으로 변경'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteInquiry(inq.id)}
                      className="p-1.5 text-neutral-400 hover:text-[#DC2626]"
                      aria-label="문의 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-medium text-[#2D4F38]">{inq.topic}</p>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                  {inq.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
