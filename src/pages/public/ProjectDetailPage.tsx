import { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { ProjectItem } from '../../types/portfolio';
import { ResilientImage } from '../../components/ResilientImage';
import { LightboxModal } from '../../components/LightboxModal';

interface ProjectDetailPageProps {
  project: ProjectItem | undefined;
  onNavigate: (path: string) => void;
}

function getYoutubeEmbedUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function ProjectDetailPage({ project, onNavigate }: ProjectDetailPageProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl text-[#1E2E21]">프로젝트 정보를 찾을 수 없습니다</h1>
        <p className="text-sm text-[#5B564D]">비공개 상태이거나 삭제된 프로젝트입니다.</p>
        <button
          type="button"
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#2E5A3E] rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4" />
          프로젝트 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const allImages = (() => {
    const list = [...project.images];
    if (project.coverImage && !list.includes(project.coverImage)) {
      list.unshift(project.coverImage);
    }
    return list;
  })();

  const embedVideoUrl = getYoutubeEmbedUrl(project.videoUrl);

  const metaRows = [
    { label: '카테고리', value: project.category },
    { label: '주관 기관', value: project.organization },
    { label: '활동 기간', value: project.period },
    { label: '나의 역할', value: project.role },
  ];

  const textSections = [
    { title: '프로젝트 소개', content: project.summary },
    { title: '기획 의도 및 목적', content: project.planningIntent },
    { title: '주요 활동 내용', content: project.keyActivities },
    { title: '결과 및 성과', content: project.outcomes },
  ];

  return (
    <div className="pb-20">
      <div className="bg-white border-b border-[#E4DDD0] py-10 lg:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <button
            type="button"
            onClick={() => onNavigate('/projects')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B564D] hover:text-[#2E5A3E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            프로젝트 아카이브 목록으로
          </button>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A5638]">
              <span className="font-semibold text-[#2E5A3E]">{project.category}</span>
              {project.organization && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{project.organization}</span>
                </>
              )}
              {project.isSample && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>초기 샘플 데이터</span>
                </>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-4xl text-[#1E2E21] leading-tight">
              {project.title}
            </h1>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-[#E4DDD0]">
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
        {allImages.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-lg text-[#1E2E21]">활동 사진</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#E4DDD0] bg-[#F3ECE1] hover:opacity-95 transition-opacity text-left"
                >
                  <ResilientImage
                    src={img}
                    alt={`${project.title} 활동 사진 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {project.videoUrl && (
          <section className="p-6 bg-white border border-[#E4DDD0] rounded-2xl space-y-4">
            <h2 className="font-display text-lg text-[#2E5A3E]">활동 영상</h2>
            {embedVideoUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={embedVideoUrl}
                  title={`${project.title} 영상`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E5A3E] hover:underline"
              >
                영상 링크 바로가기
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
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

        {project.links.length > 0 && (
          <section className="p-6 bg-white border border-[#E4DDD0] rounded-2xl space-y-3">
            <h2 className="font-display text-lg text-[#2E5A3E]">관련 문서 및 링크</h2>
            <ul className="divide-y divide-[#E4DDD0]">
              {project.links.map((lnk) => (
                <li key={lnk.id} className="py-2.5 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-[#242B22]">{lnk.label}</span>
                  <a
                    href={lnk.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E5A3E] hover:underline whitespace-nowrap"
                  >
                    바로가기
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
            onClick={() => onNavigate('/projects')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B564D] hover:text-[#242B22]"
          >
            <ArrowLeft className="w-4 h-4" />
            전체 프로젝트 보기
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/contact')}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E5A3E] rounded-2xl hover:bg-[#234730] transition-colors whitespace-nowrap"
          >
            협업 및 프로젝트 문의하기
          </button>
        </div>
      </div>

      <LightboxModal
        images={allImages}
        activeIndex={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onChangeIndex={setLightboxIdx}
        title={project.title}
      />
    </div>
  );
}
