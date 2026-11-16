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
import { staticStore } from './staticStore';

let backendCheckPromise: Promise<boolean> | null = null;
let cachedIsStatic = false;

async function hasLiveBackend(): Promise<boolean> {
  if (!backendCheckPromise) {
    backendCheckPromise = (async () => {
      try {
        const res = await fetch('/api/auth/status', { credentials: 'include' });
        const ct = res.headers.get('content-type') || '';
        const live = res.ok && ct.includes('application/json');
        cachedIsStatic = !live;
        return live;
      } catch {
        cachedIsStatic = true;
        return false;
      }
    })();
  }
  return backendCheckPromise;
}

export function isStaticHostingMode(): boolean {
  return cachedIsStatic;
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = '요청을 처리하는 중 오류가 발생했습니다.';
    try {
      const errBody = await res.json();
      if (errBody && typeof errBody.error === 'string') {
        message = errBody.error;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Public
  getPublicBootstrap: async () => {
    if (!(await hasLiveBackend())) return staticStore.getPublicBootstrap();
    return requestJson<PublicBootstrapPayload>('/api/public/bootstrap');
  },
  getPublicLecture: async (id: string) => {
    if (!(await hasLiveBackend())) return staticStore.getPublicLecture(id);
    return requestJson<LectureItem>(`/api/public/lectures/${encodeURIComponent(id)}`);
  },
  getPublicProject: async (id: string) => {
    if (!(await hasLiveBackend())) return staticStore.getPublicProject(id);
    return requestJson<ProjectItem>(`/api/public/projects/${encodeURIComponent(id)}`);
  },
  submitInquiry: async (payload: {
    name: string;
    organization: string;
    email: string;
    phone: string;
    topic: string;
    message: string;
  }) => {
    if (!(await hasLiveBackend())) return staticStore.submitInquiry(payload);
    return requestJson<{ ok: boolean; id: string }>('/api/public/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Auth
  getAuthStatus: async () => {
    if (!(await hasLiveBackend())) return staticStore.getAuthStatus();
    return requestJson<AuthStatusPayload>('/api/auth/status');
  },
  setupAdmin: async (payload: { email: string; name: string; password: string }) => {
    if (!(await hasLiveBackend())) return staticStore.setupAdmin(payload);
    return requestJson<{ user: AuthStatusPayload['user'] }>('/api/auth/setup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  login: async (payload: { email: string; password: string }) => {
    if (!(await hasLiveBackend())) return staticStore.login(payload);
    return requestJson<{ user: AuthStatusPayload['user'] }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  logout: async () => {
    if (!(await hasLiveBackend())) return staticStore.logout();
    return requestJson<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  // Admin
  getAdminBootstrap: async () => {
    if (!(await hasLiveBackend())) return staticStore.getAdminBootstrap();
    return requestJson<AdminBootstrapPayload>('/api/admin/bootstrap');
  },
  updateProfile: async (payload: InstructorProfile) => {
    if (!(await hasLiveBackend())) return staticStore.updateProfile(payload);
    return requestJson<InstructorProfile>('/api/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  updateSiteSettings: async (payload: SiteSettings) => {
    if (!(await hasLiveBackend())) return staticStore.updateSiteSettings(payload);
    return requestJson<SiteSettings>('/api/admin/site-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Lectures
  createLecture: async (payload: Partial<LectureItem>) => {
    if (!(await hasLiveBackend())) return staticStore.createLecture(payload);
    return requestJson<LectureItem>('/api/admin/lectures', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateLecture: async (id: string, payload: Partial<LectureItem>) => {
    if (!(await hasLiveBackend())) return staticStore.updateLecture(id, payload);
    return requestJson<LectureItem>(`/api/admin/lectures/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  toggleLecturePublish: async (id: string, isPublished: boolean) => {
    if (!(await hasLiveBackend())) return staticStore.toggleLecturePublish(id, isPublished);
    return requestJson<LectureItem>(`/api/admin/lectures/${encodeURIComponent(id)}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    });
  },
  deleteLecture: async (id: string) => {
    if (!(await hasLiveBackend())) return staticStore.deleteLecture(id);
    return requestJson<{ ok: boolean }>(`/api/admin/lectures/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Projects
  createProject: async (payload: Partial<ProjectItem>) => {
    if (!(await hasLiveBackend())) return staticStore.createProject(payload);
    return requestJson<ProjectItem>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateProject: async (id: string, payload: Partial<ProjectItem>) => {
    if (!(await hasLiveBackend())) return staticStore.updateProject(id, payload);
    return requestJson<ProjectItem>(`/api/admin/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  toggleProjectPublish: async (id: string, isPublished: boolean) => {
    if (!(await hasLiveBackend())) return staticStore.toggleProjectPublish(id, isPublished);
    return requestJson<ProjectItem>(`/api/admin/projects/${encodeURIComponent(id)}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    });
  },
  deleteProject: async (id: string) => {
    if (!(await hasLiveBackend())) return staticStore.deleteProject(id);
    return requestJson<{ ok: boolean }>(`/api/admin/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Categories
  createCategory: async (payload: { type: 'lecture' | 'project'; name: string }) => {
    if (!(await hasLiveBackend())) return staticStore.createCategory(payload);
    return requestJson<CategoryItem>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  deleteCategory: async (id: string) => {
    if (!(await hasLiveBackend())) return staticStore.deleteCategory(id);
    return requestJson<{ ok: boolean }>(`/api/admin/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Inquiries
  updateInquiryStatus: async (id: string, status: 'unread' | 'reviewed') => {
    if (!(await hasLiveBackend())) return staticStore.updateInquiryStatus(id, status);
    return requestJson<InquiryItem>(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  deleteInquiry: async (id: string) => {
    if (!(await hasLiveBackend())) return staticStore.deleteInquiry(id);
    return requestJson<{ ok: boolean }>(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImageWithProgress(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('JPG, PNG, WEBP, GIF 형식의 이미지 파일만 업로드할 수 있습니다.');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('이미지 파일 크기는 최대 5MB까지 업로드할 수 있습니다.');
  }

  if (!(await hasLiveBackend())) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (ev) => {
        if (ev.lengthComputable && onProgress) {
          onProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      };
      reader.onload = () => {
        onProgress?.(100);
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('이미지 읽기에 실패했습니다.'));
        }
      };
      reader.onerror = () => reject(new Error('이미지 파일을 읽을 수 없습니다.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.withCredentials = true;
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data?.url) {
            resolve(data.url);
            return;
          }
        } catch {
          // fall through
        }
        reject(new Error('서버 응답을 해석할 수 없습니다.'));
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.error || '이미지 업로드에 실패했습니다.'));
        } catch {
          reject(new Error('이미지 업로드에 실패했습니다.'));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('네트워크 오류로 이미지 업로드에 실패했습니다.'));
    };

    xhr.send(file);
  });
}
