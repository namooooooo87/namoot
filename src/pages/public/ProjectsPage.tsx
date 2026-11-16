import { useMemo, useState } from 'react';
import { ArrowRight, Search, Trees } from 'lucide-react';
import type { CategoryItem, ProjectItem } from '../../types/portfolio';
import { ResilientImage } from '../../components/ResilientImage';

interface ProjectsPageProps {
  projects: ProjectItem[];
  categories: CategoryItem[];
  onNavigate: (path: string) => void;
}

export function ProjectsPage({ projects, categories, onNavigate }: ProjectsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const projectCategories = useMemo(() => {
    const names = categories.filter((c) => c.type === 'project').map((c) => c.name);
    const fromData = projects.map((p) => p.category).filter(Boolean);
    return ['전체', ...Array.from(new Set([...names, ...fromData]))];
  }, [categories, projects]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((item) => {
      const matchCat = selectedCategory === '전체' || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      );
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <div className="pb-20">
      <section className="bg-white border-b border-[#E4DDD0] py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A5638]">
            <Trees className="w-4 h-4 text-[#2E5A3E]" />
            <span>프로젝트 및 대외활동 아카이브</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1E2E21]">
            프로젝트 아카이브
          </h1>
          <p className="font-editorial text-base text-[#5B564D] max-w-2xl leading-relaxed">
            청소년 참여·자치, 프로그램 기획, 아웃리치·자원활동 등 다양한 현장에서 기획하고 실행한 프로젝트 기록입니다.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {projectCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#2E5A3E] text-white'
                    : 'bg-white text-[#5B564D] border border-[#E4DDD0] hover:text-[#242B22] hover:border-[#7A5638]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#7A5638] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트명, 기관, 역할 검색"
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#E4DDD0] rounded-xl focus:outline-none focus:border-[#2E5A3E]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 bg-white border border-[#E4DDD0] rounded-2xl text-center space-y-2">
            <p className="font-display text-lg text-[#1E2E21]">조건에 맞는 프로젝트가 없습니다.</p>
            <p className="text-sm text-[#5B564D]">다른 카테고리를 선택하거나 검색어를 변경해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => {
              const thumb = project.coverImage || project.images[0];
              return (
                <article
                  key={project.id}
                  onClick={() => onNavigate(`/projects/${project.id}`)}
                  className="group cursor-pointer bg-white border border-[#E4DDD0] rounded-2xl overflow-hidden hover:border-[#7A5638] hover:bg-[#FAF7F0]/50 transition-colors flex flex-col"
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
                      <h2 className="font-display text-lg text-[#242B22] group-hover:text-[#2E5A3E] transition-colors leading-snug">
                        {project.title}
                      </h2>
                      {project.summary && (
                        <p className="text-sm text-[#5B564D] line-clamp-3 leading-relaxed">
                          {project.summary}
                        </p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-[#F3ECE1] flex items-center justify-between text-xs text-[#7A5638]">
                      <span className="truncate">{project.role || '상세 내용 보기'}</span>
                      <ArrowRight className="w-4 h-4 text-[#7A5638] group-hover:text-[#2E5A3E] transition-colors shrink-0" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
