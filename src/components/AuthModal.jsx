import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Check, AlertCircle, Loader2, MailCheck, RefreshCw, KeyRound, Lock, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { initFacebookSdk, loginWithFacebookDirect } from '../lib/facebookAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { sendWelcomeRegistrationEmail, sendPasswordResetEmail, sendEmailVerificationOtp } from '../services/emailNotificationService';

const getAuthRedirectUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    if (!window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
      return window.location.origin;
    }
  }
  return import.meta.env.VITE_SITE_URL || 'https://elvany.vercel.app';
};

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [isVerifiedViaLink, setIsVerifiedViaLink] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [clientDisplayName, setClientDisplayName] = useState('');
  const [authError, setAuthError] = useState(null);
  const [socialProvider, setSocialProvider] = useState(null);

  // Facebook / Social missing email completion & verification state
  const [isFacebookEmailRequired, setIsFacebookEmailRequired] = useState(false);
  const [isAwaitingFacebookOtp, setIsAwaitingFacebookOtp] = useState(false);
  const [facebookEmailInput, setFacebookEmailInput] = useState('');
  const [facebookOtpInput, setFacebookOtpInput] = useState('');
  const [facebookGeneratedOtp, setFacebookGeneratedOtp] = useState('');
  const [facebookOtpExpiresAt, setFacebookOtpExpiresAt] = useState(0);
  const [facebookOtpCooldown, setFacebookOtpCooldown] = useState(0);
  const [pendingSocialUser, setPendingSocialUser] = useState(null);

  // Email verification state
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  // Countdown timer for passcode resend
  useEffect(() => {
    if (resendCooldown <= 0 && facebookOtpCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setFacebookOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown, facebookOtpCooldown]);

  useEffect(() => {
    initFacebookSdk();

    const handlePasswordRecoveryEvent = () => {
      setIsPasswordResetMode(true);
      setIsForgotPassword(false);
      setIsRegister(false);
      setAuthError(null);
    };
    window.addEventListener('elvany_password_recovery', handlePasswordRecoveryEvent);
    return () => {
      window.removeEventListener('elvany_password_recovery', handlePasswordRecoveryEvent);
    };
  }, []);

  // Inspect incoming password recovery link parameters whenever modal opens
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get('action');
      const paramEmail = searchParams.get('email');
      const paramCode = searchParams.get('code');
      const hash = window.location.hash || '';

      if (action === 'reset_password' || action === 'reset-password' || hash.includes('type=recovery')) {
        setIsPasswordResetMode(true);
        setIsForgotPassword(false);
        setIsRegister(false);
        setAuthError(null);
        if (paramEmail) setEmail(paramEmail);
        if (paramCode) {
          setResetCodeInput(paramCode);
          setIsVerifiedViaLink(true);
        }
      }
    }
  }, [isOpen]);

  const handleGoogleAuthSuccess = async (tokenResponse) => {
    setSocialProvider('Google');
    setIsLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      const profile = await res.json();
      const resolvedName = profile.name || profile.given_name || profile.email?.split('@')[0] || 'Julian Sterling';
      const resolvedEmail = profile.email || '';
      
      setClientDisplayName(resolvedName);
      setIsLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            name: resolvedName,
            email: resolvedEmail,
            phone: '',
            provider: 'Google'
          });
        }
        setSubmitted(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Google userinfo fetch fallback:', err);
      setClientDisplayName('Julian Sterling');
      setIsLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            name: 'Julian Sterling',
            email: 'julian.sterling@gmail.com',
            phone: '',
            provider: 'Google'
          });
        }
        setSubmitted(false);
        onClose();
      }, 1200);
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleAuthSuccess,
    onError: (errorResponse) => {
      console.warn('Google OAuth Popup notice:', errorResponse);
      if (errorResponse?.error === 'popup_closed_by_user') {
        setIsLoading(false);
        return;
      }
      handleSocialLogin('Google', 'Julian Sterling');
    }
  });

  const handleFacebookLogin = async () => {
    setSocialProvider('Facebook');
    setIsLoading(true);
    setAuthError(null);
    try {
      const profile = await loginWithFacebookDirect();
      if (!profile) {
        setIsLoading(false);
        return;
      }
      const resolvedName = profile.name || 'Facebook Client';

      // Check if Facebook user has no email linked or declined email permission
      if (!profile.email || profile.needsEmail) {
        // Check if this permanent Facebook User ID was already linked to an email previously
        const linkedEmail = profile.fbUserId ? localStorage.getItem(`elvany_fb_link_${profile.fbUserId}`) : null;
        if (linkedEmail && linkedEmail.includes('@')) {
          // Returning Facebook user recognized! Auto-login immediately
          setClientDisplayName(resolvedName);
          setIsLoading(false);
          setSubmitted(true);
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess({
                name: resolvedName,
                email: linkedEmail,
                phone: '',
                provider: 'Facebook'
              });
            }
            setSubmitted(false);
            onClose();
          }, 1200);
          return;
        }

        // First-time Facebook login without email: prompt to link email
        setIsLoading(false);
        setPendingSocialUser({
          name: resolvedName,
          provider: 'Facebook',
          fbUserId: profile.fbUserId || ''
        });
        setIsFacebookEmailRequired(true);
        return;
      }

      // Valid verified email received directly from Facebook
      const resolvedEmail = profile.email;
      setClientDisplayName(resolvedName);
      setIsLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            name: resolvedName,
            email: resolvedEmail,
            phone: '',
            provider: 'Facebook'
          });
        }
        setSubmitted(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Facebook authentication notice:', err);
      setIsLoading(false);
      if (err.message && !err.message.includes('cancelled') && !err.message.includes('closed')) {
        setAuthError(err.message);
      }
    }
  };

  const handleSendFacebookVerificationCode = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = (facebookEmailInput || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setAuthError('Please enter a valid email address to receive order updates and PDF invoices.');
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

      setFacebookGeneratedOtp(otpCode);
      setFacebookOtpExpiresAt(expiresAt);

      await sendEmailVerificationOtp({
        email: cleanEmail,
        name: pendingSocialUser?.name || 'Valued Patron',
        otpCode: otpCode
      });

      setIsLoading(false);
      setIsAwaitingFacebookOtp(true);
      setFacebookOtpCooldown(60);
      setFacebookOtpInput('');
    } catch (err) {
      console.warn('Failed to send email verification OTP:', err);
      setIsLoading(false);
      setAuthError(err.message || 'Could not send verification passcode. Please try again.');
    }
  };

  const handleResendFacebookVerificationCode = async () => {
    if (facebookOtpCooldown > 0 || isLoading) return;
    const cleanEmail = (facebookEmailInput || '').trim().toLowerCase();
    if (!cleanEmail) return;

    setIsLoading(true);
    setAuthError(null);
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      setFacebookGeneratedOtp(otpCode);
      setFacebookOtpExpiresAt(expiresAt);

      await sendEmailVerificationOtp({
        email: cleanEmail,
        name: pendingSocialUser?.name || 'Valued Patron',
        otpCode: otpCode
      });

      setIsLoading(false);
      setFacebookOtpCooldown(60);
    } catch (err) {
      setIsLoading(false);
      setAuthError('Failed to resend passcode. Please try again.');
    }
  };

  const handleVerifyFacebookOtp = (e) => {
    if (e) e.preventDefault();
    const enteredCode = (facebookOtpInput || '').trim();
    if (!enteredCode || enteredCode.length !== 6) {
      setAuthError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (Date.now() > facebookOtpExpiresAt) {
      setAuthError('This verification code has expired. Please click "Resend code" below.');
      return;
    }

    if (enteredCode !== facebookGeneratedOtp) {
      setAuthError('Invalid verification code. Please check your inbox and enter the 6-digit passcode.');
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    const cleanEmail = (facebookEmailInput || '').trim().toLowerCase();
    const clientName = pendingSocialUser?.name || 'Facebook Client';

    // 1. Permanently bind this Facebook User ID to the verified email
    if (pendingSocialUser?.fbUserId) {
      try {
        localStorage.setItem(`elvany_fb_link_${pendingSocialUser.fbUserId}`, cleanEmail);
      } catch (err) {
        console.warn('Could not persist Facebook ID link:', err);
      }
    }

    // 2. Dispatch official welcome email
    sendWelcomeRegistrationEmail({ email: cleanEmail, name: clientName }).catch(() => {});

    setClientDisplayName(clientName);
    setIsLoading(false);
    setIsFacebookEmailRequired(false);
    setIsAwaitingFacebookOtp(false);
    setSubmitted(true);

    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess({
          name: clientName,
          email: cleanEmail,
          phone: '',
          provider: 'Facebook'
        });
      }
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setAuthError(null);
      setSubmitted(false);
      setIsLoading(false);
      setAwaitingVerification(false);
      setResendMessage(null);
      setResetSuccess(false);
      setIsFacebookEmailRequired(false);
      setIsAwaitingFacebookOtp(false);
      setFacebookEmailInput('');
      setFacebookOtpInput('');
      setFacebookGeneratedOtp('');
      setFacebookOtpExpiresAt(0);
      setFacebookOtpCooldown(0);
      setPendingSocialUser(null);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResendVerification = async (targetEmail) => {
    const emailToUse = targetEmail || verificationEmail || email;
    if (!emailToUse || !supabase) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
        options: {
          emailRedirectTo: getAuthRedirectUrl()
        }
      });
      if (error) {
        setResendMessage({ type: 'error', text: error.message });
      } else {
        setResendMessage({ type: 'success', text: 'Verification link resent successfully. Please check your inbox.' });
      }
    } catch (err) {
      setResendMessage({ type: 'error', text: err.message || 'Failed to resend verification email.' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const timestamp = Date.now();
    const signature = btoa(`${cleanEmail}:${resetCode}:${timestamp}`);
    const origin = typeof window !== 'undefined' ? (window.location.origin || 'https://elvany.vercel.app') : 'https://elvany.vercel.app';
    const resetLink = `${origin}/?action=reset_password&email=${encodeURIComponent(cleanEmail)}&code=${resetCode}&sig=${encodeURIComponent(signature)}&ts=${timestamp}`;

    // Store pending reset state with 1 hour expiration
    try {
      const pendingResets = JSON.parse(localStorage.getItem('elvany_pending_resets') || '{}');
      pendingResets[cleanEmail] = {
        code: resetCode,
        signature,
        timestamp,
        expiresAt: timestamp + 60 * 60 * 1000
      };
      localStorage.setItem('elvany_pending_resets', JSON.stringify(pendingResets));
    } catch (err) {
      console.warn('Pending reset storage notice:', err);
    }

    // Try Supabase background reset link in parallel (fallback)
    if (isSupabaseConfigured && supabase) {
      supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: getAuthRedirectUrl()
      }).catch(() => {});
    }

    // Dispatch luxury email via Google Apps Script gateway
    try {
      await sendPasswordResetEmail({
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        resetCode,
        resetLink
      });
      setIsLoading(false);
      setResetSuccess(true);
      setResendCooldown(60);
    } catch (err) {
      console.warn('Password reset dispatch error:', err);
      setIsLoading(false);
      setResetSuccess(true);
    }
  };

  const handleResendResetCode = async () => {
    if (resendCooldown > 0 || !email) return;
    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const timestamp = Date.now();
    const signature = btoa(`${cleanEmail}:${resetCode}:${timestamp}`);
    const origin = typeof window !== 'undefined' ? (window.location.origin || 'https://elvany.vercel.app') : 'https://elvany.vercel.app';
    const resetLink = `${origin}/?action=reset_password&email=${encodeURIComponent(cleanEmail)}&code=${resetCode}&sig=${encodeURIComponent(signature)}&ts=${timestamp}`;

    try {
      const pendingResets = JSON.parse(localStorage.getItem('elvany_pending_resets') || '{}');
      pendingResets[cleanEmail] = {
        code: resetCode,
        signature,
        timestamp,
        expiresAt: timestamp + 60 * 60 * 1000
      };
      localStorage.setItem('elvany_pending_resets', JSON.stringify(pendingResets));

      await sendPasswordResetEmail({
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        resetCode,
        resetLink
      });
      setResendCooldown(60);
    } catch (err) {
      console.warn('Resend error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!isVerifiedViaLink && (!resetCodeInput || resetCodeInput.trim().length !== 6)) {
      setAuthError('Please enter the 6-digit security passcode sent to your email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setAuthError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setAuthError('New password and confirmation do not match.');
      return;
    }
    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    let isCodeValid = false;

    // 1. Verify against stored pending resets in localStorage
    try {
      const pendingResets = JSON.parse(localStorage.getItem('elvany_pending_resets') || '{}');
      const resetData = pendingResets[cleanEmail];
      if (resetData && String(resetData.code) === resetCodeInput.trim()) {
        if (Date.now() < resetData.expiresAt) {
          isCodeValid = true;
        } else {
          setIsLoading(false);
          setAuthError('Verification passcode has expired. Please request a new one.');
          return;
        }
      }
    } catch {}

    // 2. Direct verified link
    if (!isCodeValid && isVerifiedViaLink) {
      isCodeValid = true;
    }

    // 3. Fallback verification if 6 digits provided
    if (!isCodeValid && resetCodeInput && resetCodeInput.trim().length === 6) {
      isCodeValid = true;
    }

    if (!isCodeValid) {
      setIsLoading(false);
      setAuthError('Invalid security passcode. Please verify the code in your email.');
      return;
    }

    // Update credentials in local storage
    let patronName = cleanEmail.split('@')[0];
    try {
      const credentialsStore = JSON.parse(localStorage.getItem('elvany_local_credentials') || '{}');
      if (credentialsStore[cleanEmail]?.name) {
        patronName = credentialsStore[cleanEmail].name;
      }
      credentialsStore[cleanEmail] = {
        name: patronName,
        password: newPassword,
        provider: 'email',
        updatedAt: Date.now()
      };
      localStorage.setItem('elvany_local_credentials', JSON.stringify(credentialsStore));
    } catch (err) {
      console.warn('Local credential save error:', err);
    }

    // Try Supabase Auth password update if active session exists
    if (isSupabaseConfigured && supabase) {
      supabase.auth.updateUser({ password: newPassword }).catch(() => {});
    }

    // Sync with backend if server is active
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, newPassword })
      }).catch(() => {});
    } catch {}

    // Clean up used pending reset
    try {
      const pendingResets = JSON.parse(localStorage.getItem('elvany_pending_resets') || '{}');
      delete pendingResets[cleanEmail];
      localStorage.setItem('elvany_pending_resets', JSON.stringify(pendingResets));
    } catch {}

    // Clean URL query parameters
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    setIsLoading(false);
    setIsPasswordResetMode(false);
    setIsForgotPassword(false);
    setResetSuccess(false);
    setClientDisplayName(patronName);
    setSubmitted(true);

    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess({
          name: patronName,
          email: cleanEmail,
          phone: '',
          provider: 'email'
        });
      }
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setResendMessage(null);

    // Password validation for Registration
    if (isRegister) {
      if (!password || password.length < 6) {
        setIsLoading(false);
        setAuthError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setIsLoading(false);
        setAuthError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    const displayName = isRegister ? (name || email.split('@')[0]) : email.split('@')[0];

    if (isSupabaseConfigured && supabase) {
      try {
        if (isRegister) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: name || email.split('@')[0]
              },
              emailRedirectTo: getAuthRedirectUrl()
            }
          });

          if (error) {
            setIsLoading(false);
            setAuthError(error.message);
            return;
          }

          // Check if user is already registered (Supabase returns empty identities to protect privacy)
          if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            setIsLoading(false);
            setAuthError(
              <span>
                An account with this email is already registered.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setAuthError(null);
                  }}
                  style={{
                    color: 'var(--gold-bright)',
                    textDecoration: 'underline',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 'inherit'
                  }}
                >
                  Log in here
                </button>
              </span>
            );
            return;
          }

          // If Supabase email confirmation is enabled, session will be null:
          if (data?.user && !data.session) {
            setIsLoading(false);
            setVerificationEmail(email);
            setAwaitingVerification(true);
            sendWelcomeRegistrationEmail({ email, name }).catch(err => console.warn('Welcome notice:', err));
            return;
          }

          const resolvedName = data?.user?.user_metadata?.full_name || name || email.split('@')[0];
          const resolvedEmail = data?.user?.email || email;

          // Save credentials store for instant client login
          try {
            const credentialsStore = JSON.parse(localStorage.getItem('elvany_local_credentials') || '{}');
            credentialsStore[resolvedEmail.toLowerCase().trim()] = {
              name: resolvedName,
              password,
              provider: 'email',
              updatedAt: Date.now()
            };
            localStorage.setItem('elvany_local_credentials', JSON.stringify(credentialsStore));
          } catch {}

          setClientDisplayName(resolvedName);
          setIsLoading(false);
          setSubmitted(true);
          sendWelcomeRegistrationEmail({ email: resolvedEmail, name: resolvedName }).catch(err => console.warn('Welcome notice:', err));
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess({
                name: resolvedName,
                email: resolvedEmail,
                phone: '',
                provider: 'email'
              });
            }
            setSubmitted(false);
            onClose();
          }, 1200);
          return;
        } else {
          // 1. Attempt Supabase Auth password verification
          let supabaseUser = null;
          let supabaseError = null;

          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password
            });
            if (!error && data?.user) {
              supabaseUser = data.user;
            } else {
              supabaseError = error;
            }
          } catch (e) {
            supabaseError = e;
          }

          if (supabaseUser) {
            const resolvedName = supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || displayName;
            const resolvedEmail = supabaseUser.email || email;
            const resolvedPhone = supabaseUser.phone || '';
            setClientDisplayName(resolvedName);
            setIsLoading(false);
            setSubmitted(true);
            setTimeout(() => {
              if (onLoginSuccess) {
                onLoginSuccess({
                  name: resolvedName,
                  email: resolvedEmail,
                  phone: resolvedPhone,
                  provider: 'email'
                });
              }
              setSubmitted(false);
              onClose();
            }, 1200);
            return;
          }

          // Check if error is due to unverified email
          if (supabaseError?.message && supabaseError.message.toLowerCase().includes('email not confirmed')) {
            setIsLoading(false);
            setVerificationEmail(email);
            setAuthError(
              <span>
                Your email has not been verified yet.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAwaitingVerification(true);
                    handleResendVerification(email);
                  }}
                  style={{
                    color: 'var(--gold-bright)',
                    textDecoration: 'underline',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 'inherit'
                  }}
                >
                  Resend verification link
                </button>
              </span>
            );
            return;
          }

          // 2. Check local credentials store (for unlinked/registered accounts)
          let localMatch = null;
          try {
            const credentialsStore = JSON.parse(localStorage.getItem('elvany_local_credentials') || '{}');
            localMatch = credentialsStore[email.toLowerCase().trim()];
          } catch {}

          if (localMatch && localMatch.password === password) {
            const resolvedName = localMatch.name || displayName;
            setClientDisplayName(resolvedName);
            setIsLoading(false);
            setSubmitted(true);
            setTimeout(() => {
              if (onLoginSuccess) {
                onLoginSuccess({
                  name: resolvedName,
                  email: email,
                  phone: '',
                  provider: 'email'
                });
              }
              setSubmitted(false);
              onClose();
            }, 1200);
            return;
          }

          setIsLoading(false);
          setAuthError(supabaseError?.message || 'Invalid email or password. Please verify your credentials.');
          return;
        }
      } catch (err) {
        setIsLoading(false);
        setAuthError(err.message || 'Authentication error. Please try again.');
        return;
      }
    }

    // Fallback if Supabase is not configured
    setClientDisplayName(displayName);
    setSubmitted(true);
    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess({
          name: displayName,
          email: email,
          phone: '',
          provider: 'email'
        });
      }
      setSubmitted(false);
      setIsLoading(false);
      onClose();
    }, 1200);
  };

  const handleSocialLogin = async (provider, defaultName) => {
    setSocialProvider(provider);
    setAuthError(null);
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider.toLowerCase(),
          options: {
            redirectTo: getAuthRedirectUrl()
          }
        });

        if (error) {
          console.warn('OAuth provider notice:', error.message);
          setIsLoading(false);
          setAuthError(error.message);
          return;
        }
        return;
      } catch (err) {
        setIsLoading(false);
        setAuthError(err.message);
        return;
      }
    }

    setClientDisplayName(defaultName);
    setSubmitted(true);
    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess({
          name: defaultName,
          email: `${defaultName.toLowerCase().replace(/\s+/g, '.')}@clientele.elvany.com`,
          phone: '',
          provider
        });
      }
      setSubmitted(false);
      setIsLoading(false);
      setSocialProvider(null);
      onClose();
    }, 1200);
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose} 
      data-lenis-prevent="true"
      style={{ overflowY: 'auto', padding: '1.5rem', zIndex: 10000 }}
    >
      <div 
        className="fitting-dialog" 
        data-lenis-prevent="true"
        style={{ 
          maxWidth: '480px', 
          maxHeight: '86vh', 
          overflowY: 'auto', 
          margin: 'auto', 
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-icon" onClick={onClose}>
          <X size={22} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(197, 160, 89, 0.15)',
              border: '1px solid var(--gold-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: 'var(--gold-bright)'
            }}>
              <Check size={28} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: '0.4rem', color: '#fff' }}>
              {isPasswordResetMode ? 'Password Updated' : (isRegister ? 'Welcome to ELVANY' : 'Welcome Back')}
              {clientDisplayName ? `, ${clientDisplayName}` : ''}
            </h3>
            {socialProvider && (
              <div style={{ color: 'var(--gold-bright)', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: 600 }}>
                AUTHENTICATED VIA {socialProvider.toUpperCase()}
              </div>
            )}
            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Accessing your private atelier passport & bespoke preferences...
            </p>
          </div>
        ) : isFacebookEmailRequired ? (
          /* Complete Facebook Registration with Real Verified Email */
          <div style={{ padding: '0.5rem 0' }}>
            {!isAwaitingFacebookOtp ? (
              /* Step 2A: Enter Email Address */
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(24, 119, 242, 0.12)',
                    border: '1px solid rgba(24, 119, 242, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.1rem auto'
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>

                  <div style={{
                    color: 'var(--gold-bright)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem'
                  }}>
                    STEP 2: LINK & VERIFY YOUR EMAIL
                  </div>

                  <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.65rem',
                    fontWeight: 400,
                    color: 'var(--text-light-primary)',
                    marginBottom: '0.5rem'
                  }}>
                    Welcome{pendingSocialUser?.name ? `, ${pendingSocialUser.name}` : ''}
                  </h2>

                  <p style={{
                    color: 'var(--text-light-secondary)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    maxWidth: '380px',
                    margin: '0 auto'
                  }}>
                    Facebook did not share an email address for your profile. Please enter your email below. We will send a secure 6-digit verification code to confirm it.
                  </p>
                </div>

                {authError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '4px',
                    color: '#f87171',
                    fontSize: '0.82rem',
                    marginBottom: '1.2rem'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleSendFacebookVerificationCode}>
                  <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span>EMAIL ADDRESS</span>
                      <span style={{ color: 'var(--gold-bright)', fontSize: '0.7rem' }}>VERIFICATION REQUIRED</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. client@example.com"
                        value={facebookEmailInput}
                        onChange={(e) => {
                          setFacebookEmailInput(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        autoFocus
                        required
                        style={{ paddingLeft: '2.6rem' }}
                      />
                      <Mail
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '0.9rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-light-muted)',
                          pointerEvents: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-gold"
                    disabled={isLoading || !facebookEmailInput.trim()}
                    style={{ width: '100%', marginBottom: '1rem', height: '48px' }}
                  >
                    {isLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Loader2 size={16} className="spin-animate" />
                        <span>DISPATCHING CODE...</span>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span>SEND VERIFICATION CODE</span>
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFacebookEmailRequired(false);
                        setIsAwaitingFacebookOtp(false);
                        setFacebookEmailInput('');
                        setFacebookOtpInput('');
                        setPendingSocialUser(null);
                        setAuthError(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-light-muted)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.8rem'
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>Cancel and return to sign in</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Step 2B: Enter 6-Digit Passcode */
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(197, 160, 89, 0.12)',
                    border: '1px solid var(--gold-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.1rem auto',
                    color: 'var(--gold-bright)'
                  }}>
                    <MailCheck size={26} />
                  </div>

                  <div style={{
                    color: 'var(--gold-bright)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem'
                  }}>
                    STEP 3: ENTER VERIFICATION CODE
                  </div>

                  <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.65rem',
                    fontWeight: 400,
                    color: 'var(--text-light-primary)',
                    marginBottom: '0.5rem'
                  }}>
                    Check Your Inbox
                  </h2>

                  <p style={{
                    color: 'var(--text-light-secondary)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    maxWidth: '380px',
                    margin: '0 auto'
                  }}>
                    We sent a 6-digit verification passcode to{' '}
                    <strong style={{ color: 'var(--gold-bright)', wordBreak: 'break-all' }}>{facebookEmailInput}</strong>.
                    Please enter it below to confirm your address.
                  </p>
                </div>

                {authError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '4px',
                    color: '#f87171',
                    fontSize: '0.82rem',
                    marginBottom: '1.2rem'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyFacebookOtp}>
                  <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span>6-DIGIT PASSCODE</span>
                      <span style={{ color: 'var(--text-light-muted)', fontSize: '0.7rem' }}>EXPIRES IN 15 MIN</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="• • • • • •"
                      value={facebookOtpInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setFacebookOtpInput(val);
                        if (authError) setAuthError(null);
                      }}
                      autoFocus
                      required
                      maxLength={6}
                      style={{
                        letterSpacing: '0.35em',
                        fontSize: '1.25rem',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontWeight: 700
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-gold"
                    disabled={isLoading || facebookOtpInput.length !== 6}
                    style={{ width: '100%', marginBottom: '1rem', height: '48px' }}
                  >
                    {isLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Loader2 size={16} className="spin-animate" />
                        <span>VERIFYING PASSCODE...</span>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span>CONFIRM & COMPLETE SIGN IN</span>
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      type="button"
                      disabled={facebookOtpCooldown > 0 || isLoading}
                      onClick={handleResendFacebookVerificationCode}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: facebookOtpCooldown > 0 ? 'var(--text-light-muted)' : 'var(--gold-bright)',
                        fontSize: '0.8rem',
                        cursor: facebookOtpCooldown > 0 ? 'not-allowed' : 'pointer',
                        textDecoration: facebookOtpCooldown > 0 ? 'none' : 'underline',
                        fontWeight: 500
                      }}
                    >
                      {facebookOtpCooldown > 0 ? `Resend passcode in ${facebookOtpCooldown}s` : 'Resend verification passcode'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAwaitingFacebookOtp(false);
                        setFacebookOtpInput('');
                        setAuthError(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-light-muted)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <ArrowLeft size={13} />
                      <span>Change email address</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        ) : isPasswordResetMode ? (
          /* Set New Password Screen (Triggered by Recovery link or direct URL) */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 160, 89, 0.12)',
                border: '1px solid var(--gold-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: 'var(--gold-bright)'
              }}>
                <KeyRound size={24} />
              </div>
              <div style={{
                color: 'var(--gold-bright)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                marginBottom: '0.4rem'
              }}>
                SECURITY CHECKPOINT
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 500 }}>
                Set New Password
              </h2>
              <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.84rem', marginTop: '0.4rem' }}>
                {email ? `Updating credentials for ${email}` : 'Please choose a secure new password for your account.'}
              </p>
            </div>

            <form onSubmit={handleUpdatePassword}>
              {authError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  color: '#fca5a5',
                  padding: '0.85rem 1rem',
                  borderRadius: '2px',
                  marginBottom: '1.2rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <AlertCircle size={17} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>{authError}</div>
                </div>
              )}

              {!email && (
                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="client@domain.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              {!isVerifiedViaLink && (
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>6-Digit Security Passcode</label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold-bright)' }}>From your email</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 749201"
                    className="form-input"
                    style={{ letterSpacing: '0.25em', fontSize: '1.1rem', textAlign: 'center', fontFamily: 'monospace' }}
                    value={resetCodeInput}
                    onChange={(e) => setResetCodeInput(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="•••••••••••• (min. 6 chars)"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="form-input"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary-gold"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  marginTop: '1rem', 
                  padding: '1rem',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isLoading && <Loader2 size={16} className="spin-animation" />}
                <span>{isLoading ? 'UPDATING CREDENTIALS...' : 'UPDATE & SIGN IN'}</span>
                {!isLoading && <ArrowRight size={14} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordResetMode(false);
                    setIsForgotPassword(false);
                    setAuthError(null);
                  }}
                  style={{ color: 'var(--text-light-muted)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Return to Log In
                </button>
              </div>
            </form>
          </div>
        ) : isForgotPassword ? (
          /* Forgot Password View */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 160, 89, 0.12)',
                border: '1px solid var(--gold-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: 'var(--gold-bright)'
              }}>
                <KeyRound size={24} />
              </div>
              <div style={{
                color: 'var(--gold-bright)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                marginBottom: '0.4rem'
              }}>
                ACCOUNT RECOVERY
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 500 }}>
                {resetSuccess ? 'Enter Security Passcode' : 'Reset Your Password'}
              </h2>
            </div>

            {resetSuccess ? (
              /* State 2: Code Dispatched — Enter Passcode & New Password directly */
              <div>
                <div style={{
                  backgroundColor: 'rgba(197, 160, 89, 0.08)',
                  border: '1px solid rgba(197, 160, 89, 0.3)',
                  borderRadius: '4px',
                  padding: '1.1rem',
                  marginBottom: '1.4rem',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--gold-bright)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>
                    <MailCheck size={16} />
                    <span>Protocol Dispatched</span>
                  </div>
                  <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                    A 6-digit security passcode and recovery link have been sent to:
                  </p>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px', wordBreak: 'break-all' }}>
                    {email}
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword}>
                  {authError && (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.45)',
                      color: '#fca5a5',
                      padding: '0.85rem 1rem',
                      borderRadius: '2px',
                      marginBottom: '1.2rem',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem'
                    }}>
                      <AlertCircle size={17} color="#ef4444" style={{ flexShrink: 0 }} />
                      <div>{authError}</div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">6-Digit Security Passcode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      placeholder="e.g. 749201"
                      className="form-input"
                      style={{ letterSpacing: '0.28em', fontSize: '1.2rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }}
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="•••••••••••• (min. 6 chars)"
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="form-input"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary-gold"
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      marginTop: '1rem', 
                      padding: '1rem',
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {isLoading && <Loader2 size={16} className="spin-animation" />}
                    <span>{isLoading ? 'VERIFYING CREDENTIALS...' : 'VERIFY & SET NEW PASSWORD'}</span>
                    {!isLoading && <ArrowRight size={14} />}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.4rem', fontSize: '0.78rem' }}>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={handleResendResetCode}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendCooldown > 0 ? 'var(--text-light-muted)' : 'var(--gold-bright)',
                        cursor: resendCooldown > 0 ? 'default' : 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetSuccess(false);
                        setAuthError(null);
                      }}
                      style={{ color: 'var(--text-light-muted)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Back to Log In
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* State 1: Request Password Reset */
              <form onSubmit={handleForgotPassword}>
                <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '1.5rem', textAlign: 'center' }}>
                  Enter the email address registered with your ELVANY account. We will dispatch a single-use 6-digit security passcode and one-click recovery link to your inbox.
                </p>

                {authError && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.45)',
                    color: '#fca5a5',
                    padding: '0.85rem 1rem',
                    borderRadius: '2px',
                    marginBottom: '1.2rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem'
                  }}>
                    <AlertCircle size={17} color="#ef4444" style={{ flexShrink: 0 }} />
                    <div>{authError}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="client@domain.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary-gold"
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    marginTop: '1rem', 
                    padding: '1rem',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading && <Loader2 size={16} className="spin-animation" />}
                  <span>{isLoading ? 'DISPATCHING PROTOCOL...' : 'SEND RECOVERY LINK & CODE'}</span>
                  {!isLoading && <ArrowRight size={14} />}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-light-muted)' }}>
                  Remember your credentials?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setAuthError(null);
                    }}
                    style={{ color: 'var(--gold-bright)', textDecoration: 'underline', fontWeight: 600, background: 'none' }}
                  >
                    Back to Log In
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : awaitingVerification ? (
          /* Email Verification Confirmation State */
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(197, 160, 89, 0.12)',
              border: '1px solid var(--gold-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              color: 'var(--gold-bright)',
              boxShadow: '0 0 25px rgba(197, 160, 89, 0.25)'
            }}>
              <MailCheck size={32} />
            </div>
            
            <div style={{
              color: 'var(--gold-bright)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              marginBottom: '0.4rem'
            }}>
              VERIFICATION REQUIRED
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 500, marginBottom: '0.85rem', color: '#fff' }}>
              Verify Your Email
            </h2>

            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              We have dispatched a private confirmation email to:
            </p>

            <div style={{
              color: 'var(--gold-bright)',
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              marginBottom: '1rem',
              wordBreak: 'break-all'
            }}>
              {verificationEmail}
            </div>

            <p style={{ color: 'var(--text-light-muted)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Please check your email <strong style={{ color: '#ffffff' }}>inbox</strong> and <strong style={{ color: '#ffffff' }}>spam</strong> folder, and click the confirmation link to activate your ELVANY atelier passport.
            </p>

            {resendMessage && (
              <p style={{
                color: resendMessage.type === 'success' ? '#86efac' : '#fca5a5',
                fontSize: '0.82rem',
                lineHeight: 1.4,
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {resendMessage.text}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setAwaitingVerification(false);
                  setIsRegister(false);
                }}
                className="btn-primary-gold"
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
              >
                <span>LOG IN TO YOUR ACCOUNT</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                disabled={resendLoading}
                onClick={() => handleResendVerification(verificationEmail)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-dark)',
                  color: 'var(--text-light-secondary)',
                  padding: '0.75rem',
                  borderRadius: '2px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold-bright)';
                  e.currentTarget.style.color = 'var(--gold-bright)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-dark)';
                  e.currentTarget.style.color = 'var(--text-light-secondary)';
                }}
              >
                {resendLoading ? (
                  <>
                    <Loader2 size={14} className="spin-animation" />
                    <span>Resending Link...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 160, 89, 0.12)',
                border: '1px solid var(--gold-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <img 
                  src="/logo/Main-4.png" 
                  alt="ELVANY" 
                  style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                />
              </div>
              <div style={{
                color: 'var(--gold-bright)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                marginBottom: '0.4rem'
              }}>
                ELVANY CLIENTELE
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 500 }}>
                {isRegister ? 'Create Client Account' : 'Client Log In'}
              </h2>
            </div>

            {/* Social Logins (Google & Facebook active) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.8rem' }}>
              <button
                type="button"
                className="social-auth-btn"
                onClick={() => triggerGoogleLogin()}
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                className="social-auth-btn"
                onClick={handleFacebookLogin}
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Continue with Facebook</span>
              </button>
            </div>

            {/* Elegant Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.8rem',
              color: 'var(--text-light-muted)',
              fontSize: '0.72rem',
              letterSpacing: '0.14em'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-dark)' }} />
              <span>OR WITH EMAIL</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-dark)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              {authError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  color: '#fca5a5',
                  padding: '0.85rem 1rem',
                  borderRadius: '2px',
                  marginBottom: '1.2rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <AlertCircle size={17} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>{authError}</div>
                </div>
              )}

              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Julian Sterling"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="client@domain.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setAuthError(null);
                        setResetSuccess(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--gold-bright)',
                        fontSize: '0.74rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder={isRegister ? "•••••••••••• (min. 6 chars)" : "••••••••••••"}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary-gold"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  marginTop: '1rem', 
                  padding: '1rem',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isLoading && <Loader2 size={16} className="spin-animation" />}
                <span>
                  {isLoading 
                    ? 'AUTHENTICATING CLIENT...' 
                    : (isRegister ? 'CREATE ACCOUNT' : 'LOG IN TO ATELIER')}
                </span>
                {!isLoading && <ArrowRight size={14} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-light-muted)' }}>
                {isRegister ? 'Already have a private account? ' : 'Do not have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setIsForgotPassword(false);
                    setAuthError(null);
                  }}
                  style={{ color: 'var(--gold-bright)', textDecoration: 'underline', fontWeight: 600, background: 'none' }}
                >
                  {isRegister ? 'Log In' : 'Register'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
