export type HomeSectionId =
  | 'hero'
  | 'philosophy'
  | 'keywords'
  | 'lectures'
  | 'projects'
  | 'recent'
  | 'cta';

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  period: string;
  note: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  acquiredAt: string;
}

export interface ContactInfo {
  email: string;
  instagram: string;
  blog: string;
  youtube: string;
  otherLink: string;
  inquiryGuide: string;
}

export interface InstructorProfile {
  id: string;
  name: string;
  activityName: string;
  headline: string;
  bio: string;
  philosophy: string;
  profileImage: string;
  specialties: string[];
  coreCompetencies: string[];
  education: EducationItem[];
  certifications: CertificationItem[];
  contact: ContactInfo;
  updatedAt: string;
}

export interface AttachmentItem {
  id: string;
  label: string;
  url: string;
}

export interface LectureItem {
  id: string;
  title: string;
  field: string;
  targetAudience: string;
  organization: string;
  period: string;
  participantsCount: string;
  totalHours: string;
  purpose: string;
  goals: string;
  details: string;
  teachingMethods: string;
  images: string[];
  outcomes: string;
  attachments: AttachmentItem[];
  isPublished: boolean;
  isFeatured: boolean;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  period: string;
  organization: string;
  role: string;
  summary: string;
  planningIntent: string;
  keyActivities: string;
  images: string[];
  coverImage: string;
  videoUrl: string;
  outcomes: string;
  links: AttachmentItem[];
  isPublished: boolean;
  isFeatured: boolean;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  type: 'lecture' | 'project';
  name: string;
  order: number;
}

export interface SiteSettings {
  id: string;
  heroKicker: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryCtaText: string;
  heroImage: string;
  profileImage: string;
  characterImage?: string;
  keywords: string[];
  featuredProjectIds: string[];
  featuredLectureIds: string[];
  sectionOrder: HomeSectionId[];
  updatedAt: string;
}

export interface InquiryItem {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  status: 'unread' | 'reviewed';
  createdAt: string;
}

export interface PublicBootstrapPayload {
  profile: InstructorProfile;
  siteSettings: SiteSettings;
  categories: CategoryItem[];
  lectures: LectureItem[];
  projects: ProjectItem[];
}

export interface AdminBootstrapPayload extends PublicBootstrapPayload {
  inquiries: InquiryItem[];
}

export interface AuthStatusPayload {
  authenticated: boolean;
  hasAdmin: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin';
  } | null;
}
