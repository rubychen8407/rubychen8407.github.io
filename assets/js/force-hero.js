document.addEventListener('DOMContentLoaded', function(){
  try {
    const header = document.querySelector('header.hero');
    if (!header) return;
    // if there's already a scene or background, do nothing
    if (header.querySelector('.hero-scene') || getComputedStyle(header).backgroundImage.indexOf('or-scene.png')!==-1) return;
    const d = document.createElement('div');
    d.className = 'hero-scene';
    d.setAttribute('aria-hidden','true');
    Object.assign(d.style, {
      position: 'absolute',
      right: '2%',
      top: '6%',
      width: '52%',
      maxWidth: '900px',
      height: '80%',
      backgroundImage: "url('assets/or-scene.png')",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right top',
      backgroundSize: 'contain',
      pointerEvents: 'none',
      zIndex: '0',
      opacity: '.98',
      transform: 'translateY(-3%) scale(.98)'
    });
    header.insertBefore(d, header.firstChild);
  } catch (e) { console.error('force-hero error', e); }
});
