(function(){
  function inject(){
    try{
      if (document.querySelector('.hero-illustration')) return;
      const header = document.querySelector('header.hero') || document.querySelector('header');
      if (!header) return;
      const img = document.createElement('img');
      img.className = 'hero-illustration';
      img.src = 'assets/or-scene.png';
      img.alt = '';
      img.setAttribute('aria-hidden','true');
      Object.assign(img.style, {
        position: 'absolute', right: '0', top: '0', width: '60%', maxWidth: '980px', pointerEvents: 'none', transform: 'translateY(-6%)', zIndex: '0'
      });
      header.insertBefore(img, header.firstChild);
    }catch(e){ console.warn('hero-inject failed', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
})();
