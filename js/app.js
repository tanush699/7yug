(() => {
  // Hide loader when everything is ready
  window.addEventListener('load', () => {
    const loading = document.getElementById('loading');
    if (!loading) return;

    // tiny delay for intentional cinematic feel
    window.setTimeout(() => {
      loading.classList.add('is-hidden');
    }, 250);
  });

  // Mouse-follow ambient glow (guaranteed when #cursorLight exists)
  const cursorLight = document.getElementById('cursorLight');
  if (cursorLight) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let lastX = -9999;
    let lastY = -9999;

    const apply = () => {
      raf = 0;
      cursorLight.style.left = lastX + 'px';
      cursorLight.style.top = lastY + 'px';
    };

    window.addEventListener(
      'mousemove',
      (e) => {
        if (reduceMotion) return;
        lastX = e.clientX;
        lastY = e.clientY;
        if (!raf) raf = window.requestAnimationFrame(apply);
      },
      { passive: true }
    );
  }

  // Ambient particles/stars (lightweight, no canvas)
  const particlesRoot = document.getElementById('particles');
  if (particlesRoot) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = reduceMotion ? 36 : 90;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('i');
      const size = (Math.random() * 2.2 + 0.6).toFixed(2);
      const x = (Math.random() * 100).toFixed(2);
      const y = (Math.random() * 100).toFixed(2);
      const o = (Math.random() * 0.55 + 0.15).toFixed(2);
      const delay = (Math.random() * 6).toFixed(2);
      const dur = (Math.random() * 10 + 10).toFixed(2);

      dot.style.position = 'absolute';
      dot.style.left = x + '%';
      dot.style.top = y + '%';
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.borderRadius = '50%';
      dot.style.background = `rgba(244, 210, 122, ${o})`;
      dot.style.boxShadow = `0 0 ${Math.random() * 18 + 8}px rgba(244, 210, 122, ${o})`;
      dot.style.opacity = o;
      dot.style.filter = 'blur(0.1px)';

      if (!reduceMotion) {
        dot.style.animation = `twinkle ${dur}ms ease-in-out ${delay}ms infinite alternate`;
      }

      frag.appendChild(dot);
    }

    particlesRoot.appendChild(frag);

    // Inject keyframes once
    if (!document.getElementById('twinkle-style')) {
      const st = document.createElement('style');
      st.id = 'twinkle-style';
      st.textContent = `@keyframes twinkle{0%{transform:translate3d(0,0,0) scale(0.9);opacity:0.35}100%{transform:translate3d(0,-12px,0) scale(1.15);opacity:1}}`;
      document.head.appendChild(st);
    }
  }

  // Product card premium tilt
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    card.addEventListener(
      'mousemove',
      (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--my', `${(y / rect.height) * 100}%`);

        card.style.transform = `rotateX(${-(y - rect.height / 2) / 20}deg) rotateY(${(x - rect.width / 2) / 20}deg) scale(1.03)`;
      },
      { passive: true }
    );

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.14 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Subtle parallax for hero/media frames
  const parallaxRoots = document.querySelectorAll('.product-hero__art, .lookbook-box, .product-hero__frame');
  let ticking = false;

  const update = () => {
    ticking = false;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const y = window.scrollY || 0;
    parallaxRoots.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = 0.04;
      const offset = rect.top + rect.height * 0.5 - window.innerHeight * 0.5;
      const translate = -offset * speed + y * speed * 0.2;
      el.style.transform = `translate3d(0, ${translate}px, 0)`;
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );

  // Navbar toggle (if present)
  const toggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('navMenu');
  if (toggle && navMenu) {
    // Ensure state is initialized
    if (!navMenu.hasAttribute('data-visible')) navMenu.setAttribute('data-visible', 'false');

    toggle.addEventListener('click', () => {
      const visible = navMenu.getAttribute('data-visible') === 'true';
      navMenu.setAttribute('data-visible', String(!visible));
      toggle.setAttribute('aria-expanded', String(!visible));
    });

    navMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navMenu.setAttribute('data-visible', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Set footer year when present
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Non-intrusive Easter egg
  let secret = [];
  window.addEventListener('keydown', (e) => {
    secret.push(e.key);
    if (secret.join('').toLowerCase().includes('7yug')) {
      document.body.style.filter = 'hue-rotate(18deg)';
      secret = [];
    }
  });
})();

