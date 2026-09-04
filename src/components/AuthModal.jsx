import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Check, AlertCircle, Loader2, MailCheck, RefreshCw, KeyRound, Lock, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { initFacebookSdk, loginWithFacebookDirect } from '../lib/facebookAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

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

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [clientDisplayName, setClientDisplayName] = useState('');
  const [authError, setAuthError] = useState(null);
  const [socialProvider, setSocialProvider] = useState(null);

  // Email verification state
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

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
      const resolvedName = profile.name || 'Arthur Vance';
      const resolvedEmail = profile.email || 'arthur.vance@facebook.com';
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
      if (err.message && !err.message.includes('cancelled')) {
        setAuthError(err.message);
      }
    }
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

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: getAuthRedirectUrl()
        });
        if (error) {
          setIsLoading(false);
          setAuthError(error.message);
          return;
        }
        setIsLoading(false);
        setResetSuccess(true);
        return;
      } catch (err) {
        setIsLoading(false);
        setAuthError(err.message || 'Failed to dispatch password recovery link.');
        return;
      }
    }

    // Mock fallback
    setIsLoading(false);
    setResetSuccess(true);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
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

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          setIsLoading(false);
          setAuthError(error.message);
          return;
        }
        setIsLoading(false);
        setIsPasswordResetMode(false);
        setClientDisplayName('Client');
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 1500);
        return;
      } catch (err) {
        setIsLoading(false);
        setAuthError(err.message || 'Failed to update password.');
        return;
      }
    }

    setIsLoading(false);
    setIsPasswordResetMode(false);
    setSubmitted(true);
    setTimeout(() => {
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
            return;
          }

          const resolvedName = data?.user?.user_metadata?.full_name || name || email.split('@')[0];
          const resolvedEmail = data?.user?.email || email;
          setClientDisplayName(resolvedName);
          setIsLoading(false);
          setSubmitted(true);
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
              {isPasswordResetMode ? 'Password Updated' : (isRegister ? 'Welcome to the Maison' : 'Welcome Back')}
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
        ) : isPasswordResetMode ? (
          /* Set New Password Screen (Triggered by Recovery link) */
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
                Please choose a secure new password for your account.
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
                <span>{isLoading ? 'UPDATING PASSWORD...' : 'UPDATE & SIGN IN'}</span>
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </form>
          </div>
        ) : isForgotPassword ? (
          /* Forgot Password View */
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
                ACCOUNT RECOVERY
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 500 }}>
                Reset Your Password
              </h2>
            </div>

            {resetSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                  A private password reset link has been dispatched to:
                </p>
                <div style={{
                  color: 'var(--gold-bright)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  marginBottom: '1.25rem',
                  wordBreak: 'break-all'
                }}>
                  {email}
                </div>
                <p style={{ color: 'var(--text-light-muted)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                  Please check your email <strong style={{ color: '#ffffff' }}>inbox</strong> and <strong style={{ color: '#ffffff' }}>spam</strong> folder, and click the reset link to choose a new password.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSuccess(false);
                    setAuthError(null);
                  }}
                  className="btn-primary-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>RETURN TO LOG IN</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '1.5rem', textAlign: 'center' }}>
                  Enter the email address registered with your Maison ELVANY account. We will dispatch a secure recovery link to your inbox.
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
                  <span>{isLoading ? 'DISPATCHING LINK...' : 'SEND RECOVERY LINK'}</span>
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
              Please check your email <strong style={{ color: '#ffffff' }}>inbox</strong> and <strong style={{ color: '#ffffff' }}>spam</strong> folder, and click the confirmation link to activate your Maison ELVANY atelier passport.
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
                MAISON ELVANY CLIENTELE
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 500 }}>
                {isRegister ? 'Create Client Account' : 'Client Log In'}
              </h2>
            </div>

            {/* Social Logins (Google active) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.8rem' }}>
              <button
                type="button"
                className="social-auth-btn"
                onClick={() => triggerGoogleLogin()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
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
                    : (isRegister ? 'CREATE ACCOUNT' : 'LOG IN TO MAISON')}
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
