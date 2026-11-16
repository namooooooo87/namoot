import { useMemo, useState } from 'react';
import { ArrowRight, Search, Sprout } from 'lucide-react';
import type { CategoryItem, LectureItem } from '../../types/portfolio';
import { ResilientImage } from '../../components/ResilientImage';

interface LecturesPageProps {
  lectures: LectureItem[];
  categories: CategoryItem[];
  onNavigate: (path: string) => void;
}

export function LecturesPage({ lectures, categories, onNavigate }: LecturesPageProps) {
  const [selectedField, setSelectedField] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const lectureFields = useMemo(() => {
    const names = categories.filter((c) => c.type === 'lecture').map((c) => c.name);
    const fromData = lectures.map((l) => l.field).filter(Boolean);
    return ['전체', ...Array.from(new Set([...names, ...fromData]))];
  }, [categories, lectures]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lectures.filter((item) => {
      const matchField = selectedField === '전체' || item.field === selectedField;
      if (!matchField) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.field.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.targetAudience.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q)
      );
    });
  }, [lectures, selectedField, searchQuery]);

  return (
    <div className="pb-20">
      {/* Page Header */}
      <section className="bg-white border-b border-[#E4DDD0] py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A5638]">
            <Sprout className="w-4 h-4 text-[#2E5A3E]" />
            <span>강의 및 교육 활동 아카이브</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1E2E21]">
            강사 경력
          </h1>
          <p className="font-editorial text-base text-[#5B564D] max-w-2xl leading-relaxed">
            학교, 청소년센터, 수련원 및 캠프 현장에서 진행한 강의와 교육 프로그램의 목적, 교수법, 활동 내용을 분야별로 살펴보실 수 있습니다.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {lectureFields.map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => setSelectedField(field)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                  selectedField === field
                    ? 'bg-[#2E5A3E] text-white'
                    : 'bg-white text-[#5B564D] border border-[#E4DDD0] hover:text-[#242B22] hover:border-[#7A5638]'
                }`}
              >
                {field}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#7A5638] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="강의명, 기관, 대상 검색"
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#E4DDD0] rounded-xl focus:outline-none focus:border-[#2E5A3E]"
            />
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="p-12 bg-white border border-[#E4DDD0] rounded-2xl text-center space-y-2">
            <p className="font-display text-lg text-[#1E2E21]">조건에 맞는 강의 경력이 없습니다.</p>
            <p className="text-sm text-[#5B564D]">다른 분야를 선택하거나 검색어를 초기화해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lecture) => (
              <article
                key={lecture.id}
                onClick={() => onNavigate(`/lectures/${lecture.id}`)}
                className="group cursor-pointer bg-white border border-[#E4DDD0] rounded-2xl overflow-hidden hover:border-[#2E5A3E] hover:bg-[#FAF7F0]/50 transition-colors flex flex-col"
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
                    <h2 className="font-display text-lg text-[#242B22] group-hover:text-[#2E5A3E] transition-colors leading-snug">
                      {lecture.title}
                    </h2>
                    {lecture.purpose && (
                      <p className="text-sm text-[#5B564D] line-clamp-3 leading-relaxed">
                        {lecture.purpose}
                      </p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-[#F3ECE1] flex items-center justify-between text-xs text-[#7A5638]">
                    <span>
                      {lecture.targetAudience ? `대상: ${lecture.targetAudience}` : '상세 정보 보기'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#7A5638] group-hover:text-[#2E5A3E] transition-colors" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
