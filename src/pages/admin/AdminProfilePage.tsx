import React, { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import type { CertificationItem, EducationItem, InstructorProfile } from '../../types/portfolio';
import { api } from '../../lib/api';
import { useFeedback } from '../../components/ToastProvider';
import { SingleImageUploader } from '../../components/ImageUploader';

interface AdminProfilePageProps {
  initialProfile: InstructorProfile;
  onRefresh: () => Promise<void>;
}

export function AdminProfilePage({ initialProfile, onRefresh }: AdminProfilePageProps) {
  const { showToast } = useFeedback();
  const [form, setForm] = useState<InstructorProfile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCompetency, setNewCompetency] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('이름(활동명)을 입력해 주세요.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateProfile(form);
      setForm(updated);
      await onRefresh();
      showToast('강사 프로필 및 연락처 정보가 저장되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    const next: EducationItem = {
      id: `edu-${Date.now()}`,
      school: '',
      major: '',
      period: '',
      note: '',
    };
    setForm((prev) => ({ ...prev, education: [...prev.education, next] }));
  };

  const updateEducation = (idx: number, patch: Partial<EducationItem>) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const removeEducation = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx),
    }));
  };

  const addCertification = () => {
    const next: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      acquiredAt: '',
    };
    setForm((prev) => ({ ...prev, certifications: [...prev.certifications, next] }));
  };

  const updateCertification = (idx: number, patch: Partial<CertificationItem>) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const removeCertification = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx),
    }));
  };

  const addSpecialty = () => {
    const val = newSpecialty.trim();
    if (!val) return;
    setForm((prev) => ({ ...prev, specialties: [...prev.specialties, val] }));
    setNewSpecialty('');
  };

  const addCompetency = () => {
    const val = newCompetency.trim();
    if (!val) return;
    setForm((prev) => ({ ...prev, coreCompetencies: [...prev.coreCompetencies, val] }));
    setNewCompetency('');
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D241E]">강사 정보 관리</h1>
          <p className="mt-1 text-sm text-neutral-500">
            프로필 사진, 자기소개, 교육 철학, 학력·자격증 및 연락처를 수정합니다.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#2D4F38] rounded-lg hover:bg-[#213B2A] disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <Save className="w-4 h-4" />
          {saving ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>

      {/* Basic Profile */}
      <section className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-5">
        <h2 className="text-base font-bold text-[#1D241E]">기본 프로필 및 소개</h2>

        <SingleImageUploader
          label="프로필 사진"
          value={form.profileImage}
          onChange={(url) => setForm({ ...form, profileImage: url })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1D241E]">
              이름 / 활동명 <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1D241E]">영문 부제 / 직함</label>
            <input
              type="text"
              value={form.activityName}
              onChange={(e) => setForm({ ...form, activityName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#1D241E]">한 줄 핵심 메시지</label>
          <input
            type="text"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#1D241E]">자기소개</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#1D241E]">교육 철학</label>
          <textarea
            rows={3}
            value={form.philosophy}
            onChange={(e) => setForm({ ...form, philosophy: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
          />
        </div>
      </section>

      {/* Specialties & Core Competencies */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-4">
          <h2 className="text-base font-bold text-[#1D241E]">주요 전문 분야</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSpecialty();
                }
              }}
              placeholder="새 전문 분야 입력"
              className="flex-1 px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
            />
            <button
              type="button"
              onClick={addSpecialty}
              className="px-3.5 py-2 text-xs font-medium bg-[#2D4F38] text-white rounded-lg whitespace-nowrap"
            >
              추가
            </button>
          </div>
          <ul className="divide-y divide-[#E3DDD3]">
            {form.specialties.map((item, idx) => (
              <li key={`${item}-${idx}`} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      specialties: prev.specialties.filter((_, i) => i !== idx),
                    }))
                  }
                  className="text-neutral-400 hover:text-[#DC2626] p-1"
                  aria-label="전문 분야 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-4">
          <h2 className="text-base font-bold text-[#1D241E]">강사로서의 핵심 역량</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCompetency}
              onChange={(e) => setNewCompetency(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCompetency();
                }
              }}
              placeholder="핵심 역량 입력"
              className="flex-1 px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
            />
            <button
              type="button"
              onClick={addCompetency}
              className="px-3.5 py-2 text-xs font-medium bg-[#2D4F38] text-white rounded-lg whitespace-nowrap"
            >
              추가
            </button>
          </div>
          <ul className="divide-y divide-[#E3DDD3]">
            {form.coreCompetencies.map((item, idx) => (
              <li key={`${item}-${idx}`} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      coreCompetencies: prev.coreCompetencies.filter((_, i) => i !== idx),
                    }))
                  }
                  className="text-neutral-400 hover:text-[#DC2626] p-1"
                  aria-label="핵심 역량 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Education */}
      <section className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1D241E]">학력 관리</h2>
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg hover:border-[#2D4F38]"
          >
            <Plus className="w-3.5 h-3.5" />
            학력 추가
          </button>
        </div>

        {form.education.length === 0 ? (
          <p className="text-sm text-neutral-500">등록된 학력 항목이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {form.education.map((edu, idx) => (
              <div
                key={edu.id}
                className="p-4 bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => updateEducation(idx, { school: e.target.value })}
                    placeholder="학교 / 기관명 (필수)"
                    className="px-3 py-2 text-sm bg-white border border-[#E3DDD3] rounded-md"
                  />
                  <input
                    type="text"
                    value={edu.major}
                    onChange={(e) => updateEducation(idx, { major: e.target.value })}
                    placeholder="전공 / 과정"
                    className="px-3 py-2 text-sm bg-white border border-[#E3DDD3] rounded-md"
                  />
                  <input
                    type="text"
                    value={edu.period}
                    onChange={(e) => updateEducation(idx, { period: e.target.value })}
                    placeholder="재학 기간 (예: 2018.03 - 2022.02)"
                    className="px-3 py-2 text-sm bg-white border border-[#E3DDD3] rounded-md"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={edu.note}
                    onChange={(e) => updateEducation(idx, { note: e.target.value })}
                    placeholder="비고 또는 주요 활동"
                    className="flex-1 px-3 py-2 text-sm bg-white border border-[#E3DDD3] rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="p-2 text-neutral-400 hover:text-[#DC2626]"
                    aria-label="학력 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Certifications */}
      <section className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1D241E]">보유 자격증 관리</h2>
          <button
            type="button"
            onClick={addCertification}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg hover:border-[#2D4F38]"
          >
            <Plus className="w-3.5 h-3.5" />
            자격증 추가
          </button>
        </div>

        {form.certifications.length === 0 ? (
          <p className="text-sm text-neutral-500">등록된 자격증이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {form.certifications.map((cert, idx) => (
              <div
                key={cert.id}
                className="p-4 bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
              >
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(idx, { name: e.target.value })}
                  placeholder="자격증명 (필수)"
                  className="flex-1 px-3 py-2 text-sm bg-white border border-[#E3DDD3] rounded-md"
                />
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(idx, { issuer: e.target.value })}
                  placeholder="발급 기관"
                  className="flex-1 px-3 py-2 text-sm bg-white border border-[#E3DDD3] rounded-md"
                />
                <input
                  type="text"
                  value={cert.acquiredAt}
                  onChange={(e) => updateCertification(idx, { acquiredAt: e.target.value })}
                  placeholder="취득일 (예: 2024.05)"
                  className="w-full sm:w-40 px-3 py-2 text-sm bg-white border border-[#E3DDD3] rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeCertification(idx)}
                  className="p-2 text-neutral-400 hover:text-[#DC2626] self-end sm:self-center"
                  aria-label="자격증 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact & SNS */}
      <section className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-4">
        <h2 className="text-base font-bold text-[#1D241E]">연락처 및 SNS 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1D241E]">공개 이메일</label>
            <input
              type="email"
              value={form.contact.email}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, email: e.target.value } })
              }
              placeholder="contact@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1D241E]">Instagram URL</label>
            <input
              type="url"
              value={form.contact.instagram}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, instagram: e.target.value } })
              }
              placeholder="https://instagram.com/..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1D241E]">블로그 / 브런치 URL</label>
            <input
              type="url"
              value={form.contact.blog}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, blog: e.target.value } })
              }
              placeholder="https://blog.naver.com/..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1D241E]">YouTube URL</label>
            <input
              type="url"
              value={form.contact.youtube}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, youtube: e.target.value } })
              }
              placeholder="https://youtube.com/..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#1D241E]">기타 링크 URL</label>
          <input
            type="url"
            value={form.contact.otherLink}
            onChange={(e) =>
              setForm({ ...form, contact: { ...form.contact, otherLink: e.target.value } })
            }
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#1D241E]">강의 및 협업 문의 안내 문구</label>
          <textarea
            rows={3}
            value={form.contact.inquiryGuide}
            onChange={(e) =>
              setForm({ ...form, contact: { ...form.contact, inquiryGuide: e.target.value } })
            }
            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
          />
        </div>
      </section>
    </form>
  );
}
