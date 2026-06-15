/* ============================================================
   BREATHE — MAIN LOGIC
   ============================================================ */

const FEELINGS = [
  { id: 'stressed',    label: 'feeling.stressed' },
  { id: 'anxious',     label: 'feeling.anxious' },
  { id: 'sad',         label: 'feeling.sad' },
  { id: 'overwhelmed', label: 'feeling.overwhelmed' },
  { id: 'tired',       label: 'feeling.tired' },
  { id: 'angry',       label: 'feeling.angry' }
];

const AFFIRMATIONS = {
  stressed:    'affirmation.stressed',
  anxious:     'affirmation.anxious',
  sad:         'affirmation.sad',
  overwhelmed: 'affirmation.overwhelmed',
  tired:       'affirmation.tired',
  angry:       'affirmation.angry'
};

const state = {
  currentFeeling: null,
  activeTimers: []
};

// ============================================================
// UTILITIES
// ============================================================

function $(id) { return document.getElementById(id); }

function clearTimers() {
  state.activeTimers.forEach(id => clearInterval(id));
  state.activeTimers = [];
}

function addTimer(id) {
  state.activeTimers.push(id);
  return id;
}

// ============================================================
// INSTALL MODAL
// ============================================================

function showInstallModal() {
  const modal = $('install-modal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function hideInstallModal() {
  const modal = $('install-modal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  localStorage.setItem('breathe-install-seen', '1');
}

function initInstallModal() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  if (isStandalone) {
    const btn = $('btn-open-install-modal');
    if (btn) btn.style.display = 'none';
    return;
  }

  if (!localStorage.getItem('breathe-install-seen')) {
    showInstallModal();
  }

  $('btn-open-install-modal').addEventListener('click', showInstallModal);
  $('btn-close-install-modal').addEventListener('click', hideInstallModal);
  $('btn-install-modal-ok').addEventListener('click', hideInstallModal);
  $('install-modal-backdrop').addEventListener('click', hideInstallModal);
}

// ============================================================
// LEGAL MODALS
// ============================================================

function initLegalModals() {
  [
    { openId: 'btn-open-terms',   modalId: 'terms-modal',   closeId: 'btn-close-terms-modal',   okId: 'btn-terms-ok',   backdropId: 'terms-modal-backdrop' },
    { openId: 'btn-open-privacy', modalId: 'privacy-modal', closeId: 'btn-close-privacy-modal', okId: 'btn-privacy-ok', backdropId: 'privacy-modal-backdrop' },
    { openId: 'btn-open-version', modalId: 'version-modal', closeId: 'btn-close-version-modal', okId: 'btn-version-ok', backdropId: 'version-modal-backdrop' }
  ].forEach(({ openId, modalId, closeId, okId, backdropId }) => {
    const modal = $(modalId);
    const show = () => { modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); };
    const hide = () => { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); };
    $(openId).addEventListener('click', show);
    $(closeId).addEventListener('click', hide);
    $(okId).addEventListener('click', hide);
    $(backdropId).addEventListener('click', hide);
  });

  $('btn-open-version').addEventListener('click', () => {
    const meta = document.querySelector('meta[name="app-version"]');
    const version = (meta && meta.content && meta.content !== '__APP_VERSION__')
      ? meta.content
      : 'breathe-v1.0-dev';
    $('build-version-string').textContent = version;
  });
}

// ============================================================
// THEME
// ============================================================

function applyTheme(name) {
  document.documentElement.setAttribute('data-theme', name);
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('theme-swatch--active', s.dataset.theme === name);
  });
  localStorage.setItem('breathe-theme', name);
}

function initTheme() {
  const saved = localStorage.getItem('breathe-theme') || localStorage.getItem('breath-theme') || localStorage.getItem('calm-theme') || 'midnight';
  applyTheme(saved);
  document.querySelectorAll('.theme-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => applyTheme(swatch.dataset.theme));
  });
}

// ============================================================
// SCREEN NAVIGATION
// ============================================================

const SCREENS = ['screen-checkin', 'screen-affirmation', 'screen-breathing'];

function showScreen(id) {
  clearTimers();
  SCREENS.forEach(sid => {
    const el = $(sid);
    if (sid === id) {
      el.classList.add('screen--active');
      el.scrollTop = 0;
    } else {
      el.classList.remove('screen--active');
    }
  });
}

// ============================================================
// FEELING SELECTOR
// ============================================================

function renderFeelings() {
  const grid = $('feeling-grid');
  grid.innerHTML = '';
  state.currentFeeling = null;

  const continueBtn = $('btn-continue-checkin');
  continueBtn.disabled = true;
  continueBtn.setAttribute('aria-disabled', 'true');

  FEELINGS.forEach(feeling => {
    const btn = document.createElement('button');
    btn.className = 'feeling-btn';
    btn.dataset.feelingId = feeling.id;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('data-i18n', feeling.label);
    btn.textContent = t(feeling.label);
    btn.addEventListener('click', () => selectFeeling(feeling.id));
    grid.appendChild(btn);
  });
}

function selectFeeling(id) {
  state.currentFeeling = id;
  document.querySelectorAll('.feeling-btn').forEach(btn => {
    const isSelected = btn.dataset.feelingId === id;
    btn.classList.toggle('feeling-btn--selected', isSelected);
    btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });
  const continueBtn = $('btn-continue-checkin');
  continueBtn.disabled = false;
  continueBtn.removeAttribute('aria-disabled');
}

// ============================================================
// AFFIRMATION
// ============================================================

function showAffirmation() {
  const key = AFFIRMATIONS[state.currentFeeling] || 'affirmation.default';
  const el = $('affirmation-text');
  el.setAttribute('data-i18n', key);
  el.textContent = t(key);
  showScreen('screen-affirmation');
}

// ============================================================
// BOX BREATHING
// ============================================================

function renderBoxBreathing(container) {
  let extendedExhale = false;
  let totalRounds = 4;
  let roundsCompleted = 0;
  let phaseIndex = 0;
  let count = 4;
  let sessionRunning = true;
  let currentPhases = buildPhases(false);

  function buildPhases(extended) {
    return [
      { name: t('box-breathing.phase.inhale'), duration: 4, cssClass: 'phase-inhale' },
      { name: t('box-breathing.phase.hold'),   duration: 4, cssClass: 'phase-hold-top' },
      { name: t('box-breathing.phase.exhale'), duration: extended ? 6 : 4, cssClass: extended ? 'phase-exhale-long' : 'phase-exhale' },
      { name: t('box-breathing.phase.hold'),   duration: 4, cssClass: 'phase-hold-bottom' }
    ];
  }

  container.innerHTML = `
    <div class="tool-header">
      <h2 class="tool-title" data-i18n="box-breathing.title">${t('box-breathing.title')}</h2>
      <p class="tool-subtitle" data-i18n="box-breathing.subtitle">${t('box-breathing.subtitle')}</p>
    </div>

    <div class="breath-stage">
      <p class="breath-round-label" id="round-label">${t('box-breathing.round').replace('{n}', 1).replace('{total}', totalRounds)}</p>
      <div class="breath-wrapper">
        <div class="breath-glow"></div>
        <div class="breath-circle phase-hold-bottom" id="breath-circle">
          <span class="breath-count" id="breath-count">4</span>
          <span class="breath-phase-label" id="phase-label">${t('box-breathing.ready')}</span>
        </div>
      </div>
    </div>

    <div id="breath-complete" class="breath-complete hidden">
      <p class="breath-complete-msg"></p>
      <button class="btn--keep-going" id="btn-keep-going" data-i18n="box-breathing.keep-going">${t('box-breathing.keep-going')}</button>
    </div>

    <label class="breath-mode-toggle" id="mode-toggle-label" style="margin-top:24px">
      <div class="toggle-switch" id="exhale-toggle"></div>
      <span class="toggle-label" data-i18n-html="box-breathing.extended-exhale">${t('box-breathing.extended-exhale')}</span>
    </label>

    <div class="breath-coaching" data-i18n="box-breathing.coaching">
      ${t('box-breathing.coaching')}
    </div>
  `;

  const circle     = $('breath-circle');
  const countEl    = $('breath-count');
  const phaseEl    = $('phase-label');
  const roundEl    = $('round-label');
  const completeEl = $('breath-complete');
  const toggleEl   = $('exhale-toggle');

  function updateCircle() {
    const phase = currentPhases[phaseIndex];
    circle.className = 'breath-circle ' + phase.cssClass;
    phaseEl.textContent = phase.name;
    countEl.textContent = count;
  }

  function nextPhase() {
    phaseIndex = (phaseIndex + 1) % currentPhases.length;
    if (phaseIndex === 0) {
      roundsCompleted++;
      if (roundsCompleted >= totalRounds) {
        endSession();
        return;
      }
      roundEl.textContent = t('box-breathing.round').replace('{n}', roundsCompleted + 1).replace('{total}', totalRounds);
    }
    count = currentPhases[phaseIndex].duration;
    updateCircle();
  }

  function endSession() {
    sessionRunning = false;
    clearTimers();
    circle.className = 'breath-circle phase-hold-top';
    phaseEl.textContent = '';
    countEl.textContent = '✓';
    completeEl.classList.remove('hidden');
    const s = totalRounds !== 1 ? 's' : '';
    completeEl.querySelector('.breath-complete-msg').textContent =
      t('box-breathing.complete.msg').replace('{n}', totalRounds).replace('{s}', s);
  }

  setTimeout(() => {
    phaseIndex = 0;
    count = currentPhases[0].duration;
    roundEl.textContent = t('box-breathing.round').replace('{n}', 1).replace('{total}', totalRounds);
    updateCircle();

    const tickId = setInterval(() => {
      if (!sessionRunning) return;
      count--;
      if (count <= 0) {
        nextPhase();
      } else {
        countEl.textContent = count;
      }
    }, 1000);
    addTimer(tickId);
  }, 800);

  document.getElementById('mode-toggle-label').addEventListener('click', () => {
    extendedExhale = !extendedExhale;
    toggleEl.classList.toggle('toggle-switch--on', extendedExhale);
    currentPhases = buildPhases(extendedExhale);
  });

  $('btn-keep-going').addEventListener('click', () => {
    totalRounds += 4;
    sessionRunning = true;
    phaseIndex = 0;
    count = currentPhases[0].duration;
    roundEl.textContent = t('box-breathing.round').replace('{n}', roundsCompleted + 1).replace('{total}', totalRounds);
    completeEl.classList.add('hidden');
    updateCircle();

    const tickId = setInterval(() => {
      if (!sessionRunning) return;
      count--;
      if (count <= 0) {
        nextPhase();
      } else {
        countEl.textContent = count;
      }
    }, 1000);
    addTimer(tickId);
  });

  function onLangChange() {
    if (!document.contains(container)) {
      document.removeEventListener('breathe:langchange', onLangChange);
      return;
    }
    currentPhases = buildPhases(extendedExhale);
    phaseEl.textContent = sessionRunning
      ? currentPhases[phaseIndex].name
      : t('box-breathing.ready');
    roundEl.textContent = t('box-breathing.round')
      .replace('{n}', roundsCompleted + 1)
      .replace('{total}', totalRounds);
    if (!completeEl.classList.contains('hidden')) {
      const s = totalRounds !== 1 ? 's' : '';
      completeEl.querySelector('.breath-complete-msg').textContent =
        t('box-breathing.complete.msg').replace('{n}', totalRounds).replace('{s}', s);
    }
  }
  document.addEventListener('breathe:langchange', onLangChange);
}

// ============================================================
// COMPLETION OVERLAY
// ============================================================

function showCompletionOverlay() {
  const overlay = $('completion-overlay');
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
}

function hideCompletionOverlay() {
  const overlay = $('completion-overlay');
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
}

// ============================================================
// PWA
// ============================================================

function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  if (isStandalone) return;

  let deferredPrompt = null;
  const banner = $('install-banner');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    banner.classList.remove('hidden');
  });

  $('btn-install').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.classList.add('hidden');
  });

  $('btn-dismiss-banner').addEventListener('click', () => {
    banner.classList.add('hidden');
  });

  window.addEventListener('appinstalled', () => {
    banner.classList.add('hidden');
    deferredPrompt = null;
  });
}

// ============================================================
// EVENT WIRING
// ============================================================

function wireEvents() {
  $('btn-continue-checkin').addEventListener('click', () => {
    if (!state.currentFeeling) return;
    showAffirmation();
  });

  $('btn-start-breathing').addEventListener('click', () => {
    const container = $('tool-container');
    container.innerHTML = '';
    renderBoxBreathing(container);
    showScreen('screen-breathing');
  });

  $('btn-done-breathing').addEventListener('click', () => {
    clearTimers();
    showCompletionOverlay();
  });

  $('btn-breathe-again').addEventListener('click', () => {
    hideCompletionOverlay();
    const container = $('tool-container');
    container.innerHTML = '';
    renderBoxBreathing(container);
    showScreen('screen-breathing');
  });

  $('btn-end-session').addEventListener('click', () => {
    hideCompletionOverlay();
    state.currentFeeling = null;
    renderFeelings();
    showScreen('screen-checkin');
  });
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  (window.i18nReady || Promise.resolve()).then(() => {
    initTheme();
    renderFeelings();
    wireEvents();
    initPWA();
    initInstallModal();
    initLegalModals();
  });
});
