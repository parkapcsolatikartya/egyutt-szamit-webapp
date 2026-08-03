import {
  estimateDrinkingWaterPersonDays,
  estimateReducedShowerWater,
  formatRangeHu,
  roundRange,
} from './calculator.js';

const STORAGE_KEY = 'egyutt-szamit-v0-state';
const SCREEN_IDS = [
  'intro',
  'questionnaire',
  'challenge',
  'active',
  'checkin',
  'result',
  'invite',
  'next-step',
];

let assumptions;
let questions;
let state = loadState();

const elements = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  cacheElements();
  bindStaticEvents();

  try {
    [assumptions, questions] = await Promise.all([
      loadJson('./data/assumptions.json'),
      loadJson('./data/questions.json'),
    ]);
    renderQuestionnaire(questions.questions);
    restoreView();
  } catch (error) {
    showError('A prototípus adatai nem tölthetők be. Indítsd az oldalt helyi webszerverről, majd próbáld újra.');
    console.error(error);
  }
}

function cacheElements() {
  elements.progress = document.querySelector('#app-progress');
  elements.error = document.querySelector('#app-error');
  elements.questionFields = document.querySelector('#question-fields');
  elements.questionForm = document.querySelector('#question-form');
  elements.challengeTitle = document.querySelector('#challenge-title');
  elements.challengeText = document.querySelector('#challenge-text');
  elements.challengeEstimate = document.querySelector('#challenge-estimate');
  elements.activeText = document.querySelector('#active-text');
  elements.checkinSelect = document.querySelector('#minutes-achieved');
  elements.resultHeading = document.querySelector('#result-heading');
  elements.resultWater = document.querySelector('#result-water');
  elements.resultEquivalent = document.querySelector('#result-equivalent');
  elements.resultNote = document.querySelector('#result-note');
  elements.inviteSummary = document.querySelector('#invite-summary');
  elements.shareFeedback = document.querySelector('#share-feedback');
  elements.nextStepSummary = document.querySelector('#next-step-summary');
}

function bindStaticEvents() {
  document.querySelector('#start-button').addEventListener('click', () => {
    state.phase = 'questionnaire';
    saveState();
    showScreen('questionnaire');
  });

  elements.questionForm.addEventListener('submit', handleQuestionnaireSubmit);

  document.querySelector('#accept-challenge').addEventListener('click', () => {
    state.phase = 'active';
    state.startedAt = new Date().toISOString();
    saveState();
    renderActiveScreen();
    showScreen('active');
  });

  document.querySelector('#checkin-button').addEventListener('click', () => {
    state.phase = 'checkin';
    saveState();
    renderCheckinOptions();
    showScreen('checkin');
  });

  document.querySelector('#checkin-form').addEventListener('submit', handleCheckinSubmit);

  document.querySelector('#result-continue').addEventListener('click', () => {
    state.phase = 'invite';
    saveState();
    renderInviteScreen();
    showScreen('invite');
  });

  document.querySelector('#share-button').addEventListener('click', shareResult);
  document.querySelector('#skip-share').addEventListener('click', showNextStep);

  document.querySelector('#accept-three-days').addEventListener('click', () => {
    state.phase = 'three-day-active';
    state.durationDays = 3;
    state.startedAt = new Date().toISOString();
    saveState();
    elements.nextStepSummary.textContent = 'A háromnapos kihívást elmentettük ezen az eszközön. A következő változatban napi visszajelzéssel követheted majd.';
    document.querySelector('#accept-three-days').classList.add('d-none');
  });

  document.querySelectorAll('[data-reset-app]').forEach((button) => {
    button.addEventListener('click', resetApp);
  });
}

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function renderQuestionnaire(questionList) {
  elements.questionFields.replaceChildren();

  questionList.forEach((question) => {
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

    if (question.type === 'number') {
      fieldset.append(createNumberQuestion(question));
    } else if (question.type === 'radio') {
      fieldset.append(createRadioQuestion(question));
    }

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

  const data = new FormData(elements.questionForm);
  const duration = Number(data.get('shower_duration_minutes'));
  const waterSource = String(data.get('water_source') || 'unknown');

  if (!Number.isFinite(duration) || duration < 3 || duration > 30) {
    showError('Adj meg 3 és 30 perc közötti zuhanyzási időt.');
    return;
  }

  const targetMinutes = duration >= assumptions.challenge.shortShowerThresholdMinutes
    ? assumptions.challenge.defaultReductionMinutes
    : assumptions.challenge.shortShowerReductionMinutes;

  state.answers = {
    shower_duration_minutes: duration,
    water_source: waterSource,
  };
  state.challenge = {
    id: 'shorter-shower',
    targetMinutes,
    modelVersion: assumptions.modelVersion,
  };
  state.phase = 'challenge';
  saveState();
  renderChallengeScreen();
  showScreen('challenge');
}

function renderChallengeScreen() {
  const { targetMinutes } = state.challenge;
  const estimate = calculateWaterResult(targetMinutes);
  const rounded = roundRange(estimate.rawMinLiters, estimate.rawMaxLiters, 0);

  elements.challengeTitle.textContent = 'A mai apró lépésed';
  elements.challengeText.textContent = `Ma próbáld meg körülbelül ${targetMinutes} perccel rövidebbre venni a zuhanyzásodat. A tisztálkodásból nem kell kihagynod semmit: csak arra figyelj, hogy a szükségesnél ne folyjon tovább a víz.`;
  elements.challengeEstimate.textContent = `Ha sikerül, becslésünk szerint körülbelül ${formatRangeHu(rounded.min, rounded.max, 'liter')} vízzel csökkentheted a mai használatodat.`;
}

function renderActiveScreen() {
  const targetMinutes = state.challenge?.targetMinutes ?? 1;
  elements.activeText.textContent = `A mai cél: körülbelül ${targetMinutes} perccel rövidebb zuhanyzás. Amikor már kipróbáltad, térj vissza és mondd el, nagyjából mennyivel lett rövidebb.`;
}

function renderCheckinOptions() {
  const target = state.challenge?.targetMinutes ?? 1;
  const options = [
    { value: 0, label: 'Ma nem sikerült' },
    { value: 0.5, label: 'Körülbelül fél perccel lett rövidebb' },
    { value: 1, label: 'Körülbelül 1 perccel lett rövidebb' },
  ];

  if (target >= 2) {
    options.push(
      { value: 1.5, label: 'Körülbelül másfél perccel lett rövidebb' },
      { value: 2, label: 'Körülbelül 2 perccel vagy többel lett rövidebb' },
    );
  }

  elements.checkinSelect.replaceChildren();
  options.forEach((option) => {
    const element = document.createElement('option');
    element.value = String(option.value);
    element.textContent = option.label;
    elements.checkinSelect.append(element);
  });
}

function handleCheckinSubmit(event) {
  event.preventDefault();
  const minutesAchieved = Number(elements.checkinSelect.value);

  if (!Number.isFinite(minutesAchieved) || minutesAchieved < 0) {
    showError('Válassz egy hozzávetőleges eredményt.');
    return;
  }

  state.checkin = {
    completedAt: new Date().toISOString(),
    minutesAchieved,
  };
  state.result = calculateResult(minutesAchieved);
  state.phase = 'result';
  saveState();
  renderResultScreen();
  showScreen('result');
}

function calculateWaterResult(minutesReduced) {
  return estimateReducedShowerWater({
    minutesReduced,
    flowRateMinLpm: assumptions.showerFlowRateLpm.min,
    flowRateMaxLpm: assumptions.showerFlowRateLpm.max,
  });
}

function calculateResult(minutesAchieved) {
  if (minutesAchieved === 0) {
    return {
      minutesAchieved: 0,
      displayWaterMin: 0,
      displayWaterMax: 0,
      displayPersonDaysMin: 0,
      displayPersonDaysMax: 0,
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
    minutesAchieved,
    displayWaterMin: waterRange.min,
    displayWaterMax: waterRange.max,
    displayPersonDaysMin: personDayRange.min,
    displayPersonDaysMax: personDayRange.max,
    modelVersion: water.modelVersion,
  };
}

function renderResultScreen() {
  const result = state.result;
  const mainsWater = state.answers?.water_source !== 'other';

  if (!result || result.minutesAchieved === 0) {
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

  elements.resultNote.textContent = 'Gyors becslés átlagos zuhany-vízhozam alapján. A kevesebbet használt víz nem kerül automatikusan más emberekhez.';
}

function renderInviteScreen() {
  const result = state.result;

  if (!result || result.minutesAchieved === 0) {
    elements.inviteSummary.textContent = 'Meghívhatsz valakit ugyanebbe az egynapos kihívásba akkor is, ha neked ma még nem sikerült. Egy új próbálkozás is értékes.';
    return;
  }

  elements.inviteSummary.textContent = `Mutasd meg a mai eredményedet, és hívj meg valakit, hogy egyetlen napra ő is kipróbálja. A te becsült eredményed: ${formatRangeHu(result.displayWaterMin, result.displayWaterMax, 'liter')}.`;
}

async function shareResult() {
  const shareData = buildShareData();
  elements.shareFeedback.textContent = '';

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      elements.shareFeedback.textContent = 'A megosztási lehetőség megnyílt.';
      showNextStep();
      return;
    }

    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    elements.shareFeedback.textContent = 'A meghívó szöveget és a hivatkozást a vágólapra másoltuk.';
    showNextStep();
  } catch (error) {
    if (error?.name === 'AbortError') {
      elements.shareFeedback.textContent = 'A megosztást most megszakítottad.';
      return;
    }

    elements.shareFeedback.textContent = 'A megosztás nem sikerült. Másold ki kézzel az oldal hivatkozását.';
    console.error(error);
  }
}

function buildShareData() {
  const result = state.result;
  const baseUrl = new URL(window.location.href);
  baseUrl.searchParams.set('source', 'share');
  baseUrl.searchParams.set('challenge', 'shorter-shower');

  let text = 'Csatlakozz te is az Együtt számít egynapos zuhanykihívásához! Egy kis lépés sok emberrel együtt nagy hatássá adódik.';

  if (result?.minutesAchieved > 0) {
    text = `Ma végigcsináltam az Együtt számít egynapos kihívását. A beszámolóm alapján becslés szerint ${formatRangeHu(result.displayWaterMin, result.displayWaterMax, 'liter')} vízzel csökkentettem a használatomat. Csatlakozz te is egyetlen napra!`;
  }

  return {
    title: 'Együtt számít – egynapos kihívás',
    text,
    url: baseUrl.toString(),
  };
}

function showNextStep() {
  state.phase = 'next-step';
  saveState();

  const result = state.result;
  elements.nextStepSummary.textContent = result?.minutesAchieved > 0
    ? 'Most már láttad, mit jelenthet egyetlen nap. Ugyanezt a kis lépést három napig folytatva az eredmény is összeadódik.'
    : 'A következő próbát három napos időszakban is elindíthatod, de nyugodtan maradhatsz még az egynapos lépésnél.';

  showScreen('next-step');
}

function restoreView() {
  if (!state.phase) {
    showScreen('intro');
    return;
  }

  switch (state.phase) {
    case 'questionnaire':
      showScreen('questionnaire');
      break;
    case 'challenge':
      renderChallengeScreen();
      showScreen('challenge');
      break;
    case 'active':
      renderActiveScreen();
      showScreen('active');
      break;
    case 'checkin':
      renderCheckinOptions();
      showScreen('checkin');
      break;
    case 'result':
      renderResultScreen();
      showScreen('result');
      break;
    case 'invite':
      renderInviteScreen();
      showScreen('invite');
      break;
    case 'next-step':
    case 'three-day-active':
      showNextStep();
      if (state.phase === 'three-day-active') {
        elements.nextStepSummary.textContent = 'A háromnapos kihívás ezen az eszközön el van mentve.';
        document.querySelector('#accept-three-days').classList.add('d-none');
      }
      break;
    default:
      showScreen('intro');
  }
}

function showScreen(screenId) {
  SCREEN_IDS.forEach((id) => {
    const screen = document.querySelector(`#screen-${id}`);
    screen?.classList.toggle('d-none', id !== screenId);
  });

  const progressByScreen = {
    intro: 5,
    questionnaire: 20,
    challenge: 40,
    active: 55,
    checkin: 65,
    result: 78,
    invite: 90,
    'next-step': 100,
  };
  const progress = progressByScreen[screenId] ?? 5;
  elements.progress.style.width = `${progress}%`;
  elements.progress.setAttribute('aria-valuenow', String(progress));

  const heading = document.querySelector(`#screen-${screenId} h1, #screen-${screenId} h2`);
  heading?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  state = {};
  window.location.reload();
}

function showError(message) {
  elements.error.textContent = message;
  elements.error.classList.remove('d-none');
}

function hideError() {
  elements.error.classList.add('d-none');
  elements.error.textContent = '';
}
