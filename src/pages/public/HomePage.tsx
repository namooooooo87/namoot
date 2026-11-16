import { ArrowRight, Sprout, Trees } from 'lucide-react';
import type {
  HomeSectionId,
  InstructorProfile,
  LectureItem,
  ProjectItem,
  SiteSettings,
} from '../../types/portfolio';
import { ResilientImage } from '../../components/ResilientImage';

interface HomePageProps {
  profile: InstructorProfile;
  siteSettings: SiteSettings;
  lectures: LectureItem[];
  projects: ProjectItem[];
  onNavigate: (path: string) => void;
}

export function HomePage({
  profile,
  siteSettings,
  lectures,
  projects,
  onNavigate,
}: HomePageProps) {
  const featuredProjects = (() => {
    const selected = projects.filter((p) => siteSettings.featuredProjectIds.includes(p.id));
    if (selected.length > 0) return selected.slice(0, 4);
    const flagged = projects.filter((p) => p.isFeatured);
    if (flagged.length > 0) return flagged.slice(0, 4);
    return projects.slice(0, 4);
  })();

  const featuredLectures = (() => {
    const selected = lectures.filter((l) => siteSettings.featuredLectureIds.includes(l.id));
    if (selected.length > 0) return selected.slice(0, 3);
    const flagged = lectures.filter((l) => l.isFeatured);
    if (flagged.length > 0) return flagged.slice(0, 3);
    return lectures.slice(0, 3);
  })();

  const recentActivities = [
    ...lectures.map((l) => ({
      id: l.id,
      kind: '강의 경력' as const,
      title: l.title,
      category: l.field,
      org: l.organization,
      period: l.period,
      updatedAt: l.updatedAt,
      path: `/lectures/${l.id}`,
      isSample: l.isSample,
    })),
    ...projects.map((p) => ({
      id: p.id,
      kind: '프로젝트' as const,
      title: p.title,
      category: p.category,
      org: p.organization,
      period: p.period,
      updatedAt: p.updatedAt,
      path: `/projects/${p.id}`,
      isSample: p.isSample,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const characterVisual =
    siteSettings.characterImage ||
    siteSettings.heroImage ||
    '/assets/aistudio/KakaoTalk_20261116_183534798_4d8a4ec2.png';

  const renderSection = (sectionId: HomeSectionId) => {
    switch (sectionId) {
      case 'hero':
        return (
          <section key="hero" className="border-b border-[#E4DDD0] bg-[#FAF7F0]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
                {/* Left Column: Warm Rounded Typographic Hierarchy */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A5638]">
                      <Sprout className="w-4 h-4 text-[#2E5A3E] shrink-0" />
                      <span>{siteSettings.heroKicker || '나무쌤 · 김민서 | 청소년 교육 전문가'}</span>
                    </div>
                    <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] text-[#1E2E21] leading-[1.3]">
                      {siteSettings.heroHeadline}
                    </h1>
                    <p className="font-editorial text-base sm:text-[17px] text-[#5B564D] leading-[1.85] max-w-2xl">
                      {siteSettings.heroSubheadline}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('/projects')}
                      className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-white bg-[#2E5A3E] rounded-2xl hover:bg-[#234730] transition-colors whitespace-nowrap"
                    >
                      {siteSettings.heroPrimaryCtaText || '포트폴리오 살펴보기'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('/contact')}
                      className="inline-flex items-center px-6 py-3.5 text-sm font-medium text-[#7A5638] bg-white border border-[#D4CBB8] rounded-2xl hover:border-[#7A5638] hover:bg-[#F3ECE1] transition-colors whitespace-nowrap"
                    >
                      강의·협업 문의
                    </button>
                  </div>
                </div>

                {/* Right Column: Friendly Character Card */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="w-full h-full min-h-[320px] rounded-3xl border border-[#D8CEBE] bg-[#F3ECE1] p-6 flex flex-col items-center justify-between gap-4">
                    <div className="w-full flex-1 min-h-[240px] rounded-2xl bg-white border border-[#E4DDD0] overflow-hidden flex items-center justify-center">
                      <ResilientImage
                        src={characterVisual}
                        alt={`${profile.name} 캐릭터`}
                        fallbackTitle={profile.name}
                        className="w-full h-full object-contain scale-[1.42]"
                      />
                    </div>
                    <div className="w-full flex items-center justify-between px-2 pt-1">
                      <div>
                        <p className="font-display text-lg text-[#2E5A3E]">{profile.name}</p>
                        <p className="text-xs text-[#7A5638]">청소년과 함께 자라는 배움의 숲</p>
                      </div>
                      <Trees className="w-5 h-5 text-[#7A5638]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-width Summary Strip Below Hero Split */}
              <div className="mt-12 pt-8 border-t border-[#E4DDD0] grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-[#7A5638]">강사 · 활동명</p>
                  <p className="mt-1.5 font-display text-lg text-[#242B22]">{profile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#7A5638]">공개된 강의 경력</p>
                  <p className="mt-1.5 font-display text-lg text-[#2E5A3E] tabular-nums">
                    {lectures.length}건
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#7A5638]">공개된 프로젝트</p>
                  <p className="mt-1.5 font-display text-lg text-[#2E5A3E] tabular-nums">
                    {projects.length}건
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#7A5638]">주요 교육 영역</p>
                  <p className="mt-1.5 text-sm sm:text-base font-semibold text-[#242B22] truncate">
                    {profile.specialties[0] || '진로 · 참여 · 리더십 · AI'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      case 'philosophy':
        return (
          <section key="philosophy" className="py-16 lg:py-20 border-b border-[#E4DDD0] bg-[#EBF2EC]/65">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-4 space-y-2">
                  <p className="text-xs font-semibold text-[#7A5638]">교육 철학 및 소개</p>
                  <h2 className="font-display text-2xl sm:text-[1.75rem] text-[#1E2E21]">
                    깊게 뿌리내리고 함께 자라는 나무처럼
                  </h2>
                </div>
                <div className="lg:col-span-8 space-y-6">
                  <blockquote className="font-editorial text-xl sm:text-2xl leading-[1.75] text-[#2E5A3E]">
                    “{profile.philosophy}”
                  </blockquote>
                  <p className="text-base text-[#5B564D] leading-[1.85]">{profile.bio}</p>
                  <div>
                    <button
                      type="button"
                      onClick={() => onNavigate('/about')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2E5A3E] hover:text-[#7A5638] transition-colors"
                    >
                      강사 소개 · 학력 · 자격증 자세히 보기
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'keywords':
        return (
          <section key="keywords" className="py-16 lg:py-20 bg-white border-b border-[#E4DDD0]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#7A5638]">핵심 교육 분야</p>
                  <h2 className="mt-1 font-display text-2xl sm:text-[1.75rem] text-[#1E2E21]">
                    전문 영역 및 교육 키워드
                  </h2>
                </div>
                <p className="text-sm text-[#5B564D]">
                  청소년의 눈높이와 현장의 맥락에 맞춘 교육을 설계합니다.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {siteSettings.keywords.map((kw, index) => (
                  <div
                    key={`${kw}-${index}`}
                    className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E4DDD0] flex items-baseline gap-4"
                  >
                    <span className="font-display text-base text-[#7A5638] tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-base font-semibold text-[#242B22]">{kw}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'lectures':
        return (
          <section key="lectures" className="py-16 lg:py-20 border-b border-[#E4DDD0] bg-[#FAF7F0]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#7A5638]">주요 강사 경력 요약</p>
                  <h2 className="mt-1 font-display text-2xl sm:text-[1.75rem] text-[#1E2E21]">
                    현장에서 함께한 강의 프로그램
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/lectures')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E5A3E] hover:underline whitespace-nowrap"
                >
                  전체 강의 경력 보기
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {featuredLectures.length === 0 ? (
                <div className="p-10 bg-white border border-[#E4DDD0] rounded-2xl text-center text-sm text-[#5B564D]">
                  공개된 강의 경력이 아직 등록되지 않았습니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredLectures.map((lecture) => (
                    <article
                      key={lecture.id}
                      onClick={() => onNavigate(`/lectures/${lecture.id}`)}
                      className="group cursor-pointer bg-white border border-[#E4DDD0] rounded-2xl overflow-hidden hover:border-[#2E5A3E] transition-colors flex flex-col"
                    >
                      {lecture.images.length > 0 && (
                        <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3ECE1]">
                          <ResilientImage
                            src={lecture.images[0]}
                            alt={lecture.title}
                            fallbackTitle={lecture.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#7A5638]">
                            <span className="font-semibold text-[#2E5A3E]">{lecture.field}</span>
                            {lecture.organization && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{lecture.organization}</span>
                              </>
                            )}
                            {lecture.period && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">{lecture.period}</span>
                              </>
                            )}
                          </div>
                          <h3 className="font-display text-lg text-[#242B22] group-hover:text-[#2E5A3E] transition-colors leading-snug">
                            {lecture.title}
                          </h3>
                          {lecture.purpose && (
                            <p className="text-sm text-[#5B564D] line-clamp-3 leading-relaxed">
                              {lecture.purpose}
                            </p>
                          )}
                        </div>
                        <div className="pt-3 border-t border-[#F3ECE1] flex items-center justify-between text-xs text-[#7A5638]">
                          <span>{lecture.targetAudience || '세부 내용 보기'}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#7A5638] group-hover:text-[#2E5A3E] transition-colors" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'projects':
        return (
          <section key="projects" className="py-16 lg:py-20 bg-white border-b border-[#E4DDD0]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#7A5638]">대표 프로젝트 아카이브</p>
                  <h2 className="mt-1 font-display text-2xl sm:text-[1.75rem] text-[#1E2E21]">
                    기획과 참여로 만들어 낸 활동들
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/projects')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E5A3E] hover:underline whitespace-nowrap"
                >
                  전체 프로젝트 보기
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {featuredProjects.length === 0 ? (
                <div className="p-10 bg-[#FAF7F0] border border-[#E4DDD0] rounded-2xl text-center text-sm text-[#5B564D]">
                  공개된 프로젝트가 아직 등록되지 않았습니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredProjects.map((project) => {
                    const thumb = project.coverImage || project.images[0];
                    return (
                      <article
                        key={project.id}
                        onClick={() => onNavigate(`/projects/${project.id}`)}
                        className="group cursor-pointer bg-[#FAF7F0] border border-[#E4DDD0] rounded-2xl overflow-hidden hover:border-[#7A5638] transition-colors flex flex-col"
                      >
                        {thumb && (
                          <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3ECE1]">
                            <ResilientImage
                              src={thumb}
                              alt={project.title}
                              fallbackTitle={project.title}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                            />
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                          <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#7A5638]">
                              <span className="font-semibold text-[#2E5A3E]">{project.category}</span>
                              {project.organization && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{project.organization}</span>
                                </>
                              )}
                              {project.period && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums">{project.period}</span>
                                </>
                              )}
                            </div>
                            <h3 className="font-display text-lg sm:text-xl text-[#242B22] group-hover:text-[#2E5A3E] transition-colors leading-snug">
                              {project.title}
                            </h3>
                            {project.summary && (
                              <p className="text-sm text-[#5B564D] line-clamp-3 leading-relaxed">
                                {project.summary}
                              </p>
                            )}
                          </div>
                          <div className="pt-3 border-t border-[#E4DDD0] flex items-center justify-between text-xs text-[#7A5638]">
                            <span className="truncate">{project.role || '프로젝트 상세 보기'}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#7A5638] group-hover:text-[#2E5A3E] transition-colors shrink-0" />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        );

      case 'recent':
        return (
          <section key="recent" className="py-16 lg:py-20 border-b border-[#E4DDD0] bg-[#FAF7F0]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#7A5638]">최근 활동 아카이브</p>
                <h2 className="mt-1 font-display text-2xl sm:text-[1.75rem] text-[#1E2E21]">
                  최근 기록된 교육 및 프로젝트
                </h2>
              </div>

              {recentActivities.length === 0 ? (
                <p className="text-sm text-[#5B564D]">최근 등록된 활동이 없습니다.</p>
              ) : (
                <div className="bg-white border border-[#E4DDD0] rounded-2xl divide-y divide-[#E4DDD0]">
                  {recentActivities.map((item) => (
                    <button
                      key={`${item.kind}-${item.id}`}
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      className="w-full text-left px-5 py-4 hover:bg-[#EBF2EC]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B564D]">
                          <span className="font-semibold text-[#2E5A3E]">{item.kind}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.category}</span>
                          {item.org && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#7A5638]">{item.org}</span>
                            </>
                          )}
                          {item.isSample && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-neutral-400">샘플 데이터</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-[#242B22] truncate">
                          {item.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-xs text-[#7A5638] tabular-nums">
                        <span>{item.period || new Date(item.updatedAt).toLocaleDateString('ko-KR')}</span>
                        <ArrowRight className="w-4 h-4 text-[#7A5638]" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key="cta" className="py-16 lg:py-20 bg-[#2E5A3E] text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <p className="text-xs font-medium text-[#D8CEBE]">나무쌤 김민서 · 교육 협업 문의</p>
                <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
                  학교와 기관에 맞는 청소년 교육·협업을 함께 기획합니다
                </h2>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  자유학기제, 진로체험, 방과후아카데미 AI 활용 교육, 리더십 캠프 및 참여형 프로젝트까지 대상과 현장에 맞춘 프로그램을 제안해 드립니다.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('/projects')}
                  className="px-5 py-3 text-sm font-medium text-white border border-white/35 rounded-2xl hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  전체 포트폴리오 보기
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#2E5A3E] bg-[#FAF7F0] rounded-2xl hover:bg-white transition-colors whitespace-nowrap"
                >
                  강의·협업 문의하기
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return <div>{siteSettings.sectionOrder.map((id) => renderSection(id))}</div>;
}
