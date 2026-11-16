import { createInitialPortfolioSeed, type PortfolioDataBundle } from '../data/initialSeed';
import type {
  AdminBootstrapPayload,
  AuthStatusPayload,
  CategoryItem,
  InquiryItem,
  InstructorProfile,
  LectureItem,
  ProjectItem,
  PublicBootstrapPayload,
  SiteSettings,
} from '../types/portfolio';

const STORAGE_KEY = 'namu_portfolio_static_data_v1';
const ADMIN_STORAGE_KEY = 'namu_portfolio_static_admin_v1';
const SESSION_KEY = 'namu_portfolio_static_session_v1';

interface LocalAdminRecord {
  id: string;
  email: string;
  name: string;
  passwordDigest: string;
}

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function digestText(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return input;
}

function loadStore(): PortfolioDataBundle {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PortfolioDataBundle;
    }
  } catch {
    // fallback to seed
  }
  const seeded = createInitialPortfolioSeed();
  saveStore(seeded);
  return seeded;
}

function saveStore(data: PortfolioDataBundle): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

function getLocalAdmin(): LocalAdminRecord | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalAdminRecord) : null;
  } catch {
    return null;
  }
}

function isLocalAuthenticated(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) === '1' && getLocalAdmin() !== null;
  } catch {
    return false;
  }
}

function requireLocalAdmin(): void {
  if (!isLocalAuthenticated()) {
    throw new Error('관리자 로그인이 필요합니다.');
  }
}

export const staticStore = {
  getPublicBootstrap(): PublicBootstrapPayload {
    const db = loadStore();
    return {
      profile: db.profile,
      siteSettings: db.siteSettings,
      categories: [...db.categories].sort((a, b) => a.order - b.order),
      lectures: db.lectures.filter((l) => l.isPublished),
      projects: db.projects.filter((p) => p.isPublished),
    };
  },

  getPublicLecture(id: string): LectureItem {
    const db = loadStore();
    const item = db.lectures.find((l) => l.id === id && l.isPublished);
    if (!item) throw new Error('강의를 찾을 수 없습니다.');
    return item;
  },

  getPublicProject(id: string): ProjectItem {
    const db = loadStore();
    const item = db.projects.find((p) => p.id === id && p.isPublished);
    if (!item) throw new Error('프로젝트를 찾을 수 없습니다.');
    return item;
  },

  submitInquiry(payload: {
    name: string;
    organization: string;
    email: string;
    phone: string;
    topic: string;
    message: string;
  }): { ok: boolean; id: string } {
    const db = loadStore();
    const item: InquiryItem = {
      id: makeId('inq'),
      name: payload.name.trim(),
      organization: payload.organization.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      topic: payload.topic.trim() || '강의 및 협업 문의',
      message: payload.message.trim(),
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
    db.inquiries.unshift(item);
    saveStore(db);
    return { ok: true, id: item.id };
  },

  getAuthStatus(): AuthStatusPayload {
    const admin = getLocalAdmin();
    const authenticated = isLocalAuthenticated();
    return {
      authenticated,
      hasAdmin: admin !== null,
      user:
        authenticated && admin
          ? { id: admin.id, email: admin.email, name: admin.name, role: 'admin' }
          : null,
    };
  },

  async setupAdmin(payload: {
    email: string;
    name: string;
    password: string;
  }): Promise<{ user: AuthStatusPayload['user'] }> {
    if (getLocalAdmin()) {
      throw new Error('이미 관리자 계정이 설정되어 있습니다.');
    }
    const admin: LocalAdminRecord = {
      id: makeId('admin'),
      email: payload.email.trim().toLowerCase(),
      name: payload.name.trim() || '관리자',
      passwordDigest: await digestText(payload.password),
    };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    localStorage.setItem(SESSION_KEY, '1');
    return { user: { id: admin.id, email: admin.email, name: admin.name, role: 'admin' } };
  },

  async login(payload: {
    email: string;
    password: string;
  }): Promise<{ user: AuthStatusPayload['user'] }> {
    const admin = getLocalAdmin();
    if (!admin) {
      throw new Error('관리자 계정이 설정되지 않았습니다.');
    }
    const digest = await digestText(payload.password);
    if (admin.email !== payload.email.trim().toLowerCase() || admin.passwordDigest !== digest) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    localStorage.setItem(SESSION_KEY, '1');
    return { user: { id: admin.id, email: admin.email, name: admin.name, role: 'admin' } };
  },

  logout(): { ok: boolean } {
    localStorage.removeItem(SESSION_KEY);
    return { ok: true };
  },

  getAdminBootstrap(): AdminBootstrapPayload {
    requireLocalAdmin();
    const db = loadStore();
    return {
      profile: db.profile,
      siteSettings: db.siteSettings,
      categories: [...db.categories].sort((a, b) => a.order - b.order),
      lectures: db.lectures,
      projects: db.projects,
      inquiries: db.inquiries,
    };
  },

  updateProfile(payload: InstructorProfile): InstructorProfile {
    requireLocalAdmin();
    const db = loadStore();
    const updated: InstructorProfile = {
      ...payload,
      id: db.profile.id,
      updatedAt: new Date().toISOString(),
    };
    db.profile = updated;
    saveStore(db);
    return updated;
  },

  updateSiteSettings(payload: SiteSettings): SiteSettings {
    requireLocalAdmin();
    const db = loadStore();
    const updated: SiteSettings = {
      ...payload,
      id: db.siteSettings.id,
      updatedAt: new Date().toISOString(),
    };
    db.siteSettings = updated;
    saveStore(db);
    return updated;
  },

  createLecture(payload: Partial<LectureItem>): LectureItem {
    requireLocalAdmin();
    const db = loadStore();
    const now = new Date().toISOString();
    const item: LectureItem = {
      id: makeId('lec'),
      title: payload.title?.trim() || '제목 없음',
      field: payload.field?.trim() || '',
      targetAudience: payload.targetAudience || '',
      organization: payload.organization || '',
      period: payload.period || '',
      participantsCount: payload.participantsCount || '',
      totalHours: payload.totalHours || '',
      purpose: payload.purpose || '',
      goals: payload.goals || '',
      details: payload.details || '',
      teachingMethods: payload.teachingMethods || '',
      images: payload.images || [],
      outcomes: payload.outcomes || '',
      attachments: payload.attachments || [],
      isPublished: payload.isPublished !== false,
      isFeatured: Boolean(payload.isFeatured),
      isSample: Boolean(payload.isSample),
      createdAt: now,
      updatedAt: now,
    };
    db.lectures.unshift(item);
    if (item.isFeatured && !db.siteSettings.featuredLectureIds.includes(item.id)) {
      db.siteSettings.featuredLectureIds.unshift(item.id);
    }
    saveStore(db);
    return item;
  },

  updateLecture(id: string, payload: Partial<LectureItem>): LectureItem {
    requireLocalAdmin();
    const db = loadStore();
    const idx = db.lectures.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('강의를 찾을 수 없습니다.');
    const updated: LectureItem = {
      ...db.lectures[idx],
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    db.lectures[idx] = updated;
    saveStore(db);
    return updated;
  },

  toggleLecturePublish(id: string, isPublished: boolean): LectureItem {
    return staticStore.updateLecture(id, { isPublished });
  },

  deleteLecture(id: string): { ok: boolean } {
    requireLocalAdmin();
    const db = loadStore();
    db.lectures = db.lectures.filter((l) => l.id !== id);
    db.siteSettings.featuredLectureIds = db.siteSettings.featuredLectureIds.filter((x) => x !== id);
    saveStore(db);
    return { ok: true };
  },

  createProject(payload: Partial<ProjectItem>): ProjectItem {
    requireLocalAdmin();
    const db = loadStore();
    const now = new Date().toISOString();
    const item: ProjectItem = {
      id: makeId('prj'),
      title: payload.title?.trim() || '제목 없음',
      category: payload.category?.trim() || '',
      period: payload.period || '',
      organization: payload.organization || '',
      role: payload.role || '',
      summary: payload.summary || '',
      planningIntent: payload.planningIntent || '',
      keyActivities: payload.keyActivities || '',
      images: payload.images || [],
      coverImage: payload.coverImage || '',
      videoUrl: payload.videoUrl || '',
      outcomes: payload.outcomes || '',
      links: payload.links || [],
      isPublished: payload.isPublished !== false,
      isFeatured: Boolean(payload.isFeatured),
      isSample: Boolean(payload.isSample),
      createdAt: now,
      updatedAt: now,
    };
    db.projects.unshift(item);
    if (item.isFeatured && !db.siteSettings.featuredProjectIds.includes(item.id)) {
      db.siteSettings.featuredProjectIds.unshift(item.id);
    }
    saveStore(db);
    return item;
  },

  updateProject(id: string, payload: Partial<ProjectItem>): ProjectItem {
    requireLocalAdmin();
    const db = loadStore();
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('프로젝트를 찾을 수 없습니다.');
    const updated: ProjectItem = {
      ...db.projects[idx],
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    db.projects[idx] = updated;
    saveStore(db);
    return updated;
  },

  toggleProjectPublish(id: string, isPublished: boolean): ProjectItem {
    return staticStore.updateProject(id, { isPublished });
  },

  deleteProject(id: string): { ok: boolean } {
    requireLocalAdmin();
    const db = loadStore();
    db.projects = db.projects.filter((p) => p.id !== id);
    db.siteSettings.featuredProjectIds = db.siteSettings.featuredProjectIds.filter((x) => x !== id);
    saveStore(db);
    return { ok: true };
  },

  createCategory(payload: { type: 'lecture' | 'project'; name: string }): CategoryItem {
    requireLocalAdmin();
    const db = loadStore();
    const nextOrder =
      db.categories.filter((c) => c.type === payload.type).reduce((m, c) => Math.max(m, c.order), 0) + 1;
    const item: CategoryItem = {
      id: makeId('cat'),
      type: payload.type,
      name: payload.name.trim(),
      order: nextOrder,
    };
    db.categories.push(item);
    saveStore(db);
    return item;
  },

  deleteCategory(id: string): { ok: boolean } {
    requireLocalAdmin();
    const db = loadStore();
    db.categories = db.categories.filter((c) => c.id !== id);
    saveStore(db);
    return { ok: true };
  },

  updateInquiryStatus(id: string, status: 'unread' | 'reviewed'): InquiryItem {
    requireLocalAdmin();
    const db = loadStore();
    const found = db.inquiries.find((i) => i.id === id);
    if (!found) throw new Error('문의를 찾을 수 없습니다.');
    found.status = status;
    saveStore(db);
    return found;
  },

  deleteInquiry(id: string): { ok: boolean } {
    requireLocalAdmin();
    const db = loadStore();
    db.inquiries = db.inquiries.filter((i) => i.id !== id);
    saveStore(db);
    return { ok: true };
  },
};
