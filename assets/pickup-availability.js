if (!customElements.get('pickup-availability')) {
  customElements.define('pickup-availability', class PickupAvailability extends HTMLElement {
    constructor() {
      super();

      if(!this.hasAttribute('available')) return;

      this.errorHtml = this.querySelector('template').content.firstElementChild.cloneNode(true);
      this.onClickRefreshList = this.onClickRefreshList.bind(this);
      this.fetchAvailability(this.dataset.variantId);
    }

    fetchAvailability(variantId) {
      let rootUrl = this.dataset.rootUrl;
      if (!rootUrl.endsWith("/")) {
        rootUrl = rootUrl + "/";
      }
      const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;

      fetch(variantSectionUrl)
        .then(response => response.text())
        .then(text => {
          const sectionInnerHTML = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('.shopify-section');
          this.renderPreview(sectionInnerHTML);
        })
        .catch(e => {
          const button = this.querySelector('button');
          if (button) button.removeEventListener('click', this.onClickRefreshList);
          this.renderError();
        });
    }

    onClickRefreshList(evt) {
      this.fetchAvailability(this.dataset.variantId);
    }

    renderError() {
      this.innerHTML = '';
      this.appendChild(this.errorHtml);

      this.querySelector('button').addEventListener('click', this.onClickRefreshList);
    }

    renderPreview(sectionInnerHTML) {
      const drawer = document.querySelector('.pickup-availability-drawer');
      if (drawer) drawer.remove();
      if (!sectionInnerHTML.querySelector('.pickup-availability-preview')) {
        this.innerHTML = "";
        this.removeAttribute('available');
        return;
      }

      this.innerHTML = sectionInnerHTML.querySelector('pickup-availability-preview').outerHTML;
      this.setAttribute('available', '');

      document.body.appendChild(sectionInnerHTML.querySelector('.pickup-availability-drawer'));

      const button = this.querySelector('button');
      setTimeout(() => {
        if (button){
          button.addEventListener('click', (evt) => {
            document.querySelector('pickup-availability-drawer').show(evt.target);
          });
        }
      }, 800);
    }
  });
}

if (!customElements.get('pickup-availability-drawer')) {
  customElements.define('pickup-availability-drawer', class PickupAvailabilityDrawer extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('keyup', (event) => {
        if (event.code.toUpperCase() === 'ESCAPE') this.hide();
      });
    }
 
    hide() {
      if (!this.classList.contains("active")) return;
      rootAction.remove();
      root.classList.remove("open-canvas");
      this.focusElement.classList.remove("active");
      this.classList.remove("active");
      removeTrapFocus(this.focusElement);
    }

    show(focusElement) {
      this.focusElement = focusElement;
      rootAction.addNoneHeight();
      root.classList.add("open-canvas");
      this.classList.add("active");
      setTimeout(() => {
        trapFocus(this);
      }, 400);
    }
  });
}
