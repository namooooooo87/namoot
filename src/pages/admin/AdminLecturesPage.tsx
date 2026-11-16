import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { AttachmentItem, CategoryItem, LectureItem } from '../../types/portfolio';
import { api } from '../../lib/api';
import { useFeedback } from '../../components/ToastProvider';
import { MultiImageUploader } from '../../components/ImageUploader';

interface AdminLecturesPageProps {
  lectures: LectureItem[];
  categories: CategoryItem[];
  onRefresh: () => Promise<void>;
}

function emptyLectureForm(defaultField: string): Partial<LectureItem> {
  return {
    title: '',
    field: defaultField,
    targetAudience: '',
    organization: '',
    period: '',
    participantsCount: '',
    totalHours: '',
    purpose: '',
    goals: '',
    details: '',
    teachingMethods: '',
    images: [],
    outcomes: '',
    attachments: [],
    isPublished: true,
    isFeatured: false,
  };
}

export function AdminLecturesPage({
  lectures,
  categories,
  onRefresh,
}: AdminLecturesPageProps) {
  const { showToast, confirm } = useFeedback();
  const lectureCategories = categories.filter((c) => c.type === 'lecture').map((c) => c.name);
  const defaultField = lectureCategories[0] || '청소년 리더십 교육';

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<Partial<LectureItem>>(emptyLectureForm(defaultField));
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(emptyLectureForm(defaultField));
    setEditingId('new');
  };

  const openEdit = (lecture: LectureItem) => {
    setForm({ ...lecture });
    setEditingId(lecture.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.field?.trim()) {
      showToast('강의명과 교육 분야는 필수 입력 항목입니다.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId === 'new') {
        await api.createLecture(form);
        showToast('신규 강의가 등록되었습니다.');
      } else if (editingId) {
        await api.updateLecture(editingId, form);
        showToast('강의 정보가 수정되었습니다.');
      }
      await onRefresh();
      setEditingId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lecture: LectureItem) => {
    const ok = await confirm({
      title: '강의 경력 삭제',
      description: `"${lecture.title}" 강의를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.`,
      confirmLabel: '삭제',
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.deleteLecture(lecture.id);
      await onRefresh();
      showToast('강의가 삭제되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '삭제에 실패했습니다.', 'error');
    }
  };

  const handleTogglePublish = async (lecture: LectureItem) => {
    try {
      await api.toggleLecturePublish(lecture.id, !lecture.isPublished);
      await onRefresh();
      showToast(lecture.isPublished ? '비공개 상태로 전환되었습니다.' : '공개 상태로 전환되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '상태 변경 실패', 'error');
    }
  };

  const addAttachment = () => {
    const next: AttachmentItem = { id: `att-${Date.now()}`, label: '', url: '' };
    setForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), next] }));
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
            강의 목록으로 돌아가기
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2D4F38] rounded-lg hover:bg-[#213B2A] disabled:opacity-50"
          >
            {saving ? '저장 중...' : editingId === 'new' ? '강의 등록하기' : '수정 내용 저장'}
          </button>
        </div>

        <div className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-5">
          <h1 className="text-xl font-bold text-[#1D241E]">
            {editingId === 'new' ? '신규 강의 경력 등록' : '강의 경력 수정'}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-[#1D241E]">
                강의명 <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 중학생 대상 AI LAB 교육 프로그램"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">
                교육 분야 <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={form.field || defaultField}
                onChange={(e) => setForm({ ...form, field: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
              >
                {Array.from(new Set([...lectureCategories, form.field || ''].filter(Boolean))).map(
                  (cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">강의 대상</label>
              <input
                type="text"
                value={form.targetAudience || ''}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                placeholder="예: 중학생 1~3학년"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">운영 기관</label>
              <input
                type="text"
                value={form.organization || ''}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                placeholder="기관명 입력 (미확정 시 비워둠)"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">운영 기간 및 날짜</label>
              <input
                type="text"
                value={form.period || ''}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                placeholder="예: 2025.05 - 2025.07"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">참여 인원</label>
              <input
                type="text"
                value={form.participantsCount || ''}
                onChange={(e) => setForm({ ...form, participantsCount: e.target.value })}
                placeholder="예: 60명"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">총 교육 시간</label>
              <input
                type="text"
                value={form.totalHours || ''}
                onChange={(e) => setForm({ ...form, totalHours: e.target.value })}
                placeholder="예: 총 12차시 (24시간)"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">강의 목적</label>
              <textarea
                rows={2}
                value={form.purpose || ''}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">교육 목표</label>
              <textarea
                rows={2}
                value={form.goals || ''}
                onChange={(e) => setForm({ ...form, goals: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">세부 교육 내용</label>
              <textarea
                rows={4}
                value={form.details || ''}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">활용 교구 및 교수법</label>
              <textarea
                rows={2}
                value={form.teachingMethods || ''}
                onChange={(e) => setForm({ ...form, teachingMethods: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">교육 결과 및 성과</label>
              <textarea
                rows={3}
                value={form.outcomes || ''}
                onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
              />
            </div>
          </div>

          <MultiImageUploader
            label="강의 활동 사진"
            images={form.images || []}
            onChange={(imgs) => setForm({ ...form, images: imgs })}
          />

          {/* Attachments */}
          <div className="space-y-3 pt-2 border-t border-[#E3DDD3]">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1D241E]">관련 자료 링크 첨부</label>
              <button
                type="button"
                onClick={addAttachment}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#FAF8F4] border border-[#E3DDD3] rounded-md"
              >
                <Plus className="w-3.5 h-3.5" />
                자료 추가
              </button>
            </div>
            {(form.attachments || []).map((att, idx) => (
              <div key={att.id} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={att.label}
                  onChange={(e) => {
                    const next = [...(form.attachments || [])];
                    next[idx] = { ...att, label: e.target.value };
                    setForm({ ...form, attachments: next });
                  }}
                  placeholder="자료 제목 (예: 강의안 PDF)"
                  className="flex-1 px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-md"
                />
                <input
                  type="url"
                  value={att.url}
                  onChange={(e) => {
                    const next = [...(form.attachments || [])];
                    next[idx] = { ...att, url: e.target.value };
                    setForm({ ...form, attachments: next });
                  }}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-md"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      attachments: (form.attachments || []).filter((_, i) => i !== idx),
                    })
                  }
                  className="p-2 text-neutral-400 hover:text-[#DC2626]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Publish & Featured Switches */}
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
              <span>메인 페이지 대표 강의로 지정</span>
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
          <h1 className="text-2xl font-bold text-[#1D241E]">강의 경력 관리</h1>
          <p className="mt-1 text-sm text-neutral-500">
            강의 및 교육 프로그램을 등록하고 공개 상태와 메인 대표 여부를 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#2D4F38] rounded-lg hover:bg-[#213B2A] transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          신규 강의 등록
        </button>
      </div>

      {lectures.length === 0 ? (
        <div className="p-12 bg-white border border-[#E3DDD3] rounded-xl text-center space-y-3">
          <p className="text-base font-medium text-[#1D241E]">등록된 강의 경력이 없습니다.</p>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#2D4F38] rounded-lg"
          >
            첫 강의 등록하기
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E3DDD3] rounded-xl divide-y divide-[#E3DDD3]">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="font-semibold text-[#2D4F38]">{lecture.field}</span>
                  {lecture.organization && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{lecture.organization}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className={lecture.isPublished ? 'text-[#2D4F38]' : 'text-[#D97706]'}>
                    {lecture.isPublished ? '공개' : '비공개'}
                  </span>
                  {lecture.isFeatured && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-0.5 text-[#2D4F38] font-medium">
                        <Star className="w-3 h-3 fill-[#2D4F38]" />
                        메인 대표
                      </span>
                    </>
                  )}
                  {lecture.isSample && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-neutral-400">초기 샘플</span>
                    </>
                  )}
                </div>
                <h2 className="text-base font-bold text-[#1D241E] truncate">{lecture.title}</h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(lecture)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FAF8F4] border border-[#E3DDD3] rounded-md hover:border-[#2D4F38]"
                >
                  {lecture.isPublished ? (
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
                  onClick={() => openEdit(lecture)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2D4F38] bg-[#FAF8F4] border border-[#E3DDD3] rounded-md hover:border-[#2D4F38]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(lecture)}
                  className="p-2 text-neutral-400 hover:text-[#DC2626]"
                  aria-label="강의 삭제"
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
