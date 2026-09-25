(() => {
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const previous = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const caption = carousel.querySelector('.carousel-caption');
    const announcement = carousel.querySelector('.carousel-announcement');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let timer;
    let transitionTimer;
    let transitioning = false;
    let inView = false;
    let hovered = false;
    let focused = false;
    let touchStart = null;

    // Clones keep the last-to-first transition moving in the same direction.
    for (const [slide, atStart] of [[slides.at(-1), true], [slides[0], false]]) {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('aria-label');
      clone.removeAttribute('role');
      clone.removeAttribute('aria-roledescription');
      clone.inert = true;
      clone.querySelector('img').alt = '';
      if (atStart) track.prepend(clone);
      else track.append(clone);
    }

    const position = (slot) => { track.style.transform = `translateX(-${slot * 100}%)`; };
    const schedule = () => {
      window.clearTimeout(timer);
      if (!reducedMotion.matches && inView && !hovered && !focused && !document.hidden) {
        timer = window.setTimeout(() => move(1, false), 5000);
      }
    };
    const updateSlide = (manual) => {
      slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== index)));
      caption.textContent = slides[index].dataset.caption;
      // Do not announce automatic changes while someone is reading the page.
      if (manual) announcement.textContent = `${index + 1} of ${slides.length}: ${caption.textContent}`;
    };
    const finishTransition = () => {
      window.clearTimeout(transitionTimer);
      track.classList.remove('is-moving');
      position(index + 1);
      transitioning = false;
    };
    function move(direction, manual = true) {
      if (transitioning) return;
      window.clearTimeout(timer);
      const nextIndex = index + direction;
      index = (nextIndex + slides.length) % slides.length;
      updateSlide(manual);
      if (reducedMotion.matches) {
        position(index + 1);
      } else {
        transitioning = true;
        // Commit the resting position before starting a new CSS transition.
        void track.offsetWidth;
        track.classList.add('is-moving');
        position(nextIndex + 1);
        transitionTimer = window.setTimeout(finishTransition, 550);
      }
      schedule();
    }
    track.addEventListener('transitionend', (event) => {
      if (event.target === track && event.propertyName === 'transform') finishTransition();
    });
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        focused = true;
        move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    carousel.addEventListener('mouseenter', () => {
      hovered = window.matchMedia('(hover: hover)').matches;
      schedule();
    });
    carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    carousel.addEventListener('pointerdown', () => { focused = false; schedule(); });
    carousel.addEventListener('focusin', (event) => {
      focused = event.target.matches(':focus-visible');
      schedule();
    });
    carousel.addEventListener('focusout', (event) => {
      focused = carousel.contains(event.relatedTarget) && event.relatedTarget.matches(':focus-visible');
      schedule();
    });
    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' || event.target.closest('button')) return;
      touchStart = {x: event.clientX, y: event.clientY};
      window.clearTimeout(timer);
    });
    viewport.addEventListener('pointerup', (event) => {
      if (!touchStart) return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      else schedule();
    });
    viewport.addEventListener('pointercancel', () => { touchStart = null; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', () => {
      finishTransition();
      schedule();
    });
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) track.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
      schedule();
    }, {threshold: 0.15}).observe(viewport);

    position(1);
    updateSlide(false);
    carousel.classList.add('is-ready');
    [previous, next].forEach((button) => { button.hidden = false; });
  });
})();
