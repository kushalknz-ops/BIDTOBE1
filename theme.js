// BIDTOBE1 visual system — adapted from the Kage design language (MengTo/kage).
// Near-black ground, bone type, vermilion accent. Editorial, restrained, no glassmorphism.
module.exports.CSS = `
:root{
  --ink:#05070a;        /* page black */
  --ink-2:#0a0e12;      /* raised black */
  --ink-3:#0d1218;
  --bone:#dfe7e0;
  --bone-dim:#aab4ad;
  --muted:#78837c;
  --line:rgba(223,231,224,.13);
  --line-soft:rgba(223,231,224,.07);
  --vermilion:#e0231c;
  --ember:#ff5a3c;
  --gold:#c9a24a;
  --pad:clamp(20px,3.4vw,56px);
  --ease:cubic-bezier(.22,.61,.36,1);
  --ease-out:cubic-bezier(.16,1,.3,1);
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--ink);color:var(--bone);
  font:300 15px/1.68 'Onest',system-ui,-apple-system,'Helvetica Neue',sans-serif;
  -webkit-font-smoothing:antialiased;letter-spacing:-.005em}
body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(125% 95% at 50% 34%,rgba(224,35,28,.05) 0%,transparent 46%),
             radial-gradient(120% 90% at 50% 42%,transparent 40%,rgba(2,4,6,.55) 100%)}
::selection{background:var(--vermilion);color:#fff}
a{color:inherit;text-decoration:none}
img{max-width:100%}
.page{position:relative;z-index:1}
.wrap{max-width:1180px;margin:0 auto;padding:0 var(--pad) 120px}

/* ---------- type ---------- */
.eyebrow{font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--bone-dim);
  display:flex;align-items:center;gap:10px}
.eyebrow .dot{width:5px;height:5px;border-radius:50%;background:var(--vermilion);box-shadow:0 0 10px var(--vermilion);flex:none}
h1,h2,h3{font-weight:400;margin:0;letter-spacing:-.005em}
.display{text-transform:uppercase;line-height:1.055;letter-spacing:-.012em;font-weight:400}
.h-hero{font-size:clamp(30px,4.6vw,72px)}
.h-sec{font-size:clamp(26px,3.05vw,46px)}
.h-page{font-size:clamp(28px,3.4vw,52px)}
.body-lg{font-size:clamp(14px,1.02vw,17px);line-height:1.72;color:#b4bfb7;font-weight:300}
.body{font-size:14px;line-height:1.68;color:#9aa5a0;font-weight:300}
.num{font-weight:300;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.k{font-size:10px;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:var(--muted)}
.k b{color:var(--vermilion);font-weight:500}
.rule{flex:1 1 auto;height:1px;background:var(--line-soft)}
.sec-head{display:flex;align-items:baseline;gap:16px;margin:clamp(56px,9vh,110px) 0 clamp(26px,4vh,48px)}
.vermilion{color:var(--vermilion)}

/* ---------- reveal ---------- */
[data-rv]{opacity:0;transform:translate3d(0,22px,0);
  transition:opacity 1.05s var(--ease-out),transform 1.05s var(--ease-out)}
[data-rv="fade"]{transform:none}
[data-rv].rv-in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){[data-rv]{opacity:1!important;transform:none!important}
  html{scroll-behavior:auto}}

/* ---------- ticker + nav ---------- */
.ticker{border-bottom:1px solid var(--line-soft);font-size:10px;letter-spacing:.2em;text-transform:uppercase;
  color:var(--muted);padding:9px var(--pad);display:flex;gap:14px;justify-content:center;flex-wrap:wrap;
  background:rgba(5,7,10,.7);backdrop-filter:blur(14px)}
.ticker .live{display:inline-flex;align-items:center;gap:7px;color:var(--bone-dim)}
.ticker .pip{width:5px;height:5px;border-radius:50%;background:var(--vermilion);box-shadow:0 0 10px var(--vermilion);
  animation:pip 2.6s var(--ease) infinite}
@keyframes pip{0%,100%{opacity:1}50%{opacity:.25}}
header{position:sticky;top:0;z-index:60;border-bottom:1px solid var(--line-soft);
  background:rgba(5,7,10,.78);backdrop-filter:blur(18px)}
.nav{max-width:1180px;margin:0 auto;padding:0 var(--pad);height:74px;display:flex;align-items:center;gap:clamp(14px,2vw,30px)}
.logo{display:inline-flex;align-items:center;gap:10px;font-size:14px;font-weight:600;letter-spacing:.26em;
  text-transform:uppercase;color:var(--bone);white-space:nowrap}
.logo img{width:26px;height:26px;object-fit:contain;flex:none;filter:drop-shadow(0 0 12px rgba(224,35,28,.4))}
.logo i{font-style:normal;color:var(--vermilion)}
@media(max-width:640px){.logo span{display:none}.logo img{width:28px;height:28px}}
.nav a.link{font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);
  transition:color .4s var(--ease);position:relative;padding:6px 0}
.nav a.link:hover{color:var(--bone)}
.nav a.link.on{color:var(--bone)}
.nav a.link.on:after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--vermilion)}
.navspace{flex:1}

/* ---------- buttons ---------- */
.btn{display:inline-flex;align-items:center;gap:12px;font-size:10px;font-weight:500;letter-spacing:.2em;
  text-transform:uppercase;color:var(--ink);background:var(--bone);border:1px solid var(--bone);
  padding:14px 22px;cursor:pointer;font-family:inherit;
  transition:background .45s var(--ease),color .45s var(--ease),transform .5s var(--ease-out)}
.btn:hover{background:#fff;border-color:#fff;transform:translate3d(0,-1px,0)}
.btn.ghost{background:transparent;color:var(--bone);border-color:var(--line)}
.btn.ghost:hover{background:transparent;border-color:var(--bone)}
.btn.verm{background:var(--vermilion);border-color:var(--vermilion);color:#fff}
.btn.verm:hover{background:var(--ember);border-color:var(--ember)}
.btn.sm{padding:10px 15px;font-size:9px;letter-spacing:.18em}
.arrowlink{display:inline-flex;align-items:center;gap:12px;font-size:10px;font-weight:500;letter-spacing:.2em;
  text-transform:uppercase;color:var(--bone)}
.arrowlink .ar{width:32px;height:32px;border:1px solid var(--line);border-radius:50%;display:grid;place-items:center;
  transition:background .45s var(--ease),border-color .45s,transform .5s var(--ease-out)}
.arrowlink:hover .ar{background:var(--bone);border-color:var(--bone)}
.arrowlink:hover .ar svg path{stroke:var(--ink)}
:focus-visible{outline:1px solid var(--vermilion);outline-offset:3px}

/* ---------- hero ---------- */
.hero{padding:clamp(48px,11vh,120px) 0 clamp(30px,6vh,60px);border-bottom:1px solid var(--line-soft)}
.hero .h-hero{margin:18px 0 0;max-width:15ch}
.hero-mark{display:block;width:clamp(64px,7vw,104px);height:auto;object-fit:contain;margin:24px 0 4px;
  filter:drop-shadow(0 0 34px rgba(224,35,28,.32))}
.hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(28px,5vw,84px);
  align-items:end;margin-top:clamp(30px,6vh,58px)}
@media(max-width:860px){.hero-grid{grid-template-columns:1fr}}
.claimbox{border:1px solid var(--line);padding:clamp(20px,2.4vw,30px);background:rgba(10,14,18,.5)}
.claimbox .price{font-size:clamp(40px,5.4vw,76px);font-weight:300;letter-spacing:-.03em;line-height:1;
  color:var(--bone);font-variant-numeric:tabular-nums;margin:10px 0 4px}
.claimform{display:grid;gap:10px;margin-top:22px}
.claimform .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:520px){.claimform .two{grid-template-columns:1fr}}
input,select,textarea{width:100%;padding:13px 14px;border:1px solid var(--line);background:rgba(5,7,10,.6);
  color:var(--bone);font:300 14px/1.5 inherit;font-family:inherit;border-radius:0;
  transition:border-color .4s var(--ease)}
input:focus,select:focus,textarea:focus{border-color:var(--bone-dim);outline:none}
input::placeholder{color:var(--muted)}
select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),linear-gradient(135deg,var(--muted) 50%,transparent 50%);
  background-position:calc(100% - 18px) 20px,calc(100% - 13px) 20px;background-size:5px 5px,5px 5px;background-repeat:no-repeat}
label{display:block;font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;
  color:var(--muted);margin:18px 0 0}
label input,label select,label textarea{margin-top:8px}

/* ---------- tabs / chips ---------- */
.tabs{display:flex;gap:clamp(14px,2.4vw,34px);border-bottom:1px solid var(--line-soft);margin-top:clamp(30px,5vh,54px)}
.tab{font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);
  padding:0 0 14px;position:relative;transition:color .4s var(--ease)}
.tab:hover{color:var(--bone-dim)}
.tab.on{color:var(--bone)}
.tab.on:after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--vermilion)}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0 0}
.chip{font-size:9px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);
  border:1px solid var(--line-soft);padding:8px 13px;transition:color .4s var(--ease),border-color .4s var(--ease)}
.chip:hover{color:var(--bone-dim);border-color:var(--line)}
.chip.on{color:var(--bone);border-color:var(--bone-dim)}

/* ---------- podium ---------- */
.podium{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--line-soft);
  border:1px solid var(--line-soft);margin-top:clamp(24px,4vh,40px)}
@media(max-width:820px){.podium{grid-template-columns:1fr}}
.pod{background:var(--ink);padding:clamp(22px,2.6vw,34px);position:relative;
  transition:background .6s var(--ease)}
.pod:hover{background:var(--ink-2)}
.pod .pnum{font-size:clamp(38px,5vw,68px);font-weight:300;letter-spacing:-.04em;line-height:.9;
  color:rgba(223,231,224,.14);font-variant-numeric:tabular-nums}
.pod.p1 .pnum{color:rgba(224,35,28,.42)}
.pod .pname{font-size:clamp(17px,1.5vw,22px);text-transform:uppercase;letter-spacing:-.01em;margin:18px 0 8px;line-height:1.2}
.pod .pamt{font-size:clamp(24px,2.3vw,34px);font-weight:300;letter-spacing:-.025em;font-variant-numeric:tabular-nums;
  color:var(--bone);margin-top:16px}
.pod.p1:before{content:'';position:absolute;top:-1px;left:0;right:0;height:1px;background:var(--vermilion)}
.pod .pfoot{margin-top:20px;padding-top:16px;border-top:1px solid var(--line-soft)}

/* ---------- rows ---------- */
.rows{border-top:1px solid var(--line-soft);margin-top:clamp(26px,4vh,44px)}
.row{display:flex;align-items:center;gap:clamp(12px,1.6vw,22px);padding:20px 4px;
  border-bottom:1px solid var(--line-soft);transition:background .5s var(--ease),padding-left .5s var(--ease-out)}
.row:hover{background:rgba(223,231,224,.02);padding-left:12px}
.row .rk{width:46px;font-size:12px;font-weight:500;letter-spacing:.1em;color:var(--muted);
  font-variant-numeric:tabular-nums;flex:none}
.row .ico{width:30px;height:30px;flex:none;border:1px solid var(--line-soft);object-fit:contain;background:var(--ink-2)}
.grow{flex:1;min-width:0}
.rname{font-size:15px;text-transform:uppercase;letter-spacing:-.005em;line-height:1.3}
.rtag{font-size:13px;color:var(--muted);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rmeta{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#5d665f;margin-top:7px}
.ramt{text-align:right;flex:none}
.ramt b{display:block;font-size:17px;font-weight:300;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.ramt span{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.claim{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);
  border-bottom:1px solid transparent;transition:color .4s,border-color .4s;white-space:nowrap}
.claim:hover{color:var(--vermilion);border-color:var(--vermilion)}
.badge{font-size:8px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;padding:3px 7px;
  border:1px solid var(--line);color:var(--bone-dim);margin-left:8px;white-space:nowrap}
.badge.v{border-color:rgba(201,162,74,.4);color:var(--gold)}
.badge.e{border-color:rgba(224,35,28,.4);color:var(--vermilion)}
.badge.s{border-color:var(--line-soft);color:var(--muted)}

/* ---------- panels ---------- */
.panel{border:1px solid var(--line-soft);padding:clamp(20px,2.4vw,32px);background:rgba(10,14,18,.35)}
.split{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:clamp(24px,3.4vw,60px);align-items:start}
@media(max-width:900px){.split{grid-template-columns:1fr}}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1px;background:var(--line-soft);
  border:1px solid var(--line-soft);margin:clamp(22px,3vh,36px) 0}
.stat{background:var(--ink);padding:20px}
.stat span{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);display:block}
.stat b{display:block;font-size:clamp(22px,2.1vw,30px);font-weight:300;letter-spacing:-.025em;margin-top:8px;
  font-variant-numeric:tabular-nums;color:var(--bone)}
.feed a{display:flex;gap:11px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line-soft);
  transition:padding-left .4s var(--ease-out)}
.feed a:hover{padding-left:6px}
.feed .fn{font-size:13px;text-transform:uppercase;letter-spacing:-.005em}
.feed .fm{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-top:4px}
.catlist a{display:flex;justify-content:space-between;align-items:baseline;padding:11px 0;
  border-bottom:1px solid var(--line-soft);font-size:11px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--bone-dim);transition:color .4s}
.catlist a:hover{color:var(--bone)}
.catlist a i{font-style:normal;color:var(--muted);font-variant-numeric:tabular-nums}
.bar{height:2px;background:rgba(223,231,224,.08);margin-top:9px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--vermilion)}
.err{border:1px solid rgba(224,35,28,.45);background:rgba(224,35,28,.07);color:#ffb3ae;padding:14px 16px;
  font-size:13px;margin:20px 0}
.note{border-left:1px solid var(--vermilion);padding:2px 0 2px 16px;color:var(--muted);font-size:12.5px;margin-top:18px}
ul.list{list-style:none;padding:0;margin:0}
ul.list li{padding:13px 0;border-bottom:1px solid var(--line-soft);color:#9aa5a0;font-size:14px;
  display:flex;gap:14px}
ul.list li:before{content:'—';color:var(--vermilion);flex:none}
.q{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(20px,3vw,50px);
  padding:26px 0;border-bottom:1px solid var(--line-soft)}
@media(max-width:760px){.q{grid-template-columns:1fr;gap:12px}}
.q h3{font-size:15px;text-transform:uppercase;letter-spacing:-.005em;color:var(--bone)}
.tw{border:1px solid var(--line-soft);padding:22px;font-size:13.5px;line-height:1.7;color:#a9b4ad}
.tw b{color:var(--bone);display:block;margin-bottom:8px;font-weight:400;text-transform:uppercase;
  font-size:11px;letter-spacing:.18em}
footer{border-top:1px solid var(--line-soft);padding:clamp(40px,7vh,80px) var(--pad);text-align:center}
footer .fl{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
footer .fl a{margin:0 12px;transition:color .4s}
footer .fl a:hover{color:var(--bone)}
.skip{position:absolute;left:-9999px}.skip:focus{position:static;display:inline-block;margin:10px;color:var(--vermilion)}
@media(max-width:640px){
  .row{padding:16px 2px;gap:10px}.row .rk{width:32px;font-size:11px}
  .ramt span{display:none}.rtag{display:none}
  .nav{height:64px;overflow-x:auto;scrollbar-width:none}.nav::-webkit-scrollbar{display:none}
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
