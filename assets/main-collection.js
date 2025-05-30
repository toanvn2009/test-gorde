class Loadmore extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init(){
    const _this = this;
    this.button = this.querySelector("button");
    if (!this.button) return;
    this.button.addEventListener("click", function() {
      _this.scanData();
    });
  }
  scanData() {
    const _this = this;
    const currentUrl = window.location.href;
    const param = window.location.search;
    let url = this.dataset.url;
    if (!url) return;
    if (param.length > 0) {
      url = currentUrl+url.replaceAll("?", "&");
    }
    this.classList.add("loading");
    fetch(url)
      .then(response => response.text())
      .then(text => {
        const html = parser.parseFromString(text, "text/html");
        if (!this.closest(".section-main-collection")) return;
        if (!this.closest(".section-main-collection").querySelector(".ajax-loadmore")) return;
        if (!html.querySelector(".section-main-collection .ajax-loadmore")) return;
        const animations = this.closest(".section-main-collection").querySelectorAll(".scroll-trigger");
        if (animations.length !== 0) {
          animations.forEach(e => {
            e.classList.remove("scroll-trigger");
          });
        }
        this.closest(".section-main-collection").querySelector(".ajax-loadmore").innerHTML += html.querySelector(".section-main-collection .ajax-loadmore").innerHTML;
        if (this.closest(".section-main-collection").querySelector(".ajax-loadmore .counting_product")) {
          this.closest(".section-main-collection").querySelector(".ajax-loadmore .counting_product").remove();
        }
        if (!html.querySelector(".section-main-collection .ajax-loadmore .counting_product")) return;
        if (!this.querySelector(".counting_product")) return;
        this.querySelector(".counting_product").innerHTML = html.querySelector(".section-main-collection .ajax-loadmore .counting_product").innerHTML;
      })
      .finally(() => {
        initLazyloadItem();
        if (window.SPR) {
          window.SPR.registerCallbacks();
          window.SPR.initRatingHandler();
          window.SPR.initDomEls();
          window.SPR.loadProducts();
          window.SPR.loadBadges();
        }
        _this.updateUrl(Number(this.dataset.url.replace("?page=","")));
        this.classList.remove("loading");
      })
      .catch(e => {
        console.error(e);
      });
  }
  updateUrl(e) {
    const all = this.dataset.allProducts;
    const limit = this.dataset.limit;
    if (all && limit && all > 0 ) {
      const times = ~~(all/limit);
      const remainder = all%limit;
      let pages = times;
      if (remainder > 0) {
        pages = times + 1;
      }
      if (e<pages) {
        this.dataset.url = "?page="+(++e);
      }else{
        const btn = this.querySelector("button");
        if (btn) {
          btn.remove();
        }
      }
    }
  }
}
customElements.define("loadmore-button-collection", Loadmore);

if (!customElements.get('loadmore-infinity')) {
  customElements.define('loadmore-infinity', class LoadInfinity extends Loadmore {
    constructor() {
      super();
    }
    init(){
      this.getHeightBtn();
    }
    getHeightBtn() {
      const _this = this;
      this.btn = this.querySelector("button");
      if (!this.querySelector("button")) return;
      var isVisible = false;
      window.addEventListener('scroll', function() {
        var buttonRect = _this.btn.getBoundingClientRect();
        var viewportHeight = window.innerHeight;
        if (!isVisible && buttonRect.top<=viewportHeight) {
          isVisible = true;
          _this.scanData();
      } else if (isVisible && buttonRect.top>viewportHeight) {
          isVisible = false;
      }
      });
  }
  });
}