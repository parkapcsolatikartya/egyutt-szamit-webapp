import {
  appendImpactEvent,
  clearImpactLog,
  createImpactEvent,
  getImpactEvents,
} from './impact-log.js';

const STATE_KEY = 'egyutt-szamit-mvp-v1-state';
const RESOURCE_META = {
  water: { title: 'Víz', unit: 'liter', icon: 'bi-droplet-fill', decimals: 0 },
  electricity: { title: 'Villamos energia', unit: 'kWh', icon: 'bi-lightning-charge-fill', decimals: 2 },
  heating: { title: 'Fűtési energia', unit: 'kWh', icon: 'bi-fire', decimals: 2 },
};

let config = null;
let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

document.addEventListener('DOMContentLoaded', init);

async function init() {
  bindStaticEvents();
  try {
    const response = await fetch('./data/mvp-config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Config load failed: ${response.status}`);
    config = await response.json();
    renderCategories();
    restoreFromHash();
  } catch (error) {
    console.error(error);
    showError('Az alkalmazás adatai most nem tölthetők be. Indítsd az oldalt webszerverről, majd próbáld újra.');
  }
}

function bindStaticEvents() {
  document.addEventListener('click', (event) => {
    const route = event.target.closest('[data-route]');
    if (route) {
      event.preventDefault();
      if (route.dataset.route === 'home') showHome();
      if (route.dataset.route === 'impact') showImpact();
      return;
    }

    const scrollButton = event.target.closest('[data-scroll-categories]');
    if (scrollButton) {
      $('#categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const categoryButton = event.target.closest('[data-category-id]');
    if (categoryButton) {
      showCategory(categoryButton.dataset.categoryId);
      return;
    }

    const challengeButton = event.target.closest('[data-challenge-id]');
    if (challengeButton) {
      chooseChallenge(challengeButton.dataset.challengeId);
      return;
    }

    if (event.target.closest('[data-back-category]')) {
      if (state.categoryId) showCategory(state.categoryId);
      else showHome();
      return;
    }

    const checkin = event.target.closest('[data-completion]');
    if (checkin) completeChallenge(Number(checkin.dataset.completion));
  });

  $('#personalize-form')?.addEventListener('submit', handlePersonalize);
  $('#start-challenge')?.addEventListener('click', () => showScreen('checkin', '#visszajelzes'));
  $('#share-result')?.addEventListener('click', shareResult);
  $('#clear-impact')?.addEventListener('click', () => {
    if (!window.confirm('Töröljük az ezen a böngészőn tárolt hatásnaplót?')) return;
    clearImpactLog();
    renderImpact();
  });
  window.addEventListener('popstate', restoreFromHash);
}

function renderCategories() {
  const root = $('#category-grid');
  root.replaceChildren();
  config.categories.forEach((category) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML = `
      <article class="card resource-card border-0 h-100">
        <div class="card-body p-4 p-lg-5 d-flex flex-column">
          <img class="resource-image mb-4" src="${category.image}" alt="" width="144" height="144" loading="lazy" decoding="async">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi ${category.icon} text-primary" aria-hidden="true"></i>
            <h3 class="h4 mb-0">${escapeHtml(category.title)}</h3>
          </div>
          <p class="text-body-secondary flex-grow-1">${escapeHtml(category.description)}</p>
          <button class="btn btn-primary w-100" type="button" data-category-id="${category.id}">Megnézem a próbákat</button>
        </div>
      </article>`;
    root.append(col);
  });
}

function showHome({ push = true } = {}) {
  state = {};
  saveState();
  if (push) setHash('#kezdolap');
  showScreen('home', null, false);
}

function showCategory(categoryId, { push = true } = {}) {
  const category = getCategory(categoryId);
  if (!category) return showHome();
  state = { categoryId };
  saveState();

  $('#category-heading').innerHTML = `
    <div class="card border-0 soft-panel"><div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-md-row align-items-md-center gap-4">
        <img src="${category.image}" alt="" width="112" height="112" class="resource-image flex-shrink-0">
        <div><p class="text-primary text-uppercase small fw-semibold mb-2">${escapeHtml(category.title)}</p><h1 class="display-6 fw-semibold mb-2" tabindex="-1">Melyik próbával kezdenél?</h1><p class="text-body-secondary mb-0">${escapeHtml(category.description)}</p></div>
      </div>
    </div></div>`;

  const grid = $('#challenge-grid');
  grid.replaceChildren();
  config.challenges.filter((item) => item.categoryId === categoryId).forEach((challenge) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6';
    col.innerHTML = `
      <article class="card challenge-card border-0 h-100 overflow-hidden">
        <img src="${challenge.image}" alt="${escapeHtml(challenge.imageAlt)}" width="560" height="360" loading="lazy" decoding="async">
        <div class="card-body p-4 d-flex flex-column">
          <h2 class="h4 mb-3">${escapeHtml(challenge.title)}</h2>
          <p class="text-body-secondary flex-grow-1">${escapeHtml(challenge.summary)}</p>
          <div class="d-flex justify-content-between align-items-center gap-2 mb-3 small"><span class="badge rounded-pill app-badge">becslés</span><span class="text-body-secondary">${escapeHtml(formatBaseEstimate(challenge))}</span></div>
          <button class="btn btn-primary w-100" type="button" data-challenge-id="${challenge.id}">Ezt próbálnám ki</button>
        </div>
      </article>`;
    grid.append(col);
  });

  if (push) setHash(`#${categoryId}`);
  showScreen('category');
}

function chooseChallenge(challengeId) {
  const challenge = getChallenge(challengeId);
  if (!challenge) return;
  state = { categoryId: challenge.categoryId, challengeId };
  saveState();
  renderPersonalize(challenge);
  setHash(`#proba/${challenge.id}`);
  showScreen('personalize');
}

function renderPersonalize(challenge) {
  const category = getCategory(challenge.categoryId);
  $('#personalize-image').src = challenge.image;
  $('#personalize-image').alt = challenge.imageAlt;
  $('#personalize-category').textContent = category.title;
  $('#personalize-title').textContent = challenge.title;
  $('#personalize-summary').textContent = challenge.summary;
  $('#personalize-question').textContent = challenge.question.label;
  $('#personalize-help').textContent = challenge.question.help;

  const root = $('#personalize-options');
  root.replaceChildren();
  challenge.question.options.forEach((option, index) => {
    const item = document.createElement('div');
    item.className = 'form-check form-option';
    item.innerHTML = `<input class="form-check-input" type="radio" name="choice" id="choice-${index}" value="${escapeHtml(option.value)}" ${index === 0 ? 'checked' : ''}><label class="form-check-label w-100" for="choice-${index}">${escapeHtml(option.label)}</label>`;
    root.append(item);
  });
}

function handlePersonalize(event) {
  event.preventDefault();
  const challenge = getChallenge(state.challengeId);
  if (!challenge) return showHome();
  const value = new FormData(event.currentTarget).get('choice');
  const option = challenge.question.options.find((item) => item.value === value);
  if (!option) return showError('Válassz egy lehetőséget.');

  state.choice = option.value;
  state.factor = option.factor;
  state.commitment = option.commitment;
  saveState();
  renderCommitment();
  setHash(`#vallalas/${challenge.id}`);
  showScreen('commitment');
}

function renderCommitment() {
  const challenge = getChallenge(state.challengeId);
  if (!challenge) return;
  const range = getPotentialRange(challenge, state.factor ?? 1);
  $('#commitment-text').textContent = state.commitment ?? challenge.summary;
  $('#commitment-estimate').textContent = formatRange(range.min, range.max, challenge.estimate.unit);
  $('#commitment-basis').textContent = `Alap: ${challenge.estimate.basis}`;
  $('#confidence-badge').textContent = `${challenge.estimate.confidence} pontosság`;
  $('#commitment-safety').textContent = challenge.safety;
}

function completeChallenge(completionRate) {
  const challenge = getChallenge(state.challengeId);
  if (!challenge || !Number.isFinite(completionRate)) return showHome();
  const potential = getPotentialRange(challenge, state.factor ?? 1);
  const result = { completionRate, min: potential.min * completionRate, max: potential.max * completionRate, unit: challenge.estimate.unit, resource: challenge.estimate.resource, metric: challenge.estimate.metric };
  state.completedAt = new Date().toISOString();
  state.result = result;
  saveState();

  if (completionRate > 0) {
    const event = createImpactEvent({
      challengeId: challenge.id,
      categoryId: challenge.categoryId,
      completedAt: state.completedAt,
      modelVersion: `mvp-estimate-${config.version}`,
      result: { type: 'estimated-range', completionRate, resource: result.resource, metric: result.metric, unit: result.unit, min: result.min, max: result.max },
      provenance: { userReported: true, documentedAverageUsed: true, measured: false },
    });
    appendImpactEvent(event);
  }

  renderResult();
  setHash(`#eredmeny/${challenge.id}`);
  showScreen('result');
}

function renderResult() {
  const challenge = getChallenge(state.challengeId);
  const result = state.result;
  if (!challenge || !result) return;
  const succeeded = result.completionRate > 0;
  $('#result-title').textContent = succeeded ? 'Ez lett a mai becsült hatásod' : 'Ma nem számolunk megtakarítással';
  $('#result-subtitle').textContent = succeeded ? `A „${challenge.title}” próbát a visszajelzésed szerint ${completionLabel(result.completionRate)} teljesítetted.` : 'A próba most nem sikerült, és ez rendben van. Választhatsz kisebb lépést vagy másik próbát.';
  $('#result-quantity-box').classList.toggle('d-none', !succeeded);
  $('#result-zero').classList.toggle('d-none', succeeded);
  if (succeeded) {
    $('#result-quantity').textContent = formatRange(result.min, result.max, result.unit);
    $('#result-resource').textContent = resourceLabel(result.resource);
    $('#community-scenario').textContent = `${formatRange(result.min * 100, result.max * 100, result.unit)} ugyanebből az erőforrásból.`;
  } else {
    $('#result-zero').textContent = 'A nullás eredményt nem naplózzuk megtakarításként. A kipróbálásból szerzett tapasztalat viszont segíthet egy reálisabb következő lépést választani.';
    $('#community-scenario').textContent = 'Most nincs számszerű kivetítés, mert a mai teljesítéshez nem számoltunk megtakarítást.';
  }
  $('#result-note').textContent = `${config.estimateNotice} Ennél a próbánál a becslés alapja: ${challenge.estimate.basis}`;
}

async function shareResult() {
  const challenge = getChallenge(state.challengeId);
  const result = state.result;
  if (!challenge || !result) return;
  const succeeded = result.completionRate > 0;
  const text = succeeded ? `Ma kipróbáltam az Együtt számít „${challenge.title}” próbáját. A becsült eredményem ${formatRange(result.min, result.max, result.unit)}. Nézd meg te is, nálad melyik apró változtatás fér bele!` : `Ma kipróbáltam az Együtt számít „${challenge.title}” próbáját. Nézd meg te is, nálad melyik apró változtatás fér bele!`;
  const url = new URL(window.location.href);
  url.hash = 'kezdolap';
  const data = { title: 'Együtt számít', text, url: url.toString() };
  const feedback = $('#share-feedback');
  feedback.textContent = '';
  try {
    if (navigator.share) { await navigator.share(data); feedback.textContent = 'Köszönjük, hogy továbbadod a próbát.'; return; }
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(`${text} ${data.url}`); feedback.textContent = 'A megosztási szöveget a vágólapra másoltuk.'; return; }
    throw new Error('Sharing not supported');
  } catch (error) {
    if (error?.name === 'AbortError') return;
    console.error(error);
    feedback.textContent = 'A megosztás most nem sikerült. A böngésző címsorából kimásolhatod a hivatkozást.';
  }
}

function showImpact({ push = true } = {}) {
  renderImpact();
  if (push) setHash('#sajat-hatasom');
  showScreen('impact');
}

function renderImpact() {
  const events = getImpactEvents().sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  $('#impact-empty').classList.toggle('d-none', events.length > 0);
  $('#impact-content').classList.toggle('d-none', events.length === 0);
  if (!events.length) return;

  const sums = {};
  Object.keys(RESOURCE_META).forEach((key) => sums[key] = { min: 0, max: 0, count: 0 });
  events.forEach((event) => {
    const resource = event.result.resource;
    if (!sums[resource]) sums[resource] = { min: 0, max: 0, count: 0 };
    sums[resource].min += event.result.min;
    sums[resource].max += event.result.max;
    sums[resource].count += 1;
  });

  const summary = $('#impact-summary');
  summary.replaceChildren();
  Object.entries(RESOURCE_META).forEach(([resource, meta]) => {
    const total = sums[resource];
    const col = document.createElement('div');
    col.className = 'col-12 col-md-4';
    col.innerHTML = `<article class="card border-0 app-card impact-metric h-100"><div class="card-body p-4 d-flex flex-column"><div class="d-flex align-items-center gap-2 mb-3"><i class="bi ${meta.icon} text-primary" aria-hidden="true"></i><h2 class="h6 text-uppercase fw-semibold mb-0">${meta.title}</h2></div><div class="mt-auto"><p class="metric-value fw-semibold mb-2">${total.count ? formatRange(total.min, total.max, meta.unit) : '—'}</p><p class="small text-body-secondary mb-0">${total.count ? `${total.count} naplózott próba becsült összege` : 'Még nincs ilyen naplózott eredmény'}</p></div></div></article>`;
    summary.append(col);
  });

  $('#impact-count').textContent = `${events.length} alkalom`;
  const list = $('#impact-events');
  list.replaceChildren();
  events.forEach((event) => {
    const challenge = getChallenge(event.challengeId);
    const item = document.createElement('div');
    item.className = 'event-row d-flex gap-3';
    item.innerHTML = `<span class="event-dot" aria-hidden="true"></span><div class="flex-grow-1"><div class="d-flex flex-column flex-sm-row justify-content-between gap-2"><div><strong>${escapeHtml(challenge?.title ?? event.challengeId)}</strong><div class="small text-body-secondary">${formatDate(event.completedAt)} · ${completionLabel(event.result.completionRate)}</div></div><strong class="text-primary">${formatRange(event.result.min, event.result.max, event.result.unit)}</strong></div></div>`;
    list.append(item);
  });
}

function restoreFromHash() {
  if (!config) return;
  const hash = window.location.hash || '#kezdolap';
  if (hash === '#sajat-hatasom') return showImpact({ push: false });
  const parts = hash.replace(/^#/, '').split('/');
  if (parts[0] === 'proba' && parts[1]) {
    const challenge = getChallenge(parts[1]);
    if (challenge) { state = { categoryId: challenge.categoryId, challengeId: challenge.id }; saveState(); renderPersonalize(challenge); return showScreen('personalize'); }
  }
  if (parts[0] === 'vallalas' && parts[1] && state.challengeId === parts[1] && state.commitment) { renderCommitment(); return showScreen('commitment'); }
  if (parts[0] === 'eredmeny' && parts[1] && state.challengeId === parts[1] && state.result) { renderResult(); return showScreen('result'); }
  if (['water', 'electricity', 'gas'].includes(parts[0])) return showCategory(parts[0], { push: false });
  return showHome({ push: false });
}

function showScreen(name, hash = null, focus = true) {
  $$('.app-screen').forEach((screen) => screen.classList.add('d-none'));
  $(`#screen-${name}`)?.classList.remove('d-none');
  if (hash) setHash(hash);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (focus) setTimeout(() => $(`#screen-${name} h1`)?.focus({ preventScroll: true }), 40);
}

function getPotentialRange(challenge, factor = 1) { return { min: challenge.estimate.min * factor, max: challenge.estimate.max * factor }; }
function formatBaseEstimate(challenge) { return formatRange(challenge.estimate.min, challenge.estimate.max, challenge.estimate.unit); }
function formatRange(min, max, unit) {
  const decimals = unit === 'liter' ? 0 : (Math.max(Math.abs(min), Math.abs(max)) < 10 ? 2 : 1);
  const format = (value) => new Intl.NumberFormat('hu-HU', { minimumFractionDigits: 0, maximumFractionDigits: decimals }).format(value);
  return `${format(min)}–${format(max)} ${unit}`;
}
function resourceLabel(resource) {
  if (resource === 'water') return 'becsült vízhasználat-csökkentés';
  if (resource === 'electricity') return 'becsült villamosenergia-csökkentés';
  if (resource === 'heating') return 'becsült fűtésienergia-csökkentés';
  return 'becsült erőforrás-hatás';
}
function completionLabel(value) { if (value >= 0.9) return 'teljesen'; if (value >= 0.5) return 'többnyire'; if (value > 0) return 'részben'; return 'nem'; }
function formatDate(iso) { return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso)); }
function getCategory(id) { return config.categories.find((item) => item.id === id) ?? null; }
function getChallenge(id) { return config.challenges.find((item) => item.id === id) ?? null; }
function setHash(hash) { if (window.location.hash !== hash) history.pushState({}, '', hash); }
function saveState() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
function loadState() { try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch { return {}; } }
function showError(message) { const root = $('#app-error'); root.classList.remove('d-none'); root.querySelector('.alert').textContent = message; }
function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
