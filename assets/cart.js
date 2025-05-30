function fetchConfig(type = "json") {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: `application/${type}`,
    },
  };
}

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');
    this.cartDrawer = this.closest("cart-drawer");
    this.pageCart = this.closest('.page-cart');
    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
    const cartRecommend = document.querySelector(".cart-upsell-js.cart-type-select");
    if (cartRecommend) {
      window.addEventListener('DOMContentLoaded', () => {
        const productRecommend = cartRecommend.querySelector('.slide-container');
        if (productRecommend.childElementCount === 0) {
          document.querySelector('.js-contents').classList.add('hidden-cart-upsell')
        }
      });
    }
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  onCartUpdate() {
    fetch('/cart?section_id=main-cart-items')
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const sourcePage = html.querySelector('#main-cart-items');
        if (this.pageCart) {
          this.pageCart.innerHTML = sourcePage.innerHTML;
          const cartRecommend = html.querySelector(".cart-upsell-js.cart-type-select");
          if (cartRecommend) {
            const productRecommend = cartRecommend.querySelector('.slide-container');
            if (productRecommend.childElementCount == 0) {
              document.querySelector('.js-contents').classList.add('hidden-cart-upsell')
            }
          }
        }
      })
      .catch(e => {
        console.error(e);
      });
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents'
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll('.cart-item');
        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
            const cartDrawer = this.getSectionDOM(parsedState.sections[section.section], section.selector);
            const cartRecommend = cartDrawer.querySelector(".cart-upsell-js.cart-type-select");
            if (cartRecommend) {
              const productRecommend = cartRecommend.querySelector('.slide-container');
              if (productRecommend.childElementCount > 0) {
                document.querySelector('.drawer__inner,.js-contents').classList.remove('hidden-cart-upsell')
              }
            }
        }));
        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
        let message = '';
        if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined') {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
          }
        }
        this.updateLiveRegions(line, message);
        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' });
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        if (!errors) return;
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const lineItem =
          document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper);
        }
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (message.length > 0) {
      lineItemError.querySelector('.cart-item__error-text').innerHTML = message;
      lineItemError.removeAttribute('hidden')
    }
    if (this.lineItemStatusElement) {
      this.lineItemStatusElement.setAttribute('aria-hidden', true);
    }

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector);
  }

  enableLoading(line) {
    if (this.cartDrawer) {
      this.cartDrawer.classList.add("loading", "start");
    }
    if (this.pageCart) {
      const cartInner = this.pageCart.querySelectorAll('.cart-item_inner');
      if (cartInner.length != 0) {
        cartInner.forEach((e, index) => {
          if ((index + 1) == line) {
            if (e) {
              e.classList.add("loading", "start");
            }
          }
        })
      }
    }

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    if (this.lineItemStatusElement) {
      this.lineItemStatusElement.setAttribute('aria-hidden', false);
    }
  }

  disableLoading(line) {
    if (this.cartDrawer) {
      this.cartDrawer.classList.remove("loading", "start");
      this.cartDrawer.classList.add("loaded", "finished");
      setTimeout(() => {
        this.cartDrawer.classList.remove("loaded", "finished");
      }, 1000);
    }
    if (this.pageCart) {
      const cartInner = this.pageCart.querySelectorAll('.cart-item_inner');
      if (cartInner.length != 0) {
        cartInner.forEach((e, index) => {
          if ((index + 1) == line) {
            if (e) {
              e.classList.remove("loading", "start");
              e.classList.add("loaded", "finished");
              setTimeout(() => {
                e.classList.remove("loaded", "finished");
              }, 1000);
            }
          }
        })
      }

    }

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define('cart-note', class CartNote extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('change', debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
      }, ON_CHANGE_DEBOUNCE_TIMER))

      this.toggle();
    }
    toggle() {
      const title = this.querySelectorAll(
        ".cart__note-title"
      );
      title.forEach((item) => {
        item.addEventListener("click", (e) => {
          const target = e.currentTarget;
          const parent = target.parentElement;
          const noteContent = parent.querySelector(
            ".cart__note-content"
          );
          slideAnime({
            target: noteContent,
            animeType: "slideToggle",
          });
          if (!target.classList.contains("active")) {
            target.classList.add("active");
          } else {
            target.classList.remove("active");
          }
        });
      });
    }
  });
};

class CartGift extends HTMLElement {
  constructor() {
    super();
    this.intiAction();
  }
  intiAction() {
    this.querySelectorAll('.bls__gift-js').forEach((items) => {
      items.addEventListener('click', this.addCartGift.bind(this), false)
    })
  }
  addCartGift(event) {
    this.enableLoading(event.target.dataset.index)
    event.preventDefault();
    this.querySelector('#giftPrice').checked = true
    const variant_id = this.getAttribute('data-variant-id');
    const body = JSON.stringify({
      id: Number(variant_id),
      quantity: 1,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });
    fetch(`${routes.cart_add_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      }).then((state) => {
        const parsedState = JSON.parse(state);
        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));
      }).catch(() => {

      }).finally(() => {
        this.disableLoading(event.target.dataset.index);
      });
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    if (this.cartDrawer) {
      this.cartDrawer.classList.add("loading");
    }
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
  }

  disableLoading(line) {
    if (this.cartDrawer) {
      this.cartDrawer.classList.remove("loading");
    }
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents'
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      }
    ];
  }
}

customElements.define('cart-gift-wrap', CartGift);

class CartEstimate extends HTMLElement {
  constructor() {
    super();
    this.intiAction();
    this.addonsUpdate();
    this.toggle();
  }
  intiAction() {
    this
      .querySelectorAll(".bls__addon-actions .btn-save")
      .forEach((button) => {
        button.removeEventListener(
          "click",
          this.estimateAddonsSave.bind(this),
          false
        );
        button.addEventListener("click", this.estimateAddonsSave.bind(this), false);
      });
  }

  estimateAddonsSave(event) {
    event.preventDefault();
    const _this = this;
    var e = {};
    (e.zip = _this.querySelector("#AddressZip").value || ""),
      (e.country = _this.querySelector("#address_country").value || ""),
      (e.province = _this.querySelector("#address_province").value || ""),
      _this._getCartShippingRatesForDestination(e);
  }

  _getCartShippingRatesForDestination(event) {
    fetch(
      `${window.Shopify.routes.root}cart/shipping_rates.json?shipping_address%5Bzip%5D=${event.zip}&shipping_address%5Bcountry%5D=${event.country}&shipping_address%5Bprovince%5D=${event.province}`
    )
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const message = this.querySelector(".bls__addon-message");
        for (var item of this.querySelectorAll(".bls__addon-message p")) {
          item.remove();
        }
        const parsedState = JSON.parse(state);
        if (parsedState && parsedState.shipping_rates) {
          if (parsedState.shipping_rates.length > 0) {
            message.classList.remove("error", "warning");
            message.classList.add("success");
            const p = document.createElement("p");
            p.innerText = window.cartStrings?.shipping_rate.replace(
              "{{address}}",
              event.zip + ", " + event.country + " " + event.province
            );
            message.appendChild(p);
            parsedState.shipping_rates.map((rate) => {
              const rateNode = document.createElement("p");
              rateNode.innerHTML =
                rate.name +
                ": " +
                Shopify.formatMoney(rate.price, themeGlobalVariables.settings.money_format);
              message.appendChild(rateNode);
            });
          } else {
            message.classList.remove("error", "success");
            message.classList.add("warning");
            const p = document.createElement("p");
            p.innerText = window.cartStrings?.no_shipping;
            message.appendChild(p);
          }
        } else {
          message.classList.remove("success", "warning");
          message.classList.add("error");
          Object.entries(parsedState).map((error) => {
            const message_error = `${error[1][0]}`;
            const p = document.createElement("p");
            p.innerText = message_error;
            message.appendChild(p);
          });
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  addonsUpdate() {
    const address_country = this.querySelector("#address_country");
    const address_province = this.querySelector("#address_province");
    if (address_country && address_province) {
      new Shopify.CountryProvinceSelector(
        "address_country",
        "address_province",
        { hideElement: "address_province_container" }
      );
    }
  }

  toggle() {
    const title = this.querySelectorAll(
      ".bls__addon-title"
    );
    title.forEach((item) => {
      item.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const parent = target.parentElement;
        const noteContent = parent.querySelector(
          ".bls__addon-main-content"
        );
        slideAnime({
          target: noteContent,
          animeType: "slideToggle",
        });
        if (!target.classList.contains("active")) {
          target.classList.add("active");
        } else {
          target.classList.remove("active");
        }
      });
    });
  }
}
customElements.define("cart-estimate", CartEstimate);