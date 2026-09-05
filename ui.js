// BIDTOBE1 UI kit — shadcn/ui patterns ported to vanilla, themed for Kage.
// Primitives: Field, Empty, Alert, Toast(Sonner), Dialog, Command(⌘K),
// Tooltip, Skeleton, Spinner, Breadcrumb, Kbd, Progress, Copy, Sheet.

exports.CSS = `
/* ---------------- Field (label + control + description + error) ---------------- */
.field{display:grid;gap:7px;margin-top:20px}
.field-label{font-size:13.5px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:#c9d1cc;
  display:flex;align-items:center;gap:8px;min-height:20px}
.field-label .req{color:var(--vermilion);font-size:13.5px;line-height:1}
.field-desc{font-size:13.5px;color:#d5dcd8;line-height:1.5}
.field-error{font-size:13.5px;color:#ff9d95;display:none;align-items:center;gap:7px;line-height:1.5}
.field-error:before{content:'';width:12px;height:12px;flex:none;border-radius:50%;
  background:var(--vermilion);
  -webkit-mask:no-repeat center/9px url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V8h2v5z'/%3E%3C/svg%3E");
  mask:no-repeat center/9px url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V8h2v5z'/%3E%3C/svg%3E")}
.field[data-invalid="true"] .field-error{display:flex}
.field[data-invalid="true"] input,.field[data-invalid="true"] select,.field[data-invalid="true"] textarea{
  border-color:rgba(224,35,28,.6)}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.field-row{grid-template-columns:1fr}}

/* input group — prefix/suffix inside the control */
.input-group{display:flex;align-items:stretch;border:1px solid var(--line);background:rgba(5,7,10,.6);
  transition:border-color .4s var(--ease)}
.input-group:focus-within{border-color:var(--bone-dim)}
.input-group input{border:0;background:none}
.input-group input:focus{outline:none}
.input-group .addon{display:flex;align-items:center;padding:0 13px;font-size:14.5px;color:#dfe5e2;
  background:rgba(223,231,224,.03);white-space:nowrap}
.input-group .addon.lead{border-right:1px solid var(--line-soft)}
.input-group .addon.trail{border-left:1px solid var(--line-soft)}

/* ---------------- Empty state ---------------- */
.empty{display:flex;flex-direction:column;align-items:center;text-align:center;
  padding:clamp(34px,7vw,66px) clamp(20px,4vw,40px);border:1px dashed var(--line);background:rgba(10,14,18,.3)}
.empty-media{width:52px;height:52px;display:grid;place-items:center;border:1px solid var(--line);
  margin-bottom:20px;color:#dfe5e2;font-size:20px}
.empty-title{font-size:17.5px;text-transform:uppercase;letter-spacing:-.005em;color:var(--bone)}
.empty-desc{font-size:16.5px;color:#e6ebe8;max-width:44ch;margin-top:10px;line-height:1.65}
.empty-actions{display:flex;gap:12px;margin-top:24px;flex-wrap:wrap;justify-content:center}

/* ---------------- Alert ---------------- */
.alert{display:grid;grid-template-columns:auto 1fr;gap:13px;padding:15px 17px;border:1px solid var(--line-soft);
  background:rgba(10,14,18,.5);align-items:start;margin:18px 0}
.alert-ico{width:16px;height:16px;margin-top:1px}
.alert-title{font-size:13.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--bone)}
.alert-desc{font-size:14.5px;color:#e6ebe8;line-height:1.6;margin-top:5px}
.alert.destructive{border-color:rgba(224,35,28,.45);background:rgba(224,35,28,.06)}
.alert.destructive .alert-title{color:#ffb3ae}
.alert.success{border-color:rgba(61,220,151,.35);background:rgba(61,220,151,.05)}
.alert.success .alert-title{color:#8ef0c4}

/* ---------------- Toast (Sonner-style) ---------------- */
.toaster{position:fixed;bottom:0;right:0;z-index:200;display:flex;flex-direction:column-reverse;gap:10px;
  padding:20px;pointer-events:none;max-width:min(420px,100vw)}
@media(max-width:640px){.toaster{left:0;max-width:100vw;padding:12px}}
.toast{pointer-events:auto;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:start;
  border:1px solid var(--line);background:#0d131b;padding:15px 16px;min-width:0;
  box-shadow:0 18px 50px -20px #000;
  animation:toast-in .42s cubic-bezier(.16,1,.3,1)}
.toast.out{animation:toast-out .3s cubic-bezier(.65,0,.35,1) forwards}
@keyframes toast-in{from{opacity:0;transform:translate3d(0,16px,0) scale(.97)}to{opacity:1;transform:none}}
@keyframes toast-out{to{opacity:0;transform:translate3d(0,10px,0) scale(.97)}}
.toast-dot{width:7px;height:7px;border-radius:50%;background:var(--muted);margin-top:6px;flex:none}
.toast.success .toast-dot{background:#3ddc97;box-shadow:0 0 10px #3ddc97}
.toast.error .toast-dot{background:var(--vermilion);box-shadow:0 0 10px var(--vermilion)}
.toast-title{font-size:14.5px;color:var(--bone);line-height:1.45}
.toast-desc{font-size:13.5px;color:#e6ebe8;margin-top:4px;line-height:1.5}
.toast-x{background:none;border:0;color:#c9d1cc;cursor:pointer;font-size:17.5px;line-height:1;padding:2px 4px;
  min-height:24px;min-width:24px}
.toast-x:hover{color:var(--bone)}
@media (prefers-reduced-motion:reduce){.toast,.toast.out{animation:none}}

/* ---------------- Dialog / Sheet ---------------- */
dialog.modal{border:0;padding:0;background:transparent;max-width:min(520px,calc(100vw - 32px));width:100%;
  color:var(--bone)}
dialog.modal::backdrop{background:rgba(2,4,6,.8);backdrop-filter:blur(6px)}
dialog.modal[open]{animation:dlg-in .34s cubic-bezier(.16,1,.3,1)}
@keyframes dlg-in{from{opacity:0;transform:translate3d(0,12px,0) scale(.98)}to{opacity:1;transform:none}}
.modal-panel{border:1px solid var(--line);background:#0b1017;padding:clamp(22px,3vw,30px)}
.modal-title{font-size:clamp(18px,2.2vw,24px);text-transform:uppercase;letter-spacing:-.01em;line-height:1.2}
.modal-desc{font-size:16.5px;color:#e6ebe8;margin-top:12px;line-height:1.65}
.modal-body{margin-top:20px}
.modal-actions{display:flex;gap:12px;margin-top:26px;flex-wrap:wrap}
.modal-actions .btn{flex:1;min-width:130px}
.modal-sum{border:1px solid var(--line-soft);padding:16px;margin-top:18px}
.modal-sum div{display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;font-size:14.5px}
.modal-sum div + div{border-top:1px solid var(--line-soft)}
.modal-sum b{font-variant-numeric:tabular-nums;font-weight:400;color:var(--bone)}
.modal-sum .big b{font-size:20px;color:var(--vermilion)}
@media (prefers-reduced-motion:reduce){dialog.modal[open]{animation:none}}

/* ---------------- Command palette (⌘K) ---------------- */
dialog.cmdk{border:0;padding:0;background:transparent;width:min(600px,calc(100vw - 24px));
  margin-top:12vh;color:var(--bone)}
dialog.cmdk::backdrop{background:rgba(2,4,6,.82);backdrop-filter:blur(8px)}
.cmd-panel{border:1px solid var(--line);background:#0b1017;box-shadow:0 30px 90px -30px #000}
.cmd-input-wrap{display:flex;align-items:center;gap:12px;padding:0 16px;border-bottom:1px solid var(--line-soft)}
.cmd-input-wrap svg{width:15px;height:15px;flex:none;opacity:.5}
.cmd-input{border:0!important;background:none!important;padding:17px 0!important;font-size:16.5px!important}
.cmd-input:focus{outline:none}
.cmd-list{max-height:min(56vh,420px);overflow-y:auto;padding:8px;overscroll-behavior:contain}
.cmd-group{padding:12px 10px 6px;font-size:11.5px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;
  color:#c9d1cc}
.cmd-item{display:flex;align-items:center;gap:12px;padding:11px 12px;cursor:pointer;color:#eef1ef;
  font-size:16.5px;border:1px solid transparent;min-height:40px}
.cmd-item[aria-selected="true"]{background:rgba(223,231,224,.05);border-color:var(--line-soft);color:var(--bone)}
.cmd-item .ci-ico{width:18px;text-align:center;opacity:.6;flex:none;font-size:13.5px}
.cmd-item .ci-main{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmd-item .ci-meta{font-size:13.5px;letter-spacing:.14em;text-transform:uppercase;color:#c9d1cc;flex:none}
.cmd-empty{padding:36px 16px;text-align:center;color:#e6ebe8;font-size:14.5px}
.cmd-foot{display:flex;gap:16px;padding:11px 16px;border-top:1px solid var(--line-soft);
  font-size:13.5px;letter-spacing:.14em;text-transform:uppercase;color:#c9d1cc;flex-wrap:wrap}
.kbd{display:inline-flex;align-items:center;justify-content:center;min-width:19px;height:19px;padding:0 5px;
  border:1px solid var(--line);font-size:13.5px;color:var(--bone-dim);font-family:inherit;line-height:1}
.cmd-trigger{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--line-soft);
  padding:8px 11px;font-size:13.5px;letter-spacing:.16em;text-transform:uppercase;color:#d5dcd8;
  cursor:pointer;background:none;font-family:inherit;min-height:34px;transition:border-color .4s,color .4s}
.cmd-trigger:hover{border-color:var(--bone-dim);color:#fff}
@media(max-width:900px){.cmd-trigger .ct-label{display:none}}
@media(max-width:1080px){.cmd-trigger{margin-left:auto;padding:8px 10px}.cmd-trigger .kbd{display:none}}
@media(max-width:400px){.cmd-trigger{padding:8px}}

/* ---------------- Tooltip ---------------- */
.tip{position:relative;display:inline-flex;align-items:center;border-bottom:1px dotted rgba(223,231,224,.3);
  cursor:help}
.tip:after{content:attr(data-tip);color:#fff;position:absolute;bottom:calc(100% + 9px);left:50%;transform:translateX(-50%) translateY(4px);
  background:#141b24;border:1px solid var(--line);color:var(--bone);font-size:13.5px;letter-spacing:0;
  text-transform:none;font-weight:300;padding:9px 12px;width:max-content;max-width:min(280px,80vw);
  line-height:1.5;opacity:0;visibility:hidden;transition:opacity .22s,transform .22s;z-index:80;
  pointer-events:none;box-shadow:0 12px 34px -14px #000;white-space:normal;text-align:left}
.tip:hover:after,.tip:focus-visible:after{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}
@media(hover:none){.tip:after{display:none}}

/* ---------------- Skeleton + Spinner + Progress ---------------- */
.skel{background:linear-gradient(90deg,rgba(223,231,224,.05) 25%,rgba(223,231,224,.1) 37%,rgba(223,231,224,.05) 63%);
  background-size:400% 100%;animation:shimmer 1.5s ease-in-out infinite}
@keyframes shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}
@media (prefers-reduced-motion:reduce){.skel{animation:none}}
.spinner{width:13px;height:13px;border:1.5px solid currentColor;border-right-color:transparent;border-radius:50%;
  display:inline-block;animation:spin .7s linear infinite;flex:none}
@keyframes spin{to{transform:rotate(360deg)}}
.btn[data-loading="true"]{pointer-events:none;opacity:.75}
.btn[data-loading="true"] .btn-label{opacity:.7}

/* ---------------- Breadcrumb ---------------- */
.crumb{display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:13.5px;font-weight:500;
  letter-spacing:.2em;text-transform:uppercase;color:#c9d1cc;min-height:24px}
.crumb a{color:#d5dcd8;transition:color .35s;display:inline-flex;align-items:center;min-height:24px}
.crumb a:hover{color:var(--bone)}
.crumb .sep{opacity:.4}
.crumb [aria-current]{color:#fff}

/* ---------------- misc ---------------- */
.copy-btn{background:none;border:1px solid var(--line);color:#d5dcd8;cursor:pointer;
  font:inherit;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;padding:8px 11px;min-height:32px;
  display:inline-flex;align-items:center;gap:7px;transition:color .35s,border-color .35s}
.copy-btn:hover{color:var(--bone);border-color:var(--line)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);
  white-space:nowrap;border:0}
`;

exports.JS = `
(function(){
  var RM = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- Toast ---------- */
  var toaster;
  function toast(o){
    o = typeof o === 'string' ? {title:o} : (o||{});
    if(!toaster){ toaster=document.createElement('div'); toaster.className='toaster';
      toaster.setAttribute('role','region'); toaster.setAttribute('aria-label','Notifications');
      document.body.appendChild(toaster); }
    var t=document.createElement('div');
    t.className='toast '+(o.type||'');
    t.setAttribute('role', o.type==='error'?'alert':'status');
    t.innerHTML='<span class="toast-dot"></span><div><div class="toast-title"></div>'+
      (o.description?'<div class="toast-desc"></div>':'')+'</div>'+
      '<button class="toast-x" aria-label="Dismiss">&times;</button>';
    t.querySelector('.toast-title').textContent=o.title||'';
    if(o.description) t.querySelector('.toast-desc').textContent=o.description;
    var kill=function(){ t.classList.add('out'); setTimeout(function(){t.remove()}, RM?0:300); };
    t.querySelector('.toast-x').onclick=kill;
    toaster.appendChild(t);
    setTimeout(kill, o.duration||5000);
    return t;
  }
  window.toast = toast;

  /* flash message handed over from the server via ?flash= */
  try{
    var sp=new URLSearchParams(location.search), fm=sp.get('flash');
    if(fm){ toast({title:fm, description:sp.get('flashDesc')||'', type:sp.get('flashType')||'success'});
      sp.delete('flash'); sp.delete('flashDesc'); sp.delete('flashType');
      history.replaceState({}, '', location.pathname+(sp.toString()?'?'+sp:'')+location.hash); }
  }catch(e){}

  /* ---------- Field validation (native constraints + aria) ---------- */
  function markField(el, msg){
    var f = el.closest('.field'); if(!f) return;
    f.setAttribute('data-invalid', msg?'true':'false');
    var e = f.querySelector('.field-error');
    if(e){ e.textContent = msg||''; }
    el.setAttribute('aria-invalid', msg?'true':'false');
  }
  document.addEventListener('invalid', function(ev){
    var el=ev.target; if(!el.closest) return;
    ev.preventDefault();
    markField(el, el.validationMessage);
    var first=document.querySelector('.field[data-invalid="true"] input,.field[data-invalid="true"] select,.field[data-invalid="true"] textarea');
    if(first===el){ el.focus({preventScroll:false}); }
  }, true);
  document.addEventListener('input', function(ev){
    var el=ev.target;
    if(el.matches && el.matches('input,select,textarea') && el.closest('.field[data-invalid="true"]')){
      if(el.checkValidity()) markField(el,'');
    }
  });

  /* ---------- Submit: loading state, double-submit guard ---------- */
  document.addEventListener('submit', function(ev){
    var form=ev.target;
    if(form.dataset.confirm && !form.dataset.confirmed){ return; } // dialog handles it
    var btn=form.querySelector('button[type=submit],button:not([type])');
    if(!btn) return;
    if(form.dataset.submitting==='1'){ ev.preventDefault(); return; }
    if(!form.checkValidity()) return;
    form.dataset.submitting='1';
    btn.dataset.loading='true';
    btn.setAttribute('aria-busy','true');
    var label=btn.innerHTML;
    btn.innerHTML='<span class="spinner"></span><span class="btn-label">'+(btn.dataset.loadingText||'Processing')+'</span>';
    setTimeout(function(){ // restore if the nav never happens (e.g. validation bounce)
      if(document.body.contains(btn)){ form.dataset.submitting=''; btn.dataset.loading='false';
        btn.removeAttribute('aria-busy'); btn.innerHTML=label; }
    }, 12000);
  });

  /* ---------- Confirm dialog before paying ---------- */
  document.querySelectorAll('form[data-confirm]').forEach(function(form){
    form.addEventListener('submit', function(ev){
      if(form.dataset.confirmed) return;
      if(!form.checkValidity()) return;
      ev.preventDefault();
      var amt = form.querySelector('[name=amount]');
      var d=document.createElement('dialog'); d.className='modal';
      d.innerHTML='<form method="dialog" class="modal-panel">'+
        '<h2 class="modal-title">'+(form.dataset.confirmTitle||'Confirm')+'</h2>'+
        '<p class="modal-desc">'+(form.dataset.confirmDesc||'')+'</p>'+
        '<div class="modal-sum">'+
          '<div><span>'+(form.dataset.confirmLabel||'Amount')+'</span><b class="js-amt"></b></div>'+
          '<div class="big"><span>Total charged today</span><b class="js-amt2"></b></div>'+
        '</div>'+
        '<div class="modal-actions">'+
          '<button value="cancel" class="btn ghost">Go back</button>'+
          '<button value="ok" class="btn verm">'+(form.dataset.confirmOk||'Confirm')+'</button>'+
        '</div></form>';
      document.body.appendChild(d);
      var v = amt ? ('$'+Number(amt.value||0).toLocaleString('en-NZ')) : '—';
      d.querySelector('.js-amt').textContent=v;
      d.querySelector('.js-amt2').textContent=v;
      d.showModal();
      d.addEventListener('close', function(){
        var ok = d.returnValue==='ok';
        d.remove();
        if(ok){ form.dataset.confirmed='1'; form.requestSubmit(); }
      });
    });
  });

  /* ---------- Command palette ---------- */
  var cmdData = window.__CMD__ || [];
  var dlg, input, list, items=[], idx=0;
  function buildCmd(){
    dlg=document.createElement('dialog'); dlg.className='cmdk';
    dlg.innerHTML='<div class="cmd-panel">'+
      '<div class="cmd-input-wrap">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>'+
        '<input class="cmd-input" placeholder="Search businesses, cities, categories…" aria-label="Search" autocomplete="off">'+
      '</div>'+
      '<div class="cmd-list" role="listbox"></div>'+
      '<div class="cmd-foot"><span><span class="kbd">↑</span><span class="kbd">↓</span> navigate</span>'+
      '<span><span class="kbd">↵</span> open</span><span><span class="kbd">esc</span> close</span></div>'+
      '</div>';
    document.body.appendChild(dlg);
    input=dlg.querySelector('.cmd-input'); list=dlg.querySelector('.cmd-list');
    input.addEventListener('input', function(){ render(input.value); });
    input.addEventListener('keydown', function(e){
      if(e.key==='ArrowDown'){ e.preventDefault(); move(1); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); move(-1); }
      else if(e.key==='Enter'){ e.preventDefault(); if(items[idx]) location.href=items[idx].dataset.href; }
    });
    dlg.addEventListener('click', function(e){ if(e.target===dlg) dlg.close(); });
  }
  function move(d){
    if(!items.length) return;
    items[idx] && items[idx].setAttribute('aria-selected','false');
    idx=(idx+d+items.length)%items.length;
    items[idx].setAttribute('aria-selected','true');
    items[idx].scrollIntoView({block:'nearest'});
  }
  function render(q){
    q=(q||'').toLowerCase().trim();
    var groups={};
    cmdData.forEach(function(it){
      var hay=(it.label+' '+(it.meta||'')+' '+(it.group||'')).toLowerCase();
      if(q && hay.indexOf(q)===-1) return;
      (groups[it.group]=groups[it.group]||[]).push(it);
    });
    var html='', n=0;
    Object.keys(groups).forEach(function(g){
      html+='<div class="cmd-group">'+g+'</div>';
      groups[g].slice(0,q?8:5).forEach(function(it){
        html+='<div class="cmd-item" role="option" aria-selected="false" data-href="'+it.href+'">'+
          '<span class="ci-ico">'+(it.icon||'›')+'</span>'+
          '<span class="ci-main">'+it.label.replace(/[<>]/g,'')+'</span>'+
          (it.meta?'<span class="ci-meta">'+it.meta+'</span>':'')+'</div>';
        n++;
      });
    });
    list.innerHTML = n ? html : '<div class="cmd-empty">No results for “'+q.replace(/[<>]/g,'')+'”</div>';
    items=[].slice.call(list.querySelectorAll('.cmd-item'));
    idx=0; if(items[0]) items[0].setAttribute('aria-selected','true');
    items.forEach(function(el,i){
      el.addEventListener('mouseenter', function(){ items[idx].setAttribute('aria-selected','false'); idx=i;
        el.setAttribute('aria-selected','true'); });
      el.addEventListener('click', function(){ location.href=el.dataset.href; });
    });
  }
  function openCmd(){ if(!dlg) buildCmd(); render(''); dlg.showModal(); input.value=''; input.focus(); }
  window.openCommand = openCmd;
  addEventListener('keydown', function(e){
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openCmd(); }
    else if(e.key==='/' && !/input|textarea|select/i.test(document.activeElement.tagName)){ e.preventDefault(); openCmd(); }
  });
  document.addEventListener('click', function(e){
    if(e.target.closest('.cmd-trigger')) openCmd();
  });

  /* ---------- Copy to clipboard ---------- */
  document.addEventListener('click', function(e){
    var b=e.target.closest('[data-copy]'); if(!b) return;
    var text=b.dataset.copy==='url'?location.href:b.dataset.copy;
    (navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject())
      .then(function(){ toast({title:'Copied to clipboard', type:'success'}); })
      .catch(function(){ toast({title:'Copy failed', description:text, type:'error'}); });
  });
})();
`;

// ---------------- server-side helpers ----------------
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

exports.field = ({ label, name, type = 'text', value = '', desc = '', required = false, placeholder = '',
  min, max, options, rows, autocomplete, inputmode, prefix }) => {
  const id = 'f-' + name;
  const describedBy = desc ? `${id}-desc` : '';
  const attrs = [`id="${id}"`, `name="${name}"`, required ? 'required' : '',
    placeholder ? `placeholder="${esc(placeholder)}"` : '', min != null ? `min="${min}"` : '',
    max != null ? `max="${max}"` : '', autocomplete ? `autocomplete="${autocomplete}"` : '',
    inputmode ? `inputmode="${inputmode}"` : '',
    describedBy ? `aria-describedby="${describedBy}"` : ''].filter(Boolean).join(' ');
  let control;
  if (options) control = `<select ${attrs}>${options.map(o => `<option value="${esc(o.value)}" ${o.value === value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
  else if (rows) control = `<textarea ${attrs} rows="${rows}">${esc(value)}</textarea>`;
  else control = `<input type="${type}" ${attrs} value="${esc(value)}">`;
  if (prefix) control = `<div class="input-group"><span class="addon lead">${esc(prefix)}</span>${control}</div>`;
  return `<div class="field">
    <label class="field-label" for="${id}">${esc(label)}${required ? '<span class="req" aria-hidden="true">*</span><span class="sr-only">required</span>' : ''}</label>
    ${control}
    ${desc ? `<div class="field-desc" id="${describedBy}">${desc}</div>` : ''}
    <div class="field-error" role="alert"></div>
  </div>`;
};

exports.empty = ({ icon = '◇', title, desc, actions = '' }) => `<div class="empty">
  <div class="empty-media" aria-hidden="true">${icon}</div>
  <div class="empty-title">${esc(title)}</div>
  ${desc ? `<p class="empty-desc">${desc}</p>` : ''}
  ${actions ? `<div class="empty-actions">${actions}</div>` : ''}
</div>`;

exports.alert = (variant, title, desc) => {
  const ico = { destructive: '!', success: '✓', info: 'i' }[variant] || 'i';
  return `<div class="alert ${variant}" role="${variant === 'destructive' ? 'alert' : 'status'}">
    <span class="alert-ico" aria-hidden="true">${ico}</span>
    <div><div class="alert-title">${esc(title)}</div>${desc ? `<div class="alert-desc">${desc}</div>` : ''}</div>
  </div>`;
};

exports.crumb = items => `<nav class="crumb" aria-label="Breadcrumb">${items.map((it, i) =>
  it.href ? `<a href="${it.href}">${esc(it.label)}</a>${i < items.length - 1 ? '<span class="sep" aria-hidden="true">/</span>' : ''}`
    : `<span aria-current="page">${esc(it.label)}</span>`).join('')}</nav>`;

exports.tip = (text, tip) => `<span class="tip" tabindex="0" data-tip="${esc(tip)}">${text}</span>`;
