import './home-layout.js';

const CATEGORY_IMAGES = {
  water: {
    src: './assets/images/ikon-viz.webp',
    width: 240,
    height: 240,
  },
  electricity: {
    src: './assets/images/ikon-aram.webp',
    width: 240,
    height: 240,
  },
  gas: {
    src: './assets/images/ikon-foldgaz.webp',
    width: 240,
    height: 240,
  },
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

export function getCategoryImage(visualKey) {
  return CATEGORY_IMAGES[visualKey];
}

export function getChallengeImage(visualKey) {
  return CHALLENGE_IMAGES[visualKey];
}

export function renderCategoryHeadingImage(root, category) {
  const asset = getCategoryImage(category.visualKey);
  if (!asset) return;

  const image = document.createElement('img');
  image.src = asset.src;
  image.alt = category.imageAlt ?? '';
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

export function renderChallengeDetailImage(root, challenge) {
  const asset = getChallengeImage(challenge.visualKey);
  if (!asset) return;

  const image = document.createElement('img');
  image.src = asset.src;
  image.alt = challenge.imageAlt ?? '';
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
