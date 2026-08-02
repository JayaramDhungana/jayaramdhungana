    /* ===== Pure JS Scroll Animations + UI behaviors (self-contained) ===== */

    /* ---- Inject required CSS (no external edits needed) ---- */
    (function injectAnimationCSS() {
      const css = `
    /* Scroll animation CSS injected by script */
    .scroll-fade{opacity:0;transform:translateY(40px);transition:transform 0.9s cubic-bezier(.2,.8,.2,1),opacity 0.9s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform}
    .scroll-visible{opacity:1;transform:translateY(0)}
    .project-animate{opacity:0;transform:scale(0.97) translateY(30px);transition:transform 1s cubic-bezier(.2,.8,.2,1),opacity 1s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform}
    .project-visible{opacity:1;transform:scale(1) translateY(0)}
    /* Optional: smoother scroll for anchors */
    html{scroll-behavior:smooth}
  `;
      const s = document.createElement("style");
      s.setAttribute("data-generated-by", "pure-js-anim");
      s.appendChild(document.createTextNode(css));
      document.head.appendChild(s);
    })();

    /* ---- Helpers ---- */
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));

    /* ---- Cache DOM ---- */
    const loader = $("#loader"),
      cursor = document.querySelector(".cursor"),
      follower = document.querySelector(".cursor-follower"),
      menuToggle = $("#menuToggle"),
      mobileMenu = $("#mobileMenu"),
      closeMenuBtn = $("#closeMenu"),
      overlay = $("#overlay"),
      scrollTopBtn = $("#scrollTop"),
      header = $("#header"),
      typingText = $("#typingText"),
      particlesWrap = $("#particles"),
      clientsModal = $("#clientsModal"),
      closeModalBtn = $("#closeModalBtn");

    /* ===== Loader and Initialize ===== */
    function hideLoader() {
      if (!loader) return;
      loader.style.transition = "opacity 0.5s ease";
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 650);
    }
    if (document.readyState === "complete") hideLoader();
    else window.addEventListener("load", hideLoader);
    setTimeout(hideLoader, 3500); // safety fallback

    /* ===== Custom Cursor ===== */
    if (cursor && follower) {
      document.addEventListener("mousemove", (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
        // follower slightly delayed for smooth trailing
        requestAnimationFrame(() => {
          follower.style.left = e.clientX + "px";
          follower.style.top = e.clientY + "px";
        });
      });
      ["mousedown", "mouseup"].forEach((evt) =>
        document.addEventListener(evt, (e) => {
          const scale = evt === "mousedown" ? "scale(0.85)" : "scale(1)";
          cursor.style.transform = `translate(-50%,-50%) ${scale}`;
          follower.style.transform = `translate(-50%,-50%) ${scale}`;
        })
      );
    }

    /* ===== Mobile Menu ===== */
    function openMenu() {
      if (mobileMenu) {
        mobileMenu.classList.add("active");
        overlay && overlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
    }
    function closeMenu() {
      if (mobileMenu) {
        mobileMenu.classList.remove("active");
        overlay && overlay.classList.add("hidden");
        document.body.style.overflow = "auto";
      }
    }
    menuToggle?.addEventListener("click", openMenu);
    closeMenuBtn?.addEventListener("click", closeMenu);
    overlay?.addEventListener("click", closeMenu);
    $$("#mobileMenu a").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );

    /* ===== Typing effect (unchanged behavior) ===== */
    if (typingText) {
      const texts = [
        "Mobile App Developer",
        "Flutter Developer",

      ];
      let ti = 0,
        ci = 0,
        isDeleting = false;
      (function typeLoop() {
        const cur = texts[ti];
        typingText.textContent = isDeleting
          ? cur.substring(0, --ci)
          : cur.substring(0, ++ci);
        if (!isDeleting && ci === cur.length) {
          isDeleting = true;
          setTimeout(typeLoop, 2000);
        } else if (isDeleting && ci === 0) {
          isDeleting = false;
          ti = (ti + 1) % texts.length;
          setTimeout(typeLoop, 500);
        } else setTimeout(typeLoop, isDeleting ? 50 : 100);
      })();
    }

    /* ===== Particles (generate once) ===== */
    (function genParticles() {
      if (!particlesWrap) return;
      const count = 50;
      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        const size = Math.random() * 5 + 1;
        Object.assign(p.style, {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          position: "absolute",
          background:
            getComputedStyle(document.documentElement).getPropertyValue(
              "--accent-primary"
            ) || "#64ffda",
          borderRadius: "50%",
          opacity: "0.25",
          pointerEvents: "none",
        });
        particlesWrap.appendChild(p);
      }
    })();

    /* ===== Header shrink + scrollTop visibility ===== */
    window.addEventListener("scroll", () => {
      if (!header) return;
      if (window.scrollY > 100) {
        header.style.padding = "0.5rem 5%";
        header.style.backgroundColor = "rgba(10,14,39,0.95)";
      } else {
        header.style.padding = "1rem 5%";
        header.style.backgroundColor = "rgba(10,14,39,0.9)";
      }
      if (scrollTopBtn) {
        if (window.scrollY > 400) {
          scrollTopBtn.classList.add("opacity-100", "visible");
          scrollTopBtn.classList.remove("opacity-0", "invisible");
        } else {
          scrollTopBtn.classList.remove("opacity-100", "visible");
          scrollTopBtn.classList.add("opacity-0", "invisible");
        }
      }
    });

    /* ===== Smooth anchor scroll (keeps offset for header) ===== */
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", function (e) {
        const target = this.getAttribute("href");
        if (!target || target === "#") return;
        const el = document.querySelector(target);
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });

    /* ===== Pure JS Scroll Animations (sections + project cards) ===== */

    /* utility: safely select project cards inside #projects
 original markup uses classes like 'bg-[#151932] rounded-lg ...' - use the .rounded-lg inside #projects */
    const projectCards = (() => {
      const parent = $("#projects");
      if (!parent) return [];
      return Array.from(parent.querySelectorAll(".rounded-lg"));
    })();

    const sections = Array.from(document.querySelectorAll("section"));

    /* add initial classes (hidden states injected via CSS above) */
    sections.forEach((s) => s.classList.add("scroll-fade"));
    projectCards.forEach((c) => c.classList.add("project-animate"));

    /* IntersectionObserver for sections (slide-up fade) */
    const sectionObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Add visible class & unobserve for one-time animation
            el.classList.add("scroll-visible");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    sections.forEach((s) => sectionObserver.observe(s));

    /* IntersectionObserver for project cards with stagger logic */
    const cardObserver = new IntersectionObserver(
      (entries, obs) => {
        const visibleEntries = entries
          .filter((en) => en.isIntersecting && !en.target.dataset.animated)
          .sort(
            (a, b) =>
              projectCards.indexOf(a.target) - projectCards.indexOf(b.target)
          );

        visibleEntries.forEach((entry, idx) => {
          const el = entry.target;
          const delay = idx * 100; // slightly faster stagger
          setTimeout(() => {
            el.classList.add("project-visible");
            el.dataset.animated = "true";
            obs.unobserve(el);
          }, delay);
        });
      },
      {
        threshold: 0.02, // triggers earlier
        rootMargin: "150px 0px -50px 0px", // starts animation before card is in full view
      }
    );

    projectCards.forEach((c) => cardObserver.observe(c));

    /* ===== Additional Scroll Animations ===== */

    // Get all elements with scroll animation classes
    const scrollElements = document.querySelectorAll(
      ".scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale, .scroll-rotate, .stagger-animation"
    );

    // Intersection Observer for scroll animations
    const elementInView = (el, dividend = 1) => {
      const elementTop = el.getBoundingClientRect().top;
      return (
        elementTop <=
        (window.innerHeight || document.documentElement.clientHeight) /
        dividend
      );
    };

    const displayScrollElement = (element) => {
      element.classList.add("visible");
    };

    const handleScrollAnimation = () => {
      scrollElements.forEach((el) => {
        if (elementInView(el, 1.25)) {
          displayScrollElement(el);
        }
      });
    };

    // Initialize animations on scroll
    window.addEventListener("scroll", () => {
      handleScrollAnimation();
    });

    // Initial check for elements in view on page load
    window.addEventListener("load", () => {
      handleScrollAnimation();
    });

    // Stagger animation for list items
    const staggerElements = document.querySelectorAll(".stagger-animation");
    staggerElements.forEach((element) => {
      const items = element.children;
      Array.from(items).forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
      });
    });

    /* ===== Project Filtering & Show More Feature ===== */
    (function initProjectFilters() {
      const filterBtns = document.querySelectorAll(".project-filter-btn");
      const cards = document.querySelectorAll("#projects .project-card");
      const showMoreBtn = document.getElementById("show-more-projects");
      const showMoreContainer = document.getElementById("show-more-container");

      if (!cards.length) return;

      let currentFilter = "all";
      let isExpanded = false;
      const INITIAL_LIMIT = 6;

      function renderProjects() {
        const matchingCards = [];

        cards.forEach((card) => {
          const category = card.getAttribute("data-category");
          const company = card.getAttribute("data-company");
          const matches =
            currentFilter === "all" ||
            category === currentFilter ||
            company === currentFilter;
          if (matches) {
            matchingCards.push(card);
          } else {
            card.style.display = "none";
            card.classList.remove("project-visible");
          }
        });

        matchingCards.forEach((card, idx) => {
          if (isExpanded || idx < INITIAL_LIMIT) {
            card.style.display = "flex";
            setTimeout(() => card.classList.add("project-visible"), idx * 60);
          } else {
            card.style.display = "none";
            card.classList.remove("project-visible");
          }
        });

        if (showMoreContainer && showMoreBtn) {
          if (matchingCards.length > INITIAL_LIMIT) {
            showMoreContainer.style.display = "block";
            const hiddenCount = matchingCards.length - INITIAL_LIMIT;
            const btnSpan = showMoreBtn.querySelector("span");
            const btnIcon = showMoreBtn.querySelector("i");

            if (isExpanded) {
              if (btnSpan) btnSpan.textContent = "Show Less Projects";
              if (btnIcon) btnIcon.className = "fas fa-chevron-up ml-1";
            } else {
              if (btnSpan) btnSpan.textContent = `Show More (${hiddenCount} more)`;
              if (btnIcon) btnIcon.className = "fas fa-chevron-down ml-1";
            }
          } else {
            showMoreContainer.style.display = "none";
          }
        }
      }

      filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          filterBtns.forEach((b) => {
            b.classList.remove(
              "active",
              "bg-[#64ffda]",
              "text-[#0a0e27]",
              "shadow-lg",
              "shadow-[rgba(100,255,218,0.2)]"
            );
            b.classList.add(
              "bg-[#151932]",
              "text-[#a0a0a0]",
              "border-[#1e2140]"
            );
          });
          btn.classList.add(
            "active",
            "bg-[#64ffda]",
            "text-[#0a0e27]",
            "shadow-lg",
            "shadow-[rgba(100,255,218,0.2)]"
          );
          btn.classList.remove(
            "bg-[#151932]",
            "text-[#a0a0a0]",
            "border-[#1e2140]"
          );

          currentFilter = btn.getAttribute("data-filter");
          isExpanded = false; // reset expand state when switching filters
          renderProjects();
        });
      });

      if (showMoreBtn) {
        showMoreBtn.addEventListener("click", () => {
          isExpanded = !isExpanded;
          renderProjects();
        });
      }

      // Initial run
      renderProjects();

      /* ===== Modal Logic ===== */
      const modal = document.getElementById("clientsModal");
      const closeBtn = document.getElementById("closeModalBtn");
      const modalTitle = document.getElementById("modalTitle");
      const modalDesc = document.getElementById("modalDesc");
      const clientsList = document.getElementById("clientsList");

      function openModal(title, desc, clients) {
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        clientsList.innerHTML = clients.map(client => `
          <a href="${client.link}" target="${client.link !== '#' ? '_blank' : '_self'}" class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#1e2140] to-[#151932] hover:from-[#1e2140] hover:to-[#1e2140] border border-[#64ffda]/20 hover:border-[#64ffda]/50 transition-all group no-underline w-full">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-[#0a0e27] border border-[#64ffda]/30 flex items-center justify-center text-[#64ffda] text-xl group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(100,255,218,0.2)] overflow-hidden">
                ${client.logo ? `<img src="${client.logo}" alt="${client.company}" class="w-full h-full object-contain bg-white p-1.5" />` : `<i class="fas fa-building"></i>`}
              </div>
              <div class="flex flex-col justify-center">
                <p class="text-[#e6e6e6] text-base font-bold m-0 tracking-wide">${client.company}</p>
                <p class="text-[#a0a0a0] text-sm m-0 mt-0.5">${client.appName}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-[#64ffda] bg-[#64ffda]/10 px-3 py-1.5 rounded-lg group-hover:bg-[#64ffda] group-hover:text-[#0a0e27] transition-colors">
              <i class="fab fa-google-play"></i>
              <span class="text-xs font-semibold hidden sm:inline">Play Store</span>
            </div>
          </a>
        `).join('');
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }

      closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
      });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
          document.body.style.overflow = "";
        }
      });

      // Attach click to "View All Clients" buttons via event delegation
      document.body.addEventListener("click", (e) => {
        const btn = e.target.closest(".view-clients-btn");
        if (btn) {
          e.preventDefault();
          const title = btn.getAttribute("data-modal-title");
          const desc = btn.getAttribute("data-modal-desc");
          const clients = JSON.parse(btn.getAttribute("data-clients") || "[]");
          openModal(title, desc, clients);
        }
      });

    })();

    /* ===== End of Script ===== */
