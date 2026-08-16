function buildHomepage() {
  const intro = document.querySelector('#screen-intro');
  const category = document.querySelector('#screen-category');
  const categoryList = document.querySelector('#category-list');
  if (!intro || !categoryList) return;

  intro.classList.add('container-xl', 'px-0');
  category?.classList.add('container-xl', 'px-0');

  const hero = intro.querySelector('.app-hero-card');
  if (hero) {
    hero.className = 'py-3 py-lg-4 mb-4';
    hero.innerHTML = `
      <div class="py-2 py-lg-3">
        <p class="text-primary fw-semibold mb-2">Együtt számít</p>
        <h1 class="display-4 fw-semibold mb-3" tabindex="-1">Egy kis változás is számít!</h1>
        <p class="lead text-body-secondary mb-0 col-lg-9">Nem kell mindent egyszerre megváltoztatnod. Válassz egy hétköznapi területet, és nézd meg, milyen apró változtatást próbálhatnál ki.</p>
      </div>`;
  }

  if (!intro.querySelector('[data-home-category-heading]')) {
    const heading = document.createElement('div');
    heading.className = 'mb-4';
    heading.dataset.homeCategoryHeading = '';
    heading.innerHTML = '<h2 class="h3 mb-0">Mivel kezdenél?</h2>';
    categoryList.before(heading);
  }

  const trustBlock = categoryList.nextElementSibling;
  if (trustBlock) {
    trustBlock.className = 'border-top mt-5 pt-4';
    trustBlock.innerHTML = `
      <p class="small text-body-secondary mb-3">Regisztráció nélkül használható. A válaszaid ezen az eszközön maradnak. A becsléseket mindig egyértelműen megkülönböztetjük a mért adatoktól.</p>
      <div class="d-flex flex-wrap gap-3 gap-md-4 small text-body-secondary">
        <span class="d-inline-flex align-items-center"><i class="bi bi-person-x text-primary me-2" aria-hidden="true"></i>Nincs regisztráció</span>
        <span class="d-inline-flex align-items-center"><i class="bi bi-heart text-primary me-2" aria-hidden="true"></i>Nincs bűntudatkeltés</span>
        <span class="d-inline-flex align-items-center"><i class="bi bi-graph-up text-primary me-2" aria-hidden="true"></i>A becsléseket külön jelöljük</span>
      </div>`;
  }
}

function setupHomepageShell() {
  const intro = document.querySelector('#screen-intro');
  const category = document.querySelector('#screen-category');
  if (!intro || !category) return;

  const sidebar = document.querySelector('.app-sidebar');
  const topbarBrand = document.querySelector('.app-topbar .navbar-brand');
  const desktopProgress = document.querySelector('.topbar-progress-wrap');
  const mobileProgressShell = document.querySelector('.app-progress-mobile')?.closest('.d-md-none');
  const mainColumn = intro.closest('.col-12');
  const contextColumn = document.querySelector('.app-context-column')?.parentElement;

  const applyLayout = () => {
    const isIntro = !intro.classList.contains('d-none');
    const isCategory = !category.classList.contains('d-none');
    const isSelectionScreen = isIntro || isCategory;

    sidebar?.classList.toggle('d-lg-flex', !isSelectionScreen);
    topbarBrand?.classList.toggle('d-lg-none', !isSelectionScreen);
    desktopProgress?.classList.toggle('d-md-flex', !isSelectionScreen);
    mobileProgressShell?.classList.toggle('d-none', isSelectionScreen);
    mainColumn?.classList.toggle('col-xxl-8', !isSelectionScreen);
    contextColumn?.classList.toggle('d-none', isSelectionScreen);
  };

  applyLayout();

  const observer = new MutationObserver(applyLayout);
  observer.observe(intro, { attributes: true, attributeFilter: ['class'] });
  observer.observe(category, { attributes: true, attributeFilter: ['class'] });
}

function initHomepageLayout() {
  buildHomepage();
  setupHomepageShell();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomepageLayout, { once: true });
} else {
  initHomepageLayout();
}
