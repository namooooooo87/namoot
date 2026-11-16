import { ArrowRight } from 'lucide-react';
import type { InstructorProfile } from '../../types/portfolio';
import { ResilientImage } from '../../components/ResilientImage';

interface AboutPageProps {
  profile: InstructorProfile;
  characterImage?: string;
  onNavigate: (path: string) => void;
}

export function AboutPage({ profile, characterImage, onNavigate }: AboutPageProps) {
  return (
    <div className="pb-20">
      {/* Header & Profile */}
      <section className="bg-white border-b border-[#E4DDD0] py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="aspect-[3/4] w-full max-w-sm rounded-3xl overflow-hidden border border-[#E4DDD0] bg-[#F3ECE1]">
              <ResilientImage
                src={profile.profileImage}
                alt={profile.name}
                fallbackTitle={profile.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7A5638]">
                <span>강사 소개</span>
                {profile.activityName && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#2E5A3E]">{profile.activityName}</span>
                  </>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-[#1E2E21]">
                {profile.name}
              </h1>
              {profile.headline && (
                <p className="font-editorial text-lg font-medium text-[#2E5A3E] leading-relaxed">
                  {profile.headline}
                </p>
              )}
              <p className="text-base text-[#5B564D] leading-[1.85] whitespace-pre-line">
                {profile.bio}
              </p>
            </div>

            <div className="pt-6 border-t border-[#E4DDD0] flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/lectures')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#2E5A3E] rounded-2xl hover:bg-[#234730] transition-colors whitespace-nowrap"
              >
                강의 경력 보기
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-[#7A5638] bg-[#FAF7F0] border border-[#D4CBB8] rounded-2xl hover:border-[#7A5638] hover:bg-[#F3ECE1] transition-colors whitespace-nowrap"
              >
                강의 및 협업 문의
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy with Character Greeting */}
      <section className="py-14 border-b border-[#E4DDD0] bg-[#EBF2EC]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex items-center gap-4">
            {characterImage && (
              <div className="w-20 h-20 rounded-2xl bg-white border border-[#D4CBB8] overflow-hidden shrink-0">
                <ResilientImage
                  src={characterImage}
                  alt="나무쌤 캐릭터"
                  className="w-full h-full object-contain scale-[1.45]"
                />
              </div>
            )}
            <div>
              <h2 className="font-display text-xl text-[#1E2E21]">교육 철학</h2>
              <p className="mt-1 text-xs text-[#7A5638]">교육 현장을 바라보는 나무쌤의 시선</p>
            </div>
          </div>
          <div className="lg:col-span-8">
            <blockquote className="font-editorial text-xl sm:text-2xl text-[#2E5A3E] leading-[1.75] whitespace-pre-line">
              “{profile.philosophy}”
            </blockquote>
          </div>
        </div>
      </section>

      {/* Specialties & Core Competencies */}
      <section className="py-14 bg-white border-b border-[#E4DDD0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <h2 className="font-display text-xl text-[#1E2E21]">주요 전문 분야</h2>
              <p className="mt-1 text-xs text-[#7A5638]">강의 및 프로그램 기획 가능 영역</p>
            </div>
            {profile.specialties.length === 0 ? (
              <p className="text-sm text-[#5B564D]">등록된 전문 분야가 없습니다.</p>
            ) : (
              <ul className="divide-y divide-[#E4DDD0] border-t border-b border-[#E4DDD0]">
                {profile.specialties.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="py-3.5 flex items-baseline gap-4">
                    <span className="font-display text-sm text-[#7A5638] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm sm:text-base font-medium text-[#242B22]">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div>
              <h2 className="font-display text-xl text-[#1E2E21]">강사로서의 핵심 역량</h2>
              <p className="mt-1 text-xs text-[#7A5638]">현장 운영 및 교수 설계 강점</p>
            </div>
            {profile.coreCompetencies.length === 0 ? (
              <p className="text-sm text-[#5B564D]">등록된 핵심 역량이 없습니다.</p>
            ) : (
              <ul className="divide-y divide-[#E4DDD0] border-t border-b border-[#E4DDD0]">
                {profile.coreCompetencies.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="py-3.5 flex items-baseline gap-4">
                    <span className="font-display text-sm text-[#2E5A3E] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm sm:text-base text-[#5B564D] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Education & Certifications */}
      <section className="py-14 bg-[#FAF7F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <h2 className="font-display text-xl text-[#1E2E21]">학력</h2>
              <p className="mt-1 text-xs text-[#7A5638]">전공 및 수학 이력</p>
            </div>
            {profile.education.length === 0 ? (
              <div className="p-6 bg-white border border-[#E4DDD0] rounded-2xl text-sm text-[#5B564D]">
                등록된 학력 정보가 아직 없습니다. 관리자 페이지에서 직접 추가할 수 있습니다.
              </div>
            ) : (
              <div className="bg-white border border-[#E4DDD0] rounded-2xl divide-y divide-[#E4DDD0]">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="p-5 space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold text-[#242B22]">{edu.school}</h3>
                      {edu.period && (
                        <span className="text-xs text-[#7A5638] tabular-nums">{edu.period}</span>
                      )}
                    </div>
                    {edu.major && <p className="text-sm font-medium text-[#2E5A3E]">{edu.major}</p>}
                    {edu.note && <p className="text-xs text-[#5B564D] pt-0.5">{edu.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div>
              <h2 className="font-display text-xl text-[#1E2E21]">보유 자격증</h2>
              <p className="mt-1 text-xs text-[#7A5638]">교육·상담·디지털 관련 자격 사항</p>
            </div>
            {profile.certifications.length === 0 ? (
              <div className="p-6 bg-white border border-[#E4DDD0] rounded-2xl text-sm text-[#5B564D]">
                등록된 자격증 정보가 아직 없습니다. 관리자 페이지에서 직접 추가할 수 있습니다.
              </div>
            ) : (
              <div className="bg-white border border-[#E4DDD0] rounded-2xl divide-y divide-[#E4DDD0]">
                {profile.certifications.map((cert) => (
                  <div key={cert.id} className="p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-[#242B22]">{cert.name}</h3>
                      {cert.issuer && <p className="text-sm text-[#5B564D]">{cert.issuer}</p>}
                    </div>
                    {cert.acquiredAt && (
                      <span className="text-xs text-[#7A5638] tabular-nums shrink-0">
                        {cert.acquiredAt}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
