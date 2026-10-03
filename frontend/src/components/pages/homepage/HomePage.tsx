import { apiService, BURL } from "@/services/api";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, AudioLines, Check, Link2 } from "lucide-react";
import { MacbookScrollDemo } from "./MacbookScrollDemo";

export const HomePage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState('Offline');
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    fetch(BURL)
      .then((response) => {
        if (!response.ok) throw new Error('Backend unavailable');
        if (isCurrent) {
          setStatus('Online');
          setIsOnline(true);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setStatus('Offline');
          setIsOnline(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="home-shell relative isolate min-h-screen overflow-hidden bg-[#090909] text-[#f4f0ef]">
      <style>{`
        @keyframes home-enter { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes red-sweep { from { transform: translateX(-110%); } to { transform: translateX(110vw); } }
        @keyframes equalize { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
        .home-enter { animation: home-enter .75s cubic-bezier(.2,.75,.25,1) both; }
        .home-enter-late { animation: home-enter .75s .14s cubic-bezier(.2,.75,.25,1) both; }
        .home-sweep { animation: red-sweep 8s ease-in-out infinite; }
        .home-bar { transform-origin: bottom; animation: equalize .8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .home-enter, .home-enter-late, .home-sweep, .home-bar { animation: none !important; }
          *, *::before, *::after { scroll-behavior: auto !important; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.022)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <div aria-hidden="true" className="home-sweep pointer-events-none absolute left-0 top-[94px] z-0 h-px w-64 bg-gradient-to-r from-transparent via-[#ff3047]/70 to-transparent" />

      <header className="relative z-10 border-b border-white/[0.07]">
        <nav aria-label="Main navigation" className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="/" aria-label="lost.lol home" className="group flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#ff3047]/35 bg-[#ff3047]/10 text-[#ff465b] shadow-[0_0_22px_rgba(255,48,71,.13)] transition-colors group-hover:bg-[#ff3047]/20">
              <AudioLines size={17} strokeWidth={2.3} />
            </span>
            <span className="text-[19px] font-bold tracking-tight">lost<span className="text-[#ff4056]">.lol</span></span>
          </a>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-[#898384] sm:flex">
              <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-[#777173]'}`} />
              {status === 'Online' ? 'All systems operational' : 'Connecting'}
            </span>
            <Button
              onClick={apiService.googleLogin}
              className="group h-10 rounded-lg border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white shadow-[0_5px_20px_rgba(0,0,0,.25)] transition-all hover:border-[#ff4056]/40 hover:bg-[#ff3047]/10 focus-visible:ring-2 focus-visible:ring-[#ff4056] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909]"
            >
              Sign in
              <ArrowUpRight size={15} className="ml-1.5 text-[#ff5366] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100svh-77px)] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:py-20">
        <div className="home-enter relative z-10 max-w-[600px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ff4056]/20 bg-[#ff3047]/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-[#ff6677]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff4056]" />
            Your identity, all in one place
          </div>

          <h1 className="max-w-[560px] text-[clamp(2.65rem,6vw,5.1rem)] font-bold leading-[1.02] tracking-[-.035em] text-[#f5f1f0]">
            Make yourself
            <br />
            <span className="relative inline-block text-[#ff4056]">
              hard to miss.
              <span aria-hidden="true" className="absolute -bottom-2 left-0 h-[2px] w-[72%] bg-[#ff4056]/80" />
            </span>
          </h1>

          <p className="mt-7 max-w-[430px] text-[15px] leading-7 text-[#aaa3a4] sm:text-base">
            One sharp little home for your links, socials, and everything worth finding.
          </p>

          <form
            className="mt-9 max-w-[560px]"
            onSubmit={(event) => {
              event.preventDefault();
              apiService.googleLogin();
            }}
          >
            <label htmlFor="username" className="mb-2.5 block text-xs font-semibold uppercase tracking-[.1em] text-[#aaa3a4]">
              Choose your address
            </label>
            <div className="group flex min-h-[58px] items-center gap-1 rounded-xl border border-white/[0.13] bg-[#111010] p-1.5 shadow-[0_18px_55px_rgba(0,0,0,.35)] transition-all focus-within:border-[#ff4056]/70 focus-within:shadow-[0_0_0_3px_rgba(255,64,86,.12),0_18px_55px_rgba(0,0,0,.35)]">
              <span className="hidden shrink-0 pl-3 text-sm font-semibold text-[#ff596b] sm:block">lost.lol/</span>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value.replace(/\s/g, '').toLowerCase())}
                placeholder="yourname"
                aria-label="Choose a profile username"
                className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] text-white shadow-none placeholder:text-[#655f60] focus-visible:ring-0 focus-visible:ring-offset-0 sm:px-2"
              />
              <Button
                type="submit"
                className="group/claim h-11 shrink-0 rounded-lg bg-[#e62940] px-4 text-sm font-bold text-white shadow-[0_5px_18px_rgba(230,41,64,.25)] transition-all hover:-translate-y-px hover:bg-[#ff3c53] hover:shadow-[0_8px_24px_rgba(230,41,64,.35)] focus-visible:ring-2 focus-visible:ring-[#ff7a88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111010] sm:px-5"
              >
                Claim yours
                <ArrowRight size={16} className="ml-2 transition-transform group-hover/claim:translate-x-0.5" />
              </Button>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-[#777173]">
              <Check size={13} className="text-[#ff596b]" />
              Your name becomes your profile link
            </p>
          </form>

          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/[0.08] pt-5 text-xs font-medium text-[#898384]">
            <span className="inline-flex items-center gap-2"><Link2 size={14} className="text-[#ff596b]" /> Links</span>
            <span className="inline-flex items-center gap-2"><AudioLines size={14} className="text-[#ff596b]" /> Your style</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#ff596b]" /> One URL</span>
          </div>
        </div>

        <div className="home-enter-late relative mx-auto w-full max-w-[490px] lg:ml-auto">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-5 rounded-[28px] border border-[#ff3047]/10" />
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#111010] shadow-[0_30px_100px_rgba(0,0,0,.55)]">
            <div className="flex h-11 items-center justify-between border-b border-white/[0.08] px-4">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-[#ff596b]" />
                <span className="h-2 w-2 rounded-full bg-[#766e70]" />
                <span className="h-2 w-2 rounded-full bg-[#514b4d]" />
              </div>
              <span className="rounded-md border border-white/[0.08] bg-black/30 px-3 py-1 text-[10px] text-[#827b7d]">lost.lol/afterdark</span>
              <span className="w-7" />
            </div>

            <div className="relative px-6 pb-7 pt-8 sm:px-9 sm:pb-9 sm:pt-10">
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(146,20,35,.2),transparent_58%)]" />
              <div className="relative mx-auto max-w-[290px] text-center">
                <div className="relative mx-auto mb-4 h-[78px] w-[78px]">
                  <div className="absolute -inset-1 rounded-full border border-[#ff4056]/45" />
                  <div className="grid h-full w-full place-items-center rounded-full border border-white/20 bg-[#211416] text-2xl font-bold text-[#ff6878]">a</div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[3px] border-[#111010] bg-emerald-400" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#ff596b]">@afterdark</p>
                <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">Alex Morgan</h2>
                <p className="mt-2 text-xs leading-5 text-[#a39b9c]">Designer, night owl, collector of good links.</p>

                <div className="mt-6 space-y-2.5">
                  {['Selected work', 'Elsewhere online', 'Now playing'].map((item, index) => (
                    <div key={item} className="flex h-11 items-center justify-between rounded-lg border border-white/[0.09] bg-white/[0.025] px-3.5 text-left transition-colors hover:border-[#ff4056]/35 hover:bg-[#ff3047]/[0.055]">
                      <span className="text-xs font-medium text-[#e6e0e0]">{item}</span>
                      {index === 2 ? (
                        <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                          <span className="home-bar h-2 w-[2px] rounded-full bg-[#ff596b]" />
                          <span className="home-bar h-3 w-[2px] rounded-full bg-[#ff596b]" style={{ animationDelay: '.15s' }} />
                          <span className="home-bar h-1.5 w-[2px] rounded-full bg-[#ff596b]" style={{ animationDelay: '.3s' }} />
                          <span className="home-bar h-2.5 w-[2px] rounded-full bg-[#ff596b]" style={{ animationDelay: '.45s' }} />
                        </span>
                      ) : <ArrowUpRight size={14} className="text-[#807779]" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#716a6b]">
            <span>Made to feel like you</span>
            <span className="text-[#ff596b]">01 / 01</span>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/[0.07] bg-[#0d0c0c] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#ff596b]">The profile, in motion</p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">A page that feels like yours.</h2>
            </div>
            <span className="hidden text-xs text-[#777173] sm:block">Built around your identity</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101010]">
            <MacbookScrollDemo />
          </div>
        </div>
      </section>
    </main>
  );
};