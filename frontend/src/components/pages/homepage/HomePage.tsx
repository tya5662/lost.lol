import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Code2, Globe2, Menu, Palette, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const sampleLinks = ['Portfolio', 'My socials', 'Currently listening'];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const startCreating = () => navigate('/register');

  return (
    <main className="min-h-screen overflow-hidden bg-[#09090a] text-white">
      <section className="relative isolate min-h-[900px] overflow-hidden bg-[radial-gradient(ellipse_at_50%_-14%,rgba(115,42,136,.44),transparent_57%),linear-gradient(180deg,#211426_0%,#140f17_48%,#09090a_91%)] sm:min-h-[1020px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[.12] [background-image:radial-gradient(rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
        <header className="relative z-20 mx-auto max-w-[1240px] px-4 pt-5 sm:px-8 sm:pt-8">
          <nav aria-label="Main navigation" className="flex h-[68px] items-center justify-between rounded-full border border-white/[0.07] bg-[#101011]/95 px-5 shadow-[0_18px_60px_rgba(0,0,0,.24)] backdrop-blur-xl sm:h-[82px] sm:px-8">
            <Link to="/" aria-label="lost.lol home" className="text-[23px] font-semibold tracking-[-.06em] sm:text-[28px]">
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#b14fca] align-middle shadow-[0_0_20px_rgba(177,79,202,.7)]" />
              lost<span className="text-[#c15bd7]">.lol</span>
            </Link>
            <div className="hidden items-center gap-3 sm:flex">
              <a href="#features" className="px-4 py-3 text-sm text-[#c1b9c4] transition-colors hover:text-white">Explore</a>
              <Link to="/login" className="rounded-full border border-white/[0.1] bg-white/[0.035] px-5 py-3 text-sm font-medium text-[#eeeaf0] transition-colors hover:border-white/25 hover:bg-white/[0.08]">Sign in</Link>
              <Link to="/register" className="rounded-full border border-[#8c3fa1] bg-[#482252] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(158,65,181,.17)] transition-colors hover:bg-[#5b2b68]">Create your page</Link>
            </div>
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid h-11 w-11 place-items-center rounded-full bg-[#19181a] text-[#c15bd7] transition-colors hover:bg-[#242126] sm:hidden"
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </nav>
          {menuOpen && (
            <div className="absolute left-4 right-4 top-[calc(100%+8px)] z-30 grid gap-2 rounded-3xl border border-white/[0.08] bg-[#111012] p-3 shadow-2xl sm:hidden">
              <a href="#features" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 text-sm text-[#ded9e0] hover:bg-white/[0.05]">Explore</a>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 text-sm text-[#ded9e0] hover:bg-white/[0.05]">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-2xl bg-[#51265d] px-4 py-3 text-sm font-semibold text-white">Create your page</Link>
            </div>
          )}
        </header>

        <div className="relative z-10 mx-auto px-5 pb-0 pt-20 text-center sm:px-8 sm:pt-28">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#a94bbd]/25 bg-[#70337f]/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d7a5e1] sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#bf66d1]" />
            Your page, your way
          </p>
          <h1 className="mx-auto max-w-[900px] text-[clamp(3rem,9vw,7.35rem)] font-semibold leading-[.98] tracking-[-.065em] text-[#f8f5f9]">
            Everything you
            <br />
            <span className="bg-gradient-to-r from-[#f3eaf6] via-white to-[#ddb8e6] bg-clip-text text-transparent">want, right here.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[720px] text-base leading-7 text-[#c2b9c6] sm:mt-8 sm:text-[21px] sm:leading-9">
            Your links, socials, and personal style in one simple page.
            <br className="hidden sm:block" /> Make it yours, then share it anywhere.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={startCreating}
              className="group inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full border border-[#a14cb4] bg-[#572762] px-7 text-base font-semibold text-white shadow-[0_0_38px_rgba(170,73,194,.2)] transition-all hover:-translate-y-0.5 hover:bg-[#663073] hover:shadow-[0_0_48px_rgba(170,73,194,.3)]"
            >
              Create your page <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <a href="#features" className="inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full border border-white/[0.09] bg-[#161517] px-7 text-base font-medium text-[#eeeaf0] transition-colors hover:border-white/20 hover:bg-[#201e21]">
              See what you can make <ArrowUpRight size={17} className="text-[#d08ade]" />
            </a>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#8f8792] sm:text-xs">
            <Check size={13} className="text-[#b765c8]" />
            Free to get started · no design skills needed
          </p>
        </div>

        <div aria-label="Preview of profile pages made with lost.lol" className="relative mx-auto mt-16 h-[360px] w-full max-w-[1000px] px-3 sm:mt-24 sm:h-[465px]">
          <div className="absolute left-1/2 top-8 h-[260px] w-[min(82vw,410px)] -translate-x-[76%] -rotate-[10deg] overflow-hidden rounded-[25px] border border-[#a451bb]/55 bg-[#111113] p-4 opacity-70 shadow-[0_24px_90px_rgba(0,0,0,.65)] sm:top-9 sm:h-[355px] sm:w-[355px] sm:p-6">
            <div className="h-20 rounded-[17px] bg-[linear-gradient(145deg,#25242c,#121214)] sm:h-28" />
            <div className="mx-auto -mt-8 grid h-14 w-14 place-items-center rounded-full border-4 border-[#111113] bg-[#4f3c5a] text-lg font-bold sm:h-[72px] sm:w-[72px] sm:text-2xl">m</div>
            <p className="mt-2 text-center text-xs font-semibold text-white sm:mt-3 sm:text-sm">midnightworks</p>
            <div className="mt-4 space-y-2 sm:mt-6">
              {['Selected projects', 'Around the web', 'Contact'].map((item) => <div key={item} className="rounded-full border border-white/[0.08] bg-white/[0.04] py-2.5 text-center text-[9px] text-[#dfdbe2] sm:py-3 sm:text-[11px]">{item}</div>)}
            </div>
          </div>
          <div className="absolute left-1/2 top-16 z-10 h-[270px] w-[min(82vw,410px)] -translate-x-[20%] rotate-[8deg] overflow-hidden rounded-[25px] border border-[#a451bb]/55 bg-[#151416] p-4 opacity-85 shadow-[0_24px_90px_rgba(0,0,0,.7)] sm:top-16 sm:h-[355px] sm:w-[355px] sm:p-6">
            <div className="h-[88px] rounded-[17px] bg-[linear-gradient(135deg,#28454a,#17202a_58%,#161418)] sm:h-32" />
            <div className="mx-auto -mt-8 grid h-14 w-14 place-items-center rounded-full border-4 border-[#151416] bg-[#38404d] font-semibold sm:h-[72px] sm:w-[72px] sm:text-xl">v</div>
            <p className="mt-2 text-center text-xs font-semibold text-white sm:mt-3 sm:text-sm">violet.sounds</p>
            <p className="mt-1 text-center text-[9px] text-[#9e99a1] sm:text-[10px]">music, art & late nights</p>
            <div className="mt-4 space-y-2 sm:mt-6">
              {['Listen to my latest', 'Follow along', 'My favorite things'].map((item) => <div key={item} className="flex items-center justify-between rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-[9px] text-[#dfdbe2] sm:px-4 sm:py-3 sm:text-[11px]"><span>{item}</span><ArrowUpRight size={12} /></div>)}
            </div>
          </div>
          <div className="absolute left-1/2 top-5 z-20 h-[288px] w-[min(82vw,410px)] -translate-x-1/2 overflow-hidden rounded-[26px] border border-[#b45ec5]/70 bg-[#111113] p-4 shadow-[0_30px_100px_rgba(0,0,0,.8),0_0_50px_rgba(143,53,163,.14)] sm:top-5 sm:h-[380px] sm:w-[355px] sm:p-6">
            <div className="flex items-center justify-between text-[9px] text-[#938d97] sm:text-[10px]">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#b866ca]" /> lost.lol / afterhours</span>
              <span>PROFILE</span>
            </div>
            <div className="mx-auto mt-7 grid h-[68px] w-[68px] place-items-center rounded-full border border-[#bd6ccc]/50 bg-[radial-gradient(circle_at_35%_25%,#8b5c91,#26202e_65%)] text-2xl font-semibold text-white shadow-[0_0_26px_rgba(177,79,202,.15)] sm:mt-9 sm:h-[82px] sm:w-[82px] sm:text-3xl">a</div>
            <p className="mt-3 text-center text-[9px] uppercase tracking-[.16em] text-[#c27ad0] sm:text-[10px]">@afterhours</p>
            <h2 className="mt-1 text-center text-xl font-semibold tracking-[-.04em] text-white sm:text-2xl">Alex Morgan</h2>
            <p className="mx-auto mt-2 max-w-[245px] text-center text-[10px] leading-4 text-[#a7a1aa] sm:text-xs sm:leading-5">Designer, playlist maker, and collector of good links.</p>
            <div className="mt-5 space-y-2 sm:mt-6">
              {sampleLinks.map((item, index) => (
                <div key={item} className="flex min-h-10 items-center justify-between rounded-full border border-white/[0.08] bg-[#1a191c] px-4 text-[10px] text-[#eeeaf0] transition-colors sm:min-h-11 sm:text-xs">
                  <span>{item}</span>
                  <span className="flex items-center gap-2 text-[#8e8792]"><span>0{index + 1}</span><ArrowUpRight size={13} className="text-[#bd70cc]" /></span>
                </div>
              ))}
            </div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-24 bg-gradient-to-b from-transparent to-[#100c12] sm:h-32" />
        </div>
      </section>

      <section id="features" className="relative border-t border-white/[0.06] bg-[#0d0c0e] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#c178cf]">Made to fit you</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.055em] text-white sm:text-5xl">A little more you, everywhere.</h2>
            <p className="mt-4 text-sm leading-6 text-[#a59eaa] sm:text-base">A profile that looks like yours and makes it easy for people to find the things you share.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3 sm:mt-16">
            {[
              { icon: Globe2, title: 'Your links, together', text: 'Give your work, socials, and favorite places one easy address.' },
              { icon: Palette, title: 'Make it feel like you', text: 'Pick your colors, add your image, and make your page personal.' },
              { icon: Code2, title: 'Simple to keep fresh', text: 'Update your page whenever you have something new to share.' },
            ].map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="rounded-[25px] border border-white/[0.07] bg-[#121113] p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#8c3fa1]/30 bg-[#542660]/30 text-[#d290de]"><Icon size={19} strokeWidth={1.7} /></span>
                  <span className="text-[10px] tracking-[.15em] text-[#716b75]">0{index + 1}</span>
                </div>
                <h3 className="mt-7 text-lg font-semibold text-[#f5f1f6]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#a59eaa]">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-[26px] border border-[#774080]/25 bg-[radial-gradient(ellipse_at_50%_120%,rgba(116,44,131,.26),transparent_70%),#121013] px-6 py-9 text-center sm:mt-16 sm:flex-row sm:px-10 sm:text-left">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#c178cf]">Start with your name</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-white">Your next page starts here.</h2>
            </div>
            <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#a14cb4] bg-[#572762] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#663073]">
              Sign up for free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-[#09090a] px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-[#827b86] sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="text-base font-semibold tracking-[-.05em] text-white">lost<span className="text-[#c15bd7]">.lol</span></Link>
          <span>Your page. Your links. Your corner of the internet.</span>
          <Link to="/login" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">Member sign in <ArrowUpRight size={13} /></Link>
        </div>
      </footer>
    </main>
  );
};
