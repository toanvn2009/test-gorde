function hideProductModal() {
  const productModal = document.querySelectorAll('product-modal[open]');
  productModal && productModal.forEach(modal => modal.hide());
}

document.addEventListener('shopify:section:select', (e) => {
  if (!e.detail.sectionId) return;
  var qb = document.querySelector(".overlay-quickbuy");
  var s = document.querySelector(".overlay-search");
  var c = document.querySelector(".overlay-cart");
  var qbe = document.querySelector(".overlay-quickbuy").dataset.shopifyEditorSection;
  var se = document.querySelector(".overlay-search").dataset.shopifyEditorSection;
  var ce = document.querySelector(".overlay-cart").dataset.shopifyEditorSection;
  if (qb && qbe) {
    if (document.querySelectorAll("button-quickview").length !== 0) {
      if (JSON.parse(qbe).id === e.detail.sectionId) {
        document.querySelector("button-quickview").quickview();
      }
    } else {
      if (JSON.parse(qbe).id === e.detail.sectionId) {
        fetch("/products/?section_id=product-quickview")
        .then(response => response.text())
        .then(text => {
          const html = parser.parseFromString(text, "text/html");
          if (!html.querySelector("#shopify-section-product-quickview .quickview-content")) return;
          document.querySelector(".quick_shop-popup").innerHTML = html.querySelector("#shopify-section-product-quickview .quickview-content").innerHTML;
        })
        .finally(() => {
          root.classList.add("open-canvas");
          rootAction.addNoneHeight();
          const os = document.querySelectorAll(".overlay-section");
          if (os.length > 0) {
            os.forEach(function(e){
              if (e.classList.contains("overlay-quickbuy")) {
                if (!e.querySelector(".bls__canvas")) return;
                e.querySelector(".bls__canvas").classList.add("active");
                Close.init;
              }
            });
          }
          if (window.SPR) {
            window.SPR.registerCallbacks();
            window.SPR.initRatingHandler();
            window.SPR.initDomEls();
            window.SPR.loadProducts();
            window.SPR.loadBadges();
          }
        })
        .catch(e => {
          console.error(e);
        });
      }else{
        if (!document.querySelector(".quick_shop-popup")) return;
        document.querySelector(".quick_shop-popup").classList.remove("active");
      }
      
    }
  }
  if (s && se && document.querySelector('action-search')) {
    if (JSON.parse(se).id === e.detail.sectionId) {
      document.querySelector('action-search').openPopup();
    }else{
      document.querySelector('action-search').close();
    }
  }
  if (c && ce && document.querySelector("cart-drawer") && document.querySelector('#cart-icon-bubble')) {
    if (JSON.parse(ce).id === e.detail.sectionId) {
      document.querySelector("cart-drawer").open(document.querySelector('#cart-icon-bubble'));
    }else{
      document.querySelector("cart-drawer").close();
    }
  }
  if (
    JSON.parse(ce).id !== e.detail.sectionId && 
    JSON.parse(se).id !== e.detail.sectionId && 
    JSON.parse(qbe).id !== e.detail.sectionId
    ) {
    closePopup.hide();
  }
});

document.addEventListener('shopify:section:load', (e) => {
  hideProductModal();
  const target = e.target;
  if (target) {
    const slides = target.querySelectorAll("slide-section");
    if (slides.length != 0) {
      slides.forEach(function(e){
        e.refresh();
        if (e.classList.contains("slide-section-thumbnail")) {
          if (e.getAttribute("data-axis") === "vertical") {
            if (!e.querySelector(".tns-outer") || !e.querySelector(".slide-container")) return;
            e.querySelector(".slide-container").style.width = `100%`;
            const slide_item = e.querySelectorAll(".tns-item");
            if (slide_item.length != 0) {
              slide_item.forEach(e => e.style.width = `100%`);
            }
            e.querySelector(".slide-container").style.width = `100%`;
          }
        }
      });
    }
    const announcementbar = target.querySelector("announcement-bar");
    if (announcementbar) {
      announcementbar.reload();
    }
  }

  const zoomOnHoverScript = document.querySelector('[id^=EnableZoomOnHover]');
  if (!zoomOnHoverScript) return;
  if (zoomOnHoverScript) {
    const newScriptTag = document.createElement('script');
    newScriptTag.src = zoomOnHoverScript.src;
    zoomOnHoverScript.parentNode.replaceChild(newScriptTag, zoomOnHoverScript);
  }
});

document.addEventListener('shopify:section:reorder', () => hideProductModal());

document.addEventListener('shopify:section:select', () => hideProductModal());

document.addEventListener('shopify:section:deselect', () => hideProductModal());

document.addEventListener('shopify:inspector:activate', () => hideProductModal());

document.addEventListener('shopify:inspector:deactivate', () => hideProductModal());
