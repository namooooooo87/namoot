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
  getPublicBootstrap: () => requestJson<PublicBootstrapPayload>('/api/public/bootstrap'),
  getPublicLecture: (id: string) => requestJson<LectureItem>(`/api/public/lectures/${encodeURIComponent(id)}`),
  getPublicProject: (id: string) => requestJson<ProjectItem>(`/api/public/projects/${encodeURIComponent(id)}`),
  submitInquiry: (payload: {
    name: string;
    organization: string;
    email: string;
    phone: string;
    topic: string;
    message: string;
  }) =>
    requestJson<{ ok: boolean; id: string }>('/api/public/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Auth
  getAuthStatus: () => requestJson<AuthStatusPayload>('/api/auth/status'),
  setupAdmin: (payload: { email: string; name: string; password: string }) =>
    requestJson<{ user: AuthStatusPayload['user'] }>('/api/auth/setup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    requestJson<{ user: AuthStatusPayload['user'] }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () =>
    requestJson<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),

  // Admin
  getAdminBootstrap: () => requestJson<AdminBootstrapPayload>('/api/admin/bootstrap'),
  updateProfile: (payload: InstructorProfile) =>
    requestJson<InstructorProfile>('/api/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  updateSiteSettings: (payload: SiteSettings) =>
    requestJson<SiteSettings>('/api/admin/site-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Lectures
  createLecture: (payload: Partial<LectureItem>) =>
    requestJson<LectureItem>('/api/admin/lectures', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateLecture: (id: string, payload: Partial<LectureItem>) =>
    requestJson<LectureItem>(`/api/admin/lectures/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  toggleLecturePublish: (id: string, isPublished: boolean) =>
    requestJson<LectureItem>(`/api/admin/lectures/${encodeURIComponent(id)}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    }),
  deleteLecture: (id: string) =>
    requestJson<{ ok: boolean }>(`/api/admin/lectures/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Projects
  createProject: (payload: Partial<ProjectItem>) =>
    requestJson<ProjectItem>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProject: (id: string, payload: Partial<ProjectItem>) =>
    requestJson<ProjectItem>(`/api/admin/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  toggleProjectPublish: (id: string, isPublished: boolean) =>
    requestJson<ProjectItem>(`/api/admin/projects/${encodeURIComponent(id)}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    }),
  deleteProject: (id: string) =>
    requestJson<{ ok: boolean }>(`/api/admin/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Categories
  createCategory: (payload: { type: 'lecture' | 'project'; name: string }) =>
    requestJson<CategoryItem>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteCategory: (id: string) =>
    requestJson<{ ok: boolean }>(`/api/admin/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Inquiries
  updateInquiryStatus: (id: string, status: 'unread' | 'reviewed') =>
    requestJson<InquiryItem>(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteInquiry: (id: string) =>
    requestJson<{ ok: boolean }>(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function uploadImageWithProgress(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error('JPG, PNG, WEBP, GIF 형식의 이미지 파일만 업로드할 수 있습니다.'));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error('이미지 파일 크기는 최대 5MB까지 업로드할 수 있습니다.'));
      return;
    }

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
