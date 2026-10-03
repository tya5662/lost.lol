import { FormEvent, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Link2, Palette, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const highlights = [
  {
    number: '01',
    icon: Link2,
    title: 'One address',
    description: 'A short, memorable link to share wherever people look for you.',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Your own look',
    description: 'Shape your profile with the colors, image, and details that feel right.',
  },
  {
    number: '03',
    icon: UserRound,
    title: 'All in one place',
    description: 'Bring your work, socials, and favorite corners of the web together.',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  const handleClaim = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUsername = username.trim();
    navigate(`/register${trimmedUsername ? `?username=${encodeURIComponent(trimmedUsername)}` : ''}`);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0b0b] text-[#f1f0ed]">
      <header className="border-b border-white/[0.09]">
        <nav aria-label="Main navigation" className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="lost.lol home" className="text-[19px] font-bold tracking-[-.06em] text-white">
            lost<span className="text-[#f04e5e]">.lol</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="hidden text-[11px] uppercase tracking-[.16em] text-[#777572] sm:inline">Your corner of the internet</span>
            <Link
              to="/login"
              className="inline-flex h-9 items-center gap-2 border border-white/[0.15] px-3.5 text-xs font-semibold text-[#e7e4e0] transition-colors hover:border-white/40 hover:text-white"
            >
              Sign in <ArrowUpRight size={14} className="text-[#f04e5e]" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:min-h-[660px] lg:grid-cols-[1fr_.84fr] lg:gap-20 lg:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-14 h-[440px] w-[440px] rounded-full bg-[#b62637]/[0.08] blur-[120px]" />
        <div className="relative z-10 max-w-[610px]">
          <p className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.2em] text-[#a7a39e]">
            <span className="h-px w-7 bg-[#f04e5e]" />
            Make your link yours
          </p>
          <h1 className="text-[clamp(3.4rem,8vw,7.15rem)] font-semibold leading-[.91] tracking-[-.075em] text-[#f5f3ef]">
            A home for
            <br />
            <span className="font-serif font-normal italic tracking-[-.065em] text-[#f04e5e]">your internet.</span>
          </h1>
          <p className="mt-8 max-w-[410px] text-[15px] leading-7 text-[#a29f9a] sm:text-base">
            One page for your links, your work, and everywhere else you show up. Yours to shape, easy to share.
          </p>

          <form onSubmit={handleClaim} className="mt-9 max-w-[490px]">
            <label htmlFor="username" className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[.17em] text-[#cbc7c1]">
              Your profile address
            </label>
            <div className="flex min-h-[58px] items-center border border-white/[0.16] bg-[#111110] p-1.5 transition-colors focus-within:border-[#f04e5e]/70">
              <span className="hidden shrink-0 pl-3 text-sm text-[#807b76] sm:block">lost.lol/</span>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value.replace(/\s/g, '').toLowerCase())}
                placeholder="yourname"
                autoComplete="username"
                aria-label="Choose a profile username"
                pattern="[a-z0-9_]{3,20}"
                maxLength={20}
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-[#625f5a] sm:px-2"
              />
              <button
                type="submit"
                className="group inline-flex h-11 shrink-0 items-center gap-2 bg-[#e54857] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#f04e5e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f04e5e] sm:px-5"
              >
                Get started
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <p className="mt-3 flex items-center gap-2 text-[11px] text-[#77736f]">
              <Check size={13} className="text-[#f04e5e]" />
              Choose a username to claim your profile link.
            </p>
          </form>

          <div className="mt-12 flex items-center gap-3 border-t border-white/[0.1] pt-5 text-[10px] font-medium uppercase tracking-[.14em] text-[#8d8984]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f04e5e]" />
            A little page that says a lot
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[470px] lg:ml-auto">
          <div className="absolute -right-5 -top-5 hidden h-20 w-20 border-r border-t border-[#f04e5e]/40 sm:block" />
          <div className="relative border border-white/[0.14] bg-[#111110]">
            <div className="flex h-11 items-center justify-between border-b border-white/[0.1] px-4">
              <div className="flex items-center gap-2 text-[10px] text-[#8b8781]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f04e5e]" />
                PROFILE PREVIEW
              </div>
              <span className="text-[10px] text-[#77736f]">lost.lol/yourname</span>
            </div>
            <div className="relative overflow-hidden px-6 pb-8 pt-7 sm:px-9 sm:pb-10 sm:pt-9">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(125deg,rgba(240,78,94,.16),transparent_70%)]" />
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="grid h-[66px] w-[66px] shrink-0 place-items-center rounded-full border border-white/[0.18] bg-[#26201f] font-serif text-2xl italic text-[#f08089]">
                    y
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[.16em] text-[#f08089]">@yourname</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-.05em] text-white">Your name here</h2>
                  </div>
                </div>
                <p className="mt-5 max-w-[320px] text-xs leading-5 text-[#a29f9a]">
                  A short intro, a little personality, and the places you want people to find.
                </p>

                <div className="mt-7 space-y-2">
                  {['My work', 'Find me elsewhere', 'Something I made'].map((label, index) => (
                    <div key={label} className="group flex min-h-12 items-center justify-between border border-white/[0.12] px-4 transition-colors hover:border-[#f04e5e]/55 hover:bg-white/[0.025]">
                      <span className="text-xs font-medium text-[#e8e5e0]">{label}</span>
                      <span className="flex items-center gap-3 text-[10px] text-[#77736f]">
                        0{index + 1}
                        <ArrowUpRight size={14} className="text-[#f08089]" />
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/[0.1] pt-4 text-[9px] uppercase tracking-[.14em] text-[#6e6a65]">
                  <span>Built by you</span>
                  <span>lost.lol</span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-right text-[10px] uppercase tracking-[.15em] text-[#77736f]">
            A preview of your page
          </p>
        </div>
      </section>

      <section className="border-y border-white/[0.09] bg-[#10100f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#f08089]">The essentials</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-.04em] text-white sm:text-3xl">Everything in its right place.</h2>
            </div>
            <p className="max-w-[320px] text-xs leading-5 text-[#89857f]">A flexible profile that brings your online life together without getting in the way.</p>
          </div>
          <div className="grid border-t border-white/[0.11] sm:grid-cols-3">
            {highlights.map(({ number, icon: Icon, title, description }, index) => (
              <article key={number} className={`border-b border-white/[0.11] py-6 sm:border-b-0 sm:px-6 sm:py-7 ${index > 0 ? 'sm:border-l sm:border-white/[0.11]' : 'sm:pl-0'} ${index === highlights.length - 1 ? 'sm:pr-0' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium tracking-[.15em] text-[#77736f]">{number}</span>
                  <Icon size={16} strokeWidth={1.5} className="text-[#f08089]" />
                </div>
                <h3 className="mt-7 text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 max-w-[290px] text-xs leading-5 text-[#89857f]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-[10px] uppercase tracking-[.14em] text-[#77736f] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link to="/" className="font-bold tracking-[-.04em] text-[#d5d1cb]">
          lost<span className="text-[#f04e5e]">.lol</span>
        </Link>
        <span>Your name. Your page. Your links.</span>
        <Link to="/register" className="inline-flex items-center gap-2 text-[#d5d1cb] transition-colors hover:text-white">
          Create your page <ArrowRight size={13} className="text-[#f04e5e]" />
        </Link>
      </footer>
    </main>
  );
};
