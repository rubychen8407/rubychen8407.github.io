// Lightweight runtime shim to restore original interactive behaviors
(function(){
  // resource map for covers
  window.__resources = window.__resources || {};
  window.__resources.proj1 = window.__resources.proj1 || 'assets/proj1.svg';
  window.__resources.proj2 = window.__resources.proj2 || 'assets/proj2.svg';
  window.__resources.proj3 = window.__resources.proj3 || 'assets/proj3.svg';
  window.__resources.proj4 = window.__resources.proj4 || 'assets/proj4.svg';

  function safe(fn){ try{ fn(); }catch(e){ console.error('runtime-restore error', e); } }

  function initReveal(){
    const els = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show = (el)=>{ el.style.opacity = '1'; el.style.transform = 'none'; el.classList && el.classList.add('revealed'); };
    if (reduce) { els.forEach(show); return; }
    const obs = new IntersectionObserver((entries, o)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ show(e.target); o.unobserve(e.target); } });
    }, {threshold: 0.14});
    els.forEach(el=>{ el.style.opacity = el.style.opacity || 0; el.style.transform = el.style.transform || 'translateY(18px)'; obs.observe(el); });
  }

  function initCarousel(){
    const track = document.querySelector('[data-track]');
    if (!track || track._wired) return; track._wired = true;
    const prog = document.querySelector('[data-progress]');
    const prev = document.querySelector('[data-prev]');
    const next = document.querySelector('[data-next]');

    const updateProgress = () => {
      const max = track.scrollWidth - track.clientWidth; const ratio = max > 0 ? track.scrollLeft / max : 0; const visible = track.clientWidth / track.scrollWidth || 0;
      if (prog) prog.style.width = Math.max(12, Math.min(100, (visible + ratio * (1 - visible)) * 100)) + '%';
    };
    track.addEventListener('scroll', updateProgress, {passive:true}); setTimeout(updateProgress,50);
    window.addEventListener('resize', updateProgress, {passive:true});

    const cards = ()=>Array.prototype.slice.call(track.querySelectorAll('article'));
    const offsetOf = (c)=> c.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    const go = (dir)=>{
      const cs = cards(); if (!cs.length) return;
      const sl = track.scrollLeft; let idx=0, best=Infinity; cs.forEach((c,i)=>{ const d = Math.abs(offsetOf(c)-sl); if (d<best){ best=d; idx=i; } });
      const t = Math.max(0, Math.min(cs.length-1, idx+dir)); const target = offsetOf(cs[t]);
      track.style.scrollSnapType = 'none'; const from = track.scrollLeft, dist = target - from, dur = 420; let t0=null;
      const ease = (p)=> 1 - Math.pow(1-p,3);
      const tick = (ts)=>{ if (t0===null) t0=ts; const p = Math.min(1,(ts-t0)/dur); track.scrollLeft = from + dist * ease(p); if (p<1) requestAnimationFrame(tick); else track.style.scrollSnapType = ''; };
      requestAnimationFrame(tick);
    };
    if (prev) prev.addEventListener('click', ()=>go(-1));
    if (next) next.addEventListener('click', ()=>go(1));

    // drag
    let down=false, startX=0, startLeft=0, moved=0;
    const onDown = (e)=>{ down=true; moved=0; startX = (e.touches?e.touches[0].clientX:e.clientX); startLeft = track.scrollLeft; };
    const onMove = (e)=>{ if(!down) return; const x=(e.touches?e.touches[0].clientX:e.clientX); const dx = x - startX; if(Math.abs(dx)>4){ track.classList.add('is-dragging'); moved = Math.abs(dx); } track.scrollLeft = startLeft - dx; };
    const onUp = ()=>{ down=false; setTimeout(()=>track.classList.remove('is-dragging'),0); };
    track.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove, {passive:true}); window.addEventListener('mouseup', onUp);
    track.addEventListener('touchstart', onDown, {passive:true}); track.addEventListener('touchmove', onMove, {passive:true}); track.addEventListener('touchend', onUp);
    track.addEventListener('click', (e)=>{ if (moved>6){ e.preventDefault(); e.stopPropagation(); }}, true);
  }

  function initFun(){
    // scroll progress bar if present
    const bar = document.querySelector('[data-scrollbar]');
    const onScroll = ()=>{ const d = document.documentElement; const max = (d.scrollHeight - d.clientHeight) || 1; if (bar) bar.style.width = Math.min(100, Math.max(0, (window.scrollY / max) * 100)) + '%'; };
    window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // hero spotlight
    const hero = document.querySelector('#top') || document.querySelector('header.hero') || document.querySelector('header');
    if (hero){
      const sp = document.createElement('div'); sp.setAttribute('aria-hidden','true'); sp.style.cssText = 'position:absolute;width:460px;height:460px;border-radius:50%;pointer-events:none;left:50%;top:30%;transform:translate(-50%,-50%);background:radial-gradient(circle, color-mix(in srgb, var(--acc,#D6EE4B) 18%, transparent), transparent 66%);opacity:0;transition:opacity .35s ease;z-index:0;';
      hero.style.position = hero.style.position || 'relative'; hero.insertBefore(sp, hero.firstChild);
      hero.addEventListener('pointermove', (e)=>{ const r = hero.getBoundingClientRect(); sp.style.left = (e.clientX - r.left) + 'px'; sp.style.top = (e.clientY - r.top) + 'px'; sp.style.opacity = '1'; });
      hero.addEventListener('pointerleave', ()=>{ sp.style.opacity = '0'; });
    }

    // 3D tilt
    const tiltEls = document.querySelectorAll('#work article, #skills [data-reveal]');
    tiltEls.forEach((el)=>{
      el.addEventListener('pointermove', (e)=>{
        if (el.closest('[data-track]') && el.closest('[data-track]').classList.contains('is-dragging')) return;
        const r = el.getBoundingClientRect(); const px = (e.clientX - r.left)/r.width - 0.5; const py = (e.clientY - r.top)/r.height - 0.5;
        el.style.transition = 'transform .08s ease'; el.style.transform = 'perspective(760px) rotateX(' + (-py*6).toFixed(2) + 'deg) rotateY(' + (px*6).toFixed(2) + 'deg) translateY(-5px)';
      });
      el.addEventListener('pointerleave', ()=>{ el.style.transition='transform .3s ease'; el.style.transform=''; });
    });

    // dot drift
    const dot = document.querySelector('#top h1 span') || document.querySelector('header h1 span');
    if (dot && hero){ hero.addEventListener('pointermove', (e)=>{ const r = hero.getBoundingClientRect(); const dx = ((e.clientX - r.left)/r.width - 0.5)*14; const dy = ((e.clientY - r.top)/r.height - 0.5)*10; dot.style.display='inline-block'; dot.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)'; dot.style.transition = 'transform .2s ease'; }); }
  }

  // bootstrap on DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>{ safe(initReveal); safe(initCarousel); safe(initFun); }); else { safe(initReveal); safe(initCarousel); safe(initFun); }
})();
