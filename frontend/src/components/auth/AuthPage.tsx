import { FormEvent, useState } from 'react';
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
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4 py-8 text-[#f1f0ed] sm:px-6">
      <div className="grid w-full max-w-[940px] border border-white/[0.12] bg-[#10100f] lg:grid-cols-[.92fr_1.08fr]">
        <section className="relative hidden min-h-[610px] flex-col justify-between border-r border-white/[0.1] p-10 lg:flex">
          <Link to="/" className="relative inline-flex w-fit items-center text-lg font-bold tracking-[-.06em] text-white">
            lost<span className="text-[#f04e5e]">.lol</span>
          </Link>

          <div className="relative max-w-[340px]">
            <span className="mb-5 block text-[10px] font-semibold uppercase tracking-[.2em] text-[#f08089]">A page that feels like you</span>
            <h1 className="text-5xl font-semibold leading-[.98] tracking-[-.06em] text-white">Your name.<br /><span className="font-serif font-normal italic text-[#f08089]">Your space.</span></h1>
            <p className="mt-5 max-w-[300px] text-sm leading-6 text-[#a29f9a]">Bring your links and the places you show up together in one simple page.</p>
          </div>

          <div className="relative flex items-center justify-between border-t border-white/[0.1] pt-4 text-[10px] font-semibold uppercase tracking-[.16em] text-[#77736f]">
            <span>lost.lol / account</span>
            <span className="text-[#f08089]">Secure access</span>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="mb-9 flex items-center justify-between">
            <Link to="/" aria-label="Back to lost.lol home" className="inline-flex items-center gap-2 text-xs font-medium text-[#8d8984] transition-colors hover:text-white lg:invisible">
              <ArrowLeft size={14} /> lost.lol
            </Link>
            <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#77736f]">{isRegister ? 'Create account' : 'Member access'}</span>
          </div>

          <div className="mb-7">
            <h2 className="text-3xl font-bold tracking-tight text-white">{isRegister ? 'Claim your name' : 'Welcome back'}</h2>
            <p className="mt-2 text-sm text-[#96928c]">{isRegister ? 'Set up your lost.lol account.' : 'Sign in to manage your page.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-[#cbc7c1]">Username</span>
                  <span className="flex h-12 items-center gap-3 border border-white/[0.12] bg-[#0b0b0b] px-3.5 transition-colors focus-within:border-[#f04e5e]/65">
                    <AtSign size={16} className="shrink-0 text-[#f08089]" />
                    <input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/\s/g, ''))} minLength={3} maxLength={20} pattern="[a-z0-9_]{3,20}" autoComplete="username" required className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#625f5a]" placeholder="yourname" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-[#cbc7c1]">Email</span>
                  <span className="flex h-12 items-center gap-3 border border-white/[0.12] bg-[#0b0b0b] px-3.5 transition-colors focus-within:border-[#f04e5e]/65">
                    <Mail size={16} className="shrink-0 text-[#8d8984]" />
                    <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" maxLength={254} required className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#625f5a]" placeholder="you@example.com" />
                  </span>
                </label>
              </>
            ) : (
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-[#cbc7c1]">Email or username</span>
                <span className="flex h-12 items-center gap-3 border border-white/[0.12] bg-[#0b0b0b] px-3.5 transition-colors focus-within:border-[#f04e5e]/65">
                  <AtSign size={16} className="shrink-0 text-[#8d8984]" />
                  <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" required className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#625f5a]" placeholder="yourname or you@example.com" />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#cbc7c1]">Password</span>
              <span className="flex h-12 items-center gap-3 border border-white/[0.12] bg-[#0b0b0b] px-3.5 transition-colors focus-within:border-[#f04e5e]/65">
                <LockKeyhole size={16} className="shrink-0 text-[#8d8984]" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 7 : undefined} maxLength={128} required className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#625f5a]" placeholder={isRegister ? 'At least 7 characters' : 'Your password'} />
              </span>
            </label>

            {error && <p role="alert" className="border border-[#f04e5e]/30 bg-[#f04e5e]/[0.06] px-3.5 py-3 text-sm text-[#f08a93]">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="group flex h-12 w-full items-center justify-center bg-[#e54857] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#f04e5e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f08089] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10100f] disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'}
              {!isSubmitting && <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#8d8984]">
            {isRegister ? 'Already have an account?' : 'New to lost.lol?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="font-semibold text-[#f08089] transition-colors hover:text-white">
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};