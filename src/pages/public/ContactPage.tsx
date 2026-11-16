import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Send } from 'lucide-react';
import type { InstructorProfile } from '../../types/portfolio';
import { api } from '../../lib/api';
import { useFeedback } from '../../components/ToastProvider';
import { ResilientImage } from '../../components/ResilientImage';

interface ContactPageProps {
  profile: InstructorProfile;
  characterImage?: string;
}

export function ContactPage({ profile, characterImage }: ContactPageProps) {
  const { showToast } = useFeedback();
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    topic: '강의 및 특강 요청',
    message: '',
  });

  const handleCopyEmail = async () => {
    if (!profile.contact.email) return;
    try {
      await navigator.clipboard.writeText(profile.contact.email);
      setCopied(true);
      showToast('이메일 주소가 복사되었습니다.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('이메일 복사에 실패했습니다.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      showToast('성함, 이메일, 문의 내용을 모두 입력해 주세요.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitInquiry(form);
      setSubmitted(true);
      setForm({
        name: '',
        organization: '',
        email: '',
        phone: '',
        topic: '강의 및 특강 요청',
        message: '',
      });
      showToast('강의 및 협업 문의가 성공적으로 전달되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '문의 전송에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const snsLinks = [
    { label: 'Instagram', url: profile.contact.instagram },
    { label: 'Blog / 아카이브', url: profile.contact.blog },
    { label: 'YouTube', url: profile.contact.youtube },
    { label: '기타 채널', url: profile.contact.otherLink },
  ].filter((item) => item.url && item.url.trim().length > 0);

  return (
    <div className="pb-20">
      <section className="bg-white border-b border-[#E4DDD0] py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <p className="text-xs font-semibold text-[#7A5638]">강의 및 협업 문의</p>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1E2E21]">
            CONTACT
          </h1>
          <p className="text-base text-[#5B564D] max-w-2xl leading-relaxed">
            학교, 청소년센터, 수련시설 및 협력 단체의 강의 요청과 프로그램 협업 제안을 기다립니다.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Direct Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#EBF2EC]/70 border border-[#D4E2D5] rounded-2xl space-y-4">
            <div className="flex items-center gap-4">
              {characterImage && (
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#D4CBB8] overflow-hidden shrink-0">
                  <ResilientImage
                    src={characterImage}
                    alt="나무쌤 캐릭터"
                    className="w-full h-full object-contain scale-[1.45]"
                  />
                </div>
              )}
              <div>
                <h2 className="font-display text-lg text-[#2E5A3E]">나무쌤에게 편하게 문의하세요</h2>
                <p className="text-xs text-[#7A5638]">강의 및 협업 안내</p>
              </div>
            </div>
            <p className="text-sm text-[#5B564D] leading-[1.85] whitespace-pre-line">
              {profile.contact.inquiryGuide ||
                '강의 대상, 희망 일정, 교육 주제를 남겨 주시면 확인 후 회신드리겠습니다.'}
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E4DDD0] rounded-2xl space-y-5">
            <div>
              <h3 className="text-xs font-medium text-[#7A5638]">이메일</h3>
              {profile.contact.email ? (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <a
                    href={`mailto:${profile.contact.email}`}
                    className="text-base font-semibold text-[#2E5A3E] hover:underline break-all"
                  >
                    {profile.contact.email}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7A5638] bg-[#FAF7F0] border border-[#E4DDD0] rounded-xl hover:border-[#7A5638] transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '복사됨' : '복사'}
                  </button>
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-[#5B564D]">
                  이메일 정보가 아직 등록되지 않았습니다. 아래 문의 양식을 이용해 주세요.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[#E4DDD0]">
              <h3 className="text-xs font-medium text-[#7A5638]">주요 SNS 및 채널</h3>
              {snsLinks.length === 0 ? (
                <p className="mt-1.5 text-sm text-[#5B564D]">
                  등록된 SNS 링크가 아직 없습니다. (관리자 페이지에서 등록 가능)
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {snsLinks.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#242B22] hover:text-[#2E5A3E] transition-colors"
                      >
                        <span>{item.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#7A5638]" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right: Working Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 bg-white border border-[#E4DDD0] rounded-2xl">
            <h2 className="font-display text-xl text-[#1E2E21]">온라인 문의 남기기</h2>
            <p className="mt-1 text-sm text-[#5B564D]">
              남겨 주신 문의는 관리자 페이지로 즉시 전달되어 안전하게 보관됩니다.
            </p>

            {submitted && (
              <div className="mt-5 p-4 bg-[#EBF2EC] border border-[#2E5A3E]/30 rounded-xl text-sm text-[#2E5A3E]">
                문의가 정상적으로 접수되었습니다. 남겨 주신 연락처로 빠르게 회신드리겠습니다.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#242B22]">
                    담당자 성함 <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#E4DDD0] rounded-xl focus:outline-none focus:border-[#2E5A3E]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#242B22]">소속 기관 / 학교명</label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    placeholder="예: ○○중학교, ○○청소년센터"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#E4DDD0] rounded-xl focus:outline-none focus:border-[#2E5A3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#242B22]">
                    회신받으실 이메일 <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@organization.or.kr"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#E4DDD0] rounded-xl focus:outline-none focus:border-[#2E5A3E]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#242B22]">연락처 (선택)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="010-0000-0000"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#E4DDD0] rounded-xl focus:outline-none focus:border-[#2E5A3E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#242B22]">문의 구분</label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#E4DDD0] rounded-xl focus:outline-none focus:border-[#2E5A3E]"
                >
                  <option value="강의 및 특강 요청">강의 및 특강 요청</option>
                  <option value="교육 프로그램 기획·운영 협업">교육 프로그램 기획·운영 협업</option>
                  <option value="캠프 및 워크숍 퍼실리테이션">캠프 및 워크숍 퍼실리테이션</option>
                  <option value="기타 협업 및 자문 문의">기타 협업 및 자문 문의</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#242B22]">
                  상세 문의 내용 <span className="text-[#B91C1C]">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="교육 대상, 희망 일정, 예상 인원, 요청 주제 등을 자유롭게 적어 주세요."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#E4DDD0] rounded-xl focus:outline-none focus:border-[#2E5A3E] resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-[#2E5A3E] rounded-2xl hover:bg-[#234730] disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? '전송 중...' : '문의 전송하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
