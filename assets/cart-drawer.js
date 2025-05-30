class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.setHeaderCartIconAccessibility();
    this.addEventListener('keyup', function(event) {
      if (event.code.toUpperCase() === 'ESCAPE') {
        this.close.bind(this)(event);
      }
    }.bind(this), false);
  }

  setHeaderCartIconAccessibility() {
    const _this = this;
    const cartLink = document.querySelector('#cart-icon-bubble') || document.querySelector('#cart-icon-bubble-mobile');
    const cartAction = document.querySelectorAll('.icon--cart-action');
    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    if (cartAction.length != 0) {
      cartAction.forEach(e => {
        e.addEventListener('click', (event) => {
          event.preventDefault();
          _this.open(e);
        });
      });
    }
  }


  open(triggeredBy) {
    closePopup.hide();
    if (triggeredBy) this.setActiveElement(triggeredBy);
    setTimeout(() => {
      trapFocus(document.querySelector("cart-drawer"));
    }, 500);
    setTimeout(() => {this.classList.add('active');});
    root.classList.add('open-canvas');
    rootAction.addNoneHeight();
    const cartRecommend = document.querySelector(".cart-upsell-js.cart-type-select");
    if (cartRecommend) {
      const productRecommend = cartRecommend.querySelector('.slide-container');
      if (productRecommend.childElementCount === 0) {
        document.querySelector('.drawer__inner').classList.add('hidden-cart-upsell')
      }
    }
  }

  close() {
    removeTrapFocus(this.activeElement);
    rootAction.remove();
    this.classList.remove('active');
  }

  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') && this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach(((section, index) => {
      const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
      sectionElement.innerHTML =this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
      const cartDrawer = this.getSectionDOM(parsedState.sections[section.id], section.selector);
      const cartRecommend = cartDrawer.querySelector(".cart-upsell-js.cart-type-select");
      if (cartRecommend) {
        const productRecommend = cartRecommend.querySelector('.slide-container');
        if (productRecommend.childElementCount == 0) {
          document.querySelector('.drawer__inner').classList.add('hidden-cart-upsell')
        }
      }
      if (index === 1) {
        const mobile_nav_bar_id = document.querySelector("#cart-icon-bubble-mobile");
        if (mobile_nav_bar_id && mobile_nav_bar_id.querySelector(".cart-count") && sectionElement.querySelector(".cart-count")) {
          mobile_nav_bar_id.querySelector(".cart-count").innerHTML = sectionElement.querySelector(".cart-count").innerHTML;
        }
      }
    }));
    
    setTimeout(() => {
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer'
      },
      {
        id: 'cart-icon-bubble'
      }
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector);
  }
  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartNoteElement extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init(){
    this.toggleCartNote();
  }
  toggleCartNote(){
    const title = this.querySelector(".cart-note-title-js");
    if (!title) return;
    title.addEventListener("click", this.onToggle.bind(this), false);
    this.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        this.onToggle.bind(this)(event);
      }
    }.bind(this), false);
  }
  onToggle(e){
    const _this = this;
    e.preventDefault();
    if (!_this.querySelector(".cart-note-content")) return;
    slideAnime({
      target: _this.querySelector(".cart-note-content"),
      animeType: "slideToggle",
    });
  }
}
customElements.define('cart-note-element', CartNoteElement);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner'
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      }
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);

class MinicartUpsell extends HTMLElement {
  constructor() {
    super();
  }
  init(){
    this.connectedCallback();
  }
  connectedCallback() {
    fetch(this.dataset.url)
      .then(response => response.text())
      .then(text => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('.slide-container');
        if (recommendations && recommendations.innerHTML.trim().length) {
          this.querySelector(".slide-container").innerHTML = recommendations.innerHTML;
        }
      })
      .finally(() =>{
        setTimeout(() => {
          if(this.querySelector("slide-section")) {
            this.querySelector("slide-section").initSlide(); 
          }
        }, 100);
      })
      .catch(e => {
        console.error(e);
      });
  }
}

customElements.define('minicart-recommendations', MinicartUpsell);