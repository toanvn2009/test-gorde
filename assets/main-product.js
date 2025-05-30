'use-strict';

class StickyAddCart extends Popup {
    constructor() {
      super();
      this.init();
    }
    init() {
        this.getHeightAddToCart();
        const btn_minimal = this.querySelector("minimal-button");
        if (btn_minimal) {
            btn_minimal.addEventListener("click", this.toggle.bind(this), false);
        }
    }
    getHeightAddToCart() {
        const _this = this;
        this.main = document.querySelector(".main-product-section");
        if (!this.main) return;
        const primaryBtn = this.main.querySelector(".product-sticky-show");
        const footer = document.querySelector(".product-sticky-hide");
        if (!primaryBtn) return;
        var isVisible = true;
        window.addEventListener('scroll', function() {
            var buttonRect = primaryBtn.getBoundingClientRect();
            var viewportHeight = window.innerHeight;
            if (footer) {
              var footerRect = footer.getBoundingClientRect();
              if (footerRect.top < window.innerHeight - 100) {
                _this.classList.remove("show-sticky-cart");
                isVisible = true;
              }else{
                if (!isVisible && buttonRect.top < viewportHeight && buttonRect.bottom > 0) {
                  isVisible = true;
                  _this.classList.remove("show-sticky-cart");
                } else if (isVisible && (buttonRect.bottom <= 0)) {
                  isVisible = false;
                  _this.classList.add("show-sticky-cart");
                }
              }
            }else{
              if (!isVisible && buttonRect.top < viewportHeight && buttonRect.bottom > 0) {
                isVisible = true;
                _this.classList.remove("show-sticky-cart");
              } else if (isVisible && (buttonRect.bottom <= 0)) {
                isVisible = false;
                _this.classList.add("show-sticky-cart");
              }
            }
        });
    }
    toggle(e) {
        const target = e.currentTarget;
        target.classList.toggle("opened");
        if (!target) return;
        const parent = target.closest("sticky-buy");
        if (!parent) return;
        const content = parent.querySelector(".expand-content");
        slideAnime({
            target: content,
            animeType: "slideToggle",
        });
    }
}
customElements.define("sticky-buy", StickyAddCart);

class GalleryGrid extends SlideSection {
  constructor() {
      super();
      this.init();
  }
  init() {
    this.onResize();
    setTimeout(() => {
      this.pauseMediaGrid();
      this.playMediaGrid();
    }, 300);

  }
  onResize() {
    const _this = this;
    let windowWidth = window.innerWidth;
    let isMobile = windowWidth <= 767;
    window.addEventListener("resize", function() {
      const newWindowWidth = window.innerWidth;
      const newIsMobile = newWindowWidth <= 767;
      if (newIsMobile !== isMobile) {
        windowWidth = newWindowWidth;
        isMobile = newIsMobile;
        _this.actionResize(isMobile);
        _this.pauseMediaGrid();
        _this.playMediaGrid();
      }
    });
    _this.actionResize(isMobile);

  }
  
  actionResize(isMobile) {
    const content = this.loadContent();
    const sl = document.createElement('div');
    const container = this.querySelector(".gallery-grid-js");
    container.innerHTML = "";
    if (content && container) {
      if (isMobile) {
        sl.classList.add("slide-container");
        container.classList.remove("tablet-2", "mb-1", "grid-cols", "gap-small", "row-as-column-gap");
        sl.innerHTML = content;
        container.appendChild(sl);
        this.initSlide();
        this.destroy();
        this.slider = null;
      } else {
        container.classList.add("tablet-2", "mb-1", "grid-cols", "gap-small", "row-as-column-gap");
        sl.innerHTML = content;
        container.innerHTML = sl.innerHTML;
      }
    }
  }
  loadContent() {
    const content = document.createElement('div');
    if (!this.dataset.variantSelected) {
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
    } else {
      this.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
      {
        const alt = image.dataset.alt;
        if (this.dataset.variantSelected == alt) {
          content.appendChild(image.cloneNode(true));
        }
      });
      if (content.querySelector(".slider-image")) {
        return content.innerHTML;
      } else {
        content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
      }
    }
    if (content.querySelector(".content-items")) {
      return content.querySelector(".content-items").innerHTML;
    }
  }
  pauseMediaGrid() {
    this.querySelectorAll(".slider-model, .slider-image").forEach(e => {
      e.addEventListener("click", () => {
        window.pauseAllMedia(this);
      })
    });
  }
  playMediaGrid() {
    const btnPlay = this.querySelectorAll(".overlay-btn");
    btnPlay.forEach(e => {
      e.addEventListener("click", () => {
        window.pauseAllMedia(this);
        const content = document.createElement('div');
        const itemContainer = e.closest(".slider-external-video") || e.closest(".slider-video");
        if (!itemContainer) return;
        content.appendChild(itemContainer.querySelector('template.video-template').content.firstElementChild.cloneNode(true));

        itemContainer.querySelector(".video-box").classList.remove("d-none");
        itemContainer.querySelector(".video-box").appendChild(content.querySelector('video, iframe'));
        e.remove();
      })
    })
  }
}
customElements.define("gallery-grid", GalleryGrid);

class CollapsibleRow extends HTMLElement {
  constructor() {
      super();
      const _this = this;
      this.querySelector(".detail-parent").addEventListener("click", _this.onToggle.bind(_this), false);
      this.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            _this.onToggle.bind(_this)(event);
        }
    }.bind(_this), false);
  }
  onToggle(e) {
    e.preventDefault();
    const target = this.querySelector(".detail-target");
    const parent = this.querySelector(".detail-parent");
    if (target) {
        slideAnime({
            target: target,
            animeType: "slideToggle",
            parent: parent
        });
    }
  }
}
customElements.define("collapsible-row", CollapsibleRow);

class StockAlert extends Popup {
  constructor() {
      super();
      this.initMessage();
  }
  initMessage() {
      const _this = this;
      let stockalertSuccess = "";
      let stockalertError = "";
      fetch(window.location.origin+"?section_id=form-infor")
      .then(response => response.text())
      .then(text => {
        const html = parser.parseFromString(text, "text/html");
        if (!html) return;
        if (html.querySelector(".stockalert-form-success")) {
          stockalertSuccess = html.querySelector(".stockalert-form-success").innerHTML;
        }
        if (html.querySelector(".stockalert-form-error")) {
          stockalertError = html.querySelector(".stockalert-form-error").innerHTML;
        }
        const urlInfo = window.location.href;
        if (urlInfo.indexOf('contact_posted=true') >= 1) {
          _this.initToastJs(stockalertSuccess);
          const newURL = location.href.split("?")[0];
          window.history.pushState('object', document.title, newURL);
        }
      })
      .catch(e => {
        console.error(e);
      });
      
    }
    initToastJs(content = "") { 
      let myToast = EasyDialogBox.create(null, 'dlg-toast dlg-fade', null, content, null, null, 10, 400);
      myToast.onHide = myToast.destroy;
      myToast.show().hide(3000);
    }
}
customElements.define("stock-alert", StockAlert);

document.addEventListener('DOMContentLoaded', function () {
  function addProductEntry(productJson, storedProducts) {
    if (storedProducts === null) storedProducts = [];

    var currentProductID = productJson.id;
    var product = {
      id: currentProductID,
    };
    if (JSON.parse(localStorage.getItem('product')) != currentProductID) {
      localStorage.setItem('product', JSON.stringify(product));
    }
    if (storedProducts.length < 25) {
      for (var i = storedProducts.length; i--; ) {
        var curProduct = storedProducts[i];
        if (curProduct.id === product.id) {
          storedProducts.splice(i, 1);
          break;
        }
      }
    }else{
      storedProducts.shift();
      for (var i = storedProducts.length; i--; ) {
        var curProduct = storedProducts[i];
        if (curProduct.id === product.id) {
          storedProducts.splice(i, 1);
          break;
        }
      }
    }
    storedProducts.push(product);
    if (localStorage.getItem(storedProducts)) {
      localStorage.getItem('bl_recently-viewed-products', JSON.stringify(storedProducts));
    } else {
      localStorage.setItem('bl_recently-viewed-products', JSON.stringify(storedProducts));
    }
  }
  const prodData = document.querySelector('[data-product-json]');
  if (prodData != null) {
    var productJson = JSON.parse(prodData.innerHTML);
    var storedProducts = JSON.parse(localStorage.getItem('bl_recently-viewed-products'));
    addProductEntry(productJson, storedProducts);
  }
  var canvasEscFunc = (function () {
    return {
      onEscKeyUp: function () {
        const canvas = document.querySelectorAll(".canvas-main-product");
        if (canvas.length == 0) return;
        canvas.forEach((e) => {
          e.addEventListener("keyup", (event) => {
            if(event.code?.toUpperCase() === 'ESCAPE') {
              if (e.querySelector(".bls__canvas")) {
                e.querySelector(".bls__canvas").classList.remove("active");
                const itemToFocus = e.querySelector(".bls__canvas").dataset.focusItem;
                if (document.querySelector("#"+itemToFocus)) {
                  removeTrapFocus(document.querySelector("#"+itemToFocus));
                }
              }
              rootAction.remove();
            }
          });
        });
      }
    };
  })();
  canvasEscFunc.onEscKeyUp();
});