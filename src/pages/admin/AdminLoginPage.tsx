import React, { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useFeedback } from '../../components/ToastProvider';

interface AdminLoginPageProps {
  hasAdmin: boolean;
  onAuthenticated: () => Promise<void>;
  onNavigate: (path: string) => void;
}

export function AdminLoginPage({
  hasAdmin,
  onAuthenticated,
  onNavigate,
}: AdminLoginPageProps) {
  const { showToast } = useFeedback();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (!hasAdmin) {
      if (password.length < 8) {
        setErrorMsg('비밀번호는 최소 8자 이상으로 설정해 주세요.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (!hasAdmin) {
        await api.setupAdmin({ email: email.trim(), name: name.trim() || '관리자', password });
        showToast('초기 관리자 계정이 설정되고 로그인되었습니다.');
      } else {
        await api.login({ email: email.trim(), password });
        showToast('관리자 페이지에 로그인했습니다.');
      }
      await onAuthenticated();
      onNavigate('/admin');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '인증에 실패했습니다.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-[#1D241E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          공개 포트폴리오로 돌아가기
        </button>

        <div className="bg-white border border-[#E3DDD3] rounded-xl p-7 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2D4F38]">
              {hasAdmin ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{hasAdmin ? '관리자 전용 인증' : '최초 관리자 초기 설정 (1회 한정)'}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1D241E]">
              {hasAdmin ? '관리자 로그인' : '관리자 계정 등록'}
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {hasAdmin
                ? '인증된 관리자만 포트폴리오 콘텐츠를 등록, 수정 및 삭제할 수 있습니다.'
                : '최초 1회에 한해 관리자 계정을 생성합니다. 설정이 완료되면 일반 회원가입 경로는 영구적으로 차단됩니다.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#DC2626]/30 rounded-lg text-sm text-[#991B1B]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!hasAdmin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1D241E]">관리자 이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동 강사"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">
                관리자 이메일 <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1D241E]">
                비밀번호 <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="password"
                required
                autoComplete={hasAdmin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasAdmin ? '비밀번호 입력' : '최소 8자 이상 입력'}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
              />
            </div>

            {!hasAdmin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1D241E]">
                  비밀번호 확인 <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg focus:outline-none focus:border-[#2D4F38]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-sm font-semibold text-white bg-[#2D4F38] rounded-lg hover:bg-[#213B2A] disabled:opacity-50 transition-colors"
            >
              {submitting
                ? '처리 중...'
                : hasAdmin
                  ? '로그인'
                  : '관리자 계정 생성 및 시작'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
