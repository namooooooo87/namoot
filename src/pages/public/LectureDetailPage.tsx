import { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { LectureItem } from '../../types/portfolio';
import { ResilientImage } from '../../components/ResilientImage';
import { LightboxModal } from '../../components/LightboxModal';

interface LectureDetailPageProps {
  lecture: LectureItem | undefined;
  onNavigate: (path: string) => void;
}

export function LectureDetailPage({ lecture, onNavigate }: LectureDetailPageProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!lecture) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl text-[#1E2E21]">강의 정보를 찾을 수 없습니다</h1>
        <p className="text-sm text-[#5B564D]">비공개 상태이거나 삭제된 강의입니다.</p>
        <button
          type="button"
          onClick={() => onNavigate('/lectures')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#2E5A3E] rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4" />
          강의 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const metaRows = [
    { label: '교육 분야', value: lecture.field },
    { label: '강의 대상', value: lecture.targetAudience },
    { label: '운영 기관', value: lecture.organization },
    { label: '운영 기간 및 날짜', value: lecture.period },
    { label: '참여 인원', value: lecture.participantsCount },
    { label: '총 교육 시간', value: lecture.totalHours },
  ];

  const textSections = [
    { title: '강의 목적', content: lecture.purpose },
    { title: '교육 목표', content: lecture.goals },
    { title: '세부 교육 내용', content: lecture.details },
    { title: '활용 교구 및 교수법', content: lecture.teachingMethods },
    { title: '교육 결과 및 성과', content: lecture.outcomes },
  ];

  return (
    <div className="pb-20">
      <div className="bg-white border-b border-[#E4DDD0] py-10 lg:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <button
            type="button"
            onClick={() => onNavigate('/lectures')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B564D] hover:text-[#2E5A3E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            강의 경력 목록으로
          </button>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A5638]">
              <span className="font-semibold text-[#2E5A3E]">{lecture.field}</span>
              {lecture.organization && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{lecture.organization}</span>
                </>
              )}
              {lecture.isSample && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>초기 샘플 데이터</span>
                </>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-4xl text-[#1E2E21] leading-tight">
              {lecture.title}
            </h1>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 border-t border-[#E4DDD0]">
            {metaRows.map((row) => (
              <div key={row.label} className="p-4 bg-[#FAF7F0] border border-[#E4DDD0] rounded-2xl">
                <dt className="text-xs text-[#7A5638]">{row.label}</dt>
                <dd className="mt-1 text-sm font-semibold text-[#242B22] tabular-nums">
                  {row.value || '추후 입력 예정'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {lecture.images.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-lg text-[#1E2E21]">활동 사진</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lecture.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#E4DDD0] bg-[#F3ECE1] hover:opacity-95 transition-opacity text-left"
                >
                  <ResilientImage
                    src={img}
                    alt={`${lecture.title} 활동 사진 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-6">
          {textSections.map((sec) => (
            <section key={sec.title} className="p-6 bg-white border border-[#E4DDD0] rounded-2xl space-y-2.5">
              <h2 className="font-display text-lg text-[#2E5A3E]">{sec.title}</h2>
              {sec.content ? (
                <p className="text-sm sm:text-base text-[#242B22]/85 leading-[1.85] whitespace-pre-line">
                  {sec.content}
                </p>
              ) : (
                <p className="text-sm text-[#7A5638]/75">추후 관리자 페이지에서 세부 내용이 업데이트될 예정입니다.</p>
              )}
            </section>
          ))}
        </div>

        {lecture.attachments.length > 0 && (
          <section className="p-6 bg-white border border-[#E4DDD0] rounded-2xl space-y-3">
            <h2 className="font-display text-lg text-[#2E5A3E]">관련 자료 첨부</h2>
            <ul className="divide-y divide-[#E4DDD0]">
              {lecture.attachments.map((att) => (
                <li key={att.id} className="py-2.5 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-[#242B22]">{att.label}</span>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E5A3E] hover:underline whitespace-nowrap"
                  >
                    자료 열기
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="pt-4 border-t border-[#E4DDD0] flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('/lectures')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B564D] hover:text-[#242B22]"
          >
            <ArrowLeft className="w-4 h-4" />
            전체 강의 경력 보기
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/contact')}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E5A3E] rounded-2xl hover:bg-[#234730] transition-colors whitespace-nowrap"
          >
            이 강의와 유사한 프로그램 문의하기
          </button>
        </div>
      </div>

      <LightboxModal
        images={lecture.images}
        activeIndex={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onChangeIndex={setLightboxIdx}
        title={lecture.title}
      />
    </div>
  );
}
