/* ============================================================
   RAFA DIGITAL STUDIO — Interactions
   ============================================================ */
(function () {
  "use strict";

  var config = window.RAFA_CONFIG || {};
  var doc = document;
  var html = doc.documentElement;
  var lang = html.lang === "en" ? "en" : "ar";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var messages = {
    ar: {
      sending: "جارٍ إرسال طلبك…",
      success: "تم إرسال طلبك بنجاح. شكراً لك، سنعود إليك في أقرب وقت ممكن.",
      error: "تعذّر إرسال الطلب. يرجى المحاولة مرة أخرى بعد قليل.",
      notConfigured: "قناة الإرسال غير مفعّلة بعد. أضف بريد الاستوديو في ملف assets/js/site-config.js لتفعيل النموذج.",
      mailto: "تم تجهيز رسالتك في تطبيق البريد الإلكتروني. أرسلها لنصل إليها مباشرة.",
      invalidEmail: "يرجى إدخال بريد إلكتروني صحيح.",
      required: "هذا الحقل مطلوب.",
      consent: "يرجى الموافقة على استخدام بياناتك للتواصل بخصوص مشروعك.",
      projectCount: function (n) {
        if (n === 0) return "لا توجد مشاريع في هذا التصنيف.";
        if (n === 1) return "مشروع واحد";
        if (n === 2) return "مشروعان";
        return n + " مشاريع";
      },
      close: "إغلاق"
    },
    en: {
      sending: "Sending your request…",
      success: "Your request has been sent successfully. Thank you — we'll get back to you as soon as possible.",
      error: "We couldn't send your request. Please try again in a moment.",
      notConfigured: "The form isn't connected yet. Add your studio email in assets/js/site-config.js to enable it.",
      mailto: "Your message is ready in your email app. Send it and we'll receive it directly.",
      invalidEmail: "Please enter a valid email address.",
      required: "This field is required.",
      consent: "Please agree to the use of your details for project communication.",
      projectCount: function (n) {
        if (n === 0) return "No projects in this category.";
        if (n === 1) return "1 project";
        return n + " projects";
      },
      close: "Close"
    }
  };
  var t = messages[lang];

  function qs(selector, scope) { return (scope || doc).querySelector(selector); }
  function qsa(selector, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(selector)); }

  /* ---------------- Config-driven contact & social links ---------------- */
  function applyConfig() {
    var email = (config.email || "").trim();
    var phone = (config.phone || "").trim();
    var whatsapp = (config.whatsapp || "").replace(/[^\d]/g, "");
    var socials = config.socials || {};

    if (email) {
      qsa('[data-contact="email"]').forEach(function (el) {
        el.href = "mailto:" + email;
        if (el.hasAttribute("data-contact-text")) el.textContent = email;
      });
      qsa('[data-contact-item="email"]').forEach(function (el) { el.hidden = false; });
    }

    if (phone) {
      qsa('[data-contact="phone"]').forEach(function (el) {
        el.href = "tel:" + phone.replace(/\s+/g, "");
        if (el.hasAttribute("data-contact-text")) el.textContent = phone;
      });
      qsa('[data-contact-item="phone"]').forEach(function (el) { el.hidden = false; });
    }

    if (whatsapp) {
      var waText = lang === "ar"
        ? "مرحباً RAFA DIGITAL STUDIO، لدي فكرة مشروع وأود التحدث معكم."
        : "Hello RAFA DIGITAL STUDIO, I have a project idea and would like to talk.";
      qsa('[data-contact="whatsapp"]').forEach(function (el) {
        el.href = "https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(waText);
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      });
      qsa('[data-contact-item="whatsapp"]').forEach(function (el) { el.hidden = false; });
    }

    Object.keys(socials).forEach(function (key) {
      var url = (socials[key] || "").trim();
      qsa('[data-social="' + key + '"]').forEach(function (el) {
        if (!url) { el.hidden = true; return; }
        el.href = url;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
        el.hidden = false;
      });
    });

    // Hide social wrappers when no network is configured at all.
    var hasSocial = Object.keys(socials).some(function (k) { return (socials[k] || "").trim(); });
    qsa("[data-socials-wrap]").forEach(function (el) { el.hidden = !hasSocial; });
  }

  /* ---------------- Header, back-to-top ---------------- */
  function initScrollUI() {
    var header = qs(".site-header");
    var toTop = qs(".to-top");
    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 10);
      if (toTop) toTop.classList.toggle("is-visible", y > 620);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  /* ---------------- Mobile navigation ---------------- */
  function initMobileNav() {
    var toggle = qs(".nav-toggle");
    var menu = qs("#mobileMenu");
    if (!toggle || !menu) return;
    var lastFocused = null;

    function focusables() {
      return qsa('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', menu)
        .filter(function (el) { return el.offsetParent !== null; });
    }

    function open() {
      lastFocused = doc.activeElement;
      doc.body.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      var first = focusables()[0];
      if (first) setTimeout(function () { first.focus(); }, 120);
    }

    function close(restore) {
      doc.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      if (restore !== false && lastFocused) lastFocused.focus();
    }

    toggle.addEventListener("click", function () {
      if (doc.body.classList.contains("menu-open")) close(); else open();
    });

    qsa("a", menu).forEach(function (link) {
      link.addEventListener("click", function () { close(false); });
    });

    doc.addEventListener("keydown", function (e) {
      if (!doc.body.classList.contains("menu-open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        var items = focusables();
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1060 && doc.body.classList.contains("menu-open")) close(false);
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveal() {
    var items = qsa(".reveal");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- FAQ accordions ---------------- */
  function initFaq() {
    qsa("[data-faq] .faq-item").forEach(function (item) {
      var btn = qs(".faq-q", item);
      var panel = qs(".faq-a", item);
      if (!btn || !panel) return;
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        qsa("[data-faq] .faq-item.is-open").forEach(function (other) {
          if (other === item) return;
          other.classList.remove("is-open");
          var b = qs(".faq-q", other);
          var p = qs(".faq-a", other);
          if (b) b.setAttribute("aria-expanded", "false");
          if (p) p.setAttribute("aria-hidden", "true");
        });
        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
        panel.setAttribute("aria-hidden", String(isOpen));
      });
    });
  }

  /* ---------------- Portfolio filters ---------------- */
  function initFilters() {
    var filterWrap = qs("[data-filters]");
    var grid = qs("[data-portfolio-grid]");
    if (!filterWrap || !grid) return;
    var buttons = qsa(".filter-btn", filterWrap);
    var cards = qsa("[data-category]", grid);
    var countEl = qs("[data-filter-count]");

    function apply(filter) {
      var visible = 0;
      cards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("is-hidden", !match);
        if (match) visible++;
      });
      buttons.forEach(function (btn) {
        var active = btn.getAttribute("data-filter") === filter;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
      if (countEl) countEl.textContent = t.projectCount(visible);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () { apply(btn.getAttribute("data-filter")); });
    });
  }

  /* ---------------- Project modal ---------------- */
  function initProjectModal() {
    var modal = qs("#projectModal");
    if (!modal) return;
    var dialog = qs(".modal-dialog", modal);
    var backdrop = qs(".modal-backdrop", modal);
    var closeBtn = qs(".modal-close", modal);
    var image = qs("[data-modal-image]", modal);
    var category = qs("[data-modal-category]", modal);
    var title = qs("[data-modal-title]", modal);
    var desc = qs("[data-modal-desc]", modal);
    var scope = qs("[data-modal-scope]", modal);
    var tech = qs("[data-modal-tech]", modal);
    var year = qs("[data-modal-year]", modal);
    var lastFocus = null;

    function open(trigger) {
      lastFocus = trigger;
      var data = trigger.dataset;
      if (image && data.image) { image.src = data.image; image.alt = data.title || ""; }
      if (category) category.textContent = data.category || "";
      if (title) title.textContent = data.title || "";
      if (desc) desc.textContent = data.desc || "";
      if (scope) scope.textContent = data.scope || "—";
      if (tech) tech.textContent = data.tech || "—";
      if (year) year.textContent = data.year || "2026";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      doc.body.classList.add("modal-open");
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 60);
    }

    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      doc.body.classList.remove("modal-open");
      if (lastFocus) lastFocus.focus();
    }

    qsa("[data-project]", doc).forEach(function (trigger) {
      trigger.addEventListener("click", function () { open(trigger); });
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);
    doc.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        var items = qsa('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', dialog)
          .filter(function (el) { return el.offsetParent !== null; });
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------------- Services scroll-spy ---------------- */
  function initServiceSpy() {
    var index = qs("[data-service-index]");
    if (!index) return;
    var links = qsa("a[href^='#']", index);
    var blocks = qsa("[data-service-block]");
    if (!links.length || !blocks.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-25% 0px -60% 0px", threshold: 0 });
    blocks.forEach(function (block) { io.observe(block); });
  }

  /* ---------------- Contact form ---------------- */
  function initForm() {
    var form = qs("[data-contact-form]");
    if (!form) return;
    var status = qs("[data-form-status]", form.parentNode) || qs("[data-form-status]");
    var submit = qs('[type="submit"]', form);
    var submitLabel = submit ? submit.innerHTML : "";
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setStatus(type, message) {
      if (!status) return;
      status.className = "form-status is-visible is-" + type;
      status.textContent = message;
    }

    function fieldWrap(field) { return field.closest(".field") || field.closest(".consent-field"); }

    function setFieldError(field, message) {
      var wrap = fieldWrap(field);
      if (!wrap) return;
      wrap.classList.add("has-error");
      field.setAttribute("aria-invalid", "true");
      var err = qs(".field-error", wrap);
      if (err && message) err.textContent = message;
    }

    function clearFieldError(field) {
      var wrap = fieldWrap(field);
      if (!wrap) return;
      wrap.classList.remove("has-error");
      field.removeAttribute("aria-invalid");
    }

    function validate() {
      var firstInvalid = null;
      qsa("[required]", form).forEach(function (field) {
        var value = field.type === "checkbox" ? field.checked : field.value.trim();
        var ok = true;
        if (!value) ok = false;
        if (ok && field.type === "email" && !emailRegex.test(field.value.trim())) {
          ok = false;
          setFieldError(field, t.invalidEmail);
        } else if (!ok) {
          setFieldError(field, field.type === "checkbox" ? t.consent : t.required);
        } else {
          clearFieldError(field);
        }
        if (!ok && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: true });
        firstInvalid.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
      return !firstInvalid;
    }

    qsa("input, select, textarea", form).forEach(function (field) {
      field.addEventListener("input", function () {
        if (fieldWrap(field) && fieldWrap(field).classList.contains("has-error")) {
          var value = field.type === "checkbox" ? field.checked : field.value.trim();
          if (value && (field.type !== "email" || emailRegex.test(field.value.trim()))) clearFieldError(field);
        }
      });
      field.addEventListener("change", function () { clearFieldError(field); });
    });

    function collect() {
      var data = {};
      new FormData(form).forEach(function (value, key) {
        if (key === "consent") data[key] = value ? "yes" : "no";
        else data[key] = value;
      });
      data.language = lang;
      data.page = window.location.href;
      data.submitted_at = new Date().toISOString();
      return data;
    }

    function mailtoFallback(data) {
      if (!config.email) return false;
      var subject = "New project request — " + (data.name || "");
      var lines = [
        "Name: " + (data.name || ""),
        "Email: " + (data.email || ""),
        "Phone: " + (data.phone || ""),
        "Company: " + (data.company || ""),
        "Service: " + (data.service || ""),
        "Budget: " + (data.budget || ""),
        "",
        "Project details:",
        data.details || "",
        "",
        "Language: " + data.language,
        "Page: " + data.page
      ];
      window.location.href = "mailto:" + config.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      setStatus("info", t.mailto);
      return true;
    }

    function endpoint() {
      if (config.form && config.form.endpoint) return config.form.endpoint;
      if (config.form && config.form.provider === "formsubmit" && config.email) {
        return "https://formsubmit.co/ajax/" + encodeURIComponent(config.email);
      }
      return "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      // Honeypot — quietly accept bot submissions without sending.
      var trap = qs('[name="website"]', form);
      if (trap && trap.value) {
        setStatus("success", t.success);
        form.reset();
        return;
      }

      var data = collect();
      var url = endpoint();

      if (!url) {
        if (!mailtoFallback(data)) setStatus("error", t.notConfigured);
        else form.reset();
        return;
      }

      if (submit) { submit.disabled = true; submit.setAttribute("aria-busy", "true"); submit.textContent = t.sending; }
      setStatus("info", t.sending);

      var payload = Object.assign({}, data);
      payload._subject = "New project request — RAFA DIGITAL STUDIO";
      payload._template = "table";
      payload._captcha = "false";
      if (config.form && config.form.accessKey) payload.access_key = config.form.accessKey;

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json().catch(function () { return {}; });
        })
        .then(function () {
          form.reset();
          setStatus("success", t.success);
        })
        .catch(function () {
          if (!mailtoFallback(data)) setStatus("error", t.error);
        })
        .finally(function () {
          if (submit) { submit.disabled = false; submit.removeAttribute("aria-busy"); submit.innerHTML = submitLabel; }
        });
    });
  }

  /* ---------------- Language preference ---------------- */
  function initLanguage() {
    try {
      localStorage.setItem("rafa-lang", lang);
    } catch (err) { /* storage may be unavailable */ }

    qsa('a[hreflang]').forEach(function (link) {
      link.addEventListener("click", function () {
        try {
          localStorage.setItem("rafa-lang", link.getAttribute("hreflang"));
        } catch (err) { /* ignore */ }
      });
    });
  }

  /* ---------------- Misc ---------------- */
  function initMisc() {
    qsa("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Keep native anchor focus visible after smooth scroll.
    qsa('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = qs(id);
        if (!target) return;
        setTimeout(function () { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }, 500);
      });
    });
  }

  function init() {
    applyConfig();
    initScrollUI();
    initMobileNav();
    initReveal();
    initFaq();
    initFilters();
    initProjectModal();
    initServiceSpy();
    initForm();
    initLanguage();
    initMisc();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();
