import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import type { HomeSectionId, LectureItem, ProjectItem, SiteSettings } from '../../types/portfolio';
import { api } from '../../lib/api';
import { useFeedback } from '../../components/ToastProvider';
import { SingleImageUploader } from '../../components/ImageUploader';

interface AdminHomeSettingsPageProps {
  initialSettings: SiteSettings;
  lectures: LectureItem[];
  projects: ProjectItem[];
  onRefresh: () => Promise<void>;
}

const SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: '메인 비주얼 & 자기소개',
  philosophy: '교육 철학 및 강사 요약',
  keywords: '핵심 교육 키워드',
  lectures: '주요 강사 경력 요약',
  projects: '대표 프로젝트 3~4개',
  recent: '최근 활동 목록',
  cta: '협업 및 문의 배너',
};

export function AdminHomeSettingsPage({
  initialSettings,
  lectures,
  projects,
  onRefresh,
}: AdminHomeSettingsPageProps) {
  const { showToast } = useFeedback();
  const [form, setForm] = useState<SiteSettings>(initialSettings);
  const [newKeyword, setNewKeyword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.heroHeadline.trim()) {
      showToast('메인 헤드라인 문구를 입력해 주세요.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateSiteSettings(form);
      setForm(updated);
      await onRefresh();
      showToast('메인 페이지 설정이 저장되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeaturedProject = (id: string) => {
    const exists = form.featuredProjectIds.includes(id);
    const next = exists
      ? form.featuredProjectIds.filter((x) => x !== id)
      : [...form.featuredProjectIds, id].slice(0, 4);
    setForm({ ...form, featuredProjectIds: next });
  };

  const toggleFeaturedLecture = (id: string) => {
    const exists = form.featuredLectureIds.includes(id);
    const next = exists
      ? form.featuredLectureIds.filter((x) => x !== id)
      : [...form.featuredLectureIds, id].slice(0, 3);
    setForm({ ...form, featuredLectureIds: next });
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= form.sectionOrder.length) return;
    const next = [...form.sectionOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setForm({ ...form, sectionOrder: next });
  };

  const addKeyword = () => {
    const val = newKeyword.trim();
    if (!val) return;
    setForm({ ...form, keywords: [...form.keywords, val] });
    setNewKeyword('');
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D241E]">메인 페이지 관리</h1>
          <p className="mt-1 text-sm text-neutral-500">
            메인 소개 문구, 이미지, 키워드, 대표 활동 및 섹션 노출 순서를 설정합니다.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#2D4F38] rounded-lg hover:bg-[#213B2A] disabled:opacity-50 whitespace-nowrap"
        >
          <Save className="w-4 h-4" />
          {saving ? '저장 중...' : '메인 설정 저장'}
        </button>
      </div>

      {/* Hero Copy & Visuals */}
      <section className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-5">
        <h2 className="text-base font-bold text-[#1D241E]">메인 비주얼 및 소개 문구</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SingleImageUploader
            label="메인/소개 캐릭터 일러스트"
            value={form.characterImage || ''}
            onChange={(url) => setForm({ ...form, characterImage: url })}
          />
          <SingleImageUploader
            label="메인 프로필 이미지"
            value={form.profileImage}
            onChange={(url) => setForm({ ...form, profileImage: url })}
          />
          <SingleImageUploader
            label="보조 배경 / 공간 이미지"
            value={form.heroImage}
            onChange={(url) => setForm({ ...form, heroImage: url })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1D241E]">상단 작은 문구 (Kicker)</label>
            <input
              type="text"
              value={form.heroKicker}
              onChange={(e) => setForm({ ...form, heroKicker: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1D241E]">대표 버튼 문구</label>
            <input
              type="text"
              value={form.heroPrimaryCtaText}
              onChange={(e) => setForm({ ...form, heroPrimaryCtaText: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#1D241E]">
            메인 헤드라인 <span className="text-[#DC2626]">*</span>
          </label>
          <input
            type="text"
            required
            value={form.heroHeadline}
            onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#1D241E]">메인 소개 문구</label>
          <textarea
            rows={3}
            value={form.heroSubheadline}
            onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
          />
        </div>
      </section>

      {/* Keywords */}
      <section className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-4">
        <h2 className="text-base font-bold text-[#1D241E]">주요 교육 키워드</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword();
              }
            }}
            placeholder="새 키워드 입력"
            className="flex-1 px-3.5 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium bg-[#2D4F38] text-white rounded-lg whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            추가
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {form.keywords.map((kw, idx) => (
            <div
              key={`${kw}-${idx}`}
              className="px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg flex items-center justify-between gap-2 text-sm"
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    keywords: form.keywords.filter((_, i) => i !== idx),
                  })
                }
                className="text-neutral-400 hover:text-[#DC2626]"
                aria-label="키워드 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Selection */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-3">
          <div>
            <h2 className="text-base font-bold text-[#1D241E]">메인 대표 프로젝트 선택 (최대 4개)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">공개 상태인 프로젝트가 메인에 노출됩니다.</p>
          </div>
          <div className="divide-y divide-[#E3DDD3]">
            {projects.map((prj) => (
              <label
                key={prj.id}
                className="py-3 flex items-center justify-between gap-3 cursor-pointer text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={form.featuredProjectIds.includes(prj.id)}
                    onChange={() => toggleFeaturedProject(prj.id)}
                    className="w-4 h-4 accent-[#2D4F38] shrink-0"
                  />
                  <span className="truncate">{prj.title}</span>
                </div>
                <span className="text-xs text-neutral-400 shrink-0">
                  {prj.isPublished ? '공개' : '비공개'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-3">
          <div>
            <h2 className="text-base font-bold text-[#1D241E]">메인 대표 강의 선택 (최대 3개)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">공개 상태인 강의가 메인에 노출됩니다.</p>
          </div>
          <div className="divide-y divide-[#E3DDD3]">
            {lectures.map((lec) => (
              <label
                key={lec.id}
                className="py-3 flex items-center justify-between gap-3 cursor-pointer text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={form.featuredLectureIds.includes(lec.id)}
                    onChange={() => toggleFeaturedLecture(lec.id)}
                    className="w-4 h-4 accent-[#2D4F38] shrink-0"
                  />
                  <span className="truncate">{lec.title}</span>
                </div>
                <span className="text-xs text-neutral-400 shrink-0">
                  {lec.isPublished ? '공개' : '비공개'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Section Ordering */}
      <section className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#1D241E]">메인 페이지 콘텐츠 노출 순서</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            위·아래 화살표로 메인 화면의 섹션 배치 순서를 변경할 수 있습니다.
          </p>
        </div>
        <div className="divide-y divide-[#E3DDD3] border border-[#E3DDD3] rounded-lg">
          {form.sectionOrder.map((secId, idx) => (
            <div
              key={secId}
              className="px-4 py-3 flex items-center justify-between gap-3 bg-[#FAF8F4]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-tabular text-neutral-400">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-medium text-[#1D241E]">
                  {SECTION_LABELS[secId] || secId}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveSection(idx, -1)}
                  className="p-1.5 rounded bg-white border border-[#E3DDD3] disabled:opacity-30 hover:border-[#2D4F38]"
                  aria-label="위로 이동"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === form.sectionOrder.length - 1}
                  onClick={() => moveSection(idx, 1)}
                  className="p-1.5 rounded bg-white border border-[#E3DDD3] disabled:opacity-30 hover:border-[#2D4F38]"
                  aria-label="아래로 이동"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
