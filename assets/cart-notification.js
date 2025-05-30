class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.notification = document.getElementById('cart-notification');
    this.onBodyClick = this.handleBodyClick.bind(this);
    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    if (this.querySelector('span.close')) {
      this.querySelector('span.close').addEventListener('click', this.close.bind(this));
      this.querySelector('span.close').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          this.close.bind(this)(event);
        }
      }.bind(this), false);
    }
    if (this.querySelector('button.close')) {
      this.querySelector('button.close').addEventListener('click', this.close.bind(this));
      this.querySelector('button.close').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          this.close.bind(this)(event);
        }
      }.bind(this), false);
    }
  }

  open() {
    rootAction.remove(this.notification);

    this.notification.classList.add('active');

    this.notification.addEventListener(
      'transitionend',
      () => {
        this.notification.focus();
        trapFocus(this.notification);
      },
      { once: true }
    );

    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.notification.classList.remove('active');
    document.body.removeEventListener('click', this.onBodyClick);
    removeTrapFocus(document.getElementById("cart-icon-bubble"));
  }

  renderContents(parsedState) {
      this.cartItemKey = parsedState.key;
      this.getSectionsToRender().forEach((section => {
        document.getElementById(section.id).innerHTML =
          this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
      }));

      this.open();
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-notification-product',
        selector: `[id="cart-notification-product-${this.cartItemKey}"]`,
      },
      {
        id: 'cart-notification-button'
      },
      {
        id: 'cart-icon-bubble'
      }
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.notification && !target.closest('cart-notification')) {
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-notification', CartNotification);
