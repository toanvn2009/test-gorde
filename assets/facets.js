class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));
    if(this.id == "main-collection-filters-mobile"){
      setTimeout(() => {
        this.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.onKeyUpEscape())
      });
    };
  }

  onKeyUpEscape() {
    removeTrapFocus(document.querySelector("[data-item='overlay-filter']"));
    rootAction.remove();
    this.classList.remove("active");
    this.removeAttribute("open");
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    document.getElementById('ProductContainer').querySelector('.collection').classList.add('loading');
    if (countContainer) {
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add('loading');
    }
    const filterCollection = document.getElementById('main-collection-filters');
    const filterCollectionMobile = document.getElementById('main-collection-filters-mobile');
    const filterSearch = document.getElementById('main-search-filters');
    if (filterCollection) {
      const filterCollectionVertical = filterCollection.closest(".facets-vertical");
      if (filterCollectionVertical) {
        if (window.innerWidth > 1024) {
          filterCollectionVertical.classList.add('loading',"start");
        }
      }else{
        if (window.innerWidth > 1024) {
          filterCollection.classList.add('loading',"start");
        }
      }
    }
    if (filterCollectionMobile) {
      filterCollectionMobile.classList.add('loading',"start");
    }
    if (filterSearch) {
      if (window.innerWidth > 1024) {
        filterSearch.classList.add('loading',"start");
      }
    }
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;
      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductContainer(html);
        FacetFiltersForm.renderProductCount(html);
        if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
      })
      .finally(() => {
        initLazyloadItem();
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductContainer(html);
    FacetFiltersForm.renderProductCount(html);
    if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
  }

  static renderProductContainer(html) {
    initLazyloadItem();
    document.getElementById('ProductContainer').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductContainer').innerHTML;
    const htmlRender = new DOMParser().parseFromString(html, 'text/html');
    const collectionEmpty = htmlRender.querySelector('#ProductContainer .collection--empty');
    if (collectionEmpty) {
      rootAction.remove();
      const elementsToHide = document.querySelectorAll('.filter-product details, .filter-product .filter-count');
      elementsToHide.forEach(element => {
        element.classList.add('hidden');
      });
    } else {
      const elementsToHide = document.querySelectorAll('.filter-product details, .filter-product .filter-count');
      elementsToHide.forEach(element => {
        element.classList.remove('hidden');
      });
    }
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCountDesktop')?.innerHTML;
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    if (container) {
      if (count) container.innerHTML = count;
      container.classList.remove('loading');
    }
    if (containerDesktop) {
      if (count) containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }
    const filterCollection = document.getElementById('main-collection-filters');
    const filterCollectionMobile = document.getElementById('main-collection-filters-mobile');
    const filterSearch = document.getElementById('main-search-filters');

    if (filterCollection) {
      const filterCollectionVertical = filterCollection.closest(".facets-vertical");
      if (filterCollectionVertical) {
        if (window.innerWidth > 1024) {
          filterCollectionVertical.classList.remove("loading","start");
          filterCollectionVertical.classList.add("loaded", "finished");
          setTimeout(() => {
            filterCollectionVertical.classList.remove("loaded", "finished");
          }, 500);
        }
      }else{
        if (window.innerWidth > 1024) {
          filterCollection.classList.remove("loading","start");
          filterCollection.classList.add("loaded", "finished");
          setTimeout(() => {
            filterCollection.classList.remove("loaded", "finished");
          }, 500);
        }
      }
    }
    if (filterCollectionMobile) {
      filterCollectionMobile.classList.remove("loading","start");
      filterCollectionMobile.classList.add("loaded", "finished");
      setTimeout(() => {
        filterCollectionMobile.classList.remove("loaded", "finished");
      }, 500);
    }
    if (filterSearch) {
      if (window.innerWidth > 1024) {
        filterSearch.classList.remove("loading","start");
        filterSearch.classList.add("loaded", "finished");
        setTimeout(() => {
          filterSearch.classList.remove("loaded", "finished");
        }, 500);
      }
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElements = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter((element) => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);
    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
    actionFilter();
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    const targetElementAccessibility = target.querySelector('.facets__summary');
    const sourceElementAccessibility = source.querySelector('.facets__summary');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector('.facets__summary').outerHTML = source.querySelector('.facets__summary').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'));
      this.onSubmitForm(searchParams, event);
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            const noJsElements = document.querySelectorAll('.no-js-list');
            noJsElements.forEach((el) => el.remove());
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event);
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRangeDrag extends HTMLElement {
  constructor() {
    super();
    this.adjustToValidValues();
  }
  countPercentMin(value) {
    const rangemax = this.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let from = 0;
    if (value || rangemax !== 0) {
      from = (value/rangemax)*100;
    }
    this.style.setProperty("--range-from", from+'%');
    if (Number(from) > Number(this.getValue("--range-to", this))) {
      this.style.setProperty("--range-to", from+'%');
    }
  }
  countPercentMax(value) {
    const rangemax = this.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let to = 0;
    if (value || rangemax !== 0) {
      to = (value/rangemax)*100;
    }
    this.style.setProperty("--range-to", to+'%');
    if (Number(this.getValue("--range-from", this)) > Number(to)) {
      this.style.setProperty("--range-from", to+'%');
    }
  }
  getValue(value, priceDrag) {
    var computedStyle = getComputedStyle(priceDrag);
    var fromValue = computedStyle.getPropertyValue(value);
    return fromValue.replace("%","");
  }

  adjustToValidValues() {
    const _this = this;
    var inputRange = this.querySelectorAll('input');
    var inputNum = this.closest("action-filter")?.querySelectorAll('price-range input');
    var rangeInput = inputRange[0];
    var rangeInput2 = inputRange[1];
    var minInput = inputNum[0];
    var maxInput = inputNum[1];
    
    rangeInput.addEventListener('input', function() {
      minInput.value = rangeInput.value;
      if (parseInt(minInput.value) > parseInt(maxInput.value)) {
        maxInput.value = Number(minInput.value);
        rangeInput2.value = Number(minInput.value);
      }
      _this.countPercentMin(Number(rangeInput.value));
    });
    
    rangeInput2.addEventListener('input', function() {
      maxInput.value = parseInt(rangeInput2.max) == rangeInput2.value ? Number(rangeInput2.max).toFixed(2) : rangeInput2.value;
      if (parseInt(maxInput.value) < parseInt(minInput.value)) {
        minInput.value = Number(maxInput.value);
        rangeInput.value = Number(maxInput.value);
      }
      if (parseInt(rangeInput2.max) == rangeInput2.value) {
        _this.countPercentMax(Number(rangeInput2.max));
      }else {
        _this.countPercentMax(Number(rangeInput2.value));
      }
    });
  }
}
customElements.define('price-range-drag', PriceRangeDrag);

class PriceRange extends PriceRangeDrag {
  constructor() {
    super();
    this.adjustToValidValues();
    this.priceDrag = this.closest("action-filter").querySelector('price-range-drag');
  }
  countPercentMin(value) {
    if (!this.priceDrag) return;
    const rangemax = this.priceDrag.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let from = 0;
    if (value || rangemax !== 0) {
      from = (value/rangemax)*100;
    }
    this.priceDrag.style.setProperty("--range-from", from+'%');
    if (Number(from) > Number(this.getValue("--range-to", this.priceDrag))) {
      this.priceDrag.style.setProperty("--range-to", from+'%');
    }
  }
  countPercentMax(value) {
    if (!this.priceDrag) return;
    const rangemax = this.priceDrag.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let to = 0;
    if (value || rangemax !== 0) {
      to = (value/rangemax)*100;
    }
    this.priceDrag.style.setProperty("--range-to", to+'%');
    if (Number(this.getValue("--range-from",this.priceDrag)) > Number(to)) {
      this.priceDrag.style.setProperty("--range-from", to+'%');
    }
  }
  adjustToValidValues() {
    const _this = this;
    var inputNum = this.querySelectorAll('input');
    var inputRange = this.closest("action-filter")?.querySelectorAll('price-range-drag input');
    var rangeInput = inputRange[0];
    var rangeInput2 = inputRange[1];
    var minInput = inputNum[0];
    var maxInput = inputNum[1];
    
    minInput.addEventListener('input', function() {
      if (minInput.value < Number(minInput.min) || minInput.value == "") {
        minInput.value = maxInput.min;
      }
      if (maxInput.value == "") {
        if (minInput.value > Number(maxInput.max)) {
          minInput.value = maxInput.max;
        }
      }else{
        if (minInput.value > Number(maxInput.value)) {
          minInput.value = maxInput.value;
        }
      }
      if (minInput.value != "") {
        rangeInput.value = minInput.value;
        _this.countPercentMin(Number(minInput.value));
      }
    });
    
    maxInput.addEventListener('input', function() {
      if (maxInput.value > Number(maxInput.max)) {
        maxInput.value = maxInput.max;
      }
      if (minInput.value == "") {
        if (maxInput.value < Number(minInput.min)) {
          maxInput.value = minInput.min;
        }
      }else{
        if (maxInput.value < Number(minInput.value)) {
          maxInput.value = minInput.value;
        }
      }
      if (maxInput.value != "") {
        rangeInput2.value = maxInput.value > maxInput.max ? Number(maxInput.max).toFixed(2) : maxInput.value;
        _this.countPercentMax(Number(maxInput.value));
      }else{
        rangeInput2.value = Number(maxInput.max).toFixed(2);
        _this.countPercentMax(Number(maxInput.max));
      }
    });
  }
}
customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);

class FacetRemoveCanvas extends FacetRemove {
  constructor() {
    super();
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
    const canvas = this.closest(".bls__canvas");
    setTimeout(() => {
      if (canvas) {
        rootAction.remove();
        canvas.classList.remove("active");
        canvas.removeAttribute("open");
        const details_tag = canvas.closest("details");
        if (details_tag) {
          setTimeout(() => {
            details_tag.removeAttribute("open");
          }, 300);
        }
      }
    }, 1000);
    removeTrapFocus(document.querySelector("[data-item='overlay-filter']"));
  }
}

customElements.define('facet-remove-canvas', FacetRemoveCanvas);

class FacetApplyCanvas extends HTMLElement {
  constructor() {
    super();
    const _this = this;
    this.addEventListener('click', this.closeFilter.bind(this));
    this.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        _this.closeFilter.bind(_this)(event);
      }
    }.bind(_this), false);
  }

  closeFilter(event) {
    event.preventDefault();
    const canvas = this.closest(".bls__canvas");
    if (canvas) {
      rootAction.remove();
      canvas.classList.remove("active");
      canvas.removeAttribute("open");
      const details_tag = canvas.closest("details");
      if (details_tag) {
        setTimeout(() => {
          details_tag.removeAttribute("open");
        }, 300);
      }
      removeTrapFocus(document.querySelector("[data-item='overlay-filter']"));
    }
  }
}

customElements.define('facet-apply-canvas', FacetApplyCanvas);