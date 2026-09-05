// BIDTOBE1 visual system — adapted from the Kage design language (MengTo/kage).
// Near-black ground, bone type, vermilion accent. Editorial, restrained, no glassmorphism.
module.exports.CSS = `
:root{
  --ink:#05070a;        /* page black */
  --ink-2:#0a0e12;      /* raised black */
  --ink-3:#0d1218;
  --bone:#ffffff;
  --bone-dim:#eef1ef;
  --muted:#c9d1cc;
  --line:rgba(255,255,255,.16);
  --line-soft:rgba(255,255,255,.09);
  --vermilion:#e0231c;
  --ember:#ff5a3c;
  --gold:#c9a24a;
  --pad:clamp(20px,3.4vw,56px);
  --s1:8px; --s2:16px; --s3:24px; --s4:32px; --s5:48px; --s6:64px; --s7:88px;
  --ease:cubic-bezier(.22,.61,.36,1);
  --ease-out:cubic-bezier(.16,1,.3,1);
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;overflow-x:hidden}
body{margin:0;background:var(--ink);color:var(--bone);overflow-x:hidden;min-width:0;
  font:300 16.5px/1.65 'Onest',system-ui,-apple-system,'Helvetica Neue',sans-serif;
  -webkit-font-smoothing:antialiased;letter-spacing:-.005em}
body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(125% 95% at 50% 34%,rgba(224,35,28,.05) 0%,transparent 46%),
             radial-gradient(120% 90% at 50% 42%,transparent 40%,rgba(2,4,6,.55) 100%)}
::selection{background:var(--vermilion);color:#fff}
.sub{color:#e6ebe8}
a{color:inherit;text-decoration:none}
img{max-width:100%}
.page{position:relative;z-index:1}
.wrap{max-width:1180px;margin:0 auto;padding:0 var(--pad) var(--s7);width:100%}
img,video{max-width:100%;height:auto}
svg{max-width:100%;flex:none}
.btn svg,.arrowlink svg{width:13px;height:13px;flex:none}
*{min-width:0}

/* ---------- type ---------- */
.eyebrow{font-size:12.5px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#f2f5f3;
  display:block;min-height:24px;line-height:1.55}
.eyebrow a{display:inline-flex;align-items:center;min-height:24px}
.body a,.body-lg a,ul.list a{display:inline-block;padding:3px 0;min-height:24px}
.eyebrow .dot{width:5px;height:5px;border-radius:50%;background:var(--vermilion);box-shadow:0 0 10px var(--vermilion);
  display:inline-block;vertical-align:middle;margin-right:9px;position:relative;top:-1px;flex:none}
h1,h2,h3{font-weight:400;margin:0;letter-spacing:-.005em}
.display{text-transform:uppercase;line-height:1.055;letter-spacing:-.012em;font-weight:400;overflow-wrap:break-word}
.h-hero{font-size:clamp(33px,5vw,78px)}
.h-sec{font-size:clamp(28px,3.3vw,50px)}
.h-page{font-size:clamp(30px,3.7vw,56px)}
.body-lg{font-size:clamp(15.5px,1.12vw,19px);line-height:1.72;color:#f2f5f3;font-weight:300}
.body{font-size:15.5px;line-height:1.68;color:#e6ebe8;font-weight:300}
.num{font-weight:300;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.k{font-size:13.5px;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:#c9d1cc}
.k b{color:var(--vermilion);font-weight:500}
.rule{flex:1 1 auto;height:1px;background:var(--line-soft)}
.sec-head{display:flex;align-items:baseline;gap:16px;margin:var(--s6) 0 var(--s2)}
.sec-head h2{font-size:inherit;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:#fff;margin:0}
.sec-head .k-meta{color:#c9d1cc;white-space:nowrap}
.sec-lede{font-size:clamp(15.5px,1.12vw,19px);line-height:1.7;color:#f2f5f3;max-width:60ch;margin:0 0 var(--s3)}
.vermilion{color:var(--vermilion)}

/* ---------- reveal ---------- */
[data-rv]{opacity:0;transform:translate3d(0,22px,0);
  transition:opacity 1.05s var(--ease-out),transform 1.05s var(--ease-out)}
[data-rv="fade"]{transform:none}
[data-rv].rv-in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){[data-rv]{opacity:1!important;transform:none!important}
  html{scroll-behavior:auto}}

/* ---------- ticker + nav ---------- */
.ticker{border-bottom:1px solid var(--line-soft);font-size:13.5px;letter-spacing:.2em;text-transform:uppercase;
  color:#dfe5e2;padding:9px var(--pad);display:flex;gap:14px;justify-content:center;flex-wrap:wrap;
  background:rgba(5,7,10,.7);backdrop-filter:blur(14px)}
.ticker .live{display:inline-flex;align-items:center;gap:7px;color:#fff}
.ticker .pip{width:5px;height:5px;border-radius:50%;background:var(--vermilion);box-shadow:0 0 10px var(--vermilion);
  animation:pip 2.6s var(--ease) infinite}
@keyframes pip{0%,100%{opacity:1}50%{opacity:.25}}
header{position:sticky;top:0;z-index:60;border-bottom:1px solid var(--line-soft);
  background:rgba(5,7,10,.78);backdrop-filter:blur(18px)}
.nav{max-width:1180px;margin:0 auto;padding:0 var(--pad);min-height:clamp(62px,8vw,80px);
  display:flex;align-items:center;gap:clamp(12px,1.8vw,26px);position:relative}
.navlinks{display:flex;align-items:center;gap:clamp(10px,1.4vw,20px);margin-left:auto}
.burger{display:none;width:42px;height:42px;margin-left:auto;background:none;border:1px solid var(--line);
  padding:0;cursor:pointer;flex-direction:column;justify-content:center;align-items:center;gap:5px}
.burger span{display:block;width:16px;height:1px;background:var(--bone);transition:transform .4s var(--ease),opacity .3s}
.burger[aria-expanded="true"] span:first-child{transform:translateY(3px) rotate(45deg)}
.burger[aria-expanded="true"] span:last-child{transform:translateY(-3px) rotate(-45deg)}
.logo{display:inline-flex;align-items:center;gap:10px;font-size:15.5px;font-weight:600;letter-spacing:.16em;margin-right:8px;
  text-transform:uppercase;color:var(--bone);white-space:nowrap}
.logo img{width:26px;height:26px;object-fit:contain;flex:none;filter:drop-shadow(0 0 12px rgba(224,35,28,.4))}
.logo i{font-style:normal;color:var(--vermilion)}
@media(max-width:640px){.logo span{display:none}.logo img{width:28px;height:28px}}
.nav a.link{font-size:13.5px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:#d5dcd8;
  transition:color .4s var(--ease);position:relative;padding:6px 0;
  display:inline-flex;align-items:center;min-height:26px}
.nav a.link:hover{color:var(--bone)}
.nav a.link.on{color:var(--bone)}
.nav a.link.on:after{content:'';position:absolute;left:0;right:0;bottom:4px;height:1px;background:var(--vermilion)}
.navspace{flex:1}

/* ---------- buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;white-space:nowrap;font-size:13.5px;font-weight:500;letter-spacing:.2em;
  text-transform:uppercase;color:var(--ink);background:var(--bone);border:1px solid var(--bone);
  padding:14px 22px;min-height:44px;cursor:pointer;font-family:inherit;text-align:center;
  transition:background .45s var(--ease),color .45s var(--ease),transform .5s var(--ease-out)}
.btn:hover{background:#fff;border-color:#fff;transform:translate3d(0,-1px,0)}
.btn.ghost{background:transparent;color:var(--bone);border-color:var(--line)}
.btn.ghost:hover{background:transparent;border-color:var(--bone)}
.btn.verm{background:var(--vermilion);border-color:var(--vermilion);color:#fff}
.btn.verm:hover{background:var(--ember);border-color:var(--ember)}
.btn.sm{padding:10px 15px;font-size:11.5px;letter-spacing:.18em}
.arrowlink{display:inline-flex;align-items:center;gap:12px;font-size:13.5px;font-weight:500;letter-spacing:.2em;
  text-transform:uppercase;color:var(--bone);min-height:34px}
.arrowlink .ar{width:32px;height:32px;border:1px solid var(--line);border-radius:50%;display:grid;place-items:center;
  transition:background .45s var(--ease),border-color .45s,transform .5s var(--ease-out)}
.arrowlink:hover .ar{background:var(--bone);border-color:var(--bone)}
.arrowlink:hover .ar svg path{stroke:var(--ink)}
:focus-visible{outline:1px solid var(--vermilion);outline-offset:3px}

/* ---------- hero ---------- */
.hero{padding:clamp(32px,6vh,64px) 0 clamp(28px,5vh,48px);border-bottom:1px solid var(--line-soft)}
.hero .h-hero{margin:var(--s2) 0 0;max-width:15ch}
.hero-mark{display:block;width:clamp(56px,5.5vw,84px);height:auto;object-fit:contain;margin:var(--s3) 0 2px;
  filter:drop-shadow(0 0 34px rgba(224,35,28,.32))}
.hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(28px,5vw,84px);
  align-items:start;margin-top:var(--s4)}
@media(max-width:860px){.hero-grid{grid-template-columns:1fr}}
.claimbox{border:1px solid var(--line);padding:clamp(20px,2.4vw,30px);background:rgba(10,14,18,.5)}
.claimbox .price{font-size:clamp(44px,5.8vw,82px);font-weight:300;letter-spacing:-.03em;line-height:1;
  color:var(--bone);font-variant-numeric:tabular-nums;margin:10px 0 4px}
.hero-cta{display:flex;gap:14px;margin-top:var(--s4);flex-wrap:wrap;align-items:center}
.claimform{display:grid;gap:10px;margin-top:var(--s3)}
.claimform .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:520px){.claimform .two{grid-template-columns:1fr}}
input,select,textarea{width:100%;max-width:100%;padding:13px 14px;border:1px solid var(--line);background:rgba(5,7,10,.6);
  color:var(--bone);font-family:inherit;font-weight:300;font-size:17.5px;line-height:1.5;border-radius:0;
  transition:border-color .4s var(--ease)}
input:focus,select:focus,textarea:focus{border-color:var(--bone-dim);outline:none}
input::placeholder{color:#a8b2ac}
select{text-overflow:ellipsis;padding-right:34px;appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),linear-gradient(135deg,var(--muted) 50%,transparent 50%);
  background-position:calc(100% - 18px) 20px,calc(100% - 13px) 20px;background-size:5px 5px,5px 5px;background-repeat:no-repeat}
label{display:block;font-size:13.5px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;
  color:#c9d1cc;margin:18px 0 0}
label input,label select,label textarea{margin-top:8px}

/* ---------- tabs / chips ---------- */
.tabs{display:flex;gap:clamp(14px,2.4vw,34px);border-bottom:1px solid var(--line-soft);margin-top:var(--s5);
  overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.tabs::-webkit-scrollbar{display:none}
.tab{flex:none}
.tab{font-size:13.5px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);
  padding:8px 0 14px;position:relative;transition:color .4s var(--ease);display:inline-flex;align-items:center;min-height:32px}
.tab:hover{color:#fff}
.tab.on{color:var(--bone)}
.tab.on:after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--vermilion)}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:var(--s2) 0 0}
.chip{font-size:11.5px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);
  border:1px solid var(--line-soft);padding:8px 13px;display:inline-flex;align-items:center;min-height:30px;transition:color .4s var(--ease),border-color .4s var(--ease)}
.chip:hover{color:#fff;border-color:var(--bone-dim)}
.chip.on{color:var(--bone);border-color:var(--bone-dim)}

/* ---------- podium ---------- */
.podium{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--line-soft);
  border:1px solid var(--line-soft);margin-top:var(--s1)}
@media(max-width:820px){.podium{grid-template-columns:1fr}}
.pod{background:var(--ink);padding:clamp(22px,2.6vw,34px);position:relative;
  transition:background .6s var(--ease)}
.pod:hover{background:var(--ink-2)}
.pod .pnum{font-size:clamp(42px,5.4vw,74px);font-weight:300;letter-spacing:-.04em;line-height:.9;
  color:rgba(255,255,255,.22);font-variant-numeric:tabular-nums}
.pod.p1 .pnum{color:rgba(224,35,28,.42)}
.pod .pname{font-size:clamp(19px,1.65vw,24px);text-transform:uppercase;letter-spacing:-.01em;margin:18px 0 8px;
  line-height:1.35;min-height:26px;display:flex;align-items:center}
.pod .pamt{font-size:clamp(26px,2.5vw,37px);font-weight:300;letter-spacing:-.025em;font-variant-numeric:tabular-nums;
  color:var(--bone);margin-top:16px}
.pod.p1:before{content:'';position:absolute;top:-1px;left:0;right:0;height:1px;background:var(--vermilion)}
.pod .pfoot{margin-top:20px;padding-top:16px;border-top:1px solid var(--line-soft)}

/* ---------- rows ---------- */
.rows{border-top:1px solid var(--line-soft);margin-top:0}
.row{display:grid;grid-template-columns:44px 30px minmax(0,1fr) auto auto;align-items:center;
  gap:clamp(10px,1.6vw,22px);padding:18px 4px;border-bottom:1px solid var(--line-soft);
  transition:background .5s var(--ease),padding-left .5s var(--ease-out)}
.row:hover{background:rgba(223,231,224,.02);padding-left:12px}
.row .rk{font-size:13.5px;font-weight:500;letter-spacing:.1em;color:#c9d1cc;font-variant-numeric:tabular-nums}
.row .ico{width:30px;height:30px;flex:none;border:1px solid var(--line-soft);object-fit:contain;background:var(--ink-2)}
.grow{flex:1;min-width:0;display:block;padding:3px 0}
.rname{font-size:16.5px;text-transform:uppercase;letter-spacing:-.005em;line-height:1.3;overflow-wrap:anywhere}
.rtag{font-size:14.5px;color:#dfe5e2;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rmeta{overflow-wrap:anywhere}
.rmeta{font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;color:#b4bdb8;margin-top:7px}
.ramt{text-align:right;flex:none}
.ramt b{display:block;font-size:18.5px;font-weight:300;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.ramt span{font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:#b4bdb8}
.claim{font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#d5dcd8;
  border-bottom:1px solid transparent;transition:color .4s,border-color .4s;white-space:nowrap;
  display:inline-flex;align-items:center;min-height:26px}
.claim:hover{color:var(--vermilion);border-color:var(--vermilion)}
.badge{font-size:10.5px;font-weight:500;letter-spacing:.11em;text-transform:uppercase;padding:3px 7px;
  border:1px solid var(--line);color:#eef1ef;margin-left:8px;white-space:nowrap}
.badge.v{border-color:rgba(201,162,74,.4);color:var(--gold)}
.badge.e{border-color:rgba(224,35,28,.4);color:var(--vermilion)}
.badge.s{border-color:var(--line);color:#dfe5e2}

/* ---------- panels ---------- */
.stat a,.q a,.tw a,.note a{display:inline-flex;align-items:center;min-height:24px;padding:2px 0}
.panel{border:1px solid var(--line-soft);padding:clamp(20px,2.4vw,32px);background:rgba(10,14,18,.35)}
.split{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:clamp(24px,3.4vw,60px);align-items:start}
@media(max-width:900px){.split{grid-template-columns:1fr}}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(clamp(118px,42vw,150px),1fr));gap:1px;background:var(--line-soft);
  border:1px solid var(--line-soft);margin:var(--s3) 0}
.stat{background:var(--ink);padding:20px;color:#e6ebe8}
.stat span{font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:#c9d1cc;display:block}
.stat b{display:block;font-size:clamp(24px,2.3vw,33px);font-weight:300;letter-spacing:-.025em;margin-top:8px;
  font-variant-numeric:tabular-nums;color:var(--bone)}
.feed a{display:flex;gap:11px;align-items:center;padding:13px 0;min-height:30px;border-bottom:1px solid var(--line-soft);
  transition:padding-left .4s var(--ease-out)}
.feed a:hover{padding-left:6px}
.feed .fn{font-size:14.5px;text-transform:uppercase;letter-spacing:-.005em}
.feed .fm{font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#b4bdb8;margin-top:4px}
.catlist a{display:flex;justify-content:space-between;align-items:center;padding:13px 0;min-height:26px;
  border-bottom:1px solid var(--line-soft);font-size:14.5px;letter-spacing:.12em;text-transform:uppercase;
  color:#eef1ef;transition:color .4s}
.catlist a:hover{color:var(--bone)}
.catlist a i{font-style:normal;color:#b4bdb8;font-variant-numeric:tabular-nums}
.bar{height:2px;background:rgba(223,231,224,.08);margin-top:9px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--vermilion)}
.err{border:1px solid rgba(224,35,28,.45);background:rgba(224,35,28,.07);color:#ffb3ae;padding:14px 16px;
  font-size:14.5px;margin:20px 0}
.note{border-left:1px solid var(--vermilion);padding:2px 0 2px 16px;color:#dfe5e2;font-size:15.5px;margin-top:18px}
ul.list{list-style:none;padding:0;margin:0}
ul.list li{padding:13px 0;border-bottom:1px solid var(--line-soft);color:#e6ebe8;font-size:15.5px;
  display:flex;gap:14px}
ul.list li:before{content:'—';color:var(--vermilion);flex:none}
.q{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(20px,3vw,50px);
  padding:26px 0;border-bottom:1px solid var(--line-soft)}
@media(max-width:760px){.q{grid-template-columns:1fr;gap:12px}}
.q h3{font-size:16.5px;text-transform:uppercase;letter-spacing:-.005em;color:var(--bone)}
.tw{border:1px solid var(--line-soft);padding:22px;font-size:16.5px;line-height:1.7;color:#e6ebe8}
.tw b{color:var(--bone);display:block;margin-bottom:8px;font-weight:400;text-transform:uppercase;
  font-size:14.5px;letter-spacing:.18em}
footer{color:#dfe5e2;border-top:1px solid var(--line-soft);padding:clamp(40px,7vh,80px) var(--pad);text-align:center}
footer .fl{font-size:13.5px;letter-spacing:.2em;text-transform:uppercase;color:#d5dcd8;
  display:flex;justify-content:center;flex-wrap:wrap;gap:2px}
footer .fl a{color:#eef1ef;margin:0 6px;padding:9px 6px;display:inline-flex;align-items:center;min-height:30px;transition:color .4s}
footer .fl a:hover{color:var(--bone)}
.skip{position:absolute;left:-9999px}.skip:focus{position:static;display:inline-block;margin:10px;color:var(--vermilion)}
/* ============================================================ responsive */

/* Tablet / small laptop */
@media(max-width:1024px){
  .split{grid-template-columns:minmax(0,1fr) 280px}
}

/* Tablet portrait — collapse sidebars */
@media(max-width:900px){
  .split{grid-template-columns:1fr}
  .split > div:last-child{padding-top:0!important}
}

/* Podium stacks */
@media(max-width:820px){
  .podium{grid-template-columns:1fr}
  .pod{padding:22px}
  .pod .pnum{font-size:47px}
}

/* --- Mobile nav breakpoint --- */
@media(max-width:1080px){.nav a.link{font-size:11px;letter-spacing:.1em}}
@media(max-width:960px){
  .burger{display:flex}
  .navlinks{position:absolute;top:100%;left:0;right:0;margin:0;
    flex-direction:column;align-items:stretch;gap:0;
    background:rgba(5,7,10,.98);backdrop-filter:blur(18px);
    border-bottom:1px solid var(--line);
    max-height:0;overflow:hidden;visibility:hidden;
    transition:max-height .45s var(--ease),visibility 0s linear .45s}
  .navlinks.open{max-height:80vh;overflow-y:auto;visibility:visible;transition:max-height .5s var(--ease),visibility 0s}
  .navlinks .link{padding:17px var(--pad);border-bottom:1px solid var(--line-soft);font-size:14.5px}
  .navlinks .link.on:after{left:var(--pad);right:auto;width:18px}
  .navcta{margin:16px var(--pad) 22px}
}

/* --- Phones (landscape + large phones) --- */
@media(max-width:640px){
  .ticker{gap:10px;font-size:11.5px;letter-spacing:.14em;padding:8px 14px}
  .ticker span:nth-child(n+4){display:none}
  .hero{padding:32px 0 26px}
  .hero-grid{gap:26px}
  .claimbox{padding:20px}
  .sec-head{gap:12px;margin:44px 0 22px}
  .stats{grid-template-columns:1fr 1fr}
  .stat{padding:16px}
  .q{padding:20px 0}
  .tw{padding:18px}
  .panel{padding:20px}

  /* rows: 2-line reflow, price under the name */
  .row{grid-template-columns:30px 24px minmax(0,1fr);
    grid-template-areas:"rk ico name" ". . amt" ". . claim";
    row-gap:8px;padding:16px 2px}
  .row .rk{grid-area:rk;font-size:14.5px}
  .row .ico{grid-area:ico;width:24px;height:24px}
  .row .grow{grid-area:name}
  .row .ramt{grid-area:amt;text-align:left}
  .row .ramt b{font-size:16.5px}
  .row .claim{grid-area:claim;justify-self:start}
  .row:hover{padding-left:2px}
  .rtag{white-space:normal;font-size:15.5px}
  .rmeta{font-size:14.5px;letter-spacing:.12em}
  .badge{margin-left:6px;font-size:13.5px;padding:2px 5px}

  .btn{width:100%}
  .btn.sm,.navcta{width:auto}
  .claimform .two{grid-template-columns:1fr}
  .hero-mark{width:64px;margin:18px 0 2px}
  ul.list li{font-size:16.5px;gap:10px}
}

/* --- Small phones (iPhone SE / 360px Android) --- */
@media(max-width:400px){
  :root{--pad:16px}
  body{font-size:15.5px}
  .ticker span:nth-child(n+3){display:none}
  .h-hero{font-size:29px}
  .h-page,.h-sec{font-size:26px}
  .claimbox .price{font-size:39px}
  .stats{grid-template-columns:1fr}
  .chip{font-size:14.5px;padding:7px 10px}
  .logo{letter-spacing:.16em;font-size:13.5px}
  .pod{padding:18px}
}

/* --- Landscape phones: reclaim vertical space --- */
@media(max-height:500px) and (orientation:landscape){
  .hero{padding:22px 0 18px}
  .hero-mark{width:52px;margin:12px 0 0}
  .sec-head{margin:30px 0 18px}
  .navlinks.open{max-height:70vh}
}

/* --- Large desktop --- */
@media(min-width:1600px){
  .wrap,.nav{max-width:1320px}
}

/* --- Touch devices: no hover-dependent affordances --- */
@media(hover:none){
  .row:hover{padding-left:4px;background:none}
  .feed a:hover{padding-left:0}
  .btn:hover{transform:none}
  .pod:hover{transform:none}
  a,button{-webkit-tap-highlight-color:rgba(224,35,28,.18)}
}

/* --- Safe areas (notched iPhones) --- */
@supports(padding:max(0px)){
  .wrap,.nav,.ticker,footer{
    padding-left:max(var(--pad),env(safe-area-inset-left));
    padding-right:max(var(--pad),env(safe-area-inset-right))}
  footer{padding-bottom:max(clamp(40px,7vh,80px),env(safe-area-inset-bottom))}
}

/* --- Print --- */
@media print{
  body{background:#fff;color:#000}
  header,.ticker,.burger,.btn,.claim,.cursor,footer{display:none!important}
  .row,.panel,.pod{border-color:#ccc}
  [data-rv]{opacity:1!important;transform:none!important}
}

/* custom cursor, fine pointers only */
@media (pointer:fine){
  .cursor{position:fixed;top:0;left:0;width:26px;height:26px;border:1px solid rgba(223,231,224,.4);border-radius:50%;
    pointer-events:none;z-index:999;transform:translate3d(-50%,-50%,0);
    transition:width .35s var(--ease),height .35s var(--ease),background .35s var(--ease),border-color .35s var(--ease)}
  .cursor.hot{width:44px;height:44px;border-color:var(--vermilion);background:rgba(224,35,28,.1)}
}
`;

module.exports.JS = `
(function(){
  var R = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var els = document.querySelectorAll('[data-rv]');
  if (R || !('IntersectionObserver' in window)) { els.forEach(function(e){e.classList.add('rv-in')}); }
  else {
    var io = new IntersectionObserver(function(en){
      en.forEach(function(x){ if(x.isIntersecting){
        var d = +(x.target.getAttribute('data-d')||0);
        setTimeout(function(){ x.target.classList.add('rv-in'); }, d*80);
        io.unobserve(x.target);
      }});
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(e){io.observe(e)});
  }
  // mobile nav
  var b = document.getElementById('burger'), nl = document.getElementById('navlinks');
  if (b && nl) {
    b.addEventListener('click', function(){
      var open = nl.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nl.addEventListener('click', function(e){
      if (e.target.closest('a')) { nl.classList.remove('open'); b.setAttribute('aria-expanded','false'); }
    });
    addEventListener('keydown', function(e){
      if (e.key === 'Escape' && nl.classList.contains('open')) {
        nl.classList.remove('open'); b.setAttribute('aria-expanded','false'); b.focus();
      }
    });
    var mq = matchMedia('(min-width:861px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq,'change') : mq.addListener.bind(mq))(function(){
      nl.classList.remove('open'); b.setAttribute('aria-expanded','false');
    });
  }

  if (matchMedia('(pointer:fine)').matches && !R) {
    var c = document.createElement('div'); c.className='cursor'; document.body.appendChild(c);
    var x=0,y=0,cx=0,cy=0;
    addEventListener('mousemove',function(e){x=e.clientX;y=e.clientY;});
    (function loop(){ cx+=(x-cx)*.18; cy+=(y-cy)*.18;
      c.style.transform='translate3d('+cx+'px,'+cy+'px,0) translate(-50%,-50%)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover',function(e){
      c.classList.toggle('hot', !!e.target.closest('a,button,input,select,textarea'));
    });
  }
})();
`;
