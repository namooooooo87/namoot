import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import type {
  CategoryItem,
  HomeSectionId,
  InquiryItem,
  InstructorProfile,
  LectureItem,
  ProjectItem,
  SiteSettings,
} from './src/types/portfolio.ts';
import { createInitialPortfolioSeed } from './src/data/initialSeed.ts';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: AdminUser[];
  profile: InstructorProfile;
  lectures: LectureItem[];
  projects: ProjectItem[];
  categories: CategoryItem[];
  siteSettings: SiteSettings;
  inquiries: InquiryItem[];
}

const PORT = 3000;
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'portfolio-db.json');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const COOKIE_NAME = 'portfolio_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Generate or derive a persistent session secret if env var is missing
const SECRET_FILE = path.join(DATA_DIR, '.session-secret');
function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET !== 'change-this-to-a-secure-random-string') {
    return process.env.SESSION_SECRET;
  }
  if (fs.existsSync(SECRET_FILE)) {
    return fs.readFileSync(SECRET_FILE, 'utf8').trim();
  }
  const generated = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600 });
  return generated;
}
const SESSION_SECRET = getSessionSecret();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function signSessionToken(payload: { uid: string; email: string; role: 'admin'; exp: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifySessionToken(token: string): { uid: string; email: string; role: 'admin'; exp: number } | null {
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;
  const body = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!decoded || typeof decoded.uid !== 'string' || decoded.role !== 'admin' || typeof decoded.exp !== 'number') {
      return null;
    }
    if (Date.now() > decoded.exp) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (key) {
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

function createInitialSeed(): DatabaseSchema {
  const now = new Date().toISOString();
  const initialUsers: AdminUser[] = [];

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    initialUsers.push({
      id: `admin-${crypto.randomUUID()}`,
      email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
      name: process.env.ADMIN_NAME?.trim() || '관리자',
      role: 'admin',
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD),
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    users: initialUsers,
    ...createInitialPortfolioSeed(),
  };
}

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const seeded = createInitialSeed();
    saveDatabase(seeded);
    return seeded;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    return parsed;
  } catch (err) {
    console.error('Failed to read DB file, recreating initial seed:', err);
    const seeded = createInitialSeed();
    saveDatabase(seeded);
    return seeded;
  }
}

function saveDatabase(data: DatabaseSchema): void {
  const tmpPath = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_FILE);
}

let db: DatabaseSchema = loadDatabase();

// Simple in-memory login rate limiter
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 15) {
    return false;
  }
  entry.count += 1;
  return true;
}

function getAuthenticatedAdmin(req: Request): AdminUser | null {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const user = db.users.find((u) => u.id === payload.uid && u.role === 'admin');
  return user || null;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    res.status(401).json({ error: '관리자 인증이 필요합니다.' });
    return;
  }
  next();
}

function setSessionCookie(res: Response, req: Request, user: AdminUser): void {
  const token = signSessionToken({
    uid: user.id,
    email: user.email,
    role: 'admin',
    exp: Date.now() + SESSION_TTL_MS,
  });
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

function sanitizeString(val: unknown, maxLen = 5000): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function sanitizeStringArray(val: unknown, maxItems = 30, maxLen = 200): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .map((item) => sanitizeString(item, maxLen))
    .filter((s) => s.length > 0)
    .slice(0, maxItems);
}

function detectImageExtension(buf: Buffer, mimeType: string): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff && mimeType === 'image/jpeg') {
    return '.jpg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    mimeType === 'image/png'
  ) {
    return '.png';
  }
  // WEBP: RIFF....WEBP
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP' &&
    mimeType === 'image/webp'
  ) {
    return '.webp';
  }
  // GIF: GIF87a / GIF89a
  const header6 = buf.subarray(0, 6).toString('ascii');
  if ((header6 === 'GIF87a' || header6 === 'GIF89a') && mimeType === 'image/gif') {
    return '.gif';
  }
  return null;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // Serve uploaded files safely
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      fallthrough: false,
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    }),
  );

  // Image upload endpoint (raw binary stream up to 5MB, strictly authenticated)
  app.post(
    '/api/upload',
    requireAdmin,
    express.raw({
      type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      limit: '5mb',
    }),
    (req: Request, res: Response) => {
      const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ error: '유효한 이미지 파일이 아닙니다. (최대 5MB, JPG/PNG/WEBP/GIF 지원)' });
        return;
      }
      if (req.body.length > 5 * 1024 * 1024) {
        res.status(413).json({ error: '이미지 크기는 5MB를 초과할 수 없습니다.' });
        return;
      }
      const ext = detectImageExtension(req.body, contentType);
      if (!ext) {
        res.status(400).json({ error: '허용되지 않거나 손상된 이미지 형식입니다. (JPG, PNG, WEBP, GIF만 허용)' });
        return;
      }
      const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
      const targetPath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(targetPath, req.body);
      res.status(201).json({ url: `/uploads/${filename}`, filename });
    },
  );

  app.use(express.json({ limit: '2mb' }));

  // --- AUTH ROUTES ---
  app.get('/api/auth/status', (req: Request, res: Response) => {
    const admin = getAuthenticatedAdmin(req);
    res.json({
      authenticated: Boolean(admin),
      hasAdmin: db.users.length > 0,
      user: admin
        ? {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          }
        : null,
    });
  });

  // One-time initial admin setup (strictly disabled once an admin exists - no public signup)
  app.post('/api/auth/setup', (req: Request, res: Response) => {
    if (db.users.length > 0) {
      res.status(403).json({ error: '이미 관리자 계정이 설정되어 있어 추가 가입이 불가합니다.' });
      return;
    }
    const email = sanitizeString(req.body?.email, 160).toLowerCase();
    const name = sanitizeString(req.body?.name, 80) || '관리자';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: '올바른 이메일 주소를 입력해 주세요.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' });
      return;
    }

    const now = new Date().toISOString();
    const newAdmin: AdminUser = {
      id: `admin-${crypto.randomUUID()}`,
      email,
      name,
      role: 'admin',
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now,
    };
    db.users.push(newAdmin);
    if (!db.profile.contact.email) {
      db.profile.contact.email = email;
    }
    saveDatabase(db);
    setSessionCookie(res, req, newAdmin);
    res.status(201).json({
      user: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name, role: newAdmin.role },
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const clientIp = req.ip || 'unknown';
    if (!checkLoginRateLimit(clientIp)) {
      res.status(429).json({ error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.' });
      return;
    }
    const email = sanitizeString(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      res.status(400).json({ error: '이메일과 비밀번호를 모두 입력해 주세요.' });
      return;
    }
    const admin = db.users.find((u) => u.email === email && u.role === 'admin');
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      return;
    }
    setSessionCookie(res, req, admin);
    res.json({
      user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  // --- PUBLIC ROUTES (Strictly published items only) ---
  app.get('/api/public/bootstrap', (_req: Request, res: Response) => {
    res.json({
      profile: db.profile,
      siteSettings: db.siteSettings,
      categories: [...db.categories].sort((a, b) => a.order - b.order),
      lectures: db.lectures.filter((item) => item.isPublished),
      projects: db.projects.filter((item) => item.isPublished),
    });
  });

  app.get('/api/public/lectures/:id', (req: Request, res: Response) => {
    const lecture = db.lectures.find((l) => l.id === req.params.id && l.isPublished);
    if (!lecture) {
      res.status(404).json({ error: '공개된 강의 정보를 찾을 수 없습니다.' });
      return;
    }
    res.json(lecture);
  });

  app.get('/api/public/projects/:id', (req: Request, res: Response) => {
    const project = db.projects.find((p) => p.id === req.params.id && p.isPublished);
    if (!project) {
      res.status(404).json({ error: '공개된 프로젝트 정보를 찾을 수 없습니다.' });
      return;
    }
    res.json(project);
  });

  app.post('/api/public/inquiries', (req: Request, res: Response) => {
    const name = sanitizeString(req.body?.name, 80);
    const organization = sanitizeString(req.body?.organization, 120);
    const email = sanitizeString(req.body?.email, 160);
    const phone = sanitizeString(req.body?.phone, 40);
    const topic = sanitizeString(req.body?.topic, 120);
    const message = sanitizeString(req.body?.message, 3000);

    if (!name || !email || !message) {
      res.status(400).json({ error: '이름, 이메일, 문의 내용을 모두 입력해 주세요.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: '올바른 이메일 형식을 입력해 주세요.' });
      return;
    }

    const inquiry: InquiryItem = {
      id: `inq-${crypto.randomUUID()}`,
      name,
      organization,
      email,
      phone,
      topic: topic || '강의 및 협업 문의',
      message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
    db.inquiries.unshift(inquiry);
    saveDatabase(db);
    res.status(201).json({ ok: true, id: inquiry.id });
  });

  // --- ADMIN ROUTES (Protected by requireAdmin) ---
  app.get('/api/admin/bootstrap', requireAdmin, (_req: Request, res: Response) => {
    res.json({
      profile: db.profile,
      siteSettings: db.siteSettings,
      categories: [...db.categories].sort((a, b) => a.order - b.order),
      lectures: db.lectures,
      projects: db.projects,
      inquiries: db.inquiries,
    });
  });

  app.put('/api/admin/profile', requireAdmin, (req: Request, res: Response) => {
    const body = req.body || {};
    const name = sanitizeString(body.name, 100);
    if (!name) {
      res.status(400).json({ error: '이름(활동명)은 필수 입력 항목입니다.' });
      return;
    }

    const education = Array.isArray(body.education)
      ? body.education
          .map((e: Record<string, unknown>) => ({
            id: sanitizeString(e.id, 64) || `edu-${crypto.randomUUID()}`,
            school: sanitizeString(e.school, 120),
            major: sanitizeString(e.major, 120),
            period: sanitizeString(e.period, 80),
            note: sanitizeString(e.note, 300),
          }))
          .filter((e: { school: string }) => e.school.length > 0)
      : db.profile.education;

    const certifications = Array.isArray(body.certifications)
      ? body.certifications
          .map((c: Record<string, unknown>) => ({
            id: sanitizeString(c.id, 64) || `cert-${crypto.randomUUID()}`,
            name: sanitizeString(c.name, 120),
            issuer: sanitizeString(c.issuer, 120),
            acquiredAt: sanitizeString(c.acquiredAt, 60),
          }))
          .filter((c: { name: string }) => c.name.length > 0)
      : db.profile.certifications;

    const nextProfileImage = sanitizeString(body.profileImage, 500) || db.profile.profileImage;
    db.profile = {
      id: 'main-profile',
      name,
      activityName: sanitizeString(body.activityName, 120),
      headline: sanitizeString(body.headline, 300),
      bio: sanitizeString(body.bio, 4000),
      philosophy: sanitizeString(body.philosophy, 2000),
      profileImage: nextProfileImage,
      specialties: sanitizeStringArray(body.specialties, 20, 100),
      coreCompetencies: sanitizeStringArray(body.coreCompetencies, 20, 200),
      education,
      certifications,
      contact: {
        email: sanitizeString(body.contact?.email, 160),
        instagram: sanitizeString(body.contact?.instagram, 300),
        blog: sanitizeString(body.contact?.blog, 300),
        youtube: sanitizeString(body.contact?.youtube, 300),
        otherLink: sanitizeString(body.contact?.otherLink, 300),
        inquiryGuide: sanitizeString(body.contact?.inquiryGuide, 2000),
      },
      updatedAt: new Date().toISOString(),
    };
    db.siteSettings.profileImage = nextProfileImage;
    saveDatabase(db);
    res.json(db.profile);
  });

  app.put('/api/admin/site-settings', requireAdmin, (req: Request, res: Response) => {
    const body = req.body || {};
    const validSections: HomeSectionId[] = [
      'hero',
      'philosophy',
      'keywords',
      'lectures',
      'projects',
      'recent',
      'cta',
    ];
    const requestedOrder = Array.isArray(body.sectionOrder)
      ? body.sectionOrder.filter((s: unknown): s is HomeSectionId =>
          typeof s === 'string' && validSections.includes(s as HomeSectionId),
        )
      : db.siteSettings.sectionOrder;

    // Ensure all sections exist once
    const uniqueOrder = Array.from(new Set([...requestedOrder, ...validSections]));

    const nextProfileImg = sanitizeString(body.profileImage, 500) || db.siteSettings.profileImage;
    db.siteSettings = {
      id: 'main-settings',
      heroKicker: sanitizeString(body.heroKicker, 120),
      heroHeadline: sanitizeString(body.heroHeadline, 300) || db.siteSettings.heroHeadline,
      heroSubheadline: sanitizeString(body.heroSubheadline, 1500),
      heroPrimaryCtaText: sanitizeString(body.heroPrimaryCtaText, 60) || '포트폴리오 살펴보기',
      heroImage: sanitizeString(body.heroImage, 500) || db.siteSettings.heroImage,
      profileImage: nextProfileImg,
      characterImage: sanitizeString(body.characterImage, 500) || db.siteSettings.characterImage || '/assets/aistudio/KakaoTalk_20261116_183534798_4d8a4ec2.png',
      keywords: sanitizeStringArray(body.keywords, 16, 60),
      featuredProjectIds: sanitizeStringArray(body.featuredProjectIds, 12, 100),
      featuredLectureIds: sanitizeStringArray(body.featuredLectureIds, 12, 100),
      sectionOrder: uniqueOrder,
      updatedAt: new Date().toISOString(),
    };
    db.profile.profileImage = nextProfileImg;
    saveDatabase(db);
    res.json(db.siteSettings);
  });

  // Lectures CRUD
  app.post('/api/admin/lectures', requireAdmin, (req: Request, res: Response) => {
    const body = req.body || {};
    const title = sanitizeString(body.title, 200);
    const field = sanitizeString(body.field, 120);
    if (!title || !field) {
      res.status(400).json({ error: '강의명과 교육 분야는 필수 입력 항목입니다.' });
      return;
    }
    const now = new Date().toISOString();
    const attachments = Array.isArray(body.attachments)
      ? body.attachments
          .map((a: Record<string, unknown>) => ({
            id: sanitizeString(a.id, 64) || `att-${crypto.randomUUID()}`,
            label: sanitizeString(a.label, 120),
            url: sanitizeString(a.url, 500),
          }))
          .filter((a: { label: string; url: string }) => a.label && a.url)
      : [];

    const item: LectureItem = {
      id: `lec-${crypto.randomUUID()}`,
      title,
      field,
      targetAudience: sanitizeString(body.targetAudience, 150),
      organization: sanitizeString(body.organization, 150),
      period: sanitizeString(body.period, 120),
      participantsCount: sanitizeString(body.participantsCount, 80),
      totalHours: sanitizeString(body.totalHours, 80),
      purpose: sanitizeString(body.purpose, 2000),
      goals: sanitizeString(body.goals, 2000),
      details: sanitizeString(body.details, 5000),
      teachingMethods: sanitizeString(body.teachingMethods, 2000),
      images: sanitizeStringArray(body.images, 15, 500),
      outcomes: sanitizeString(body.outcomes, 3000),
      attachments,
      isPublished: Boolean(body.isPublished ?? true),
      isFeatured: Boolean(body.isFeatured ?? false),
      isSample: false,
      createdAt: now,
      updatedAt: now,
    };
    db.lectures.unshift(item);
    if (item.isFeatured && !db.siteSettings.featuredLectureIds.includes(item.id)) {
      db.siteSettings.featuredLectureIds.push(item.id);
    }
    saveDatabase(db);
    res.status(201).json(item);
  });

  app.put('/api/admin/lectures/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.lectures.findIndex((l) => l.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: '수정할 강의를 찾을 수 없습니다.' });
      return;
    }
    const existing = db.lectures[idx];
    const body = req.body || {};
    const title = sanitizeString(body.title, 200);
    const field = sanitizeString(body.field, 120);
    if (!title || !field) {
      res.status(400).json({ error: '강의명과 교육 분야는 필수 입력 항목입니다.' });
      return;
    }
    const attachments = Array.isArray(body.attachments)
      ? body.attachments
          .map((a: Record<string, unknown>) => ({
            id: sanitizeString(a.id, 64) || `att-${crypto.randomUUID()}`,
            label: sanitizeString(a.label, 120),
            url: sanitizeString(a.url, 500),
          }))
          .filter((a: { label: string; url: string }) => a.label && a.url)
      : existing.attachments;

    const updated: LectureItem = {
      ...existing,
      title,
      field,
      targetAudience: sanitizeString(body.targetAudience, 150),
      organization: sanitizeString(body.organization, 150),
      period: sanitizeString(body.period, 120),
      participantsCount: sanitizeString(body.participantsCount, 80),
      totalHours: sanitizeString(body.totalHours, 80),
      purpose: sanitizeString(body.purpose, 2000),
      goals: sanitizeString(body.goals, 2000),
      details: sanitizeString(body.details, 5000),
      teachingMethods: sanitizeString(body.teachingMethods, 2000),
      images: sanitizeStringArray(body.images, 15, 500),
      outcomes: sanitizeString(body.outcomes, 3000),
      attachments,
      isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : existing.isPublished,
      isFeatured: typeof body.isFeatured === 'boolean' ? body.isFeatured : existing.isFeatured,
      isSample: typeof body.isSample === 'boolean' ? body.isSample : existing.isSample,
      updatedAt: new Date().toISOString(),
    };
    db.lectures[idx] = updated;
    if (updated.isFeatured && !db.siteSettings.featuredLectureIds.includes(updated.id)) {
      db.siteSettings.featuredLectureIds.push(updated.id);
    } else if (!updated.isFeatured) {
      db.siteSettings.featuredLectureIds = db.siteSettings.featuredLectureIds.filter(
        (id) => id !== updated.id,
      );
    }
    saveDatabase(db);
    res.json(updated);
  });

  app.patch('/api/admin/lectures/:id/publish', requireAdmin, (req: Request, res: Response) => {
    const item = db.lectures.find((l) => l.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: '강의를 찾을 수 없습니다.' });
      return;
    }
    item.isPublished = Boolean(req.body?.isPublished);
    item.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json(item);
  });

  app.delete('/api/admin/lectures/:id', requireAdmin, (req: Request, res: Response) => {
    const before = db.lectures.length;
    db.lectures = db.lectures.filter((l) => l.id !== req.params.id);
    if (db.lectures.length === before) {
      res.status(404).json({ error: '삭제할 강의를 찾을 수 없습니다.' });
      return;
    }
    db.siteSettings.featuredLectureIds = db.siteSettings.featuredLectureIds.filter(
      (id) => id !== req.params.id,
    );
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Projects CRUD
  app.post('/api/admin/projects', requireAdmin, (req: Request, res: Response) => {
    const body = req.body || {};
    const title = sanitizeString(body.title, 200);
    const category = sanitizeString(body.category, 120);
    if (!title || !category) {
      res.status(400).json({ error: '프로젝트명과 카테고리는 필수 입력 항목입니다.' });
      return;
    }
    const now = new Date().toISOString();
    const images = sanitizeStringArray(body.images, 20, 500);
    const coverImage = sanitizeString(body.coverImage, 500) || images[0] || '';
    const links = Array.isArray(body.links)
      ? body.links
          .map((a: Record<string, unknown>) => ({
            id: sanitizeString(a.id, 64) || `lnk-${crypto.randomUUID()}`,
            label: sanitizeString(a.label, 120),
            url: sanitizeString(a.url, 500),
          }))
          .filter((a: { label: string; url: string }) => a.label && a.url)
      : [];

    const item: ProjectItem = {
      id: `prj-${crypto.randomUUID()}`,
      title,
      category,
      period: sanitizeString(body.period, 120),
      organization: sanitizeString(body.organization, 150),
      role: sanitizeString(body.role, 150),
      summary: sanitizeString(body.summary, 2000),
      planningIntent: sanitizeString(body.planningIntent, 3000),
      keyActivities: sanitizeString(body.keyActivities, 5000),
      images,
      coverImage,
      videoUrl: sanitizeString(body.videoUrl, 500),
      outcomes: sanitizeString(body.outcomes, 3000),
      links,
      isPublished: Boolean(body.isPublished ?? true),
      isFeatured: Boolean(body.isFeatured ?? false),
      isSample: false,
      createdAt: now,
      updatedAt: now,
    };
    db.projects.unshift(item);
    if (item.isFeatured && !db.siteSettings.featuredProjectIds.includes(item.id)) {
      db.siteSettings.featuredProjectIds.push(item.id);
    }
    saveDatabase(db);
    res.status(201).json(item);
  });

  app.put('/api/admin/projects/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = db.projects.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: '수정할 프로젝트를 찾을 수 없습니다.' });
      return;
    }
    const existing = db.projects[idx];
    const body = req.body || {};
    const title = sanitizeString(body.title, 200);
    const category = sanitizeString(body.category, 120);
    if (!title || !category) {
      res.status(400).json({ error: '프로젝트명과 카테고리는 필수 입력 항목입니다.' });
      return;
    }
    const images = sanitizeStringArray(body.images, 20, 500);
    const coverImage = sanitizeString(body.coverImage, 500) || images[0] || '';
    const links = Array.isArray(body.links)
      ? body.links
          .map((a: Record<string, unknown>) => ({
            id: sanitizeString(a.id, 64) || `lnk-${crypto.randomUUID()}`,
            label: sanitizeString(a.label, 120),
            url: sanitizeString(a.url, 500),
          }))
          .filter((a: { label: string; url: string }) => a.label && a.url)
      : existing.links;

    const updated: ProjectItem = {
      ...existing,
      title,
      category,
      period: sanitizeString(body.period, 120),
      organization: sanitizeString(body.organization, 150),
      role: sanitizeString(body.role, 150),
      summary: sanitizeString(body.summary, 2000),
      planningIntent: sanitizeString(body.planningIntent, 3000),
      keyActivities: sanitizeString(body.keyActivities, 5000),
      images,
      coverImage,
      videoUrl: sanitizeString(body.videoUrl, 500),
      outcomes: sanitizeString(body.outcomes, 3000),
      links,
      isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : existing.isPublished,
      isFeatured: typeof body.isFeatured === 'boolean' ? body.isFeatured : existing.isFeatured,
      isSample: typeof body.isSample === 'boolean' ? body.isSample : existing.isSample,
      updatedAt: new Date().toISOString(),
    };
    db.projects[idx] = updated;
    if (updated.isFeatured && !db.siteSettings.featuredProjectIds.includes(updated.id)) {
      db.siteSettings.featuredProjectIds.push(updated.id);
    } else if (!updated.isFeatured) {
      db.siteSettings.featuredProjectIds = db.siteSettings.featuredProjectIds.filter(
        (id) => id !== updated.id,
      );
    }
    saveDatabase(db);
    res.json(updated);
  });

  app.patch('/api/admin/projects/:id/publish', requireAdmin, (req: Request, res: Response) => {
    const item = db.projects.find((p) => p.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
      return;
    }
    item.isPublished = Boolean(req.body?.isPublished);
    item.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json(item);
  });

  app.delete('/api/admin/projects/:id', requireAdmin, (req: Request, res: Response) => {
    const before = db.projects.length;
    db.projects = db.projects.filter((p) => p.id !== req.params.id);
    if (db.projects.length === before) {
      res.status(404).json({ error: '삭제할 프로젝트를 찾을 수 없습니다.' });
      return;
    }
    db.siteSettings.featuredProjectIds = db.siteSettings.featuredProjectIds.filter(
      (id) => id !== req.params.id,
    );
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Categories CRUD
  app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
    const type = req.body?.type === 'lecture' ? 'lecture' : req.body?.type === 'project' ? 'project' : null;
    const name = sanitizeString(req.body?.name, 80);
    if (!type || !name) {
      res.status(400).json({ error: '카테고리 유형과 이름을 정확히 입력해 주세요.' });
      return;
    }
    const exists = db.categories.some((c) => c.type === type && c.name === name);
    if (exists) {
      res.status(409).json({ error: '이미 존재하는 카테고리입니다.' });
      return;
    }
    const nextOrder =
      db.categories.filter((c) => c.type === type).reduce((max, c) => Math.max(max, c.order), 0) + 1;
    const item: CategoryItem = {
      id: `cat-${crypto.randomUUID()}`,
      type,
      name,
      order: nextOrder,
    };
    db.categories.push(item);
    saveDatabase(db);
    res.status(201).json(item);
  });

  app.delete('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const before = db.categories.length;
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    if (db.categories.length === before) {
      res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' });
      return;
    }
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Inquiries management
  app.patch('/api/admin/inquiries/:id', requireAdmin, (req: Request, res: Response) => {
    const inquiry = db.inquiries.find((i) => i.id === req.params.id);
    if (!inquiry) {
      res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
      return;
    }
    inquiry.status = req.body?.status === 'reviewed' ? 'reviewed' : 'unread';
    saveDatabase(db);
    res.json(inquiry);
  });

  app.delete('/api/admin/inquiries/:id', requireAdmin, (req: Request, res: Response) => {
    db.inquiries = db.inquiries.filter((i) => i.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Vite middleware in dev, static dist in production
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.join(ROOT_DIR, 'dist'));
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
