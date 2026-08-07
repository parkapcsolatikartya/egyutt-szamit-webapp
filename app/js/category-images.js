const CATEGORY_IMAGES = {
  water: './assets/images/ikon-viz.webp',
  electricity: './assets/images/ikon-aram.webp',
  gas: './assets/images/ikon-foldgaz.webp',
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

document.addEventListener('DOMContentLoaded', () => {
  const categoryList = document.querySelector('#category-list');
  if (!categoryList) return;

  replaceCategoryVisuals(categoryList);

  const observer = new MutationObserver(() => replaceCategoryVisuals(categoryList));
  observer.observe(categoryList, { childList: true, subtree: true });
});
