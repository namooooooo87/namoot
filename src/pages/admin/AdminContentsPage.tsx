import { useMemo, useState } from 'react';
import { Eye, EyeOff, Plus, Search, Trash2 } from 'lucide-react';
import type { CategoryItem, LectureItem, ProjectItem } from '../../types/portfolio';
import { api } from '../../lib/api';
import { useFeedback } from '../../components/ToastProvider';

interface AdminContentsPageProps {
  lectures: LectureItem[];
  projects: ProjectItem[];
  categories: CategoryItem[];
  onRefresh: () => Promise<void>;
  onNavigate: (path: string) => void;
}

export function AdminContentsPage({
  lectures,
  projects,
  categories,
  onRefresh,
  onNavigate,
}: AdminContentsPageProps) {
  const { showToast, confirm } = useFeedback();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lecture' | 'project'>('all');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [sortOrder, setSortOrder] = useState<'updated-desc' | 'updated-asc' | 'created-desc' | 'created-asc'>('updated-desc');

  const [newCatType, setNewCatType] = useState<'lecture' | 'project'>('project');
  const [newCatName, setNewCatName] = useState('');

  const allCategoryNames = useMemo(() => {
    const names = categories
      .filter((c) => typeFilter === 'all' || c.type === typeFilter)
      .map((c) => c.name);
    return ['전체', ...Array.from(new Set(names))];
  }, [categories, typeFilter]);

  const unifiedRows = useMemo(() => {
    const rows = [
      ...lectures.map((l) => ({
        id: l.id,
        type: 'lecture' as const,
        typeLabel: '강의 경력',
        title: l.title,
        category: l.field,
        organization: l.organization,
        isPublished: l.isPublished,
        isSample: l.isSample,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      })),
      ...projects.map((p) => ({
        id: p.id,
        type: 'project' as const,
        typeLabel: '프로젝트',
        title: p.title,
        category: p.category,
        organization: p.organization,
        isPublished: p.isPublished,
        isSample: p.isSample,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    ];

    const q = search.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (typeFilter !== 'all' && row.type !== typeFilter) return false;
      if (categoryFilter !== '전체' && row.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.organization.toLowerCase().includes(q)
      );
    });

    filtered.sort((a, b) => {
      if (sortOrder === 'updated-desc') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortOrder === 'updated-asc') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (sortOrder === 'created-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return filtered;
  }, [lectures, projects, search, typeFilter, categoryFilter, sortOrder]);

  const handleTogglePublish = async (row: (typeof unifiedRows)[number]) => {
    try {
      if (row.type === 'lecture') {
        await api.toggleLecturePublish(row.id, !row.isPublished);
      } else {
        await api.toggleProjectPublish(row.id, !row.isPublished);
      }
      await onRefresh();
      showToast('공개 상태가 변경되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '상태 변경 실패', 'error');
    }
  };

  const handleDeleteRow = async (row: (typeof unifiedRows)[number]) => {
    const ok = await confirm({
      title: `${row.typeLabel} 삭제`,
      description: `"${row.title}" 항목을 삭제하시겠습니까?`,
      confirmLabel: '삭제',
      destructive: true,
    });
    if (!ok) return;
    try {
      if (row.type === 'lecture') {
        await api.deleteLecture(row.id);
      } else {
        await api.deleteProject(row.id);
      }
      await onRefresh();
      showToast('삭제되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '삭제 실패', 'error');
    }
  };

  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    try {
      await api.createCategory({ type: newCatType, name });
      setNewCatName('');
      await onRefresh();
      showToast('새 카테고리가 추가되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '카테고리 추가 실패', 'error');
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    const ok = await confirm({
      title: '카테고리 삭제',
      description: `"${cat.name}" 카테고리를 삭제하시겠습니까?`,
      confirmLabel: '삭제',
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.deleteCategory(cat.id);
      await onRefresh();
      showToast('카테고리가 삭제되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '삭제 실패', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#1D241E]">콘텐츠 통합 관리</h1>
        <p className="mt-1 text-sm text-neutral-500">
          전체 강의 및 프로젝트를 검색·필터링하고 공개 상태, 등록일, 수정일 및 카테고리를 관리합니다.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white border border-[#E3DDD3] rounded-xl space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목, 카테고리, 기관명 검색"
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as 'all' | 'lecture' | 'project');
                setCategoryFilter('전체');
              }}
              className="px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
            >
              <option value="all">유형: 전체</option>
              <option value="lecture">강의 경력만</option>
              <option value="project">프로젝트만</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
            >
              {allCategoryNames.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === '전체' ? '카테고리: 전체' : cat}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
              className="px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
            >
              <option value="updated-desc">최근 수정순</option>
              <option value="updated-asc">오래된 수정순</option>
              <option value="created-desc">최근 등록순</option>
              <option value="created-asc">과거 등록순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unified Content Table */}
      <div className="bg-white border border-[#E3DDD3] rounded-xl overflow-hidden">
        {unifiedRows.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            검색 조건에 해당하는 콘텐츠가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E3DDD3] bg-[#FAF8F4] text-xs font-semibold text-neutral-500">
                  <th className="py-3 px-4 whitespace-nowrap">유형</th>
                  <th className="py-3 px-4">제목 / 카테고리</th>
                  <th className="py-3 px-4 whitespace-nowrap">구분</th>
                  <th className="py-3 px-4 whitespace-nowrap">상태</th>
                  <th className="py-3 px-4 whitespace-nowrap">등록일</th>
                  <th className="py-3 px-4 whitespace-nowrap">수정일</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DDD3] text-sm">
                {unifiedRows.map((row) => (
                  <tr key={`${row.type}-${row.id}`} className="hover:bg-[#FAF8F4]">
                    <td className="py-3 px-4 text-xs font-semibold text-[#2D4F38] whitespace-nowrap">
                      {row.typeLabel}
                    </td>
                    <td className="py-3 px-4 min-w-[220px]">
                      <p className="font-medium text-[#1D241E]">{row.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {row.category}
                        {row.organization ? ` · ${row.organization}` : ''}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-500 whitespace-nowrap">
                      {row.isSample ? '샘플 데이터' : '직접 등록'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(row)}
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          row.isPublished ? 'text-[#2D4F38]' : 'text-[#D97706]'
                        }`}
                      >
                        {row.isPublished ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> 공개
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> 비공개
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-500 tabular-nums whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-500 tabular-nums whitespace-nowrap">
                      {new Date(row.updatedAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate(row.type === 'lecture' ? '/admin/lectures' : '/admin/projects')
                          }
                          className="text-xs font-medium text-[#2D4F38] hover:underline"
                        >
                          편집
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row)}
                          className="p-1 text-neutral-400 hover:text-[#DC2626]"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Manager */}
      <section className="p-6 bg-white border border-[#E3DDD3] rounded-xl space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#1D241E]">활동 카테고리 및 교육 분야 관리</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            강의 교육 분야와 프로젝트 카테고리를 자유롭게 추가하거나 정리할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value as 'lecture' | 'project')}
            className="px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
          >
            <option value="project">프로젝트 카테고리</option>
            <option value="lecture">강의 교육 분야</option>
          </select>
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="새 카테고리명 입력"
            className="flex-1 px-3.5 py-2 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#2D4F38] rounded-lg whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            카테고리 추가
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-neutral-500">강의 교육 분야</h3>
            <ul className="divide-y divide-[#E3DDD3] border border-[#E3DDD3] rounded-lg">
              {categories
                .filter((c) => c.type === 'lecture')
                .map((cat) => (
                  <li
                    key={cat.id}
                    className="px-3.5 py-2.5 flex items-center justify-between text-sm bg-[#FAF8F4]"
                  >
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-neutral-400 hover:text-[#DC2626]"
                      aria-label="카테고리 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-neutral-500">프로젝트 카테고리</h3>
            <ul className="divide-y divide-[#E3DDD3] border border-[#E3DDD3] rounded-lg">
              {categories
                .filter((c) => c.type === 'project')
                .map((cat) => (
                  <li
                    key={cat.id}
                    className="px-3.5 py-2.5 flex items-center justify-between text-sm bg-[#FAF8F4]"
                  >
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-neutral-400 hover:text-[#DC2626]"
                      aria-label="카테고리 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
