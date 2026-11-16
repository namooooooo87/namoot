import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { AttachmentItem, CategoryItem, ProjectItem } from '../../types/portfolio';
import { api } from '../../lib/api';
import { useFeedback } from '../../components/ToastProvider';
import { MultiImageUploader } from '../../components/ImageUploader';

interface AdminProjectsPageProps {
  projects: ProjectItem[];
  categories: CategoryItem[];
  onRefresh: () => Promise<void>;
}

function emptyProjectForm(defaultCat: string): Partial<ProjectItem> {
  return {
    title: '',
    category: defaultCat,
    period: '',
    organization: '',
    role: '',
    summary: '',
    planningIntent: '',
    keyActivities: '',
    images: [],
    coverImage: '',
    videoUrl: '',
    outcomes: '',
    links: [],
    isPublished: true,
    isFeatured: false,
  };
}

export function AdminProjectsPage({
  projects,
  categories,
  onRefresh,
}: AdminProjectsPageProps) {
  const { showToast, confirm } = useFeedback();
  const projectCategories = categories.filter((c) => c.type === 'project').map((c) => c.name);
  const defaultCategory = projectCategories[0] || '청소년 참여활동';

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<Partial<ProjectItem>>(emptyProjectForm(defaultCategory));
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(emptyProjectForm(defaultCategory));
    setEditingId('new');
  };

  const openEdit = (project: ProjectItem) => {
    setForm({ ...project });
    setEditingId(project.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.category?.trim()) {
      showToast('프로젝트명과 카테고리는 필수 입력 항목입니다.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId === 'new') {
        await api.createProject(form);
        showToast('신규 프로젝트가 등록되었습니다.');
      } else if (editingId) {
        await api.updateProject(editingId, form);
        showToast('프로젝트가 수정되었습니다.');
      }
      await onRefresh();
      setEditingId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: ProjectItem) => {
    const ok = await confirm({
      title: '프로젝트 삭제',
      description: `"${project.title}" 프로젝트를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.`,
      confirmLabel: '삭제',
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.deleteProject(project.id);
      await onRefresh();
      showToast('프로젝트가 삭제되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '삭제에 실패했습니다.', 'error');
    }
  };

  const handleTogglePublish = async (project: ProjectItem) => {
    try {
      await api.toggleProjectPublish(project.id, !project.isPublished);
      await onRefresh();
      showToast(project.isPublished ? '비공개 상태로 전환되었습니다.' : '공개 상태로 전환되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '상태 변경 실패', 'error');
    }
  };

  const addLink = () => {
    const next: AttachmentItem = { id: `lnk-${Date.now()}`, label: '', url: '' };
    setForm((prev) => ({ ...prev, links: [...(prev.links || []), next] }));
  };

  if (editingId !== null) {
    return (
      <form onSubmit={handleSave} className="space-y-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-[#1D241E]"
          >
            <ArrowLeft className="w-4 h-4" />
            프로젝트 목록으로 돌아가기
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2D4F38] rounded-lg hover:bg-[#213B2A] disabled:opacity-50"
          >
            {saving ? '저장 중...' : editingId === 'new' ? '프로젝트 등록하기' : '수정 내용 저장'}
          </button>
        </div>

        <div className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-5">
          <h1 className="text-xl font-bold text-[#1D241E]">
            {editingId === 'new' ? '신규 프로젝트 등록' : '프로젝트 수정'}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-[#1D241E]">
                프로젝트명 <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 청소년 권리축제 '유스피아' 운영 활동"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">
                카테고리 <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={form.category || defaultCategory}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
              >
                {Array.from(
                  new Set([...projectCategories, form.category || ''].filter(Boolean)),
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">활동 기간</label>
              <input
                type="text"
                value={form.period || ''}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                placeholder="예: 2024.03 - 2024.12"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">주관 기관</label>
              <input
                type="text"
                value={form.organization || ''}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                placeholder="기관명 입력"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">나의 역할</label>
              <input
                type="text"
                value={form.role || ''}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="예: 프로그램 기획 및 운영 총괄"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">프로젝트 소개</label>
              <textarea
                rows={3}
                value={form.summary || ''}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">기획 의도 및 목적</label>
              <textarea
                rows={3}
                value={form.planningIntent || ''}
                onChange={(e) => setForm({ ...form, planningIntent: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">주요 활동 내용</label>
              <textarea
                rows={4}
                value={form.keyActivities || ''}
                onChange={(e) => setForm({ ...form, keyActivities: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">결과 및 성과</label>
              <textarea
                rows={3}
                value={form.outcomes || ''}
                onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">활동 영상 링크 (YouTube 등)</label>
              <input
                type="url"
                value={form.videoUrl || ''}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
          </div>

          <MultiImageUploader
            label="프로젝트 활동 사진 (여러 장 업로드 및 대표 이미지 설정)"
            images={form.images || []}
            onChange={(imgs) => setForm({ ...form, images: imgs })}
            coverImage={form.coverImage}
            onSelectCover={(url) => setForm({ ...form, coverImage: url })}
          />

          <div className="space-y-3 pt-2 border-t border-[#E3DDD3]">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1D241E]">관련 문서 및 링크</label>
              <button
                type="button"
                onClick={addLink}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#FAF8F4] border border-[#E3DDD3] rounded-md"
              >
                <Plus className="w-3.5 h-3.5" />
                링크 추가
              </button>
            </div>
            {(form.links || []).map((lnk, idx) => (
              <div key={lnk.id} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={lnk.label}
                  onChange={(e) => {
                    const next = [...(form.links || [])];
                    next[idx] = { ...lnk, label: e.target.value };
                    setForm({ ...form, links: next });
                  }}
                  placeholder="문서 / 보도자료 제목"
                  className="flex-1 px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-md"
                />
                <input
                  type="url"
                  value={lnk.url}
                  onChange={(e) => {
                    const next = [...(form.links || [])];
                    next[idx] = { ...lnk, url: e.target.value };
                    setForm({ ...form, links: next });
                  }}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-md"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      links: (form.links || []).filter((_, i) => i !== idx),
                    })
                  }
                  className="p-2 text-neutral-400 hover:text-[#DC2626]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E3DDD3] flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.isPublished)}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="w-4 h-4 accent-[#2D4F38]"
              />
              <span>공개 상태로 게시</span>
            </label>
            <label className="inline-flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.isFeatured)}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-[#2D4F38]"
              />
              <span>메인 페이지 대표 프로젝트로 지정</span>
            </label>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D241E]">프로젝트 관리</h1>
          <p className="mt-1 text-sm text-neutral-500">
            청소년 참여·권리·기획 프로젝트를 등록하고 대표 이미지와 공개 여부를 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#2D4F38] rounded-lg hover:bg-[#213B2A] transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          신규 프로젝트 등록
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 bg-white border border-[#E3DDD3] rounded-xl text-center space-y-3">
          <p className="text-base font-medium text-[#1D241E]">등록된 프로젝트가 없습니다.</p>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#2D4F38] rounded-lg"
          >
            첫 프로젝트 등록하기
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E3DDD3] rounded-xl divide-y divide-[#E3DDD3]">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="font-semibold text-[#2D4F38]">{project.category}</span>
                  {project.organization && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{project.organization}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className={project.isPublished ? 'text-[#2D4F38]' : 'text-[#D97706]'}>
                    {project.isPublished ? '공개' : '비공개'}
                  </span>
                  {project.isFeatured && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-0.5 text-[#2D4F38] font-medium">
                        <Star className="w-3 h-3 fill-[#2D4F38]" />
                        메인 대표
                      </span>
                    </>
                  )}
                  {project.isSample && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-neutral-400">초기 샘플</span>
                    </>
                  )}
                </div>
                <h2 className="text-base font-bold text-[#1D241E] truncate">{project.title}</h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(project)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FAF8F4] border border-[#E3DDD3] rounded-md hover:border-[#2D4F38]"
                >
                  {project.isPublished ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> 비공개 전환
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> 공개 전환
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(project)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2D4F38] bg-[#FAF8F4] border border-[#E3DDD3] rounded-md hover:border-[#2D4F38]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project)}
                  className="p-2 text-neutral-400 hover:text-[#DC2626]"
                  aria-label="프로젝트 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
