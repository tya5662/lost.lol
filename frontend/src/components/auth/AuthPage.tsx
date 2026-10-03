import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AudioLines, AtSign, LockKeyhole, Mail } from 'lucide-react';
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await apiService.registerAccount({ email, username, password });
      } else {
        await apiService.loginAccount({ identifier, password });
      }
      navigate('/dashboard');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to authenticate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#090909] px-4 py-8 text-[#f4f0ef] sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-px w-[min(80vw,780px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#e62940]/70 to-transparent" />

      <div className="grid w-full max-w-[940px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0e0d0d] shadow-[0_35px_120px_rgba(0,0,0,.55)] lg:grid-cols-[.92fr_1.08fr]">
        <section className="relative hidden min-h-[610px] flex-col justify-between overflow-hidden border-r border-white/[0.08] bg-[#100b0c] p-10 lg:flex">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(148,18,34,.22),transparent_55%)]" />
          <Link to="/" className="relative inline-flex w-fit items-center gap-2.5 text-lg font-bold tracking-tight text-white">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#ff3047]/35 bg-[#ff3047]/10 text-[#ff5265]"><AudioLines size={17} /></span>
            lost<span className="-ml-2 text-[#ff4056]">.lol</span>
          </Link>

          <div className="relative max-w-[340px]">
            <span className="mb-5 block text-[10px] font-bold uppercase tracking-[.2em] text-[#ff596b]">Make it yours</span>
            <h1 className="text-5xl font-bold leading-[1.04] tracking-[-.035em] text-white">Your name.<br />Your corner.</h1>
            <p className="mt-5 max-w-[300px] text-sm leading-6 text-[#a49b9d]">A personal page for the links and details you want people to find.</p>
          </div>

          <div className="relative flex items-center justify-between border-t border-white/[0.1] pt-4 text-[10px] font-semibold uppercase tracking-[.16em] text-[#746d6e]">
            <span>lost.lol / account</span>
            <span className="text-[#ff596b]">Secure access</span>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="mb-9 flex items-center justify-between">
            <Link to="/" aria-label="Back to lost.lol home" className="inline-flex items-center gap-2 text-xs font-medium text-[#928a8b] transition-colors hover:text-white lg:invisible">
              <ArrowLeft size={14} /> lost.lol
            </Link>
            <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#736c6d]">{isRegister ? 'Create account' : 'Member access'}</span>
          </div>

          <div className="mb-7">
            <h2 className="text-3xl font-bold tracking-tight text-white">{isRegister ? 'Claim your name' : 'Welcome back'}</h2>
            <p className="mt-2 text-sm text-[#968e90]">{isRegister ? 'Set up your lost.lol account.' : 'Sign in to manage your page.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-[#c4bcbd]">Username</span>
                  <span className="flex h-12 items-center gap-3 rounded-lg border border-white/[0.1] bg-[#090909] px-3.5 transition-colors focus-within:border-[#ff4056]/65">
                    <AtSign size={16} className="shrink-0 text-[#ff596b]" />
                    <input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/\s/g, ''))} minLength={3} maxLength={20} pattern="[a-z0-9_]{3,20}" autoComplete="username" required className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#5f585a]" placeholder="yourname" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-[#c4bcbd]">Email</span>
                  <span className="flex h-12 items-center gap-3 rounded-lg border border-white/[0.1] bg-[#090909] px-3.5 transition-colors focus-within:border-[#ff4056]/65">
                    <Mail size={16} className="shrink-0 text-[#81797b]" />
                    <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" maxLength={254} required className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#5f585a]" placeholder="you@example.com" />
                  </span>
                </label>
              </>
            ) : (
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-[#c4bcbd]">Email or username</span>
                <span className="flex h-12 items-center gap-3 rounded-lg border border-white/[0.1] bg-[#090909] px-3.5 transition-colors focus-within:border-[#ff4056]/65">
                  <AtSign size={16} className="shrink-0 text-[#81797b]" />
                  <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" required className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#5f585a]" placeholder="yourname or you@example.com" />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#c4bcbd]">Password</span>
              <span className="flex h-12 items-center gap-3 rounded-lg border border-white/[0.1] bg-[#090909] px-3.5 transition-colors focus-within:border-[#ff4056]/65">
                <LockKeyhole size={16} className="shrink-0 text-[#81797b]" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 7 : undefined} maxLength={128} required className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#5f585a]" placeholder={isRegister ? 'At least 7 characters' : 'Your password'} />
              </span>
            </label>

            {error && <p role="alert" className="rounded-lg border border-[#ff4056]/25 bg-[#ff3047]/[0.08] px-3.5 py-3 text-sm text-[#ff8290]">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="group flex h-12 w-full items-center justify-center rounded-lg bg-[#e62940] px-4 text-sm font-bold text-white shadow-[0_6px_22px_rgba(230,41,64,.2)] transition-all hover:-translate-y-px hover:bg-[#ff3c53] hover:shadow-[0_9px_28px_rgba(230,41,64,.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0d0d] disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'}
              {!isSubmitting && <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#8d8587]">
            {isRegister ? 'Already have an account?' : 'New to lost.lol?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="font-semibold text-[#ff596b] transition-colors hover:text-[#ff8996]">
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};