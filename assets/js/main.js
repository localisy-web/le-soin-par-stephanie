/* ==========================================================================
   Le Soin par Stéphanie · script du site (version 2, après audit)
   Vanilla JS, sans dépendance, volontairement léger : menu, questions
   dépliables, filtres du catalogue, formulaire, bandeau cookies, suivi.
   Chaque module est isolé : si l'un échoue, les autres continuent.
   ========================================================================== */
(function () {
  'use strict';

  /* ----- Réglages à adapter ----- */
  var CONFIG = {
    // Adresse qui reçoit les demandes quand aucun service d'envoi n'est branché (ouvre la messagerie de la visiteuse).
    // Pour un envoi direct, renseignez data-endpoint sur le <form> (voir README).
    contactEmail: 'stephaniewathelet54@gmail.com',
    // Identifiant du conteneur Google Tag Manager (ex. "GTM-XXXXXXX"). Vide : aucun script de suivi n'est chargé.
    gtmId: '',
    consentKey: 'lsps-cookies',
    thanksPage: 'merci.html'
  };

  var doc = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  doc.classList.add('js');
  window.dataLayer = window.dataLayer || [];

  function safe(name, fn) {
    try { fn(); } catch (err) {
      if (window.console) console.warn('[site] module « ' + name + ' » ignoré :', err);
    }
  }

  /* ----- En-tête : simple trait quand on a défilé ----- */
  safe('header', function () {
    var header = $('.header'); if (!header) return;
    function update() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', update, { passive: true });
    update();
  });

  /* ----- Menu mobile ----- */
  safe('menu', function () {
    var burger = $('.burger'), menu = $('.menu');
    if (!burger || !menu) return;
    function setOpen(open) {
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      doc.classList.toggle('menu-open', open);
    }
    burger.addEventListener('click', function () { setOpen(!menu.classList.contains('is-open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setOpen(false); });
  });

  /* ----- Questions dépliables ----- */
  safe('faq', function () {
    $$('[data-accordion]').forEach(function (root) {
      var items = $$('.faq__item', root);
      function set(item, open) {
        $('.faq__q', item).setAttribute('aria-expanded', String(open));
        $('.faq__panel', item).classList.toggle('is-open', open);
      }
      items.forEach(function (item, i) {
        $('.faq__q', item).addEventListener('click', function () {
          var open = $('.faq__q', item).getAttribute('aria-expanded') === 'true';
          items.forEach(function (it) { set(it, false); });
          if (!open) set(item, true);
        });
        set(item, i === 0);
      });
    });
  });

  /* ----- Catalogue : filtres par étape ou par gamme ----- */
  safe('products', function () {
    var root = $('[data-products]'); if (!root) return;
    var buttons = $$('[data-filter]', root), cards = $$('.product', root), count = $('[data-count-visible]', root);
    var keys = buttons.map(function (b) { return b.dataset.filter; });
    function apply(key) {
      buttons.forEach(function (b) { b.classList.toggle('is-active', b.dataset.filter === key); });
      var n = 0;
      cards.forEach(function (c) {
        var show = key === 'all' || c.dataset.step === key || c.dataset.line === key;
        c.classList.toggle('is-hidden', !show);
        if (show) n++;
      });
      if (count) count.textContent = String(n);
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.filter); }); });
    var hash = window.location.hash.replace('#', '');
    apply(keys.indexOf(hash) >= 0 ? hash : (root.dataset.default || 'all'));
    window.addEventListener('hashchange', function () {
      var h = window.location.hash.replace('#', '');
      if (keys.indexOf(h) >= 0) apply(h);
    });
  });

  /* ----- Horaires : jour courant ----- */
  safe('hours', function () {
    var rows = $$('[data-day]'); if (!rows.length) return;
    var today = new Date().getDay() || 7; // 1 = lundi … 7 = dimanche
    rows.forEach(function (r) { r.classList.toggle('is-today', parseInt(r.dataset.day, 10) === today); });
  });

  /* ----- Formulaire de réservation ----- */
  safe('form', function () {
    var form = $('[data-form]'); if (!form) return;
    var status = $('.form__status', form), submit = $('[type="submit"]', form);

    // Champs cachés : source de la demande (campagnes, page d'arrivée), utiles au suivi des demandes.
    try {
      var params = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
        var f = form.elements[k]; if (f) f.value = params.get(k) || '';
      });
      if (form.elements.source_page) form.elements.source_page.value = window.location.pathname;
      if (form.elements.referent) form.elements.referent.value = document.referrer || '';
    } catch (e) { /* sans importance */ }

    $$('.input, input[type="checkbox"]', form).forEach(function (f) {
      f.addEventListener('input', function () { var w = f.closest('.field'); if (w) w.classList.remove('is-invalid'); });
      f.addEventListener('change', function () { var w = f.closest('.field'); if (w) w.classList.remove('is-invalid'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.site && form.elements.site.value) return; // pot de miel anti-robots
      var ok = true, first = null;
      $$('[required]', form).forEach(function (f) {
        var valid = f.checkValidity();
        var w = f.closest('.field'); if (w) w.classList.toggle('is-invalid', !valid);
        if (!valid) { ok = false; first = first || f; }
      });
      if (!ok) {
        status.textContent = 'Il manque une information pour que nous puissions vous rappeler.';
        if (first && first.focus) first.focus();
        return;
      }

      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name) return;
        if (el.type === 'checkbox') {
          if (el.checked) data[el.name] = (data[el.name] ? data[el.name] + ', ' : '') + el.value;
          else if (!(el.name in data)) data[el.name] = '';
          return;
        }
        if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; else if (!(el.name in data)) data[el.name] = ''; return; }
        data[el.name] = el.value;
      });

      window.dataLayer.push({ event: 'lead_form_submit', besoin: data.besoin || '' });
      form.classList.add('is-sent');
      function thanks() { window.location.href = CONFIG.thanksPage; }
      function fail() {
        form.classList.remove('is-sent');
        status.textContent = 'L\'envoi a échoué. Appelez-nous, ou réessayez dans un instant.';
      }

      var endpoint = form.dataset.endpoint;
      if (endpoint) {
        status.textContent = 'Envoi en cours…';
        window.fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (r) { r.ok ? thanks() : fail(); }).catch(fail);
        return;
      }
      // Sans service d'envoi : la messagerie de la visiteuse s'ouvre avec la demande pré-remplie.
      var subject = encodeURIComponent('Demande de bilan de peau · ' + data.nom);
      var body = encodeURIComponent(
        'Nom : ' + data.nom + '\nTéléphone : ' + data.telephone + '\nE-mail : ' + (data.email || '-') +
        '\nBesoin principal : ' + (data.besoin || '-') + '\nJours préférés : ' + (data.jours || 'indifférent') +
        '\nMoment : ' + (data.moment || 'indifférent') + '\nPremière visite : ' + (data.visite || '-') +
        '\n\n' + (data.message || '') +
        '\n\nSource : ' + (data.utm_source || 'directe') + ' · ' + (data.source_page || '')
      );
      window.location.href = 'mailto:' + CONFIG.contactEmail + '?subject=' + subject + '&body=' + body;
      status.textContent = 'Votre messagerie s\'ouvre avec la demande pré-remplie.';
      window.setTimeout(thanks, 1200);
    });
  });

  /* ----- Appels : comptés comme conversion secondaire ----- */
  safe('phone', function () {
    $$('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () { window.dataLayer.push({ event: 'phone_click', position: a.dataset.pos || '' }); });
    });
  });

  /* ----- Bandeau cookies et chargement du suivi après accord ----- */
  safe('consent', function () {
    var banner = $('[data-consent]'); if (!banner) return;
    var choice = null;
    try { choice = window.localStorage.getItem(CONFIG.consentKey); } catch (e) { choice = null; }
    function loadGtm() {
      if (!CONFIG.gtmId || window.__gtmLoaded) return;
      window.__gtmLoaded = true;
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.gtmId);
      document.head.appendChild(s);
    }
    function save(value) {
      try { window.localStorage.setItem(CONFIG.consentKey, value); } catch (e) { /* navigation privée */ }
      banner.classList.remove('is-visible');
      if (value === 'accept') loadGtm();
    }
    if (choice === 'accept') loadGtm();
    else if (choice !== 'refuse') banner.classList.add('is-visible');
    var accept = $('[data-consent-accept]', banner), refuse = $('[data-consent-refuse]', banner);
    if (accept) accept.addEventListener('click', function () { save('accept'); });
    if (refuse) refuse.addEventListener('click', function () { save('refuse'); });
  });

  /* ----- Repères de mesure sur la photo : fond des étiquettes ajusté au texte ----- */
  safe('scan-labels', function () {
    var nodes = $$('.scan .node'); if (!nodes.length) return;
    function fit() {
      nodes.forEach(function (node) {
        var bg = node.querySelector('.node__bg'), text = node.querySelector('text');
        if (!bg || !text) return;
        var b = text.getBBox(), pad = 12;
        if (!b.width) return;
        bg.setAttribute('x', b.x - pad); bg.setAttribute('y', b.y - pad);
        bg.setAttribute('width', b.width + pad * 2); bg.setAttribute('height', b.height + pad * 2);
      });
    }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('load', fit);
    window.addEventListener('resize', fit);
  });

  /* ----- Étapes repliables (page bilan de peau) ----- */
  safe('fold', function () {
    $$('[data-fold]').forEach(function (item) {
      function toggle() { item.classList.toggle('is-open'); }
      item.addEventListener('click', toggle);
      item.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
  });

  /* ----- Page merci : conversion principale, comptée à l'arrivée sur la page ----- */
  safe('thanks', function () {
    if (document.body.classList.contains('page--merci')) window.dataLayer.push({ event: 'lead_thanks' });
  });

  /* ----- Nouvelle page : toujours commencer en haut.
     Sur un site hébergé normalement, c'est le comportement du navigateur. Quand le site est affiché
     dans un cadre (aperçu, intégration), le cadre peut garder sa position : on remonte alors nous-mêmes,
     à l'arrivée sur la page et au clic sur un lien interne. Rechargement et retour arrière restent
     à la position que le navigateur restaure. ----- */
  safe('top', function () {
    var framed = false;
    try { framed = window.self !== window.top; } catch (e) { framed = true; }
    function up() {
      try { document.documentElement.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) { /* sans importance */ }
      try { window.scrollTo(0, 0); } catch (e) { /* sans importance */ }
      if (framed) { try { window.parent.scrollTo(0, 0); } catch (e) { /* cadre d'une autre origine */ } }
    }
    var entries = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
    var fresh = !entries.length || entries[0].type === 'navigate';
    if (!window.location.hash && fresh) { up(); window.addEventListener('load', function () { window.setTimeout(up, 0); }); }
    if (!framed) return;
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.target === '_blank') return;
      var href = a.getAttribute('href') || '';
      if (/^(#|tel:|mailto:|https?:)/i.test(href)) return;
      up();
    });
  });

  /* ----- Année courante ----- */
  safe('year', function () {
    var year = $('[data-year]'); if (year) year.textContent = String(new Date().getFullYear());
  });

  if (reduced) doc.classList.add('reduced');
})();
