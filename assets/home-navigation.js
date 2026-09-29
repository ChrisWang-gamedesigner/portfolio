(() => {
  // Run in the head, before the browser can follow an old fragment link.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const resetEntryPosition = () => {
    if (location.hash) {
      history.replaceState(history.state, '', location.pathname + location.search);
    }
    // A cached page can retain focus in a lower section as well as its scroll.
    const active = document.activeElement;
    const heading = document.querySelector('#top h1');
    if (heading && active && active !== document.body && active !== document.documentElement && active !== heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({preventScroll: true});
    }
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  };

  resetEntryPosition();
  window.addEventListener('pageshow', () => {
    resetEntryPosition();
    // Also cover a page restored from the browser's back/forward cache.
    requestAnimationFrame(resetEntryPosition);
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-scroll-target]');
    if (!button) return;
    const section = document.getElementById(button.dataset.scrollTarget);
    if (!section) return;

    const heading = section.querySelector('h2') || section;
    heading.setAttribute('tabindex', '-1');
    heading.focus({preventScroll: true});
    section.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  });
})();
