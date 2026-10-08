import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AtSign, LockKeyhole, Mail } from 'lucide-react';
import { apiService } from '@/services/api';

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRegister = location.pathname === '/register';
  const [username, setUsername] = useState(() => searchParams.get('username') ?? '');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const isEmailTaken = error.toLowerCase().includes('email') && error.toLowerCase().includes('account');
  const TURNSTILE_SITE_KEY = '0x4AAAAAAFRAyeyXHwm1-O5M';

  useEffect(() => {
    let cancelled = false;
    const renderWidget = () => {
      if (cancelled || !turnstileRef.current || !window.turnstile) return;
      turnstileRef.current.innerHTML = '';
      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        appearance: 'always',
        execution: 'render',
        action: 'auth',
        retry: 'auto',
        callback: (token: string) => {
          setTurnstileToken(token);
          setError('');
        },
        'expired-callback': () => {
          setTurnstileToken('');
          setError('The CAPTCHA expired. Please complete it again.');
        },
        'timeout-callback': () => {
          setTurnstileToken('');
          setError('The CAPTCHA timed out. Please complete it again.');
        },
        'error-callback': (code?: string) => {
          setTurnstileToken('');
          setError(code ? `CAPTCHA error ${code}. Please refresh and try again.` : 'The CAPTCHA could not load. Please refresh and try again.');
          return true;
        },
      });
    };
    if (window.turnstile) renderWidget();
    else {
      const existing = document.querySelector('script[data-turnstile]') as HTMLScriptElement | null;
      if (existing) existing.addEventListener('load', renderWidget, { once: true });
      else {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = 'true';
        script.addEventListener('load', renderWidget, { once: true });
        document.head.appendChild(script);
      }
    }
    return () => { cancelled = true; setTurnstileToken(''); turnstileWidgetId.current = null; };
  }, [isRegister]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!turnstileToken) {
      setError('Please complete the CAPTCHA first.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await apiService.registerAccount({ email, username, password, turnstileToken });
      } else {
        await apiService.loginAccount({ identifier, password, turnstileToken });
      }
      navigate('/dashboard');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to authenticate. Please try again.');
      if (turnstileWidgetId.current !== null && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current);
        setTurnstileToken('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-3 py-7 text-white sm:px-6 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(ellipse_at_50%_-20%,rgba(239,51,64,.22),transparent_64%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-[-12%] top-[20%] -z-10 h-72 w-72 rounded-full bg-[#ef3340]/10 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[-10%] bottom-[8%] -z-10 h-80 w-80 rounded-full bg-[#8b8b9a]/10 blur-[110px]" />

      <section className="w-full max-w-[820px] overflow-hidden rounded-[28px] border border-[#ef3340]/20 bg-[#0d0d0f]/95 shadow-[0_32px_120px_rgba(0,0,0,.65),0_0_70px_rgba(239,51,64,.08)] sm:rounded-[36px]">
        <div className="flex items-center justify-between px-5 pt-5 sm:px-10 sm:pt-8">
          <Link to="/" aria-label="Back to suffer.info home" className="inline-flex items-center gap-3 text-sm font-semibold text-[#aaa4a0] transition-colors hover:text-white sm:text-base">
            <ArrowLeft size={19} />
            <span className="tracking-[-.03em] text-white">suffer<span className="text-[#ef3340]">.info</span></span>
          </Link>
          <span className="rounded-full border border-[#ef3340]/20 bg-[#ef3340]/5 px-3 py-1 text-[9px] font-semibold uppercase tracking-[.2em] text-[#ef3340] sm:text-[11px]">
            {isRegister ? 'Create account' : 'Member access'}
          </span>
        </div>

        <div className="px-5 pb-8 pt-10 sm:px-12 sm:pb-12 sm:pt-14">
          <div className="mb-9 sm:mb-11">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[.18em] text-[#ef3340]">
              {isRegister ? 'Your space starts here' : 'Good to have you back'}
            </p>
            <h1 className="text-[clamp(2.55rem,7vw,4.75rem)] font-semibold leading-[.98] tracking-[-.065em] text-white">
              {isRegister ? 'Claim your name' : 'Welcome back.'}
            </h1>
            <p className="mt-4 max-w-[530px] text-sm leading-6 text-[#aaa4a0] sm:text-base">
              {isRegister ? 'Set up your suffer.info account and bring the places you share together.' : 'Sign in to edit your page, update your links, and make it yours.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister ? (
              <>
                <label className="block">
                  <span className="mb-2.5 block text-sm font-medium text-[#e5dfdc]">Username</span>
                  <span className="flex h-[62px] items-center gap-4 rounded-[18px] border border-white/[0.1] bg-[#080808] px-4 transition-colors focus-within:border-[#ef3340]/70 sm:h-[68px] sm:px-5">
                    <AtSign size={20} className="shrink-0 text-[#ef3340]" />
                    <input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/\s/g, ''))} minLength={1} maxLength={20} pattern="[a-z0-9._]{1,20}" autoComplete="username" required className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[#625d59] sm:text-lg" placeholder="yourname" />
                  </span>
                  <span className="mt-2 block text-[11px] text-[#817a75]">Your page will be at suffer.info/{username || 'yourname'}</span>
                </label>
                <label className="block">
                  <span className="mb-2.5 block text-sm font-medium text-[#e5dfdc]">Email</span>
                  <span className="flex h-[62px] items-center gap-4 rounded-[18px] border border-white/[0.1] bg-[#080808] px-4 transition-colors focus-within:border-[#ef3340]/70 sm:h-[68px] sm:px-5">
                    <Mail size={20} className="shrink-0 text-[#8c8580]" />
                    <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" maxLength={254} required className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[#625d59] sm:text-lg" placeholder="you@example.com" />
                  </span>
                </label>
              </>
            ) : (
              <label className="block">
                <span className="mb-2.5 block text-sm font-medium text-[#e5dfdc]">Email or username</span>
                <span className="flex h-[62px] items-center gap-4 rounded-[18px] border border-white/[0.1] bg-[#080808] px-4 transition-colors focus-within:border-[#ef3340]/70 sm:h-[68px] sm:px-5">
                  <AtSign size={20} className="shrink-0 text-[#8c8580]" />
                  <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" required className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[#625d59] sm:text-lg" placeholder="yourname or you@example.com" />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-2.5 block text-sm font-medium text-[#e5dfdc]">Password</span>
              <span className="flex h-[62px] items-center gap-4 rounded-[18px] border border-white/[0.1] bg-[#080808] px-4 transition-colors focus-within:border-[#ef3340]/70 sm:h-[68px] sm:px-5">
                <LockKeyhole size={20} className="shrink-0 text-[#8c8580]" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 7 : undefined} maxLength={128} required className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[#625d59] sm:text-lg" placeholder={isRegister ? 'At least 7 characters' : 'Your password'} />
              </span>
            </label>

            <div className="flex min-h-[78px] justify-center py-2"><div ref={turnstileRef} /></div>            {error && (
              <div role="alert" className="rounded-[18px] border border-[#8e2c39]/60 bg-[#35171d]/60 px-4 py-4 text-sm leading-6 text-[#ff8392] sm:px-5">
                <p>{error}</p>
                {isEmailTaken && <Link to="/login" className="mt-1 inline-flex items-center gap-1 font-semibold text-[#ff9ba7] underline decoration-[#ff9ba7]/40 underline-offset-4 hover:text-white">Sign in instead <ArrowRight size={14} /></Link>}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="group mt-2 flex min-h-[62px] w-full items-center justify-center gap-3 rounded-[18px] border border-[#ef3340] bg-[#ef3340] px-5 text-base font-semibold text-white shadow-[0_8px_34px_rgba(239,51,64,.18)] transition-all hover:-translate-y-0.5 hover:bg-[#ef3340] hover:shadow-[0_10px_38px_rgba(239,51,64,.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0f] disabled:cursor-wait disabled:opacity-60 sm:min-h-[68px] sm:text-lg">
              {isSubmitting ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'}
              {!isSubmitting && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#a59d98] sm:mt-9 sm:text-base">
            {isRegister ? 'Already have an account?' : 'New to suffer.info?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="font-semibold text-[#ef3340] transition-colors hover:text-white">
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};
