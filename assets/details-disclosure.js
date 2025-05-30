class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;
    this.onInit();
  }

  onInit() {
    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    const _this = this;
    setTimeout(() => {
      if (!_this.contains(document.activeElement)) _this.close();
    });
  }

  onFocusIn(e) {
    const _this = this;
    setTimeout(() => {
      var focusElement = e.target;
      if (!_this.contains(focusElement)) {
        _this.close();
      }
    });
    document.addEventListener("click", function(e) {
      var clickedElement = e.target;
      if (!_this.contains(clickedElement)) {
        _this.close();
      }
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach(animation => animation.play());
    } else {
      this.animations.forEach(animation => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);
