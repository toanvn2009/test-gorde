class PredictiveSearch extends HTMLElement {
  constructor(){
    super();
    this.init();
  }
  init(){
    this.target = this.closest("action-search");
    if (!this.target) return;
    this.input = this.target.querySelector('input[type="search"]');
    this.form = this.target.querySelector("form#search_mini_form");
    this.predictiveSearchResults = this.target.querySelector('.predictive-search');
    this.searchKeyword = this.target.querySelector('.search-keyword');
    this.recommendSearch = this.target.querySelector('.recommend-search');
    this.input?.addEventListener("input", this.debounce((event) => {
      this.onInput(event);
    }, 300).bind(this));
  }

  getQuery() {
    return this.input.value.trim();
  }

  onInput(){
    const searchTerm = this.input.value.trim();
    if (!searchTerm.length) {
      this.close();
      return;
    }
    this.getSearchResults(searchTerm);
    this.form.classList.add('loading');
  }

  getSearchResults(searchTerm) {
    const query =`${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search&resources[type]=product,page,article,query`; 
    fetch(query)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search')?.innerHTML;
        if (this.predictiveSearchResults) {
          this.predictiveSearchResults.innerHTML = resultsMarkup;
        }
        this.form.classList.remove('loading');
        if (this.target.querySelectorAll(".more-result-link").length > 0) {
          this.target.querySelectorAll(".more-result-link").forEach(e => {
            e.href = `search?q=${encodeURIComponent(searchTerm)}&options%5Bprefix%5D=last`;
          });
        }
        this.open();
        this.lazyloadImage();
      })
      .catch((error) => {
        this.form.classList.remove('loading');
        this.close();
        throw error;
      });
  }
  close() {
    this.predictiveSearchResults?.classList.add("d-none");
    this.recommendSearch?.classList.remove("d-none");
    this.searchKeyword?.classList.remove("d-none");
    if (!this.getQuery().length) {
      trapFocus(this.form);
    }
  }

  open() {
    trapFocus(this.form);
    this.predictiveSearchResults?.classList.remove("d-none");
    this.recommendSearch?.classList.add("d-none");
    this.searchKeyword?.classList.add("d-none");
  }

  lazyloadImage() {
    if (this.querySelectorAll(".loading-animation").length != 0) {
      this.querySelectorAll(".loading-animation").forEach((e, index) => {
        var img = new Image();
        img.src = e.getAttribute("src");
        img.addEventListener('load', function() {
          setTimeout(() => {
            e.classList.add("loaded-animation");
            e.classList.remove("loading-animation");
          }, index*100);
        });
      });
    }
  }
  

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
customElements.define('predictive-search', PredictiveSearch);