import './home-layout.js';

const CATEGORY_IMAGES = {
  water: './assets/images/ikon-viz.webp',
  electricity: './assets/images/ikon-aram.webp',
  gas: './assets/images/ikon-foldgaz.webp',
};

const CHALLENGE_IMAGES = {
  'shorter-shower': {
    src: './assets/images/viz-zuhanyzas.webp',
    width: 280,
    height: 187,
  },
  dishwashing: {
    src: './assets/images/viz-mosogatas.webp',
    width: 280,
    height: 210,
  },
  'full-washer': {
    src: './assets/images/viz-mosas.webp',
    width: 280,
    height: 187,
  },
  'task-lighting': {
    src: './assets/images/aram-vilagitas.webp',
    width: 280,
    height: 210,
    imageClasses: 'img-fluid w-100 d-block p-3 p-md-4',
  },
  'gentle-cooling': {
    src: './assets/images/aram-legkondi-v2.webp',
    width: 360,
    height: 240,
    imageClasses: 'img-fluid w-100 d-block p-3 p-md-4',
  },
};

function replaceCategoryVisuals(root) {
  root.querySelectorAll('.category-visual').forEach((placeholder) => {
    const visualClass = [...placeholder.classList].find((className) => className.startsWith('category-visual-'));
    const visualKey = visualClass?.replace('category-visual-', '');
    const src = CATEGORY_IMAGES[visualKey];
    if (!src) return;

    const image = document.createElement('img');
    image.src = src;
    image.alt = placeholder.getAttribute('aria-label') ?? '';
    image.width = 240;
    image.height = 240;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.className = 'img-fluid mx-auto d-block rounded-4';

    placeholder.replaceWith(image);
  });
}

function replaceCategoryHeadingVisual(root) {
  const visualClass = [...root.classList].find((className) => className.startsWith('category-heading-visual-'));
  const visualKey = visualClass?.replace('category-heading-visual-', '');
  const src = CATEGORY_IMAGES[visualKey];
  if (!src) return;

  const image = document.createElement('img');
  image.src = src;
  image.alt = root.getAttribute('aria-label') ?? '';
  image.width = 144;
  image.height = 144;
  image.loading = 'eager';
  image.decoding = 'async';
  image.className = 'img-fluid d-block rounded-4';

  root.className = 'd-flex align-items-center justify-content-center flex-shrink-0 p-2 p-md-3';
  root.removeAttribute('role');
  root.removeAttribute('aria-label');
  root.replaceChildren(image);
}

function replaceChallengeVisuals(root) {
  root.querySelectorAll('.challenge-visual').forEach((placeholder) => {
    const visualClass = [...placeholder.classList].find((className) => className.startsWith('challenge-visual-'));
    const visualKey = visualClass?.replace('challenge-visual-', '');
    const asset = CHALLENGE_IMAGES[visualKey];
    if (!asset) return;

    const image = document.createElement('img');
    image.src = asset.src;
    image.alt = placeholder.getAttribute('aria-label') ?? '';
    image.width = asset.width;
    image.height = asset.height;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.className = asset.imageClasses ?? 'img-fluid w-100 d-block';

    placeholder.replaceWith(image);
  });
}

function replaceChallengeDetailVisual(root) {
  const visualClass = [...root.classList].find((className) => className.startsWith('challenge-detail-visual-'));
  const visualKey = visualClass?.replace('challenge-detail-visual-', '');
  const asset = CHALLENGE_IMAGES[visualKey];
  if (!asset) return;

  const image = document.createElement('img');
  image.src = asset.src;
  image.alt = root.getAttribute('aria-label') ?? '';
  image.width = asset.width;
  image.height = asset.height;
  image.loading = 'eager';
  image.decoding = 'async';
  image.className = 'img-fluid d-block rounded-4';

  root.className = 'd-flex align-items-center justify-content-center p-4 p-md-5 border-bottom bg-white';
  root.removeAttribute('role');
  root.removeAttribute('aria-label');
  root.replaceChildren(image);
}

document.addEventListener('DOMContentLoaded', () => {
  const categoryList = document.querySelector('#category-list');
  const categoryHeadingVisual = document.querySelector('#category-heading-visual');
  const challengeList = document.querySelector('#challenge-list');
  const challengeDetailVisuals = [
    document.querySelector('#questionnaire-visual'),
    document.querySelector('#challenge-detail-visual'),
  ].filter(Boolean);

  if (categoryList) {
    replaceCategoryVisuals(categoryList);

    const categoryObserver = new MutationObserver(() => replaceCategoryVisuals(categoryList));
    categoryObserver.observe(categoryList, { childList: true, subtree: true });
  }

  if (categoryHeadingVisual) {
    replaceCategoryHeadingVisual(categoryHeadingVisual);

    const categoryHeadingObserver = new MutationObserver(() => replaceCategoryHeadingVisual(categoryHeadingVisual));
    categoryHeadingObserver.observe(categoryHeadingVisual, { attributes: true, attributeFilter: ['class'] });
  }

  if (challengeList) {
    replaceChallengeVisuals(challengeList);

    const challengeObserver = new MutationObserver(() => replaceChallengeVisuals(challengeList));
    challengeObserver.observe(challengeList, { childList: true, subtree: true });
  }

  challengeDetailVisuals.forEach((detailVisual) => {
    replaceChallengeDetailVisual(detailVisual);

    const detailObserver = new MutationObserver(() => replaceChallengeDetailVisual(detailVisual));
    detailObserver.observe(detailVisual, { attributes: true, attributeFilter: ['class'] });
  });
});
