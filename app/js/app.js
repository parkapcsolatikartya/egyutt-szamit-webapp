import {
  estimateDrinkingWaterPersonDays,
  estimateReducedShowerWater,
  formatRangeHu,
  roundRange,
} from './calculator.js';
import {
  getCategoryImage,
  getChallengeImage,
  renderCategoryHeadingImage,
  renderChallengeDetailImage,
} from './category-images.js';

const STORAGE_KEY = 'egyutt-szamit-v0-state';
const SCREEN_IDS = ['intro', 'category', 'questionnaire', 'challenge', 'active', 'checkin', 'result', 'invite', 'next-step'];
const elements = {};

let assumptions = {};
let categories = [];
let challenges = [];
let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

document.addEventListener('DOMContentLoaded', init);

async function init() {
  cacheElements();
  bindEvents();

  try {
    const [assumptionData, categoryData, challengeData] = await Promise.all([
      loadJson('./data/assumptions.json'),
      loadJson('./data/categories.json'),
      loadJson('./data/challenges.json'),
    ]);

    assumptions = assumptionData;
    categories = categoryData.categories;
    challenges = challengeData.challenges;
    renderCategories();
    restoreView();
  } catch (error) {
    showError('A prototípus adatai nem tölthetők be. Indítsd az oldalt webszerverről, majd próbáld újra.');
    console.error(error);
  }
}

function cacheElements() {
  const ids = [
    'app-progress', 'progress-label', 'app-error', 'category-list', 'category-heading-visual',
    'category-kicker', 'category-title', 'category-intro', 'challenge-list', 'questionnaire-visual',
    'questionnaire-category', 'questionnaire-title', 'question-fields', 'question-form',
    'challenge-detail-visual', 'challenge-category-label', 'challenge-section-icon', 'challenge-title',
    'challenge-text', 'challenge-estimate', 'challenge-safety-text', 'active-heading', 'active-text',
    'checkin-label', 'checkin-value', 'result-category-badge', 'result-heading', 'result-water',
    'result-equivalent', 'result-note', 'invite-summary', 'share-feedback', 'next-step-summary',
    'accept-three-days',
  ];

  ids.forEach((id) => {
    elements[toCamelCase(id)] = $(`#${id}`);
  });
  elements.mobileProgress = $('.app-progress-mobile');
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function bindEvents() {
  elements.categoryList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category-id]');
    if (button && !button.disabled) selectCategory(button.dataset.categoryId);
  });

  elements.challengeList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-challenge-id]');
    if (button) selectChallenge(button.dataset.challengeId);
  });

  $$('[data-show-home], [data-back-home]').forEach((button) => button.addEventListener('click', () => showHome()));
  $$('[data-category-nav]').forEach((button) => button.addEventListener('click', () => selectCategory(button.dataset.categoryNav)));
  $$('[data-back-category]').forEach((button) => button.addEventListener('click', showSelectedCategory));
  $$('[data-reset-app]').forEach((button) => button.addEventListener('click', resetApp));

  elements.questionForm.addEventListener('submit', handleQuestionnaireSubmit);
  $('#accept-challenge').addEventListener('click', startChallenge);
  $('#checkin-button').addEventListener('click', () => {
    renderCheckinOptions();
    setPhase('checkin');
  });
  $('#checkin-form').addEventListener('submit', handleCheckinSubmit);
  $('#result-continue').addEventListener('click', () => {
    renderInviteScreen();
    setPhase('invite');
  });
  $('#share-button').addEventListener('click', shareResult);
  $('#skip-share').addEventListener('click', showNextStep);
  elements.acceptThreeDays.addEventListener('click', startThreeDayChallenge);
  window.addEventListener('popstate', restoreRouteFromHash);
}

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}

function renderCategories() {
  elements.categoryList.replaceChildren();

  categories.forEach((category) => {
    const image = getCategoryImage(category.visualKey);
    const column = document.createElement('div');
    column.className = 'col-12 col-md-6 col-xl-4';
    column.innerHTML = `
      <article class="card category-card category-card-${category.visualKey} border-0 h-100 overflow-hidden" data-status="${category.status}">
        <div class="category-media p-3">
          <img src="${image.src}" alt="${escapeHtml(category.imageAlt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" class="img-fluid mx-auto d-block rounded-4">
        </div>
        <div class="card-body p-4 d-flex flex-column">
          <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
            <h2 class="h4 mb-0">${escapeHtml(category.title)}</h2>
            ${category.status === 'active' ? '' : '<span class="badge rounded-pill status-chip">előkészítés alatt</span>'}
          </div>
          <p class="text-body-secondary flex-grow-1">${escapeHtml(category.description)}</p>
          <button class="btn ${category.status === 'active' ? 'btn-primary' : 'btn-outline-secondary'} w-100" type="button" data-category-id="${category.id}" ${category.status === 'active' ? '' : 'disabled aria-disabled="true"'}>${escapeHtml(category.buttonLabel)}</button>
        </div>
      </article>`;
    elements.categoryList.append(column);
  });
}

function selectCategory(categoryId, { replaceHistory = false } = {}) {
  const category = categories.find((item) => item.id === categoryId && item.status === 'active');
  if (!category) return;

  state = { selectedCategoryId: category.id, phase: 'category' };
  saveState();
  renderCategoryScreen(category);
  setLocationHash(`/${category.slug}`, replaceHistory);
  showScreen('category', { focusHeading: true });
  updateSidebar(category.id);
}

function renderCategoryScreen(category) {
  renderCategoryHeadingImage(elements.categoryHeadingVisual, category);
  elements.categoryKicker.textContent = `${category.title} kategória`;
  elements.categoryTitle.textContent = category.id === 'water' ? 'Melyik vízpróbával kezdenél?' : 'Melyik árampróbával kezdenél?';
  elements.categoryIntro.textContent = category.id === 'water'
    ? 'Válassz egyetlen területet. A következő lépésben néhány rövid kérdéssel a saját helyzetedhez igazítjuk a próbát.'
    : 'Válassz egy olyan helyzetet, amely a hétköznapjaidban gyakran előfordul. Az első próbához elég egyetlen kis változtatás.';

  elements.challengeList.replaceChildren();
  challenges
    .filter((challenge) => challenge.categoryId === category.id && challenge.status === 'active')
    .forEach((challenge) => {
      const image = getChallengeImage(challenge.visualKey);
      const column = document.createElement('div');
      column.className = 'col-12 col-md-6';
      column.innerHTML = `
        <article class="card challenge-card border-0 h-100 overflow-hidden">
          <img src="${image.src}" alt="${escapeHtml(challenge.imageAlt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" class="${image.imageClasses ?? 'img-fluid w-100 d-block'}">
          <div class="card-body p-4">
            <h2 class="h5 mb-3">${escapeHtml(challenge.title)}</h2>
            <p class="text-body-secondary mb-4">${escapeHtml(challenge.cardDescription)}</p>
            <button class="btn btn-primary w-100" type="button" data-challenge-id="${challenge.id}">Ezt próbálnám ki</button>
          </div>
        </article>`;
      elements.challengeList.append(column);
    });
}

function selectChallenge(challengeId) {
  const challenge = challenges.find((item) => item.id === challengeId && item.status === 'active');
  if (!challenge) return;
  const category = categories.find((item) => item.id === challenge.categoryId);

  state = {
    selectedCategoryId: category.id,
    selectedChallengeId: challenge.id,
    phase: 'questionnaire',
    answers: {},
  };
  saveState();
  renderQuestionnaire(challenge, category);
  setLocationHash(`/${category.slug}/${challenge.slug}`);
  showScreen('questionnaire', { focusHeading: true });
  updateSidebar(category.id);
}

function renderQuestionnaire(challenge, category) {
  setChallengeVisual(elements.questionnaireVisual, challenge);
  elements.questionnaireCategory.textContent = `${category.title} · személyre szabás`;
  elements.questionnaireTitle.textContent = challenge.title;
  elements.questionFields.replaceChildren();

  challenge.questions.forEach((question) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'mb-4';

    const legend = document.createElement('legend');
    legend.className = 'h5 mb-2';
    legend.textContent = question.label;
    fieldset.append(legend);

    if (question.help) {
      const help = document.createElement('p');
      help.className = 'text-body-secondary small mb-3';
      help.textContent = question.help;
      fieldset.append(help);
    }

    fieldset.append(question.type === 'number' ? createNumberQuestion(question) : createRadioQuestion(question));
    elements.questionFields.append(fieldset);
  });
}

function createNumberQuestion(question) {
  const wrapper = document.createElement('div');
  wrapper.className = 'input-group';
  const input = document.createElement('input');
  input.className = 'form-control form-control-lg';
  input.type = 'number';
  input.id = question.id;
  input.name = question.id;
  input.min = String(question.min);
  input.max = String(question.max);
  input.step = String(question.step ?? 1);
  input.value = String(state.answers?.[question.id] ?? question.defaultValue ?? '');
  input.required = Boolean(question.required);
  input.inputMode = 'numeric';
  const unit = document.createElement('span');
  unit.className = 'input-group-text';
  unit.textContent = question.unit ?? '';
  wrapper.append(input, unit);
  return wrapper;
}

function createRadioQuestion(question) {
  const wrapper = document.createElement('div');
  wrapper.className = 'vstack gap-2';
  const selected = state.answers?.[question.id] ?? question.defaultValue;

  question.options.forEach((option, index) => {
    const item = document.createElement('div');
    item.className = 'form-check border rounded-3 p-3 ps-5';
    const input = document.createElement('input');
    input.className = 'form-check-input';
    input.type = 'radio';
    input.id = `${question.id}-${index}`;
    input.name = question.id;
    input.value = option.value;
    input.checked = option.value === selected;
    input.required = Boolean(question.required);
    const label = document.createElement('label');
    label.className = 'form-check-label w-100';
    label.htmlFor = input.id;
    label.textContent = option.label;
    item.append(input, label);
    wrapper.append(item);
  });
  return wrapper;
}

function handleQuestionnaireSubmit(event) {
  event.preventDefault();
  hideError();
  const challenge = getSelectedChallenge();
  if (!challenge) return showError('A kiválasztott próba nem található. Válassz újra a kategóriák közül.');

  const formData = new FormData(elements.questionForm);
  const answers = {};

  for (const question of challenge.questions) {
    const rawValue = formData.get(question.id);
    if ((rawValue === null || rawValue === '') && question.required) return showError('Válaszolj minden kötelező kérdésre.');

    if (question.type === 'number') {
      const value = Number(rawValue);
      if (!Number.isFinite(value) || value < question.min || value > question.max) return showError(`Adj meg ${question.min} és ${question.max} közötti értéket.`);
      answers[question.id] = value;
    } else {
      answers[question.id] = String(rawValue ?? '');
    }
  }

  state.answers = answers;
  state.challenge = { id: challenge.id, modelVersion: challenge.modelVersion };
  if (challenge.resultMode === 'shower-water') {
    state.challenge.targetMinutes = answers.shower_duration_minutes >= assumptions.challenge.shortShowerThresholdMinutes
      ? assumptions.challenge.defaultReductionMinutes
      : assumptions.challenge.shortShowerReductionMinutes;
  }
  saveState();
  renderChallengeScreen();
  setPhase('challenge');
}

function buildPersonalizedChallenge(challenge) {
  const answers = state.answers ?? {};

  if (challenge.id === 'shorter-shower') {
    const targetMinutes = state.challenge?.targetMinutes ?? 1;
    const estimate = calculateWaterResult(targetMinutes);
    const rounded = roundRange(estimate.rawMinLiters, estimate.rawMaxLiters, 0);
    return {
      title: challenge.detailTitle,
      text: `Ma próbáld meg körülbelül ${targetMinutes} perccel rövidebbre venni a zuhanyzásodat. A tisztálkodásból nem kell kihagynod semmit: csak arra figyelj, hogy a szükségesnél ne folyjon tovább a víz.`,
      estimate: `Becslésünk szerint körülbelül ${formatRangeHu(rounded.min, rounded.max, 'liter')} vízzel csökkentheted a mai használatodat.`,
      activeText: `A mai cél: körülbelül ${targetMinutes} perccel rövidebb zuhanyzás. Amikor kipróbáltad, térj vissza és mondd el, nagyjából mennyivel lett rövidebb.`,
    };
  }

  if (challenge.id === 'dishwashing-flow') {
    return {
      title: challenge.detailTitle,
      text: answers.dishwashing_mode === 'machine'
        ? 'A következő kézi mosogatásnál figyeld meg, mikor zárható el a csap az áztatás, szivacsozás vagy az edények rendezése közben.'
        : 'A következő kézi mosogatásnál próbáld csökkenteni azt az időt, amikor a víz úgy folyik, hogy éppen nem öblítesz vele.',
      estimate: challenge.estimateText,
      activeText: 'A mai cél: egyetlen kézi mosogatásnál tudatosan csökkenteni a feleslegesen folyó víz idejét.',
    };
  }

  if (challenge.id === 'full-washer-load') {
    return {
      title: challenge.detailTitle,
      text: answers.washer_can_wait === 'no'
        ? 'A következő szükséges mosásnál a programhoz illő ruhákkal használd ki ésszerűen a gép kapacitását, de ne terheld túl.'
        : 'Ha nincs sürgősen szükség a ruhákra, várd meg, amíg a következő mosásnál a programhoz illő, jól kihasznált töltet gyűlik össze.',
      estimate: challenge.estimateText,
      activeText: 'A mai cél: a következő mosást nem kevés ruhával, hanem a gép ajánlott kapacitását jól kihasználva elindítani.',
    };
  }

  if (challenge.id === 'task-lighting') {
    return {
      title: challenge.detailTitle,
      text: answers.task_lamp_available === 'yes'
        ? 'A kiválasztott esti tevékenységnél próbáld ki a kisebb, célzott lámpát a teljes szoba erős megvilágítása helyett.'
        : 'Nézd meg, van-e már otthon olyan kisebb fényforrás, amely a tevékenység helyét biztonságosan megvilágítja. Új eszköz vásárlása nem része ennek a próbának.',
      estimate: challenge.estimateText,
      activeText: 'A mai cél: egy esti helyzetben csak azt a területet megvilágítani, ahol valóban szükséges.',
    };
  }

  if (challenge.id === 'gentle-cooling') {
    let text = 'A következő hűtési időszakban próbáld ki az általad választott kis változtatást úgy, hogy a lakás továbbra is biztonságosan és kényelmesen használható maradjon.';
    let activeText = 'A mai cél: a hűtést egy kicsit kevésbé intenzíven használni, a komfort és a biztonság megtartásával.';
    if (answers.air_conditioner_use === 'no' || answers.cooling_change === 'passive') {
      text = 'Ma először árnyékolással, megfelelő időben végzett szellőztetéssel vagy már meglévő ventilátorral próbáld mérsékelni a meleget, mielőtt intenzívebb hűtést választanál.';
      activeText = 'A mai cél: először egy passzív vagy kevésbé energiaigényes hűtési lépést kipróbálni.';
    } else if (answers.cooling_change === 'temperature') {
      text = 'A következő használatnál próbáld a légkondicionálót egy fokkal magasabb, de még kényelmes beállítással működtetni.';
    } else if (answers.cooling_change === 'shorter') {
      text = 'A következő használatnál próbáld valamivel rövidebb ideig működtetni a légkondicionálót, majd figyeld meg, megmarad-e a komfortérzeted.';
    }
    return { title: challenge.detailTitle, text, estimate: challenge.estimateText, activeText };
  }

  return {
    title: challenge.detailTitle,
    text: challenge.detailDescription,
    estimate: challenge.estimateText ?? 'Ehhez a próbához a V0 még nem jelenít meg számszerű becslést.',
    activeText: challenge.detailDescription,
  };
}

function renderChallengeScreen() {
  const challenge = getSelectedChallenge();
  const category = getSelectedCategory();
  if (!challenge || !category) return;
  const copy = buildPersonalizedChallenge(challenge);
  setChallengeVisual(elements.challengeDetailVisual, challenge);
  elements.challengeCategoryLabel.textContent = `${category.title} · a mai próba`;
  elements.challengeSectionIcon.className = `section-icon section-icon-${category.id === 'electricity' ? 'energy' : 'water'}`;
  elements.challengeSectionIcon.innerHTML = category.id === 'electricity' ? '<i class="bi bi-lightning-charge"></i>' : '<i class="bi bi-droplet"></i>';
  elements.challengeTitle.textContent = copy.title;
  elements.challengeText.textContent = copy.text;
  elements.challengeEstimate.textContent = copy.estimate;
  elements.challengeSafetyText.textContent = challenge.safetyNote;
}

function startChallenge() {
  state.startedAt = new Date().toISOString();
  saveState();
  renderActiveScreen();
  setPhase('active');
}

function renderActiveScreen() {
  const challenge = getSelectedChallenge();
  if (!challenge) return;
  elements.activeHeading.textContent = challenge.title;
  elements.activeText.textContent = buildPersonalizedChallenge(challenge).activeText;
}

function renderCheckinOptions() {
  const challenge = getSelectedChallenge();
  if (!challenge) return;
  const options = challenge.checkinType === 'minutes'
    ? buildMinuteCheckinOptions()
    : [
      { value: 1, label: 'Teljesen sikerült' },
      { value: 0.66, label: 'Többnyire sikerült' },
      { value: 0.33, label: 'Részben sikerült' },
      { value: 0, label: 'Most nem sikerült' },
    ];
  elements.checkinLabel.textContent = challenge.checkinType === 'minutes'
    ? 'A mai zuhanyzás körülbelül ennyivel lett rövidebb:'
    : 'Mennyire sikerült a kiválasztott próba?';
  elements.checkinValue.replaceChildren();
  options.forEach((option) => {
    const element = document.createElement('option');
    element.value = String(option.value);
    element.textContent = option.label;
    elements.checkinValue.append(element);
  });
}

function buildMinuteCheckinOptions() {
  const options = [
    { value: 0, label: 'Ma nem sikerült' },
    { value: 0.5, label: 'Körülbelül fél perccel lett rövidebb' },
    { value: 1, label: 'Körülbelül 1 perccel lett rövidebb' },
  ];
  if ((state.challenge?.targetMinutes ?? 1) >= 2) {
    options.push(
      { value: 1.5, label: 'Körülbelül másfél perccel lett rövidebb' },
      { value: 2, label: 'Körülbelül 2 perccel vagy többel lett rövidebb' },
    );
  }
  return options;
}

function handleCheckinSubmit(event) {
  event.preventDefault();
  hideError();
  const challenge = getSelectedChallenge();
  const value = Number(elements.checkinValue.value);
  if (!challenge || !Number.isFinite(value) || value < 0) return showError('Válassz egy hozzávetőleges eredményt.');
  state.checkin = { completedAt: new Date().toISOString(), value };
  state.result = challenge.resultMode === 'shower-water'
    ? calculateShowerResult(value)
    : { type: 'qualitative', completionRate: value, modelVersion: challenge.modelVersion };
  saveState();
  renderResultScreen();
  setPhase('result');
}

function calculateWaterResult(minutesReduced) {
  return estimateReducedShowerWater({
    minutesReduced,
    flowRateMinLpm: assumptions.showerFlowRateLpm.min,
    flowRateMaxLpm: assumptions.showerFlowRateLpm.max,
  });
}

function calculateShowerResult(minutesAchieved) {
  if (minutesAchieved === 0) {
    return {
      type: 'shower-water', completionRate: 0, minutesAchieved: 0,
      displayWaterMin: 0, displayWaterMax: 0, displayPersonDaysMin: 0, displayPersonDaysMax: 0,
      modelVersion: assumptions.modelVersion,
    };
  }
  const water = calculateWaterResult(minutesAchieved);
  const waterRange = roundRange(water.rawMinLiters, water.rawMaxLiters, 0);
  const personDays = estimateDrinkingWaterPersonDays({
    waterMinLiters: water.rawMinLiters,
    waterMaxLiters: water.rawMaxLiters,
    litersPerPersonDay: assumptions.drinkingWaterReference.litersPerPersonDay,
  });
  const personDayRange = roundRange(personDays.minPersonDays, personDays.maxPersonDays, 0);
  return {
    type: 'shower-water', completionRate: 1, minutesAchieved,
    displayWaterMin: waterRange.min, displayWaterMax: waterRange.max,
    displayPersonDaysMin: personDayRange.min, displayPersonDaysMax: personDayRange.max,
    modelVersion: water.modelVersion,
  };
}

function renderResultScreen() {
  const result = state.result;
  const challenge = getSelectedChallenge();
  const category = getSelectedCategory();
  if (!result || !challenge || !category) return;

  elements.resultCategoryBadge.textContent = result.type === 'shower-water' ? 'Becsült eredmény' : 'Önbevallásos eredmény';
  if (result.type === 'shower-water') return renderShowerResult(result);

  const level = result.completionRate >= 0.9 ? 'teljesen' : result.completionRate >= 0.5 ? 'többnyire' : result.completionRate > 0 ? 'részben' : 'most még nem';
  elements.resultHeading.textContent = result.completionRate > 0 ? 'A mai próbád eredménye' : 'Már az is számít, hogy kipróbáltad';
  elements.resultWater.textContent = result.completionRate > 0
    ? `A visszajelzésed szerint a „${challenge.title}” próba ${level} sikerült.`
    : `A „${challenge.title}” próba most még nem sikerült, de már pontosabban látod a saját helyzetedet.`;
  elements.resultEquivalent.textContent = category.id === 'water'
    ? 'A V0 ennél a vízpróbánál még nem számol literes eredményt, mert ehhez további, ellenőrzött bemeneti adatok és modell szükséges.'
    : 'A V0 ennél az árampróbánál még nem számol kWh-eredményt, mert a készülék teljesítménye és a használati idő nélkül az hamis pontosságot sugallna.';
  elements.resultNote.textContent = result.completionRate > 0
    ? 'Ez önbevallásos teljesítési eredmény, nem mérőórával igazolt megtakarítás.'
    : 'Nincs kudarc: választhatsz kisebb lépést, másik próbát, vagy később újra megpróbálhatod.';
}

function renderShowerResult(result) {
  const mainsWater = state.answers?.water_source === 'mains';
  if (result.minutesAchieved === 0) {
    elements.resultHeading.textContent = 'Már az is számít, hogy kipróbáltad';
    elements.resultWater.textContent = 'Ma még nem számolunk csökkentett vízhasználattal.';
    elements.resultEquivalent.textContent = 'A következő alkalommal újra megpróbálhatod, vagy választhatsz egy kisebb, könnyebben tartható lépést.';
    elements.resultNote.textContent = 'Nincs kudarc: most már jobban látod a saját szokásodat.';
    return;
  }
  const waterRange = formatRangeHu(result.displayWaterMin, result.displayWaterMax, 'liter');
  const personDays = formatRangeHu(result.displayPersonDaysMin, result.displayPersonDaysMax);
  elements.resultHeading.textContent = 'A mai becsült eredményed';
  elements.resultWater.textContent = mainsWater
    ? `A beszámolód alapján ma körülbelül ${waterRange} ivóvíz-minőségű vezetékes vízzel kevesebbet használtál.`
    : `A beszámolód alapján ma körülbelül ${waterRange} vízzel kevesebbet használtál.`;
  elements.resultEquivalent.textContent = mainsWater
    ? `Ez mennyiségében körülbelül ${personDays} ember egy napi ivóvizének felel meg.`
    : `Ez körülbelül ${formatRangeHu(Math.max(1, Math.round(result.displayWaterMin / 10)), Math.max(1, Math.round(result.displayWaterMax / 10)))} darab 10 literes vödörnyi víz.`;
  elements.resultNote.textContent = mainsWater
    ? 'Gyors becslés átlagos zuhany-vízhozam alapján. A kevesebbet használt víz nem kerül automatikusan más emberekhez.'
    : 'Gyors becslés átlagos zuhany-vízhozam alapján.';
}

function renderInviteScreen() {
  const result = state.result;
  const challenge = getSelectedChallenge();
  if (!result || !challenge) return;
  elements.inviteSummary.textContent = result.type === 'shower-water' && result.minutesAchieved > 0
    ? `Mutasd meg a mai eredményedet, és hívj meg valakit ugyanebbe a próbába. A becsült eredményed: ${formatRangeHu(result.displayWaterMin, result.displayWaterMax, 'liter')}.`
    : result.completionRate > 0
      ? `Hívj meg valakit, hogy egyetlen napra ő is kipróbálja a „${challenge.title}” kihívást.`
      : `A „${challenge.title}” próbába akkor is meghívhatsz valakit, ha neked ma még nem sikerült. Egy új próbálkozás is értékes.`;
}

async function shareResult() {
  const shareData = buildShareData();
  elements.shareFeedback.textContent = '';
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return showNextStep();
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      elements.shareFeedback.textContent = 'A meghívó szöveget és a hivatkozást a vágólapra másoltuk.';
      return showNextStep();
    }
    throw new Error('No supported share method.');
  } catch (error) {
    if (error?.name === 'AbortError') {
      elements.shareFeedback.textContent = 'A megosztást most megszakítottad.';
    } else {
      elements.shareFeedback.textContent = 'A megosztás nem sikerült. Másold ki kézzel az oldal hivatkozását.';
      console.error(error);
    }
  }
}

function buildShareData() {
  const result = state.result;
  const challenge = getSelectedChallenge();
  const category = getSelectedCategory();
  const baseUrl = new URL(window.location.href);
  baseUrl.searchParams.set('source', 'share');
  if (category && challenge) baseUrl.hash = `/${category.slug}/${challenge.slug}`;

  let text = `Csatlakozz te is az Együtt számít „${challenge?.title ?? 'egynapos'}” próbájához! Egy kis lépés sok emberrel együtt nagy hatássá adódik.`;
  if (result?.type === 'shower-water' && result.minutesAchieved > 0) {
    text = `Ma végigcsináltam az Együtt számít egynapos zuhanypróbáját. A beszámolóm alapján becslés szerint ${formatRangeHu(result.displayWaterMin, result.displayWaterMax, 'liter')} vízzel csökkentettem a használatomat. Csatlakozz te is egyetlen napra!`;
  } else if (result?.type === 'qualitative' && result.completionRate > 0) {
    text = `Ma kipróbáltam az Együtt számít „${challenge.title}” egynapos kihívását. Nézd meg te is, melyik apró változtatás illik hozzád!`;
  }
  return { title: 'Együtt számít – egynapos próba', text, url: baseUrl.toString() };
}

function showNextStep() {
  renderNextStepScreen(false);
  setPhase('next-step');
}

function startThreeDayChallenge() {
  state.phase = 'three-day-active';
  state.durationDays = 3;
  state.startedAt = new Date().toISOString();
  saveState();
  renderNextStepScreen(true);
}

function renderNextStepScreen(isThreeDayActive) {
  const result = state.result;
  const challenge = getSelectedChallenge();
  if (isThreeDayActive) {
    elements.nextStepSummary.textContent = `A „${challenge?.title ?? 'kiválasztott'}” háromnapos próbát elmentettük ezen az eszközön. A következő változatban napi visszajelzéssel követheted majd.`;
    elements.acceptThreeDays.classList.add('d-none');
    return;
  }
  elements.acceptThreeDays.classList.remove('d-none');
  const succeeded = result?.type === 'shower-water' ? result.minutesAchieved > 0 : result?.completionRate > 0;
  elements.nextStepSummary.textContent = succeeded
    ? 'Most már láttad, mit jelenthet egyetlen nap. Ugyanezt a kis lépést három napig folytatva a tapasztalatod is pontosabb lesz.'
    : 'A következő próbát három napos időszakban is elindíthatod, de nyugodtan maradhatsz még az egynapos lépésnél.';
}

function restoreView() {
  if (!state.phase) return restoreRouteFromHash();
  const category = getSelectedCategory();
  const challenge = getSelectedChallenge();

  if (state.phase === 'category' && category) {
    renderCategoryScreen(category);
  } else if (state.phase === 'questionnaire' && category && challenge) {
    renderQuestionnaire(challenge, category);
  } else if (state.phase === 'challenge' && challenge) {
    renderChallengeScreen();
  } else if (state.phase === 'active' && challenge) {
    renderActiveScreen();
  } else if (state.phase === 'checkin' && challenge) {
    renderCheckinOptions();
  } else if (state.phase === 'result' && state.result) {
    renderResultScreen();
  } else if (state.phase === 'invite' && state.result) {
    renderInviteScreen();
  } else if (state.phase === 'next-step') {
    renderNextStepScreen(false);
  } else if (state.phase === 'three-day-active') {
    renderNextStepScreen(true);
    state.phase = 'next-step';
  } else {
    return showHome({ replaceHistory: true });
  }

  showScreen(state.phase);
  updateSidebar(category?.id ?? null);
}

function restoreRouteFromHash() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (!parts.length) return showHome({ replaceHistory: true });
  const category = categories.find((item) => item.slug === parts[0] && item.status === 'active');
  if (!category) return showHome({ replaceHistory: true });
  if (!parts[1]) return selectCategory(category.id, { replaceHistory: true });

  const challenge = challenges.find((item) => item.categoryId === category.id && item.slug === parts[1] && item.status === 'active');
  if (!challenge) return selectCategory(category.id, { replaceHistory: true });

  state = { selectedCategoryId: category.id, selectedChallengeId: challenge.id, phase: 'questionnaire', answers: {} };
  saveState();
  renderQuestionnaire(challenge, category);
  showScreen('questionnaire');
  updateSidebar(category.id);
}

function showSelectedCategory() {
  const category = getSelectedCategory();
  category ? selectCategory(category.id, { replaceHistory: true }) : showHome();
}

function showHome({ replaceHistory = false } = {}) {
  state = {};
  saveState();
  setLocationHash('/', replaceHistory);
  showScreen('intro', { focusHeading: true });
  updateSidebar(null);
}

function setPhase(phase) {
  state.phase = phase;
  saveState();
  showScreen(phase, { focusHeading: true });
}

function showScreen(screenId, { focusHeading = false } = {}) {
  SCREEN_IDS.forEach((id) => $(`#screen-${id}`)?.classList.toggle('d-none', id !== screenId));
  const progress = { intro: 5, category: 15, questionnaire: 30, challenge: 45, active: 58, checkin: 68, result: 80, invite: 92, 'next-step': 100 }[screenId] ?? 5;
  const label = {
    intro: 'Válassz egy területet', category: 'Válassz egy próbát', questionnaire: 'Igazítsuk hozzád',
    challenge: 'Nézd át a vállalást', active: 'A próba elindult', checkin: 'Mondd el, hogyan sikerült',
    result: 'Nézd meg az eredményt', invite: 'Oszd meg a próbát', 'next-step': 'Válassz folytatást',
  }[screenId] ?? 'Együtt számít';

  [elements.appProgress, elements.mobileProgress].forEach((bar) => {
    if (!bar) return;
    bar.style.width = `${progress}%`;
    bar.setAttribute('aria-valuenow', String(progress));
  });
  elements.progressLabel.textContent = label;
  if (focusHeading) $(`#screen-${screenId} h1, #screen-${screenId} h2`)?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setChallengeVisual(element, challenge) {
  renderChallengeDetailImage(element, challenge);
}

function getSelectedCategory() {
  return categories.find((item) => item.id === state.selectedCategoryId) ?? null;
}

function getSelectedChallenge() {
  return challenges.find((item) => item.id === state.selectedChallengeId) ?? null;
}

function updateSidebar(categoryId) {
  $$('[data-show-home]').forEach((item) => item.classList.toggle('active', !categoryId));
  $$('[data-category-nav]').forEach((item) => item.classList.toggle('active', item.dataset.categoryNav === categoryId));
}

function setLocationHash(path, replaceHistory = false) {
  history[replaceHistory ? 'replaceState' : 'pushState']({}, '', path === '/' ? '#' : `#${path}`);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function resetApp() {
  localStorage.removeItem(STORAGE_KEY);
  history.replaceState({}, '', '#');
  window.location.reload();
}

function showError(message) {
  elements.appError.textContent = message;
  elements.appError.classList.remove('d-none');
}

function hideError() {
  elements.appError.classList.add('d-none');
  elements.appError.textContent = '';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}