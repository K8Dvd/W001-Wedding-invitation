import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { data } from "./data";

const { couple, els, frames, venue, music, story, itinerary, attire, entourage, video, gifts, reminders, faq, rsvp, closing, calendar, envelope } = data;
const vars = (o: Record<string, string | number>) => o as unknown as CSSProperties;

/* ---------- storage helpers (no backend) ---------- */
type Family = { family: string; members: string[] };
const GK = "w001-guests", RK = "w001-rsvp-demo";
type Row = { when: string; who: string; att: string[]; dec: string[]; msg: string; note: string; seats: number };
const names = (v: unknown): string[] => Array.isArray(v) ? v.map(String) : typeof v === "string" && v && v !== "true" && v !== "false" ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
const isReal = (r: Row) => !Number.isNaN(Date.parse(r.when)); // a header row has no real timestamp, so it is never counted
const toRow = (r: Record<string, unknown>): Row => ({
  when: String(r.date ?? r.submittedAt ?? ""), who: String(r.family ?? r.name ?? ""), att: names(r.attending), dec: names(r.declined), msg: String(r.message ?? ""),
  note: typeof r.attending === "boolean" ? (r.attending ? `Attending (${Number(r.seats) || 1} seats)` : "Declined") : "",
  seats: typeof r.attending === "boolean" && r.attending ? Number(r.seats) || 1 : 0,
});
const read = <T,>(k: string, fb: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

/* ------------------------------------------------------------------ */
/* REUSABLE PIECES                                                     */
/* ------------------------------------------------------------------ */

/** Reveal on scroll. from = direction the element arrives from. */
function R({ children, className = "", delay = 0, from = "up" }: { children: ReactNode; className?: string; delay?: number; from?: "up" | "l" | "r" | "zoom" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rv f-${from} ${className}`} style={vars({ "--d": `${delay}ms` })}>{children}</div>;
}

/**
 * Transparent PNG slot (flowers, ornaments, monograms, cut-outs, QR…).
 * If the file is missing it shows a dashed placeholder (data.showPlaceholders)
 * so you can see exactly where each Canva PNG goes and its shape.
 * flow = normal layout (not absolutely positioned).
 */
function Slot({ src, className = "", ar = "1/1", flow, alt = "", style }: { src: string; className?: string; ar?: string; flow?: boolean; alt?: string; style?: CSSProperties }) {
  const [bad, setBad] = useState(false);
  const cls = `${flow ? "" : "deco"} ${className}`;
  if (bad) {
    return data.showPlaceholders
      ? <span className={`slot ${cls}`} style={{ aspectRatio: ar, ...style }} role="img" aria-label={`Placeholder for ${src}`}><b>{src.split("/").pop()}</b></span>
      : null;
  }
  return <img className={cls} src={src} alt={alt} aria-hidden={alt ? undefined : true} style={style} onError={() => setBad(true)} />;
}
const Deco = Slot;
const Ornament = () => <Slot src={els.ornament} flow ar="4/1" className="orn" />;

/** Flower layout for a section. Pick the positions you want to fill with Canva PNGs. */
function Flora({ corners }: { corners?: boolean; sides?: boolean; top?: boolean; bottom?: boolean }) {
  if (!corners) return null;
  return (
    <>
      <Deco src={els.cornerLeft} className="fl tl float" /><Deco src={els.cornerRight} className="fl tr float s2" />
      <Deco src={els.cornerLeft} className="fl bl float s3" /><Deco src={els.cornerRight} className="fl br float s4" />
    </>
  );
}

/**
 * Photo. index = 1…20 (photo-01.jpg…). frame = optional transparent PNG overlay;
 * the real photo stays underneath so customers just swap files.
 */
type PhotoProps = { index: number; frame?: string; ratio?: string; pos?: string; round?: string; overlay?: string; className?: string; priority?: boolean; alt?: string; style?: CSSProperties };
export function Photo({ index, frame, ratio, pos = "center", round, overlay, className = "", priority, alt, style }: PhotoProps) {
  const src = data.photos[(index - 1) % data.photos.length];
  return (
    <figure className={`photo ${className}`} style={{ aspectRatio: ratio, borderRadius: round, ...style }}>
      <img src={src} alt={alt ?? `${couple.displayName} — photo ${index}`} loading={priority ? "eager" : "lazy"} style={{ objectPosition: pos }} />
      {overlay && <span className="photo-ov" style={{ background: overlay }} />}
      {frame && <img className="photo-frame" src={frame} alt="" aria-hidden="true" onError={(e) => (e.currentTarget.style.display = "none")} />}
    </figure>
  );
}

function useCountdown(iso: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, new Date(iso).getTime() - now);
  return { days: Math.floor(diff / 864e5), hours: Math.floor(diff / 36e5) % 24, minutes: Math.floor(diff / 6e4) % 60, seconds: Math.floor(diff / 1e3) % 60 };
}

const Sparkles = ({ n = 18 }: { n?: number }) => (
  <>{Array.from({ length: n }, (_, i) => <i key={i} className="sparkle" style={vars({ left: `${(i * 53) % 100}%`, top: `${(i * 29 + 7) % 100}%`, "--t": `${3 + (i % 5)}s`, "--w": `${(i % 7) * 0.6}s` })} />)}</>
);

/* ------------------------------------------------------------------ */
/* ENVELOPE — click the seal                                           */
/* ------------------------------------------------------------------ */
const STAGES = ["closed", "seal", "flap", "rise", "burst", "gone"] as const;
type Stage = (typeof STAGES)[number];

function Envelope({ onOpen }: { onOpen: () => void }) {
  const [stage, setStage] = useState<Stage>("closed");
  const at = (s: Stage) => STAGES.indexOf(stage) >= STAGES.indexOf(s);
  const start = () => {
    if (stage !== "closed") return;
    const q = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.3 : 1;
    setStage("seal");
    setTimeout(() => setStage("flap"), 550 * q);
    setTimeout(() => setStage("rise"), 1500 * q);
    setTimeout(() => { setStage("burst"); onOpen(); }, 2800 * q);
    setTimeout(() => setStage("gone"), 4400 * q);
  };
  if (stage === "gone") return null;
  return (
    <div className={`env-stage ${at("burst") ? "burst" : ""}`} role="dialog" aria-label="Wedding invitation">
      {/* Couple photo as background, blurred, with moving light */}
      <div className="env-bg" style={{ backgroundImage: `url(${data.photos[envelope.bgPhoto - 1]})` }} />
      <div className="env-light" /><div className="env-rays" /><Sparkles />
      {/* Flower border around the screen (Canva PNGs) */}
      <Flora corners top bottom />
      <div className="flash" />
      <div className="env-inner">
        <p className="env-kicker">The Wedding of</p>
        <div className="env-wrap">
          <div className={`env ${at("seal") ? "seal-on" : ""} ${at("flap") ? "flap-open" : ""} ${at("rise") ? "rise" : ""}`}>
            <div className="env-back" />
            <div className="env-card">
              <p className="card-small">The Wedding of</p>
              <h1 className="script card-names">{couple.displayName}</h1>
              <Ornament />
              <p className="card-date">{couple.shortDate}</p>
            </div>
            <div className="env-front"><div className="env-names"><span className="script">{couple.displayName}</span><span className="env-date">{couple.shortDate}</span></div></div>
            <div className="env-flap" />
            {/* Seal = YOUR monogram PNG. The guest clicks it to open. */}
            <button className="seal" onClick={start} aria-label="Open the invitation">
              <span className="ring" /><span className="ring r2" />
              <Slot src={els.seal} flow className="seal-img" alt="" />
            </button>
          </div>
          {/* Two flowers under the envelope */}
          <Deco src={els.flowerBottomLeft} className="env-fl l float" />
          <Deco src={els.flowerBottomRight} className="env-fl r float s2" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MUSIC (hidden YouTube player)                                       */
/* ------------------------------------------------------------------ */
function Music({ started }: { started: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [on, setOn] = useState(true);
  const send = (func: string) => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: "" }), "*");
  const toggle = () => { send(on ? "pauseVideo" : "playVideo"); setOn(!on); };
  if (!started) return null;
  const id = music.youtubeId;
  return (
    <>
      <iframe ref={frame} className="yt" title="Wedding music" tabIndex={-1} aria-hidden="true" allow="autoplay; encrypted-media"
        src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&enablejsapi=1&playsinline=1`} />
      <button className={`music ${on ? "playing" : ""}`} onClick={toggle} aria-pressed={on} aria-label={on ? "Pause music" : "Play music"} title={music.title}><i /><i /><i /><i /></button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* SECTIONS                                                            */
/* ------------------------------------------------------------------ */
function Hero() {
  const bg = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => bg.current?.style.setProperty("--sy", String(window.scrollY))); };
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <header className="hero">
      <div className="hero-bg" ref={bg}><Photo index={1} priority className="kb" pos="50% 30%" /></div>
      <div className="hero-shade" /><Sparkles n={10} />
      <Deco src={els.cornerLeft} className="fl tl float" /><Deco src={els.cornerRight} className="fl tr float s2" />
      <p className="h-kicker"><span />The Wedding of</p>
      <Photo index={couple.groom.photo} frame={frames.editorial} ratio="3/4" className="h-p a" priority alt={`Portrait of ${couple.partnerOne}`} />
      <Photo index={couple.bride.photo} frame={frames.editorial} ratio="3/4" className="h-p b" priority alt={`Portrait of ${couple.partnerTwo}`} />
      <h1 className="h-names script" aria-label={couple.displayName}><span className="n1">{couple.partnerOne}</span><span className="amp">&amp;</span><span className="n2">{couple.partnerTwo}</span></h1>
      <div className="h-date"><b>{couple.shortDate}</b><span>{couple.date}</span></div>
      <div className="h-line" />
    </header>
  );
}

/** Groom + bride: identical arch shapes, names only. */
function CouplePair() {
  const one = (p: { name: string; photo: number }, role: string, from: "l" | "r") => (
    <R from={from} className="cp">
      <Photo index={p.photo} frame={frames.arch} ratio="4/5" round="999px 999px 6px 6px" className="cp-photo" alt={`${role}: ${p.name}`} />
      <p className="cp-role">{role}</p>
      <h2 className="script cp-name">{p.name}</h2>
    </R>
  );
  return (
    <section className="sec bg-pearl couple">
      <Flora corners sides />
      <div className="cp-wrap">{one(couple.groom, "The Groom", "l")}{one(couple.bride, "The Bride", "r")}</div>
    </section>
  );
}

function Cinema() {
  const c = useCountdown(couple.countdownDate);
  const items: [number, string][] = [[c.days, "Days"], [c.hours, "Hours"], [c.minutes, "Minutes"], [c.seconds, "Seconds"]];
  return (
    <section className="sec bg-photo cinema" style={vars({ "--bgimg": `url(${data.photos[14]})` })}>
      <Flora top bottom />
      <R className="center"><p className="eyebrow light">{couple.date}</p><h2 className="serif big">Until we say<br /><em>I do</em></h2></R>
      <div className="count" role="timer" aria-label="Countdown to the wedding">
        {items.map(([n, l], i) => (
          <R key={l} delay={i * 120} from="zoom" className={`ct ct${i}`}><span key={n} className="num">{String(n).padStart(2, "0")}</span><span className="lbl">{l}</span></R>
        ))}
      </div>
    </section>
  );
}

/** Story: no overlaps. Text and photos sit in their own cells. */
function Story() {
  const frameFor = [frames.royal, frames.floral, frames.minimal];
  return (
    <section className="sec bg-champ story">
      <Flora top corners />
      <R className="center"><h2 className="serif head">Our Story</h2></R>
      {story.map((s, i) => (
        <article key={s.year} className={`sp ${i % 2 ? "flip" : ""}`}>
          <R from={i % 2 ? "r" : "l"} className="sp-text">
            <span className="sp-year">{s.year}</span>
            <h3 className="serif">{s.title}</h3><Ornament /><p>{s.text}</p>
          </R>
          <R from={i % 2 ? "l" : "r"} className="sp-photos">
            <Photo index={s.photos[0]} frame={frameFor[i % 3]} ratio="3/4" className="sp-big" alt={`${s.title}, ${s.year}`} />
            <Photo index={s.photos[1]} frame={frames.polaroid} ratio="1/1" className="sp-small tilt" />
          </R>
        </article>
      ))}
    </section>
  );
}

type Venue = typeof venue.ceremony;
function Details() {
  const block = (v: Venue, from: "l" | "r") => (
    <R from={from} className="dt">
      <p className="dt-label">{v.label}</p>
      <div className="dt-time"><span className="dt-hr">{v.hour}</span><span className="dt-min">{v.minute}<small>{v.meridiem}</small></span></div>
      <h3 className="serif">{v.name}</h3>
      <p className="dt-city">{v.address}</p>
      <div className="map">
        <iframe title={`${v.label} map — ${v.name}`} src={v.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        <img className="photo-frame" src={frames.arch} alt="" aria-hidden="true" onError={(e) => (e.currentTarget.style.display = "none")} />
      </div>
      <a className="btn" href={v.mapLink} target="_blank" rel="noreferrer">Open in Maps</a>
    </R>
  );
  return (
    <section className="sec bg-photo details" style={vars({ "--bgimg": `url(${data.photos[venue.bgPhoto - 1]})` })}>
      <Flora corners sides />
      <R className="center"><p className="eyebrow light">{couple.date}</p></R>
      <div className="dt-wrap">{block(venue.ceremony, "l")}<div className="dt-rule" />{block(venue.reception, "r")}</div>
    </section>
  );
}

/** Calendar for the wedding month + add to Google Calendar / .ics download. */
function SaveDate() {
  const [y, m, day] = couple.countdownDate.slice(0, 10).split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const cells = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)] as (number | null)[];
  const start = new Date(couple.countdownDate), end = new Date(start.getTime() + calendar.durationHours * 36e5);
  const f = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const loc = `${venue.ceremony.name}, ${venue.ceremony.address}`;
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendar.title)}&dates=${f(start)}/${f(end)}&details=${encodeURIComponent(calendar.description)}&location=${encodeURIComponent(loc)}`;
  return (
    <section className="sec bg-pearl savedate">
      <Flora corners top />
      <div className="sd-wrap">
        <R from="l" className="cal" >
          <h2 className="serif cal-title">{month} {y}</h2>
          <div className="cal-grid" role="grid" aria-label={`${month} ${y}`}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="cal-h">{d}</span>)}
            {cells.map((c, i) => <span key={i} className={`cal-d ${c === day ? "on" : ""}`}>{c}</span>)}
          </div>
        </R>
        <R from="r" className="sd-side">
          <p className="eyebrow">Save the date</p>
          <p className="script sd-date">{couple.shortDate}</p>
          <p className="sd-time">{venue.ceremony.hour}:{venue.ceremony.minute} {venue.ceremony.meridiem}</p>
          {/* INVITATION IMAGE (with all details): put it at calendar.inviteImage in data.ts */}
          <div className="sd-invite"><Slot flow src={calendar.inviteImage} ar="3/4" alt="Invitation card with the wedding details" /></div>
          <div className="sd-btns">
            <a className="btn dark" href={google} target="_blank" rel="noreferrer">Add to Google Calendar</a>
            <a className="btn dark" href={calendar.inviteImage} download="Wedding-Invitation.png">Download Invitation</a>
          </div>
        </R>
      </div>
    </section>
  );
}

/** Scroll-driven: Alex enters from the left, Kate from the right, and they meet. */
function Meet() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const upd = () => { const r = el.getBoundingClientRect(); const total = r.height - window.innerHeight; el.style.setProperty("--p", String(Math.min(1, Math.max(0, -r.top / total)))); };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); };
    upd(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="meet" ref={ref}>
      <div className="meet-stick bg-blush">
        <Flora corners sides />
        <div className="meet-row">
          <div className="meet-fig a"><Slot flow src={els.alexCutout} ar="3/5" alt={couple.partnerOne} /></div>
          <div className="meet-fig k"><Slot flow src={els.kateCutout} ar="3/5" alt={couple.partnerTwo} /></div>
        </div>
        <div className="meet-names"><span className="script">{couple.displayName}</span><span className="meet-date">{couple.shortDate}</span></div>
      </div>
    </section>
  );
}

/** Collage: A (groom) on the left, K (bride) on the right, photos under each letter. */
function Collage() {
  const left: [number, string, boolean][] = [[16, "3/4", false], [17, "1/1", true], [18, "4/5", false]];
  const right: [number, string, boolean][] = [[19, "4/5", false], [15, "1/1", true], [20, "3/4", false]];
  const col = (list: [number, string, boolean][], mono: string, cls: string, from: "l" | "r") => (
    <div className={`co-col ${cls}`}>
      <R from={from}><Slot flow src={mono} className="co-mono" alt={cls === "a" ? "Letter A" : "Letter K"} /></R>
      {list.map(([n, r, pol], i) => (
        <R key={n} delay={i * 140} from={from}><Photo index={n} ratio={r} frame={pol ? frames.polaroid : undefined} className={pol ? "tilt" : ""} /></R>
      ))}
    </div>
  );
  return (
    <section className="sec bg-ivory collage">
      <Flora corners sides />
      <div className="co-grid">{col(left, els.groomMonogram, "a", "l")}{col(right, els.brideMonogram, "k", "r")}</div>
    </section>
  );
}

function Carousel() {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const drag = useRef({ down: false, x: 0, left: 0 });
  const step = () => ((ref.current?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 280) + 14;
  // AUTO-SLIDE: moves every 3s and loops back. Guests can also swipe (phone) or drag (mouse).
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (paused.current) return;
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      el.scrollTo({ left: end ? 0 : el.scrollLeft + step(), behavior: "smooth" });
    }, 3000);
    return () => clearInterval(t);
  }, []);
  const hold = (v: boolean, delay = 0) => () => { setTimeout(() => { paused.current = v; }, delay); };
  const up = () => { drag.current.down = false; if (ref.current) ref.current.style.scrollSnapType = ""; hold(false, 2000)(); };
  return (
    <section className="film bg-rose" aria-label="Photo carousel">
      <div className="strip" ref={ref} tabIndex={0}
        onMouseEnter={hold(true)} onMouseLeave={hold(false)} onTouchStart={hold(true)} onTouchEnd={hold(false, 2500)} onFocus={hold(true)} onBlur={hold(false)}
        onPointerDown={(e) => { if (e.pointerType !== "mouse" || !ref.current) return; drag.current = { down: true, x: e.clientX, left: ref.current.scrollLeft }; ref.current.style.scrollSnapType = "none"; }}
        onPointerMove={(e) => { if (drag.current.down && ref.current) ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x); }}
        onPointerUp={up} onPointerLeave={up}>
        {[3, 6, 9, 12, 14, 17, 2, 5, 18, 19].map((n, i) => <Photo key={i} index={n} ratio="3/4" className="frame-cell" />)}
      </div>
    </section>
  );
}

function Itinerary() {
  return (
    <section className="sec bg-pearl itin">
      <Flora corners />
      <div className="it-grid">
        <div className="it-side"><div><R from="l"><h2 className="serif head left">Order of<br />the Day</h2><Photo index={13} frame={frames.ornate} ratio="3/4" className="it-photo" /></R></div></div>
        <ol className="it-list">
          {itinerary.map((it, i) => (
            <R key={i} delay={(i % 3) * 80} from="r"><li><span className="it-time">{it.time}</span><span className="it-title serif">{it.title}</span><span className="it-note">{it.note}</span></li></R>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Attire: tabs per group, men + women image slots, strict note, what to avoid. */
function Attire() {
  const [g, setG] = useState(0);
  const grp = attire.groups[g];
  return (
    <section className="sec bg-blush attire">
      <Flora corners sides />
      <R className="center"><h2 className="serif head">{attire.title}</h2></R>
      <div className="tabs" role="tablist">
        {attire.groups.map((x, i) => <button key={x.id} role="tab" aria-selected={g === i} className={g === i ? "on" : ""} onClick={() => setG(i)}>{x.title}</button>)}
      </div>
      <div className="at-body" key={grp.id}>
        {[grp.men, grp.women].map((p) => (
          <figure key={p.label} className="at-fig">
            <div className="at-img"><Slot flow src={p.image} ar="3/5" alt={`${grp.title} attire for ${p.label.toLowerCase()}`} /></div>
            <figcaption><b className="script">{p.label}</b><span>{p.note}</span></figcaption>
          </figure>
        ))}
      </div>
      <div className="swatches">{attire.colors.map((c) => <div key={c.name} className="sw"><i style={{ background: c.hex }} /><span>{c.name}</span></div>)}</div>
      <R className="at-rules">
        <p className="at-strict">{attire.strict}</p>
        <p className="at-avoid-t">Please do not wear</p>
        <ul>{attire.avoid.map((a) => <li key={a}>{a}</li>)}</ul>
      </R>
    </section>
  );
}

/** Entourage: parents, principal sponsors, secondary sponsors, wedding party, bearers. */
function Names({ names }: { names: string[] }) { return <>{names.map((n) => <p key={n} className="en-name">{n}</p>)}</>; }
function Entourage() {
  const nav: [string, string][] = [["Parents", "en-parents"], ["Principal Sponsors", "en-principal"], ["Secondary Sponsors", "en-secondary"], ["Wedding Party", "en-party"], ["Bearers", "en-bearers"]];
  return (
    <section className="sec bg-champ entourage">
      <Flora corners sides />
      <R className="center"><h2 className="serif head">Entourage</h2></R>
      <nav className="en-nav" aria-label="Entourage sections">{nav.map(([t, id]) => <a key={id} href={`#${id}`}>{t}</a>)}</nav>

      <div id="en-parents" className="en-block">
        <R className="center"><h3 className="script en-title">Parents</h3></R>
        <div className="en-two">
          <R from="l" className="en-col r"><p className="en-role">Parents of the Groom</p><Names names={entourage.parents.groom} /></R>
          <span className="en-amp script">&amp;</span>
          <R from="r" className="en-col"><p className="en-role">Parents of the Bride</p><Names names={entourage.parents.bride} /></R>
        </div>
      </div>

      <div id="en-principal" className="en-block">
        <R className="center"><h3 className="script en-title">Principal Sponsors</h3></R>
        <R className="en-cols"><Names names={entourage.principal} /></R>
      </div>

      <div id="en-secondary" className="en-block">
        <R className="center"><h3 className="script en-title">Secondary Sponsors</h3></R>
        <div className="en-three">
          {entourage.secondary.map((s, i) => <R key={s.role} delay={i * 120} className="en-col c"><p className="en-role">{s.role}</p><Names names={s.names} /></R>)}
        </div>
      </div>

      <div id="en-party" className="en-block">
        <R className="center"><h3 className="script en-title">Wedding Party</h3></R>
        <div className="en-two top">
          <R from="l" className="en-col r">{entourage.party.groom.map((g) => <div key={g.role} className="en-grp"><p className="en-role">{g.role}</p><Names names={g.names} /></div>)}</R>
          <span className="en-vr" />
          <R from="r" className="en-col">{entourage.party.bride.map((g) => <div key={g.role} className="en-grp"><p className="en-role">{g.role}</p><Names names={g.names} /></div>)}</R>
        </div>
      </div>

      <div id="en-bearers" className="en-block">
        <R className="center"><h3 className="script en-title">Bearers</h3></R>
        <div className="en-four">{entourage.bearers.map((b, i) => <R key={b.role} delay={i * 100} className="en-col c"><p className="en-role">{b.role}</p><Names names={b.names} /></R>)}</div>
      </div>
    </section>
  );
}

/** Video: no heading. Flowers + a small photo overlap only the corners. */
function Video() {
  const v = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <section className="sec bg-dark video">
      <Flora corners />
      <R from="zoom" className="vid-wrap">
        <div className="vid">
          <video ref={v} src={video.src} poster={data.photos[video.poster - 1]} playsInline preload="metadata" controls={playing} onPlay={() => setPlaying(true)} />
          {!playing && <button className="play" onClick={() => v.current?.play()} aria-label="Play video"><span /></button>}
          <img className="photo-frame" src={frames.royal} alt="" aria-hidden="true" onError={(e) => (e.currentTarget.style.display = "none")} />
        </div>
        <Deco src={els.flowerBottomLeft} className="vf bl float" />
        <Deco src={els.cornerRight} className="vf tr float s2" />
        <Photo index={12} frame={frames.polaroid} ratio="1/1" className="vp tilt" />
      </R>
    </section>
  );
}

/** Gifts: a gift-tag card (appliances / anything useful) + QR codes for cash. No links. */
function Gifts() {
  return (
    <section className="sec bg-pearl gifts">
      <Flora corners />
      <R className="center"><h2 className="serif head">{gifts.title}</h2><p className="g-intro serif">{gifts.intro}</p><p className="g-sub">{gifts.sub}</p></R>
      <R from="zoom" className="g-tag">
        <p className="g-tag-s">{gifts.headlineLead}</p>
        <p className="script g-tag-h">{gifts.headline}</p>
        <Ornament />
        <p className="g-tag-s">{gifts.headlineSub}</p>
      </R>
      <R className="center"><p className="g-cash serif">{gifts.cashTitle}</p></R>
      <div className="g-qr">
        {gifts.options.map((o, i) => (
          <R key={o.title} delay={i * 120} from="zoom" className="g-pay">
            <div className="qr"><Slot flow src={o.qr} ar="1/1" alt={`${o.title} QR code`} /></div>
            <h3 className="script">{o.title}</h3>
            <p className="g-acc">{o.accountName}</p>
            {o.number && <p className="g-num">{o.number}</p>}
          </R>
        ))}
      </div>
    </section>
  );
}

/** Hashtag + reminders + FAQ accordion. */
function Info() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="sec bg-blush info">
      <Flora corners sides />
      <div className="in-grid">
        <R from="l" className="in-left">
          <p className="eyebrow">Hashtag</p>
          <p className="script in-tag">{couple.hashtag}</p>
          <Ornament />
          <h3 className="serif in-h">Reminders</h3>
          <ul className="rem">{reminders.map((r) => <li key={r}>{r}</li>)}</ul>
        </R>
        <R from="r" className="in-right">
          <h3 className="serif in-h">Questions</h3>
          {faq.map((f, i) => (
            <div key={f.q} className={`fq ${open === i ? "open" : ""}`}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{f.q}<i /></button>
              <div className="fq-a"><div><p>{f.a}</p></div></div>
            </div>
          ))}
        </R>
      </div>
    </section>
  );
}

/* ---------- RSVP ---------- */
async function submitRsvp(payload: Record<string, unknown>) {
  const body = { ...payload, submittedAt: new Date().toISOString() };
  if (rsvp.endpoint) {
    await fetch(rsvp.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) });
  } else {
    write(RK, [...read<unknown[]>(RK, []), body]); // DEMO only: this browser
  }
}

function Rsvp() {
  const CK = "w001-guest-cache";
  const [guests, setGuests] = useState<Family[]>(() => (rsvp.endpoint ? read<Family[]>(CK, []) : read<Family[]>(GK, rsvp.smartGuests)));
  const [listState, setListState] = useState<"ok" | "loading" | "fail">(() => (rsvp.endpoint && read<Family[]>(CK, []).length === 0 ? "loading" : "ok"));
  useEffect(() => {
    if (!rsvp.endpoint) return;
    fetch(`${rsvp.endpoint}?action=guests`).then((r) => r.json()).then((j: { guests?: Family[] }) => { setGuests(j.guests ?? []); write(CK, j.guests ?? []); setListState("ok"); }).catch(() => setListState((p) => (p === "ok" ? "ok" : "fail")));
  }, []);
  const [done, setDone] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const [attend, setAttend] = useState<"yes" | "no">("yes");
  const [name, setName] = useState(""), [seats, setSeats] = useState(1), [msg, setMsg] = useState("");
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<Family | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const q = query.trim().toLowerCase();
  const matches = q.length < 2 ? [] : guests.filter((g) => g.family.toLowerCase().includes(q) || g.members.some((m) => m.toLowerCase().includes(q)));

  const send = async (e: FormEvent) => {
    e.preventDefault(); setErr("");
    let payload: Record<string, unknown>;
    if (rsvp.mode === "smart") {
      if (!family) return setErr("Please find your invitation first.");
      if (attend === "yes" && picked.length === 0) return setErr("Select at least one guest, or choose “Regretfully decline”.");
      payload = { mode: "smart", family: family.family, attending: attend === "yes" ? picked : [], declined: attend === "no" ? family.members : family.members.filter((m) => !picked.includes(m)), message: msg };
    } else {
      if (!name.trim()) return setErr("Please enter your name.");
      payload = { mode: "standard", name, attending: attend === "yes", seats: attend === "yes" ? seats : 0, message: msg };
    }
    try { setBusy(true); await submitRsvp(payload); setDone(true); } catch { setErr("Something went wrong. Please try again."); } finally { setBusy(false); }
  };
  const choice = (
    <div className="radios">
      <button type="button" className={attend === "yes" ? "on" : ""} onClick={() => setAttend("yes")}>Joyfully accept</button>
      <button type="button" className={attend === "no" ? "on" : ""} onClick={() => setAttend("no")}>Regretfully decline</button>
    </div>
  );
  return (
    <section className="sec bg-photo rsvp" style={vars({ "--bgimg": `url(${data.photos[18]})` })}>
      <Flora corners sides />
      <R from="zoom" className="rs-card">
        <h2 className="serif head">RSVP</h2>
        <p className="rs-sub">{rsvp.deadline}</p>
        {done ? (
          <div className="rs-done" role="status"><h3 className="script">Thank you</h3><p>{attend === "yes" ? "Your reply has been received. We look forward to celebrating with you." : "Your reply has been received. You will be missed."}</p></div>
        ) : (
          <form onSubmit={send} noValidate>
            {rsvp.mode === "smart" ? (
              !family ? (
                <div className="field">
                  <label htmlFor="find">Find your invitation</label>
                  <input id="find" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter your name" autoComplete="off" />
                  {listState === "loading" && <p className="hint">Loading guest list…</p>}
                  {listState === "fail" && <p className="err" role="alert">Could not load the guest list. Please refresh the page.</p>}
                  {listState === "ok" && q.length >= 2 && matches.length === 0 && <p className="hint">No invitation found. Please check the spelling of your name.</p>}
                  <ul className="matches">{matches.map((g) => <li key={g.family}><button type="button" onClick={() => { setFamily(g); setPicked([]); }}>{g.family}<small>{g.members.length} guests</small></button></li>)}</ul>
                </div>
              ) : (
                <div className="field">
                  <p className="fam">{family.family}</p>{choice}
                  {attend === "yes" && family.members.map((m) => (
                    <label key={m} className="chk"><input type="checkbox" checked={picked.includes(m)} onChange={() => setPicked((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]))} /><span>{m}</span></label>
                  ))}
                  <button type="button" className="link" onClick={() => setFamily(null)}>Not your invitation? Search again</button>
                </div>
              )
            ) : (
              <>
                <div className="field"><label htmlFor="nm">Name</label><input id="nm" value={name} onChange={(e) => setName(e.target.value)} /></div>
                {choice}
                {attend === "yes" && <div className="field"><label htmlFor="st">Number of seats</label><select id="st" value={seats} onChange={(e) => setSeats(Number(e.target.value))}>{Array.from({ length: rsvp.maxSeats }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></div>}
              </>
            )}
            {(rsvp.mode === "standard" || family) && <div className="field"><label htmlFor="ms">Message</label><textarea id="ms" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} /></div>}
            {err && <p className="err" role="alert">{err}</p>}
            {(rsvp.mode === "standard" || family) && <button className="btn solid" disabled={busy}>{busy ? "Sending…" : "Send Reply"}</button>}
          </form>
        )}
      </R>
    </section>
  );
}

function Closing() {
  return (
    <footer className="sec bg-photo dark closing" style={vars({ "--bgimg": `url(${data.photos[closing.photo - 1]})` })}>
      <Flora corners sides bottom /><Sparkles n={14} />
      <R from="zoom" className="cl-body">
        <Photo index={closing.photo} frame={frames.arch} ratio="3/4" round="999px 999px 0 0" className="cl-photo" alt={`${couple.displayName} closing portrait`} />
        <p className="cl-msg serif">{closing.message}</p>
        <p className="cl-with">{closing.signoff}</p>
        <h2 className="script cl-names shine">{couple.displayName}</h2>
        <p className="cl-date">{couple.shortDate}</p>
        <p className="cl-tag script">{couple.hashtag}</p>
      </R>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* COUPLE DASHBOARD — open  yoursite.com/#admin                        */
/* LIVE: reads/writes the couple's Google Sheet through the Apps Script */
/*       URL in rsvp.endpoint (passcode lives in the script, not here). */
/* DEMO (no endpoint): works in this browser only, for previewing.     */
/* ------------------------------------------------------------------ */
function Admin({ onClose }: { onClose: () => void }) {
  const api = rsvp.endpoint, live = !!api;
  const [unlocked, setUnlocked] = useState(false), [pin, setPin] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"guests" | "replies">("guests");
  const [guests, setGuests] = useState<Family[]>(() => read<Family[]>(GK, rsvp.smartGuests));
  const [rows, setRows] = useState<Row[]>([]);
  const [fam, setFam] = useState(""), [bulk, setBulk] = useState(""), [updated, setUpdated] = useState("");
  const post = (b: Record<string, unknown>) => fetch(api, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(b) });
  const upd = (i: number, f: Family) => setGuests(guests.map((x, j) => (j === i ? f : x)));

  const load = async (p: string, silent = false) => {
    if (!silent) { setBusy(true); setMsg(""); }
    try {
      if (live) {
        const r = await (await fetch(`${api}?action=all&pin=${encodeURIComponent(p)}`)).json(); // ONE call: guests + replies
        if (r.error) { if (!silent) setMsg("Wrong passcode. It must match the PIN inside your Apps Script (capital letters count)."); return false; }
        if (!silent) setGuests(r.guests ?? []);
        setRows(((r.replies ?? []) as Record<string, unknown>[]).map(toRow).filter(isReal));
      } else setRows(read<Record<string, unknown>[]>(RK, []).map(toRow).filter(isReal));
      setUpdated(new Date().toLocaleTimeString());
      return true;
    } catch { if (!silent) setMsg("Could not connect. Check the endpoint URL in data.ts."); return false; } finally { if (!silent) setBusy(false); }
  };
  const enter = async () => { const p = pin.trim(); if (await load(p)) { setPin(p); sessionStorage.setItem("w001-pin", p); setUnlocked(true); } };
  // Remember the passcode for this browser session, and refresh replies every 20 seconds.
  useEffect(() => { const s = sessionStorage.getItem("w001-pin"); if (s) { setPin(s); load(s).then((ok) => { if (ok) setUnlocked(true); }); } }, []);
  useEffect(() => { if (!unlocked) return; const t = setInterval(() => { load(pin, true); }, 20000); return () => clearInterval(t); }, [unlocked, pin]);
  const clean = () => guests.map((g) => ({ family: g.family.trim(), members: g.members.map((m) => m.trim()).filter(Boolean) })).filter((g) => g.family && g.members.length);
  const save = async () => {
    setBusy(true); setMsg("");
    try {
      const c = clean();
      if (live) { await post({ action: "saveGuests", pin, guests: c }); await new Promise((r) => setTimeout(r, 1500)); const gg = await (await fetch(`${api}?action=guests`)).json(); setGuests(gg.guests ?? c); }
      else { write(GK, c); setGuests(c); }
      setMsg("Saved. The invitation now uses this guest list.");
    } catch { setMsg("Save failed. Please try again."); } finally { setBusy(false); }
  };
  const addBulk = () => {
    const add = bulk.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const [f, m = ""] = l.split(":"); return { family: f.trim(), members: m.split(",").map((x) => x.trim()).filter(Boolean) }; });
    setGuests([...guests, ...add]); setBulk("");
  };

  if (!unlocked) {
    return (
      <div className="admin"><div className="ad-box">
        <h2 className="serif">Couple dashboard</h2>
        {!live && <p className="ad-h">Demo mode: no endpoint is set, so changes stay in this browser. Enter any passcode.</p>}
        <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Passcode" aria-label="Passcode" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} onKeyDown={(e) => e.key === "Enter" && enter()} />
        <button className="btn solid" onClick={enter} disabled={busy}>{busy ? "Connecting… first load can take a few seconds" : "Enter"}</button>
        {msg && <p className="err" role="alert">{msg}</p>}
        <button className="link" onClick={onClose}>Back to invitation</button>
      </div></div>
    );
  }
  const all = guests.flatMap((g) => g.members);
  const status = new Map<string, "att" | "dec">();
  rows.forEach((r) => { r.att.forEach((n) => status.set(n, "att")); r.dec.forEach((n) => status.set(n, "dec")); }); // latest reply wins
  const att = [...status].filter(([, s]) => s === "att"), dec = [...status].filter(([, s]) => s === "dec");
  const pending = all.filter((m) => !status.has(m)).length;
  const seats = rows.reduce((n, r) => n + r.seats, 0); // standard-mode seats
  const replied = new Set(rows.map((r) => r.who)).size;
  const csv = () => {
    const out = [["Date", "Family/Name", "Attending", "Declined", "Message"], ...rows.map((r) => [r.when, r.who, r.att.join("; ") || r.note, r.dec.join("; "), r.msg])];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([out.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" }));
    a.download = "rsvp.csv"; a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <div className="admin"><div className="ad-main">
      <header className="ad-top"><h2 className="serif">Couple dashboard</h2><button className="link" onClick={onClose}>Back to invitation</button></header>
      {!live && <p className="ad-h">Demo mode: changes stay in this browser only. Set rsvp.endpoint in data.ts to go live.</p>}
      <div className="ad-stats"><div><b>{all.length}</b>Invited</div><div><b>{att.length + seats}</b>Attending</div><div><b>{dec.length}</b>Declined</div><div><b>{pending}</b>Pending</div></div>
      <p className="ad-h">{replied} of {guests.length} families replied{updated && ` · updated ${updated}`}</p>
      <div className="tabs">{(["guests", "replies"] as const).map((x) => <button key={x} className={tab === x ? "on" : ""} onClick={() => setTab(x)}>{x}</button>)}<button onClick={() => load(pin)} disabled={busy}>Refresh</button></div>
      {msg && <p className="hint" role="status">{msg}</p>}

      {tab === "guests" && (
        <>
          <div className="ad-row"><input value={fam} onChange={(e) => setFam(e.target.value)} placeholder="New family / group name" aria-label="New family name" /><button className="btn dark" onClick={() => { if (fam.trim()) { setGuests([...guests, { family: fam.trim(), members: [""] }]); setFam(""); } }}>Add</button></div>
          {guests.map((g, i) => (
            <div key={i} className="ad-fam">
              <div className="ad-row"><input className="ad-name" value={g.family} onChange={(e) => upd(i, { ...g, family: e.target.value })} aria-label="Family name" /><button className="del" onClick={() => setGuests(guests.filter((_, j) => j !== i))} aria-label={`Delete ${g.family}`}>Delete</button></div>
              {g.members.map((m, k) => (
                <div key={k} className="ad-row sm"><input value={m} onChange={(e) => upd(i, { ...g, members: g.members.map((x, j) => (j === k ? e.target.value : x)) })} aria-label="Guest name" /><button className="del" onClick={() => upd(i, { ...g, members: g.members.filter((_, j) => j !== k) })} aria-label={`Remove ${m || "guest"}`}>×</button></div>
              ))}
              <button className="link" onClick={() => upd(i, { ...g, members: [...g.members, ""] })}>+ Add guest</button>
            </div>
          ))}
          <p className="ad-h">Bulk add — one family per line: <i>Family Name: Guest 1, Guest 2</i></p>
          <textarea rows={4} value={bulk} onChange={(e) => setBulk(e.target.value)} aria-label="Bulk add guests" /><button className="btn dark" onClick={addBulk}>Add all</button>
          <div className="ad-save"><button className="btn solid" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save guest list"}</button></div>
        </>
      )}
      {tab === "replies" && (
        <>
          {rows.length === 0 && <p className="ad-h">No replies yet.</p>}
          {rows.map((r, i) => (
            <div key={i} className="ad-fam"><b>{r.who}</b> <small>{r.when && new Date(r.when).toLocaleString()}</small>
              {r.note && <p>{r.note}</p>}
              {(r.att.length > 0 || !r.note) && <p>Attending: {r.att.join(", ") || "none"}</p>}
              {r.dec.length > 0 && <p>Not attending: {r.dec.join(", ")}</p>}{r.msg && <p>“{r.msg}”</p>}</div>
          ))}
          <button className="btn dark" onClick={csv}>Download CSV</button>
        </>
      )}
    </div></div>
  );
}

/* ------------------------------------------------------------------ */
export default function App() {
  const [opened, setOpened] = useState(false);
  const [admin, setAdmin] = useState(() => window.location.hash === "#admin");
  useEffect(() => { document.body.classList.toggle("lock", !opened); }, [opened]);
  useEffect(() => { document.title = `${couple.displayName} — The Wedding`; }, []);
  useEffect(() => { const h = () => setAdmin(window.location.hash === "#admin"); window.addEventListener("hashchange", h); return () => window.removeEventListener("hashchange", h); }, []);
  if (admin) return <Admin onClose={() => { window.location.hash = ""; setAdmin(false); }} />;
  return (
    <>
      <Envelope onOpen={() => setOpened(true)} />
      <Music started={opened} />
      <main className={`site ${opened ? "revealed" : ""}`} aria-hidden={!opened}>
        <Hero /><CouplePair /><Cinema /><Story /><Details /><SaveDate /><Meet /><Collage /><Carousel />
        <Itinerary /><Attire /><Entourage /><Video /><Gifts /><Info /><Rsvp /><Closing />
      </main>
    </>
  );
}