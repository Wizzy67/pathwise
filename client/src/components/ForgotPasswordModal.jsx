import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  KeyRound, ShieldCheck, Mail, Lock, Eye, EyeOff,
  ArrowRight, RotateCw, CheckCircle2, X, Sparkles, Check, ArrowLeft
} from 'lucide-react';
import api from '../services/api';

const ForgotPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Verify Code & Set Password, 3 = Success
  const [email, setEmail] = useState('');
  const [emailHint, setEmailHint] = useState('');
  const [devCode, setDevCode] = useState('');

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail('');
      setEmailHint('');
      setDevCode('');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrorMessage('');
      setResendTimer(0);
    }
  }, [isOpen]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // ESC to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Resend countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Password strength
  const getStrength = (pass) => {
    let s = 0;
    if (pass.length >= 6) s++;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) s++;
    return Math.min(s, 4);
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong'];
  const strengthColors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  // Step 1: Send Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = email.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid student email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: cleanEmail });
      setEmailHint(res.data.emailHint || cleanEmail);
      if (res.data.devCode) {
        setDevCode(res.data.devCode);
      }
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || 'No student account found with this email address.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend Code
  const handleResendCode = async () => {
    if (resendTimer > 0 || isSubmitting) return;
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.devCode) setDevCode(res.data.devCode);
      setResendTimer(60);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to resend verification code right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanCode = code.trim();

    if (cleanCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        identifier: email.trim(),
        code: cleanCode,
        newPassword
      });

      setStep(3);
      if (onSuccess) onSuccess(email.trim());
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || 'Invalid or expired verification code. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="forgot-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop overlay with blur */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            key="forgot-modal-card"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            className="relative w-full max-w-[425px] bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(32,66,139,0.22)] border border-slate-100 z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar: Standalone Back Button (Step 2) & Standalone Cancel Button */}
            <div className="flex items-center justify-between mb-4">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMessage('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#20428B] bg-slate-100/90 hover:bg-[#EEF2F9] transition-all cursor-pointer shadow-xs active:scale-95"
                  aria-label="Go back to previous step"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {/* Standalone unique close / cancel button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs ml-auto"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" strokeWidth={2.3} />
              </button>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* STEP 1: Enter Email                                       */}
            {/* ══════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <motion.div
                key="step-1-panel"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF2F9] text-[#20428B] border border-[#20428B]/15 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <KeyRound className="w-6 h-6" strokeWidth={2.3} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">
                    Forgot Password?
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 leading-relaxed max-w-[310px] mx-auto">
                    Enter your student email address and we'll send a 6-digit verification code to reset your account.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRequestCode} className="flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">
                      Student Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#20428B] focus:ring-2 focus:ring-[#20428B]/10 transition-all font-medium"
                        autoComplete="email"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full mt-1 py-3.5 px-4 rounded-xl bg-[#20428B] hover:bg-[#1A346C] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </span>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* STEP 2: Verify Code & Set Password                       */}
            {/* ══════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <motion.div
                key="step-2-panel"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <div className="text-center mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#EEF2F9] text-[#20428B] border border-[#20428B]/15 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
                    <ShieldCheck className="w-5 h-5" strokeWidth={2.3} />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-outfit">
                    Reset Password
                  </h3>

                  {/* Clean 1-Line Email Badge */}
                  <div className="flex items-center justify-center gap-1.5 mt-1 text-xs text-slate-500">
                    <span>Code sent to</span>
                    <strong className="text-slate-800 font-bold">{emailHint || email}</strong>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setErrorMessage('');
                      }}
                      className="text-[#20428B] font-bold hover:underline ml-1 cursor-pointer"
                    >
                      (Change)
                    </button>
                  </div>

                  {/* Dev Code Auto-Fill Helper */}
                  {devCode && (
                    <div className="mt-2 py-1.5 px-3 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-between text-xs text-blue-900 text-left">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Dev Code: <strong className="font-mono font-bold">{devCode}</strong></span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setCode(devCode)}
                        className="text-[11px] font-bold text-[#20428B] bg-white px-2 py-0.5 rounded border border-blue-300 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>

                {/* Form */}
                <form onSubmit={handleResetPassword} className="flex flex-col gap-3 text-left">
                  {/* Group 1: 6-Digit Code */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        6-Digit OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={resendTimer > 0 || isSubmitting}
                        className="text-[11px] font-bold text-[#20428B] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                        <span>{resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend code'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-base text-slate-900 tracking-[0.35em] text-center font-mono placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-[#20428B] focus:ring-2 focus:ring-[#20428B]/10 transition-all font-bold"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  {/* Group 2: New Password & Confirm */}
                  <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                    {/* New Password */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#20428B] focus:ring-2 focus:ring-[#20428B]/10 transition-all font-medium"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#20428B] focus:ring-2 focus:ring-[#20428B]/10 transition-all font-medium"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Compact Strength & Match Status Bar */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      {newPassword ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className="w-4 h-1 rounded-full transition-all duration-300"
                                style={{
                                  backgroundColor: bar <= strength ? strengthColors[strength - 1] || '#3B82F6' : '#E2E8F0'
                                }}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-slate-600">
                            {strengthLabels[strength - 1] || 'Too weak'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Min. 6 characters</span>
                      )}

                      {confirmPassword && (
                        <div>
                          {newPassword === confirmPassword ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> Match
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium">
                              No match
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      code.length !== 6 ||
                      newPassword.length < 6 ||
                      newPassword !== confirmPassword
                    }
                    className="w-full mt-1 py-3 px-4 rounded-xl bg-[#20428B] hover:bg-[#1A346C] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </span>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setErrorMessage('');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      ← Back
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* STEP 3: Complete Success State                            */}
            {/* ══════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <motion.div
                key="step-3-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-3"
              >
                <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-4 bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" strokeWidth={2.4} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">
                  Password Updated! 🎉
                </h3>
                <p className="text-[13px] text-slate-500 mt-2 leading-relaxed px-2">
                  Your student account password has been successfully reset. You can now sign in immediately using your new password.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mt-6 py-3.5 px-4 rounded-xl bg-[#20428B] hover:bg-[#1A346C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ForgotPasswordModal;
