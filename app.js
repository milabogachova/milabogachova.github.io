const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");

function setMenu(open) {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Закрити меню" : "Відкрити меню",
  );
  menu.setAttribute("aria-hidden", String(!open));
  menu.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}
menuButton?.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
menu
  ?.querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});
addEventListener("resize", () => {
  if (innerWidth > 991) setMenu(false);
});

requestAnimationFrame(() =>
  document
    .querySelectorAll("[data-reveal]")
    .forEach((el, i) =>
      setTimeout(() => el.classList.add("is-visible"), 120 + i * 120),
    ),
);

const track = document.querySelector("[data-track]");
const slides = track ? [...track.children] : [];
let index = 0;
let timer = null;
let touchX = 0;
const compact = () => matchMedia("(max-width: 991px)").matches;

function paintSlider() {
  if (!track) return;
  track.style.transform = compact() ? `translate3d(${-index * 100}%,0,0)` : "";
}
function startSlider() {
  clearInterval(timer);
  if (compact() && slides.length > 1) {
    timer = setInterval(() => {
      index = (index + 1) % slides.length;
      paintSlider();
    }, 3600);
  }
}
track?.addEventListener(
  "touchstart",
  (e) => {
    touchX = e.touches[0].clientX;
  },
  { passive: true },
);
track?.addEventListener(
  "touchend",
  (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) {
      index = (index + (dx < 0 ? 1 : -1) + slides.length) % slides.length;
      paintSlider();
      startSlider();
    }
  },
  { passive: true },
);
addEventListener("resize", () => {
  if (!compact()) index = 0;
  paintSlider();
  startSlider();
});
paintSlider();
startSlider();
/* ==========================================================
   ABOUT REVEAL
========================================================== */

const aboutSection = document.querySelector(".about");

if (aboutSection) {
  const aboutItems = [...aboutSection.querySelectorAll("[data-about-reveal]")];

  const aboutObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        aboutItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("is-visible");
          }, index * 130);
        });

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  aboutObserver.observe(aboutSection);
}

/* =========================================
   PHILOSOPHY — SCROLL ANIMATION
========================================= */

(() => {
  const section = document.querySelector(".choice");
  if (!section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const intro = [...section.querySelectorAll("[data-choice-reveal]")];

  const steps = [...section.querySelectorAll("[data-choice-step]")];

  const reveal = (elements, gap) => {
    elements.forEach((el, i) => {
      if (reduced) {
        el.classList.add("is-visible");
      } else {
        window.setTimeout(() => el.classList.add("is-visible"), i * gap);
      }
    });
  };

  if (reduced || !("IntersectionObserver" in window)) {
    reveal(intro, 0);
    section.classList.add("is-journey-visible");
    reveal(steps, 0);
    return;
  }

  const introObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        reveal(intro, 165);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.13 },
  );

  introObserver.observe(section.querySelector(".choice__intro"));

  const journeyObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        section.classList.add("is-journey-visible");

        window.setTimeout(() => {
          reveal(steps, 340);
        }, 350);

        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15 },
  );

  journeyObserver.observe(section.querySelector(".choice__journey"));
})();
/* ==========================================
   HELP CARDS — SCROLL REVEAL
========================================== */

(() => {
  const section = document.querySelector(".help-section");
  if (!section) return;

  const items = [...section.querySelectorAll("[data-help-reveal]")];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -30px 0px",
    },
  );

  items.forEach((item) => observer.observe(item));
})();

/* ==========================================
   AUDIENCE — AUTO CAROUSEL
========================================== */

(() => {
  const slider = document.querySelector("[data-audience-slider]");
  const track = document.querySelector("[data-audience-track]");

  if (!slider || !track) return;

  const originalCards = [...track.children];
  const total = originalCards.length;

  if (total < 2) return;

  const mobile = window.matchMedia("(max-width: 700px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let index = 0;
  let timer = null;
  let startX = 0;
  let isAnimating = false;

  const getVisible = () => (mobile.matches ? 1 : 3);

  // Клони потрібні для безшовного переходу
  // від останньої картки до першої.

  const clonesBefore = originalCards
    .slice(-3)
    .map((card) => card.cloneNode(true));

  const clonesAfter = originalCards
    .slice(0, 3)
    .map((card) => card.cloneNode(true));

  clonesBefore.forEach((card) => {
    card.setAttribute("aria-hidden", "true");
    track.insertBefore(card, track.firstChild);
  });

  clonesAfter.forEach((card) => {
    card.setAttribute("aria-hidden", "true");
    track.appendChild(card);
  });

  const offset = clonesBefore.length;
  let position = offset;

  const getStep = () => {
    const card = track.children[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const moveTo = (pos, animate = true) => {
    track.style.transition = animate
      ? "transform .9s cubic-bezier(.22, 1, .36, 1)"
      : "none";

    track.style.transform = `translate3d(${-pos * getStep()}px, 0, 0)`;
  };

  const next = () => {
    if (isAnimating) return;

    isAnimating = true;
    position++;
    moveTo(position);
  };

  const previous = () => {
    if (isAnimating) return;

    isAnimating = true;
    position--;
    moveTo(position);
  };

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;

    isAnimating = false;

    if (position >= offset + total) {
      position -= total;
      moveTo(position, false);
    }

    if (position < offset) {
      position += total;
      moveTo(position, false);
    }
  });

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();

    if (reducedMotion.matches) return;

    timer = setInterval(next, 4000);
  };

  // Swipe на мобільному

  slider.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0].clientX;
      stop();
    },
    { passive: true },
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      const delta = event.changedTouches[0].clientX - startX;

      if (Math.abs(delta) > 45) {
        if (delta < 0) next();
        else previous();
      }

      start();
    },
    { passive: true },
  );

  // Пауза, коли користувач наводить мишку

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  // Пауза, коли вкладка неактивна

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  // Перерахунок ширини при зміні екрана

  window.addEventListener("resize", () => {
    moveTo(position, false);
  });

  reducedMotion.addEventListener?.("change", start);

  // Початкове положення

  moveTo(position, false);
  start();
})();
/* ==========================================
   PROJECTS — RESPONSIVE CAROUSEL
========================================== */

(() => {
  const section = document.querySelector(".projects");
  if (!section) return;

  const track = section.querySelector("[data-project-track]");
  const viewport = section.querySelector("[data-project-viewport]");
  const prev = section.querySelector("[data-project-prev]");
  const next = section.querySelector("[data-project-next]");
  const counter = section.querySelector("[data-project-counter]");

  if (!track || !viewport || !prev || !next) return;

  const slides = [...track.querySelectorAll(".projects__item")];
  const total = slides.length;

  if (!total) return;

  let index = 0;
  let touchStartX = null;

  function visibleCount() {
    if (window.innerWidth <= 700) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, total - visibleCount());
  }

  function update() {
    const visible = visibleCount();

    index = Math.max(0, Math.min(index, maxIndex()));

    const offset = index * (100 / visible);

    track.style.transform = `translate3d(-${offset}%, 0, 0)`;

    if (counter) {
      const first = String(index + 1).padStart(2, "0");
      const last = String(Math.min(index + visible, total)).padStart(2, "0");

      counter.textContent = `${first} — ${last} / ${String(total).padStart(2, "0")}`;
    }

    // Приховані картки не потрапляють у Tab-навігацію.
    slides.forEach((slide, i) => {
      const visibleSlide = i >= index && i < index + visible;

      slide.setAttribute("aria-hidden", String(!visibleSlide));

      const link = slide.querySelector("a");
      if (link) link.tabIndex = visibleSlide ? 0 : -1;
    });
  }

  function move(direction) {
    const max = maxIndex();

    if (direction > 0) {
      index = index >= max ? 0 : index + 1;
    } else {
      index = index <= 0 ? max : index - 1;
    }

    update();
  }

  next.addEventListener("click", () => move(1));
  prev.addEventListener("click", () => move(-1));

  // SWIPE

  viewport.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null) return;

      const delta = event.changedTouches[0].clientX - touchStartX;

      if (Math.abs(delta) > 45) {
        move(delta < 0 ? 1 : -1);
      }

      touchStartX = null;
    },
    { passive: true },
  );

  // KEYBOARD

  viewport.addEventListener("keydown", (event) => {
    if (event.target.closest("a, button")) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  });

  // RESIZE

  window.addEventListener("resize", update);

  update();
})();
/* ==========================================
   STORY — CERTIFICATES SLIDER
========================================== */

(() => {
  const root = document.querySelector(".story");
  if (!root) return;

  const viewport = root.querySelector("[data-story-viewport]");
  const track = root.querySelector("[data-story-track]");
  const prev = root.querySelector("[data-story-prev]");
  const next = root.querySelector("[data-story-next]");
  const counter = root.querySelector("[data-story-counter]");

  const dialog = root.querySelector("[data-story-lightbox]");
  const full = root.querySelector("[data-story-full]");
  const close = root.querySelector("[data-story-close]");

  if (!viewport || !track || !prev || !next || !counter) return;

  const slides = [...track.children];

  let index = 0;
  let touchStartX = null;

  function visibleSlides() {
    if (window.innerWidth <= 700) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, slides.length - visibleSlides());
  }

  function update() {
    index = Math.max(0, Math.min(index, maxIndex()));

    const offset = index * (100 / visibleSlides());

    track.style.transform = `translate3d(-${offset}%, 0, 0)`;

    const from = String(index + 1).padStart(2, "0");

    const to = String(
      Math.min(slides.length, index + visibleSlides()),
    ).padStart(2, "0");

    const total = String(slides.length).padStart(2, "0");

    counter.textContent = `${from} — ${to} / ${total}`;

    slides.forEach((slide, i) => {
      const active = i >= index && i < index + visibleSlides();

      slide.setAttribute("aria-hidden", String(!active));

      const button = slide.querySelector("button");

      if (button) {
        button.tabIndex = active ? 0 : -1;
      }
    });
  }

  function move(direction) {
    if (direction > 0) {
      index = index >= maxIndex() ? 0 : index + 1;
    } else {
      index = index <= 0 ? maxIndex() : index - 1;
    }

    update();
  }

  // ARROWS

  prev.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));

  // SWIPE

  viewport.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null) return;

      const delta = event.changedTouches[0].clientX - touchStartX;

      if (Math.abs(delta) > 45) {
        move(delta < 0 ? 1 : -1);
      }

      touchStartX = null;
    },
    { passive: true },
  );

  // KEYBOARD

  viewport.addEventListener("keydown", (event) => {
    if (event.target.closest("button")) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  });

  // LIGHTBOX

  root.querySelectorAll(".story__certificate").forEach((button) => {
    button.addEventListener("click", () => {
      if (!dialog || !full) return;

      const img = button.querySelector("img");

      full.src = img.src;
      full.alt = img.alt;

      dialog.showModal();
    });
  });

  if (dialog && close) {
    close.addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  window.addEventListener("resize", update);

  update();
})();

/* ==========================================
   APPROACH — SCROLL ANIMATION
========================================== */

(() => {
  const section = document.querySelector(".approach");
  if (!section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const intro = [...section.querySelectorAll("[data-approach-reveal]")];

  const steps = [...section.querySelectorAll("[data-approach-step]")];

  const reveal = (elements, gap) => {
    elements.forEach((el, i) => {
      if (reduced) {
        el.classList.add("is-visible");
      } else {
        window.setTimeout(() => {
          el.classList.add("is-visible");
        }, i * gap);
      }
    });
  };

  if (reduced || !("IntersectionObserver" in window)) {
    reveal(intro, 0);
    section.classList.add("is-journey-visible");
    reveal(steps, 0);
    return;
  }

  const introObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        reveal(intro, 165);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.13 },
  );

  introObserver.observe(section.querySelector(".approach__intro"));

  const journeyObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        section.classList.add("is-journey-visible");

        window.setTimeout(() => {
          reveal(steps, 340);
        }, 350);

        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15 },
  );

  journeyObserver.observe(section.querySelector(".approach__journey"));
})();
