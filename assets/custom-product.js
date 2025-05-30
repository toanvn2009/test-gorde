class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });
    this.input.addEventListener('change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.validateQtyRules.bind(this));
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange() {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' || event.target.closest("button").name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle('disabled', value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle('disabled', value >= max);
    }
  }
}

customElements.define('quantity-input', QuantityInput);
  
  class VariantSwatches extends HTMLElement {
    constructor() {
      super();
      this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
      this.init();
    }
    init() {
      const _this = this;
      this.querySelectorAll(".swatch-items-js").forEach((btn) => {
        _this.checkSwatches(btn);
        btn.addEventListener("click", this.onVariantChange.bind(this), false);
      });
      this.showColorSwatch();
    }
    showColorSwatch() {
      const _this = this;
      const show_color_swatch = this.querySelector('.show-color-swatch-js');
      if (show_color_swatch != null) {
        show_color_swatch.addEventListener('click', (e) => {
          e.currentTarget.classList.add('hidden');
          _this
            .querySelectorAll('.swatch-items-js.hidden')
            .forEach((btn) => {
              btn.classList.remove('hidden');
              setTimeout(() => {
                btn.classList.remove('opacity-0');
              }, 100);
            });
        });
      }
    }
    onVariantChange(e) {
      e.preventDefault();
      const target = e.currentTarget;
      this.productTarget = target.closest('.product__item-js');
      this.position_swatch = target.getAttribute("data-position");
      const type_swatch = "item";
      if (!target.classList.contains("active")) {
        const activeSwatches = target
          .closest(".product-swatches-js")
          .querySelectorAll(".swatch-items-js");
        activeSwatches.forEach((el) => {
          el.classList.remove("active");
        });
        target.classList.toggle("active");
        const variantQtyData = JSON.parse(
          this.productTarget.querySelector(".productVariantsQty").textContent
        );
        this.updateOptions();
        const currentVariant = this.updateMasterId(this.variantData);
        if (currentVariant) {
          this.updateMedia(type_swatch);
          this.updatePrice(this.productTarget);
          this.renderProductInfor(variantQtyData);
          this.updateShareUrl();
        }
      }
    }
    updateShareUrl() {
      const shareButton = document.getElementById(`Share-${this.dataset.section}`);
      if (!shareButton || !shareButton.updateUrl) return;
      shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
    }
    updateURL() {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }
    updateOptions() {
      this.options = Array.from(
        this.productTarget.querySelectorAll(".swatch-items-js.active"),
        (select) => select.getAttribute("data-value")
      );
      this.variantData.find((variant) => {
        if (this.options.length == 1) {
          const variantOptions = {
            1: variant.option1,
            2: variant.option2,
            3: variant.option3,
          };
          if (variantOptions[this.position_swatch] === this.options[0]) {
            this.options = variant.options;
          }
        }
      });
    }
    updateMasterId(variantData) {
      return this.currentVariant = variantData.find((variant) => {
        return !variant.options
          .map((option, index) => {
            return this.options[index] === option;
          })
          .includes(false);
      });
    }
    updateMedia() {
      if (!this.currentVariant) return;
      if (!this.currentVariant.featured_media) return;
        if (this.productTarget.querySelector(".product__media img")) {
          this.productTarget.querySelector(".product__media img")
          .removeAttribute("srcset");
        }      
        if (this.productTarget.querySelector(".product__media img")) {
          this.productTarget.querySelector(".product__media img")
          .setAttribute("src", this.currentVariant.featured_media.preview_image.src);
        }
        if (this.productTarget.querySelector(".product__media.animation-swatches")) {
          this.productTarget.querySelector(".product__media.animation-swatches")
          .classList.add("skeleton-box");
          var img = new Image();
          const _this = this;
          img.src = this.currentVariant.featured_media.preview_image.src;
          img.addEventListener('load', function() {
            setTimeout(() => {
              _this.productTarget.querySelector(".product__media.animation-swatches").classList.remove("skeleton-box");
            }, 1000);
          });
        }
    }
    updatePrice(productTarget) {
      if (!this.currentVariant) return;
      if (!productTarget) return;
      const p = document.getElementById(`price-${this.dataset.section}`);
      if (p) p.classList.remove('visibility-hidden');
      const compare_at_price = this.currentVariant.compare_at_price;
      const price = this.currentVariant.price;
      const unit_price = this.currentVariant.unit_price;
      const unit_price_measurement = this.currentVariant.unit_price_measurement;
      const price_format = Shopify.formatMoney(
        this.currentVariant.price,
        themeGlobalVariables.settings.money_format
      );
      if (unit_price && unit_price_measurement) {
        const price_num = Shopify.formatMoney(unit_price, themeGlobalVariables.settings.money_format);
        const price_unit = unit_price_measurement.reference_value != 1 ? unit_price_measurement.reference_value : unit_price_measurement.reference_unit;
        if (productTarget.querySelector('.unit-price .number')) {
          productTarget.querySelector('.unit-price .number').innerHTML = price_num;
        }
        if (productTarget.querySelector('.unit-price .unit')) {
          productTarget.querySelector('.unit-price .unit').innerHTML = price_unit;
        }
      }
      if (productTarget.querySelector(".price-regular .price")) {
        productTarget.querySelector(".price-regular .price").innerHTML =
        price_format;
      }
      const bls__price = productTarget.querySelector(".card-product-price");
      if (bls__price) {
        if (!bls__price.querySelector(".compare-price")) {
          var ps = document.createElement("div");
          var sp = document.createElement("span");
          var cp = document.createElement("s");
          cp.classList.add(
            "price-item",
            "compare-price"
          );
          sp.appendChild(cp);
          ps.appendChild(sp);
          ps.classList.add("price-sale");
          if (productTarget.querySelector(".card-product-price")) {
            productTarget.querySelector(".card-product-price").appendChild(ps);
          }
        }
        const cpp = bls__price.querySelector(".compare-price");
        if (cpp) {
          if (compare_at_price && compare_at_price > price) {
            const compare_format = Shopify.formatMoney(
              compare_at_price,
              themeGlobalVariables.settings.money_format
            );
            cpp.innerHTML = compare_format;
            if (bls__price.querySelector(".price-regular .price")) {
              bls__price.querySelector(".price-regular .price").classList.add("special-price");
            }
          } else {
            cpp.innerHTML = "";
            if (bls__price.querySelector(".price-regular .price")) {
              bls__price.querySelector(".price-regular .price").classList.remove("special-price");
              bls__price.querySelector(".price-regular .price").innerHTML = price_format;
            }
          }
          if (!this.currentVariant.available) {
            bls__price.classList.add("price--sold-out");
          }
        }
      }
    }
    renderLabel(sale,pre_order,soldOut,percent) {
      if (sale || pre_order || soldOut) {
        if (!this.productTarget.querySelector(".product__badges")) {
          var element = document.createElement("div");
          element.classList.add(
            "product__badges",
            "fs-small",
            "absolute",
            "d-flex",
            "flex-wrap",
            "uppercase"
          );
          if (this.productTarget.querySelector(".product__inner a")) {
            this.productTarget.querySelector(".product__inner a").appendChild(element);
          }
        }
      }
      const label = this.productTarget.querySelector(".product__badges");
      const show_badges = this.productTarget.dataset.showBadges;
      if (label && show_badges !== 'false') {
        const dsale = label.querySelector(".product__badges-sale");
        const dsoldout = label.querySelector(".product__badges-sold-out");
        const dpreorder = label.querySelector(".product__badges-pre-order");
        if (sale) {
          if (!dsale) {
            var elementsale = document.createElement("div");
            elementsale.classList.add(
              "product__badges-sale",
              "d-inline-flex",
              "middle-center",
              "heading-weight",
              "text-center"
            );
            elementsale.innerHTML = `${percent.toFixed(0)}% OFF`;
            if (dsoldout) {
              label.insertBefore(elementsale, dsoldout);
  
            }else if (dpreorder){
              label.insertBefore(elementsale, dpreorder);
            }else{
              label.appendChild(elementsale);
            }
        } else {
            dsale.innerHTML = `${percent.toFixed(0)}% OFF`;
        }
      }
      else{
          if(dsale){
            dsale.remove();
          }
      }
      if (pre_order) {
        if (!dpreorder) {
          var elementpo = document.createElement("div");
          elementpo.classList.add(
            "product__badges-pre-order",
            "d-inline-flex",
            "middle-center",
            "heading-weight",
            "text-center"
          );
          elementpo.innerHTML = window.variantStrings.preOrder?window.variantStrings.preOrder:"Pre-order";
          label.appendChild(elementpo);
        } else {
          dpreorder.innerHTML = window.variantStrings.preOrder?window.variantStrings.preOrder:"Pre-order";
        }
      }else{
        if(dpreorder){
            dpreorder.remove();
        }
      }
      if (soldOut) {
        if (!dsoldout) {
          var elementso = document.createElement("div");
          elementso.classList.add(
            "product__badges-sold-out",
            "d-inline-flex",
            "middle-center",
            "heading-weight",
            "text-center"
          );
          elementso.innerHTML = window.variantStrings.soldOut?window.variantStrings.soldOut:"Sold out";
          label.appendChild(elementso);
        } else {
          dsoldout.innerHTML = window.variantStrings.soldOut?window.variantStrings.soldOut:"Sold out";
        }
      }else{
        if(dsoldout){
            dsoldout.remove();
        }
      }
     }
    }
    updateIncomingStatus(productTarget, variantQtyData){
      if (!variantQtyData) return;
      if (!productTarget) return;
      if (!this.currentVariant) return;
      let date = "";
      let is_coming = false;
      const vqd = variantQtyData.reduce((acc, item) => {
        const existingItem = acc.find(i => i.option === item.option);
        if (existingItem) {
          existingItem.incoming_date = item.incoming_date;
          if (item.incoming === true) {
            existingItem.incoming = true;
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      vqd.find((variantQty) => {
        if (variantQty.option === this.currentVariant.option1) {
          is_coming = variantQty.incoming;
          date = variantQty.incoming_date;
        }
      });
      const inventory_status = productTarget.querySelector(".inventory_status");
      if (inventory_status) {
        const divMessage = inventory_status.querySelector(".incoming-message");
        var options = { month: 'long', day: 'numeric', year: 'numeric' };
        var dateObj = new Date(date);
        var formattedDate = dateObj.toLocaleDateString('en-US', options);
        if (divMessage) {
          if (is_coming === "true") {
            if (date) {
              divMessage.innerHTML = window.variantStrings.incoming_with_date?window.variantStrings.incoming_with_date.replace("{{ date }}",formattedDate):"The stock will arrive on "+formattedDate;
            }else{
              divMessage.innerHTML = window.variantStrings.incoming?window.variantStrings.incoming:"Stock in transit";
            }
          }else{
            divMessage.remove();
          }
        }else{
          if (is_coming === "true") {
              var elementso = document.createElement("div");
              elementso.classList.add("incoming-message", "mb-10");
              if (date) {
              elementso.innerHTML = window.variantStrings.incoming_with_date?window.variantStrings.incoming_with_date.replace("{{ date }}",formattedDate):"The stock will arrive on "+formattedDate;
            }else{
              elementso.innerHTML = window.variantStrings.incoming?window.variantStrings.incoming:"Stock in transit";
            }
            inventory_status.appendChild(elementso);

          }
        }
      }
    }
    updateInventoryStatus(productTarget, variantQtyData){
      if (!variantQtyData) return;
      if (!productTarget) return;
      if (!this.currentVariant) return;
      let qty = 0;
      let im = false;
      let av = false;
      const vqd = variantQtyData.reduce((acc, item) => {
        const existingItem = acc.find(i => i.option === item.option);
        if (existingItem) {
          existingItem.qty += item.qty;
          if (item.mamagement === "") {
            existingItem.mamagement = "";
          }
          if (item.available === true) {
            existingItem.available = true;
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      vqd.find((variantQty) => {
        if (variantQty.option === this.currentVariant.option1) {
          qty = variantQty.qty;
          im = variantQty.mamagement;
          av = variantQty.available;
        }
      });
    }
    updateStockNotify(productTarget, variantQtyData){
      if (!variantQtyData) return;
      if (!productTarget) return;
      if (!this.currentVariant) return;
      let qty = 0;
      let im = false;
      let av = false;
      const vqd = variantQtyData.reduce((acc, item) => {
        const existingItem = acc.find(i => i.option === item.option);
        if (existingItem) {
          existingItem.qty += item.qty;
          if (item.mamagement === "") {
            existingItem.mamagement = "";
          }
          if (item.available === true) {
            existingItem.available = true;
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      vqd.find((variantQty) => {
        if (variantQty.option === this.currentVariant.option1) {
          qty = variantQty.qty;
          im = variantQty.mamagement;
          av = variantQty.available;
        }
      });
      const blockButton = productTarget.querySelector(".product__form-add-cart");
      if (!blockButton) return;
      const notifyBtn = blockButton.querySelector(".notify-btn-js");
      if (!notifyBtn) return;
      const buyBtn = blockButton.querySelector(".buy-btn-js");

      if (im === "shopify" && qty === 0 && av !== true) {
        if (buyBtn) {
          buyBtn.classList.add("d-none");
        }
          notifyBtn.classList.remove("d-none");
      }else{
        if (buyBtn) {
          buyBtn.classList.remove("d-none");
        }
          notifyBtn.classList.add("d-none");
      }
    }
    renderProductInfor(variantQtyData) {
      if (!this.currentVariant) return;
      if (!this.productTarget) return;
      let qty = 0;
      let percent = 0;
      let sale = false;
      let soldOut = false;
      let pre_order = false;
      let av = false;
      let im = false;
      const compare_at_price = this.currentVariant.compare_at_price;
      const price = this.currentVariant.price;
  
      const vqd = variantQtyData.reduce((acc, item) => {
        const existingItem = acc.find(i => i.option === item.option);
        if (existingItem) {
          existingItem.qty += item.qty;
          if (item.available === true) {
            existingItem.available = true;
          }
          if (item.mamagement === "") {
            existingItem.mamagement = "";
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      vqd.find((variantQty) => {
        if (variantQty.option === this.currentVariant.option1) {
          qty = variantQty.qty;
          av = variantQty.available;
          im = variantQty.mamagement;
        }
      });
      if (compare_at_price && compare_at_price > price) {
        sale = true;
        percent = ((compare_at_price - price) / compare_at_price) * 100;
      }
      if (im === "") {
        soldOut = false;
        pre_order = false;
      } else {
        if (av && qty < 1) {
          pre_order = true;
        } else if (!av) {
          soldOut = true;
        }
      }
      this.renderLabel(sale,pre_order,soldOut,percent);
    }
    checkSwatches(e) {
      const { color, image, hex } = e.dataset;
      if (color) {
        if (this.checkColor(color)) {
          e.style.backgroundColor = color;
          if (hex) {
            e.style.backgroundColor = hex;
          }
        } else {
          
          if (hex) {
            e.style.backgroundColor = hex;
          }else{
            if (image) {
              e.classList.add("color__" + color.replace(/ /g, "-"));
              e.style.backgroundColor = null;
              e.style.backgroundImage = "url('" + image + "')";
              e.style.backgroundSize = "cover";
              e.style.backgroundRepeat = "no-repeat";
            }
          }
        }
      }
      else{
        if (image) {
          e.style.backgroundColor = null;
          e.style.backgroundImage = "url('" + image + "')";
          e.style.backgroundSize = "cover";
          e.style.backgroundRepeat = "no-repeat";
        }
      }
    }
    setInputAvailability(listOfOptions, listOfAvailableOptions) {

      listOfOptions.forEach(input => {
        if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
          input.classList.remove('disabled');
        } else {
          input.classList.add('disabled');
        }
      });
    }
    updateVariantInput() {
      const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}`);
      productForms.forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          input.value = this.currentVariant.id;
          input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    renderBtnStatus(productTarget, im, av, qty) {
      if (!productTarget) return;
      let btn_add_cart = productTarget.querySelector(".product_submit_button");
      if (btn_add_cart && btn_add_cart.querySelector(".btn-label")) {
        if (im === null) {
          btn_add_cart.querySelector(".btn-label").innerHTML = window.variantStrings.addToCart;
          btn_add_cart.disabled = false;
        }else{
          if (av) {
            if (qty < 1) {
              btn_add_cart.querySelector(".btn-label").innerHTML = window.variantStrings.preOrder;
              btn_add_cart.disabled = false;
            }
            else{
              btn_add_cart.querySelector(".btn-label").innerHTML = window.variantStrings.addToCart;
              btn_add_cart.disabled = false;
            }
          } else {
            btn_add_cart.querySelector(".btn-label").innerHTML = window.variantStrings.soldOut;
            btn_add_cart.disabled = true;
          }
        }
      }
      const inventory_status = productTarget.querySelector(".inventory_status");
      if (inventory_status) {
        const divProgress = inventory_status.querySelector("inventory-progress-bar");
        if (divProgress) {
          if (im === "shopify") {
            divProgress.classList.remove("d-none");
            divProgress.init(qty, av);
          }else{
            divProgress.classList.add("d-none");
          }
        }
      }
    }
    checkColor(strColor) {
      var s = new Option().style;
      s.color = strColor;
      return s.color == strColor;
    }
    mapUpdateVariantInput(target) {
      if (!target) return;
      const section_id = target.dataset.section;
      const productForms = target.querySelectorAll(`#product-form-${section_id}`);
      productForms.forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          input.value = this.currentVariant.id;
          input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    setUnavailable() {
      if (!this.productTarget) return;
      const button = document.getElementById(`product-form-${this.dataset.section}`);
      if (!button) return;
      const addButton = button.querySelector('[name="add"]');
      const addButtonText = button.querySelector('[name="add"] > span');
      const price = document.getElementById(`price-${this.dataset.section}`);
      if (!addButton) return;
      addButtonText.textContent = window.variantStrings.unavailable;
      addButton.disabled = true;
      if (price) price.classList.add('visibility-hidden');
    }
    mapSetUnavailable(target) {
      if (!target) return;
      const section_id = target.dataset.section;
      if (!section_id) return;
      const button = target.querySelector(`#product-form-${section_id}`);
      if (!button) return;
      const addButton = button.querySelector('[name="add"]');
      const addButtonText = button.querySelector('[name="add"] > span');
      const price = document.getElementById(`price-${section_id}`);
      if (!addButton) return;
      addButtonText.textContent = window.variantStrings.unavailable;
      addButton.disabled = true;
      if (price) price.classList.add('visibility-hidden');
    }
    mapUpdateVariantChecked(target) {
      if (!target) return;
      const variant_controller_radios = target.querySelector("variant-radios-page") || target.querySelector("variant-radios-sticky");
      const variant_controller_selects = target.querySelector("variant-selects-sticky") || target.querySelector("variant-selects-page");
      if (!variant_controller_radios && !variant_controller_selects) return;
      let variant_controller = null;
      let is_select = false;
      if (variant_controller_radios) {
        variant_controller = variant_controller_radios;
      }
      if (variant_controller_selects) {
        variant_controller = variant_controller_selects;
        is_select = true;
      }
      const inputWrappers = Array.from(this.querySelectorAll('.product-form__input'));
      const inputWrappersDetail = Array.from(variant_controller.querySelectorAll('.product-form__input'));
      
      inputWrappers.forEach((option, index) => {
        const previousOptionSelected = inputWrappers[index].querySelector(':checked')?.value;
        let inputDetail = null;
        if (is_select != true) {
          inputDetail = Array.from(inputWrappersDetail[index].querySelectorAll('input'));
        }else{
          inputDetail = Array.from(inputWrappersDetail[index].querySelectorAll('option'));
        }
        const checkedInput = inputDetail.find(e => e.value === previousOptionSelected);
        if (!checkedInput) return;
        if (is_select != true) {
          checkedInput.checked = true;
        }else{
          checkedInput.selected = true;
        }
      });
    }
    updateVariantStatuses() {
      const selectedOptionOneVariants = this.variantData.filter(variant => this.querySelector(':checked')?.value === variant.option1);

      const inputWrappers = [...this.querySelectorAll('.product-form__input')];
      inputWrappers.forEach((option, index) => {
        if (index === 0) return;
        const optionInputs = [...option.querySelectorAll('input[type="radio"], option')];
        const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked')?.value;
        const availableOptionInputsValue = selectedOptionOneVariants.filter(variant => variant.available && variant[`option${ index }`] === previousOptionSelected).map(variantOption => variantOption[`option${ index + 1 }`]);        
        this.setInputAvailability(optionInputs, availableOptionInputsValue)
      });
    }
    mapUpdateVariantStatuses(target) {
      if (!target) return;
      const variant_controller = 
        target.querySelector("variant-radios-sticky") || target.querySelector("variant-selects-sticky");
      if (!variant_controller) return;
      const selectedOptionOneVariants = variant_controller.variantData.filter(variant => this.querySelector(':checked')?.value === variant.option1);
      if (!variant_controller) return;
      const inputWrappersDetail = [...variant_controller.querySelectorAll('.product-form__input')];
      inputWrappersDetail.forEach((option, index) => {
        if (index === 0) return;
        const optionInputs = [...option.querySelectorAll('input[type="radio"], option')];
        const previousOptionSelected = inputWrappersDetail[index - 1].querySelector(':checked')?.value;
        const availableOptionInputsValue = selectedOptionOneVariants.filter(variant => variant.available && variant[`option${ index }`] === previousOptionSelected).map(variantOption => variantOption[`option${ index + 1 }`]);
        this.setInputAvailability(optionInputs, availableOptionInputsValue);
      });
    }
    mapUpdateMedia(target, is_sticky = false, t) {
      if (!target) return;
      if (is_sticky) {
        if (!this.currentVariant) return;
        if (!this.currentVariant.featured_media) return;
        if (target.querySelector(".product__media img")) {
          target.querySelector(".product__media img")
          .removeAttribute("srcset");
        }      
        if (target.querySelector(".product__media img")) {
          target.querySelector(".product__media img")
          .setAttribute("src", this.currentVariant.featured_media.preview_image.src);
        }
      }else{
        if (!this.currentVariant.featured_media || !this.currentVariant.featured_media.position) return;
        const section_id = target.dataset.section;
        if (!target.querySelector(".is_variant_group")) {
          if (target.querySelector(".is_column")) {
            const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${section_id}"]`);
            mediaGalleries.forEach((mediaGallery) =>
              mediaGallery.setActiveMedia(`${section_id}-${this.currentVariant.featured_media.id}`, true)
            );
          }else{
            const slide = target.querySelector("slide-section.slide-section-media");
            if (!slide) return;
            slide.gotoFunction(this.currentVariant.featured_media.position-1);
            const thumb = target.querySelector("slide-section.slide-section-thumbnail");
            if (!thumb) return;
            thumb.gotoFunction(this.currentVariant.featured_media.position-1);
          }
        }else{
          const option_name = target.dataset.optionName;
          const arr = option_name.split(',');
          if (!t) return;
            let match = t.name.match(/\[(.*?)\]/);
            var val1;
            if (match) {
              val1 = match[1];
            }else {
              val1 = t.name;
            }
          if (target.querySelector(".is_column")) {
            const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${section_id}"]`);
            if (!arr.includes(val1)) {
              mediaGalleries.forEach((mediaGallery) =>
                mediaGallery.setActiveMedia(`${section_id}-${this.currentVariant.featured_media.id}`, true)
              );
            }else{
              mediaGalleries.forEach((mediaGallery) =>
                {
                  const colorPosition = mediaGallery.dataset.colorPosition;
                  if (colorPosition) {
                    const filter_items = this.variantData.filter(item => item[colorPosition] === t.value);
                    const galleryGrid = mediaGallery.querySelector(".gallery-grid-js");
                    if (!galleryGrid) return;
                    const content = document.createElement('div');
                    mediaGallery.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                    {
                      const alt = image.dataset.alt;
                      if (t.value == alt) {
                        content.appendChild(image.cloneNode(true));
                      }
                    });
                    if (!content.querySelector(".slider-image") && filter_items) {
                      mediaGallery.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                      {
                        const position = image.dataset.position;
                        filter_items.forEach((items) => {
                          if (items.featured_image.position == position) {
                            content.appendChild(image.cloneNode(true));
                          }
                        });
                      });
                    }
                    galleryGrid.innerHTML = "";
                    galleryGrid.innerHTML = content.innerHTML;
                  }
                }
              );
            }
          }else{
            const slide = target.querySelector("slide-section.slide-section-media");
            if (!slide) return;
            if (!arr.includes(val1)) {
              const slide_items = slide.querySelectorAll(".slider-image");
              if (slide_items.length == 0) return;
              slide_items.forEach((e, index) => {
                const mediaId = e.getAttribute('data-media-id');
                if (mediaId && mediaId === `${section_id}-${this.currentVariant.featured_media.id}`) {
                  slide.gotoFunction(index);
                  const thumb = target.querySelector("slide-section.slide-section-thumbnail");
                  if (!thumb) return;
                  thumb.gotoFunction(index);
                }
              });
            }else{
              const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${section_id}"]`);
              mediaGalleries.forEach((mediaGallery) =>
                {
                  const colorPosition = mediaGallery.dataset.colorPosition;
                  if (colorPosition) {
                    const filter_items = this.variantData.filter(item => item[colorPosition] === t.value);
                    const thumbnailSlide = mediaGallery.querySelector("slide-section.slide-section-thumbnail");
                    if (!thumbnailSlide) return;
                    const content_thumb = document.createElement('div');
                    thumbnailSlide.querySelector('template').content.querySelectorAll('.slider-thumbnail').forEach((image) =>
                    {
                      const alt = image.dataset.alt;
                      if (t.value == alt) {
                        content_thumb.appendChild(image.cloneNode(true));
                      }
                    });
                    if (!content_thumb.querySelector(".slider-thumbnail") && filter_items) {
                      thumbnailSlide.querySelector('template').content.querySelectorAll('.slider-thumbnail').forEach((image) =>
                      {
                        const position = image.dataset.position;
                        filter_items.forEach((items) => {
                          if (items.featured_image.position == position) {
                            content_thumb.appendChild(image.cloneNode(true));
                          }
                        });
                      });
                    }
                    thumbnailSlide.destroy();
                    thumbnailSlide.slider = null;
                    thumbnailSlide.querySelector(".slide-container").innerHTML = "";
                    thumbnailSlide.querySelector(".slide-container").innerHTML = content_thumb.innerHTML;
                    thumbnailSlide.initSlide();
                    const gallerySlide = mediaGallery.querySelector("slide-section.slide-section-media");
                    if (!gallerySlide) return;
                    const content = document.createElement('div');
                    gallerySlide.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                    {
                      const alt = image.dataset.alt;
                      if (t.value == alt) {
                        content.appendChild(image.cloneNode(true));
                      }
                    });
                    if (!content.querySelector(".slider-image") && filter_items) {
                      gallerySlide.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                      {
                        const position = image.dataset.position;
                        filter_items.forEach((items) => {
                          if (items.featured_image.position == position) {
                            content.appendChild(image.cloneNode(true));
                          }
                        });
                      });
                    }
                    gallerySlide.destroy();
                    gallerySlide.slider = null;
                    gallerySlide.querySelector(".slide-container").innerHTML = "";
                    gallerySlide.querySelector(".slide-container").innerHTML = content.innerHTML;
                    gallerySlide.initSlide();
                    gallerySlide.gotoFunction(0);
                  }
                }
              );
            }
          }
          const media = document.querySelector('.feature-product-media');
          if (media){
            if (media.classList.contains('external_zoom') || media.classList.contains('inner_zoom')) {
              Zoom.init();
            } else if (media.classList.contains('lightbox')) {
              initPhotoSwipeFromDOM('.gallery-zoom');
            }
          }
        }
      }
    }
  }
  customElements.define("variant-radios",VariantSwatches);
  
  class VariantRadios extends VariantSwatches {
    constructor() {
      super();
    }
    init() {
      const _this = this;
      if (this.querySelectorAll(".swatch-items-js").length) {
        this.querySelectorAll(".swatch-items-js").forEach((btn) => {
          _this.checkSwatches(btn);
        });
      }
      this.addEventListener('change', this.onVariantChange);
      if (this.closest('.product__item-js')) {
        _this.onSlideChange(this.closest('.product__item-js'));
      }
    }
    onSlideChange(target){
      const slide = target.querySelector("slide-section.slide-section-media");
      if (!slide) return;
      slide.onSlideChange();
    }
    onVariantChange(e) {
      e.preventDefault();
      const target = e.currentTarget;
      this.productTarget = target.closest('.product__item-js');
      const variantQtyData = JSON.parse(
        this.productTarget.querySelector(".productVariantsQty").textContent
      );
      this.updateOptions();
      const currentVariant = this.updateMasterId(this.variantData);
      this.updateVariantStatuses();
      if (currentVariant) {
        this.updateMedia()
        this.updatePrice(this.productTarget)
        this.renderProductInfor(this.productTarget,variantQtyData);
        this.updateVariantInput();
        this.updateShareUrl();
        this.updateIncomingStatus(this.productTarget, variantQtyData);
        this.updateInventoryStatus(this.productTarget, variantQtyData);
      }else{
        this.setUnavailable();
      }
    }

    updatePickupAvailability() {
      const pickUpAvailability = document.querySelector('pickup-availability');
      if (!pickUpAvailability) return;
  
      if (this.currentVariant && this.currentVariant.available) {
        pickUpAvailability.fetchAvailability(this.currentVariant.id);
      } else {
        pickUpAvailability.removeAttribute('available');
        pickUpAvailability.innerHTML = '';
      }
    }

    updateOptions() {
      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      this.options = fieldsets.map((fieldset) => {
        if (Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked)) {
          return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
        }
      });
    }
    renderProductInfor(productTarget, variantQtyData) {
      if (!this.currentVariant) return;
      if (!productTarget) return;
      let qty = 0;
      let percent = 0;
      let sale = false;
      let soldOut = false;
      let pre_order = false;
      let av = this.currentVariant.available;
      let sku = this.currentVariant.sku;
      let im = this.currentVariant.inventory_management;
      const compare_at_price = this.currentVariant.compare_at_price;
      const price = this.currentVariant.price;
      let avaiable = productTarget.querySelector(".available-value");
      let sku_area = productTarget.querySelector(".product__sku .sku_content");
      let option_value = productTarget.querySelectorAll(".option_value");
      if (option_value.length != 0) {
        option_value.forEach((e, index) => {
          if (this.currentVariant[`option${index+1}`]) {
            e.innerHTML = this.currentVariant[`option${index+1}`];
          }
        });
      }
      if (sku_area) sku_area.innerHTML = sku ? sku : "N/A";
      variantQtyData.find((variantQty) => {
        if (variantQty.id === this.currentVariant.id) {
          qty = variantQty.qty;
        }
      });

      if (compare_at_price && compare_at_price > price) {
        sale = true;
        percent = compare_at_price - price;
      }
      if (im === null) {
        soldOut = false;
        pre_order = false;
        if (avaiable) {
          avaiable.innerHTML = window.variantStrings.inStock;
        }
      } else {
        if (av) {
          if (qty < 1) {
            pre_order = true;
            if (avaiable) {
              avaiable.innerHTML = window.variantStrings.preOrder;
            }
          }
          else{
            soldOut = false;
            pre_order = false;
            if (avaiable) {
              avaiable.innerHTML = window.variantStrings.inStock;
            }
            if (avaiable) {
              avaiable.innerHTML = window.variantStrings.inStock;
            }
          }
        } else {
          soldOut = true;
          if (avaiable) {
            avaiable.innerHTML = window.variantStrings.outStock;
          }
        }
      }
      this.renderLabel(sale,pre_order,soldOut,percent,productTarget);
      this.renderBtnStatus(productTarget,im, av, qty);

    }
  
    renderLabel(sale,pre_order,soldOut,percent,productTarget) {
      if (sale || pre_order || soldOut) {

        if (!productTarget.querySelector(".product__badges")) {
          var element = document.createElement("div");
          element.classList.add(
            "product__badges",
            "fs-small",
            "d-flex",
            "flex-wrap",
            "uppercase"
          );
          if (productTarget.querySelector(".sale_badge")) {
            productTarget.querySelector(".sale_badge").appendChild(element);
          }
        }
      }
      const label = productTarget.querySelector(".product__badges");
  
      if (label) {
        const prd = Shopify.formatMoney(
          percent,
          themeGlobalVariables.settings.money_format
        );
        const dsale = label.querySelector(".product__badges-sale");
        const dsoldout = label.querySelector(".product__badges-sold-out");
        const dpreorder = label.querySelector(".product__badges-pre-order");
        if (sale) {
          if (!dsale) {
            var elementsale = document.createElement("div");
            elementsale.classList.add(
              "product__badges-sale",
              "d-inline-flex",
              "middle-center",
              "heading-weight",
              "text-center"
            );
  
            elementsale.innerHTML = `${window.variantStrings.save?window.variantStrings.save:"Save"} ${prd}`;
            if (dsoldout) {
              label.insertBefore(elementsale, dsoldout);
  
            }else if (dpreorder){
              label.insertBefore(elementsale, dpreorder);
            }else{
              label.appendChild(elementsale);
            }
        } else {
            dsale.innerHTML = `${window.variantStrings.save?window.variantStrings.save:"Save"} ${prd}`;
        }
      }
      else{
        dsale?.remove();
      }
      if (pre_order) {
        if (!dpreorder) {
          var elementpo = document.createElement("div");
          elementpo.classList.add(
            "product__badges-pre-order",
            "d-inline-flex",
            "middle-center",
            "heading-weight",
            "text-center"
          );
          elementpo.innerHTML = window.variantStrings.preOrder?window.variantStrings.preOrder:"Pre-order";
          label.appendChild(elementpo);
        } else {
          dpreorder.innerHTML = window.variantStrings.preOrder?window.variantStrings.preOrder:"Pre-order";
        }
      }else{
        dpreorder?.remove();
      }
      if (soldOut) {
        if (!dsoldout) {
          var elementso = document.createElement("div");
          elementso.classList.add(
            "product__badges-sold-out",
            "d-inline-flex",
            "middle-center",
            "heading-weight",
            "text-center"
          );
          elementso.innerHTML = window.variantStrings.soldOut?window.variantStrings.soldOut:"Sold out";
          label.appendChild(elementso);
        } else {
          dsoldout.innerHTML = window.variantStrings.soldOut?window.variantStrings.soldOut:"Sold out";
        }
      }else{
        dsoldout?.remove();
      }
     }
    }
    updateMedia(t) {
      if (!this.productTarget) return;
      const option_name = this.productTarget.dataset.optionName;
      if(option_name === undefined){
        return; 
      }
      const arr = option_name.split(',');
      if (!this.currentVariant.featured_media || !this.currentVariant.featured_media.position) return;
      if (!this.productTarget.querySelector(".is_variant_group")) {
        if (this.productTarget.querySelector(".is_column")) {
          const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
          mediaGalleries.forEach((mediaGallery) =>
            mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true)
          );
        }else{
          const slide = this.productTarget.querySelector("slide-section.slide-section-media");
          if (!slide) return;
          slide.gotoFunction(this.currentVariant.featured_media.position-1);
          const thumb = this.productTarget.querySelector("slide-section.slide-section-thumbnail");
          if (!thumb) return;
          thumb.gotoFunction(this.currentVariant.featured_media.position-1);
        }
      }else{
        if (this.productTarget.querySelector(".is_column")) {
          if (!t) return;
          if (!arr.includes(t.name)) {
            const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
            mediaGalleries.forEach((mediaGallery) =>
              mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true)
            );
          }else{
            const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
            mediaGalleries.forEach((mediaGallery) =>
              {
                const colorPosition = mediaGallery.dataset.colorPosition;
                if (colorPosition) {
                  const filter_items = this.variantData.filter(item => item[colorPosition] === t.value);
                  const galleryGrid = mediaGallery.querySelector(".gallery-grid-js");
                  if (!galleryGrid) return;
                  const content = document.createElement('div');
                  mediaGallery.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                  {
                    const alt = image.dataset.alt;
                    if (t.value == alt) {
                      content.appendChild(image.cloneNode(true));
                    }
                  });
                  if (!content.querySelector(".slider-image") && filter_items) {
                    mediaGallery.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                    {
                      const position = image.dataset.position;
                      filter_items.forEach((items) => {
                        if (items.featured_image.position == position) {
                          content.appendChild(image.cloneNode(true));
                        }
                      });
                    });
                  }
                  galleryGrid.innerHTML = "";
                  galleryGrid.innerHTML = content.innerHTML;
                }
              }
            );
          }
        }else{
          const slide = this.productTarget.querySelector("slide-section.slide-section-media");
          if (!slide) return;
          if (!t) return;
          if (!arr.includes(t.name)) {
            const slide_items = slide.querySelectorAll(".slider-image");
            if (slide_items.length == 0) return;
            slide_items.forEach((e, index) => {
              const mediaId = e.getAttribute('data-media-id');
              if (mediaId && mediaId === `${this.dataset.section}-${this.currentVariant.featured_media.id}`) {
                slide.gotoFunction(index);
                const thumb = this.productTarget.querySelector("slide-section.slide-section-thumbnail");
                if (!thumb) return;
                thumb.gotoFunction(index);
              }
            });
          }else{
            const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
            mediaGalleries.forEach((mediaGallery) =>
              {
                const colorPosition = mediaGallery.dataset.colorPosition;
                if (colorPosition) {
                  const filter_items = this.variantData.filter(item => item[colorPosition] === t.value);
                  const thumbnailSlide = mediaGallery.querySelector("slide-section.slide-section-thumbnail");
                  if (!thumbnailSlide) return;
                  const content_thumb = document.createElement('div');
                  thumbnailSlide.querySelector('template').content.querySelectorAll('.slider-thumbnail').forEach((image) =>
                  {
                    const alt = image.dataset.alt;
                    if (t.value == alt) {
                      content_thumb.appendChild(image.cloneNode(true));
                    }
                  });
                  if (!content_thumb.querySelector(".slider-thumbnail") && filter_items) {
                    thumbnailSlide.querySelector('template').content.querySelectorAll('.slider-thumbnail').forEach((image) =>
                    {
                      const position = image.dataset.position;
                      filter_items.forEach((items) => {
                        if (items.featured_image.position == position) {
                          content_thumb.appendChild(image.cloneNode(true));
                        }
                      });
                    });
                  }
                  thumbnailSlide.destroy();
                  thumbnailSlide.slider = null;
                  thumbnailSlide.querySelector(".slide-container").innerHTML = "";
                  thumbnailSlide.querySelector(".slide-container").innerHTML = content_thumb.innerHTML;
                  thumbnailSlide.initSlide();
                  const gallerySlide = mediaGallery.querySelector("slide-section.slide-section-media");
                  if (!gallerySlide) return;
                  const content = document.createElement('div');
                  gallerySlide.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                  {
                    const alt = image.dataset.alt;
                    if (t.value == alt) {
                      content.appendChild(image.cloneNode(true));
                    }
                  });
                  if (!content.querySelector(".slider-image") && filter_items) {
                    gallerySlide.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                    {
                      const position = image.dataset.position;
                      filter_items.forEach((items) => {
                        if (items.featured_image.position == position) {
                          content.appendChild(image.cloneNode(true));
                        }
                      });
                    });
                  }
                  gallerySlide.destroy();
                  gallerySlide.slider = null;
                  gallerySlide.querySelector(".slide-container").innerHTML = "";
                  gallerySlide.querySelector(".slide-container").innerHTML = content.innerHTML;
                  gallerySlide.initSlide();
                  gallerySlide.gotoFunction(0);
                }
              }
            );
          }
        }
        const media = document.querySelector('.feature-product-media');
        if (media){
          if (media.classList.contains('external_zoom') || media.classList.contains('inner_zoom')) {
            Zoom.init();
          } else if (media.classList.contains('lightbox')) {
            initPhotoSwipeFromDOM('.gallery-zoom');
          }
        }
      }
    }
  }
  customElements.define('variant-radios-detail', VariantRadios);

  class VariantSelects extends VariantSwatches {
    constructor() {
      super();
      this.addEventListener('change', this.onVariantChange.bind(this));
    }
    onVariantChange(e) {
      e.preventDefault();
      const target = e.currentTarget;
      this.productTarget = target.closest('.product__item-js');
      const variantQtyData = JSON.parse(
        this.productTarget.querySelector(".productVariantsQty").textContent
      );
      this.updateOptions();
      const currentVariant = this.updateMasterId(this.variantData);
      this.updateVariantStatuses();
      if (currentVariant) {
        this.updateMedia()
        this.updatePrice(this.productTarget)
        this.renderProductInfor(this.productTarget,variantQtyData);
        this.updateVariantInput();
        this.updateShareUrl();
      }else{
        this.setUnavailable();
      }
    }
    updatePickupAvailability() {
      const pickUpAvailability = document.querySelector('pickup-availability');
      if (!pickUpAvailability) return;
  
      if (this.currentVariant && this.currentVariant.available) {
        pickUpAvailability.fetchAvailability(this.currentVariant.id);
      } else {
        pickUpAvailability.removeAttribute('available');
        pickUpAvailability.innerHTML = '';
      }
    }
    updateOptions() {
      this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    }
    updateMedia(t) {
      if (!this.productTarget) return;
      const option_name = this.productTarget.dataset.optionName;
      if(option_name === undefined){
        return; 
      }
      const arr = option_name.split(',');
      if (!this.currentVariant.featured_media || !this.currentVariant.featured_media.position) return;
      if (!this.productTarget.querySelector(".is_variant_group")) {
        if (this.productTarget.querySelector(".is_column")) {
          const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
          mediaGalleries.forEach((mediaGallery) =>
            mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true)
          );
        }else{
          const slide = this.productTarget.querySelector("slide-section.slide-section-media");
          if (!slide) return;
          slide.gotoFunction(this.currentVariant.featured_media.position-1);
          const thumb = this.productTarget.querySelector("slide-section.slide-section-thumbnail");
          if (!thumb) return;
          thumb.gotoFunction(this.currentVariant.featured_media.position-1);
        }
      }else{
        if (!t) return;
        let match = t.name.match(/\[(.*?)\]/);
        if (!match) return;
        let val = match[1];
        if (this.productTarget.querySelector(".is_column")) {
          if (!arr.includes(val)) {
            const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
            mediaGalleries.forEach((mediaGallery) =>
              mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true)
            );
          }else{
            const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
            mediaGalleries.forEach((mediaGallery) =>
              {
                const colorPosition = mediaGallery.dataset.colorPosition;
                if (colorPosition) {
                  const filter_items = this.variantData.filter(item => item[colorPosition] === t.value);
                  const galleryGrid = mediaGallery.querySelector(".gallery-grid-js");
                  if (!galleryGrid) return;
                  const content = document.createElement('div');
                  mediaGallery.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                  {
                    const alt = image.dataset.alt;
                    if (t.value == alt) {
                      content.appendChild(image.cloneNode(true));
                    }
                  });
                  if (!content.querySelector(".slider-image") && filter_items) {
                    mediaGallery.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                    {
                      const position = image.dataset.position;
                      filter_items.forEach((items) => {
                        if (items.featured_image.position == position) {
                          content.appendChild(image.cloneNode(true));
                        }
                      });
                    });
                  }
                  galleryGrid.innerHTML = "";
                  galleryGrid.innerHTML = content.innerHTML;
                }
              }
            );
          }
        }else{
          const slide = this.productTarget.querySelector("slide-section.slide-section-media");
          if (!slide) return;
          if (!arr.includes(val)) {
            const slide_items = slide.querySelectorAll(".slider-image");
            if (slide_items.length == 0) return;
            slide_items.forEach((e, index) => {
              const mediaId = e.getAttribute('data-media-id');
              if (mediaId && mediaId === `${this.dataset.section}-${this.currentVariant.featured_media.id}`) {
                slide.gotoFunction(index);
                const thumb = this.productTarget.querySelector("slide-section.slide-section-thumbnail");
                if (!thumb) return;
                thumb.gotoFunction(index);
              }
            });
          }else{
            const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
            mediaGalleries.forEach((mediaGallery) =>
              {
                const colorPosition = mediaGallery.dataset.colorPosition;
                if (colorPosition) {
                  const filter_items = this.variantData.filter(item => item[colorPosition] === t.value);
                  const thumbnailSlide = mediaGallery.querySelector("slide-section.slide-section-thumbnail");
                  if (!thumbnailSlide) return;
                  const content_thumb = document.createElement('div');
                  thumbnailSlide.querySelector('template').content.querySelectorAll('.slider-thumbnail').forEach((image) =>
                  {
                    const alt = image.dataset.alt;
                    if (t.value == alt) {
                      content_thumb.appendChild(image.cloneNode(true));
                    }
                  });
                  if (!content_thumb.querySelector(".slider-thumbnail") && filter_items) {
                    thumbnailSlide.querySelector('template').content.querySelectorAll('.slider-thumbnail').forEach((image) =>
                    {
                      const position = image.dataset.position;
                      filter_items.forEach((items) => {
                        if (items.featured_image.position == position) {
                          content_thumb.appendChild(image.cloneNode(true));
                        }
                      });
                    });
                  }
                  thumbnailSlide.destroy();
                  thumbnailSlide.slider = null;
                  thumbnailSlide.querySelector(".slide-container").innerHTML = "";
                  thumbnailSlide.querySelector(".slide-container").innerHTML = content_thumb.innerHTML;
                  thumbnailSlide.initSlide();
                  const gallerySlide = mediaGallery.querySelector("slide-section.slide-section-media");
                  if (!gallerySlide) return;
                  const content = document.createElement('div');
                  gallerySlide.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                  {
                    const alt = image.dataset.alt;
                    if (t.value == alt) {
                      content.appendChild(image.cloneNode(true));
                    }
                  });
                  if (!content.querySelector(".slider-image") && filter_items) {
                    gallerySlide.querySelector('template').content.querySelectorAll('.slider-image').forEach((image) =>
                    {
                      const position = image.dataset.position;
                      filter_items.forEach((items) => {
                        if (items.featured_image.position == position) {
                          content.appendChild(image.cloneNode(true));
                        }
                      });
                    });
                  }
                  gallerySlide.destroy();
                  gallerySlide.slider = null;
                  gallerySlide.querySelector(".slide-container").innerHTML = "";
                  gallerySlide.querySelector(".slide-container").innerHTML = content.innerHTML;
                  gallerySlide.initSlide();
                  gallerySlide.gotoFunction(0);
                }
              }
            );
          }
        }
        const media = document.querySelector('.feature-product-media');
        if (media){
          if (media.classList.contains('external_zoom') || media.classList.contains('inner_zoom')) {
            Zoom.init();
          } else if (media.classList.contains('lightbox')) {
            initPhotoSwipeFromDOM('.gallery-zoom');
          }
        }
      }
    }
    renderProductInfor(productTarget,variantQtyData) {
      if (!this.currentVariant) return;
      if (!productTarget) return;
      let qty = 0;
      let percent = 0;
      let sale = false;
      let soldOut = false;
      let pre_order = false;
      let av = this.currentVariant.available;
      let im = this.currentVariant.inventory_management;
      const compare_at_price = this.currentVariant.compare_at_price;
      const price = this.currentVariant.price;
      let avaiable = productTarget.querySelector(".available-value");
      let sku = this.currentVariant.sku;
      let sku_area = productTarget.querySelector(".product__sku .sku_content");
      if (sku_area) sku_area.innerHTML = sku ? sku : "N/A";
      let option_value = productTarget.querySelectorAll(".option_value");
      if (option_value.length != 0) {
        option_value.forEach((e, index) => {
          if (this.currentVariant[`option${index+1}`]) {
            e.innerHTML = this.currentVariant[`option${index+1}`];
          }
        });
      }
      variantQtyData.find((variantQty) => {
        if (variantQty.id === this.currentVariant.id) {
          qty = variantQty.qty;
        }
      });
      variantQtyData.find((variantQty) => {
        if (variantQty.id === this.currentVariant.id) {
          qty = variantQty.qty;
        }
      });
      if (compare_at_price && compare_at_price > price) {
        sale = true;
        percent = compare_at_price - price;
      }
      if (im === null) {
        soldOut = false;
        pre_order = false;
        if (avaiable) {
          avaiable.innerHTML = window.variantStrings.inStock;
        }
      } else {
        if (av) {
          if (qty < 1) {
            pre_order = true;
            if (avaiable) {
              avaiable.innerHTML = window.variantStrings.preOrder;
            }
          }
          else{
            soldOut = false;
            pre_order = false;
            if (avaiable) {
              avaiable.innerHTML = window.variantStrings.inStock;
            }
            if (avaiable) {
              avaiable.innerHTML = window.variantStrings.inStock;
            }
          }
        } else {
          soldOut = true;
          if (avaiable) {
            avaiable.innerHTML = window.variantStrings.outStock;
          }
        }
      }
      this.renderLabel(sale,pre_order,soldOut,percent,productTarget);
      this.renderBtnStatus(productTarget,im, av, qty);
    }
    renderLabel(sale,pre_order,soldOut,percent,productTarget) {
      if (sale || pre_order || soldOut) {

        if (!productTarget.querySelector(".product__badges")) {
          var element = document.createElement("div");
          element.classList.add(
            "product__badges",
            "fs-small",
            "d-flex",
            "flex-wrap",
            "uppercase"
          );
          if (productTarget.querySelector(".sale_badge")) {
            productTarget.querySelector(".sale_badge").appendChild(element);
          }
        }
      }
      const label = productTarget.querySelector(".product__badges");
  
      if (label) {
        const prd = Shopify.formatMoney(
          percent,
          themeGlobalVariables.settings.money_format
        );
        const dsale = label.querySelector(".product__badges-sale");
        const dsoldout = label.querySelector(".product__badges-sold-out");
        const dpreorder = label.querySelector(".product__badges-pre-order");
        if (sale) {
          if (!dsale) {
            var elementsale = document.createElement("div");
            elementsale.classList.add(
              "product__badges-sale",
              "d-inline-flex",
              "middle-center",
              "heading-weight",
              "text-center"
            );
  
            elementsale.innerHTML = `${window.variantStrings.save?window.variantStrings.save:"Save"} ${prd}`;
            if (dsoldout) {
              label.insertBefore(elementsale, dsoldout);
            }else if (dpreorder){
              label.insertBefore(elementsale, dpreorder);
            }else{
              label.appendChild(elementsale);
            }
        } else {
            dsale.innerHTML = `${window.variantStrings.save?window.variantStrings.save:"Save"} ${prd}`;
        }
      }
      else{
        dsale?.remove();
      }
      if (pre_order) {
        if (!dpreorder) {
          var elementpo = document.createElement("div");
          elementpo.classList.add(
            "product__badges-pre-order",
            "d-inline-flex",
            "middle-center",
            "heading-weight",
            "text-center"
          );
          elementpo.innerHTML = window.variantStrings.preOrder?window.variantStrings.preOrder:"Pre-order";
          label.appendChild(elementpo);
        } else {
          dpreorder.innerHTML = window.variantStrings.preOrder?window.variantStrings.preOrder:"Pre-order";
        }
      }else{
        dpreorder?.remove();
      }
      if (soldOut) {
        if (!dsoldout) {
          var elementso = document.createElement("div");
          elementso.classList.add(
            "product__badges-sold-out",
            "d-inline-flex",
            "middle-center",
            "heading-weight",
            "text-center"
          );
          elementso.innerHTML = window.variantStrings.soldOut?window.variantStrings.soldOut:"Sold out";
          label.appendChild(elementso);
        } else {
          dsoldout.innerHTML = window.variantStrings.soldOut?window.variantStrings.soldOut:"Sold out";
        }
      }else{
        dsoldout?.remove();
      }
     }
    }
  }
  customElements.define('variant-selects', VariantSelects);

  class VariantRadiosPage extends VariantRadios {
    onVariantChange(e) {
      e.preventDefault();
      const target = e.currentTarget;

      const sticky = document.querySelector("variant-radios-sticky") || document.querySelector("variant-selects-sticky");
      if (sticky) {
        this.stickyTarget = sticky.closest('.product__item-js');
      }
      this.productTarget = target.closest('.product__item-js');
      const variantQtyData = JSON.parse(
        this.productTarget.querySelector(".productVariantsQty").textContent
      );
      this.updateOptions();
      const currentVariant = this.updateMasterId(this.variantData);
      this.updateVariantStatuses();
      this.updatePickupAvailability();
      if (currentVariant) {
        this.updateMedia(e.target);
        this.mapUpdateMedia(this.stickyTarget, true);
        this.updatePrice(this.productTarget);
        this.updatePrice(this.stickyTarget);
        this.renderProductInfor(this.productTarget,variantQtyData);
        this.renderProductInfor(this.stickyTarget,variantQtyData);
        this.updateVariantInput();
        this.mapUpdateVariantInput(this.stickyTarget);
        this.mapUpdateVariantChecked(this.stickyTarget);
        this.updateURL();
        this.updateShareUrl();
        this.updateIncomingStatus(this.productTarget, variantQtyData);
        this.updateInventoryStatus(this.productTarget, variantQtyData);
        this.updateStockNotify(this.productTarget, variantQtyData);
      }else{
        this.setUnavailable();
        this.mapSetUnavailable(this.stickyTarget);
        this.mapUpdateVariantChecked(this.stickyTarget);

      }
      this.mapUpdateVariantStatuses(this.stickyTarget);

    }
  }
  customElements.define('variant-radios-page', VariantRadiosPage);
  class VariantSelectsPage extends VariantSelects {
    onVariantChange(e) {
      e.preventDefault();
      const target = e.currentTarget;
      const sticky = document.querySelector("variant-radios-sticky") || document.querySelector("variant-selects-sticky");
      if (sticky) {
        this.stickyTarget = sticky.closest('.product__item-js');
      }
      this.productTarget = target.closest('.product__item-js');
      const variantQtyData = JSON.parse(
        this.productTarget.querySelector(".productVariantsQty").textContent
      );
      this.updateOptions();
      const currentVariant = this.updateMasterId(this.variantData);
      this.updateVariantStatuses();
      this.updatePickupAvailability();
      if (currentVariant) {
        this.updateMedia(e.target);
        this.mapUpdateMedia(this.stickyTarget, true);
        this.updatePrice(this.productTarget);
        this.updatePrice(this.stickyTarget);
        this.renderProductInfor(this.productTarget,variantQtyData);
        this.renderProductInfor(this.stickyTarget,variantQtyData);
        this.updateVariantInput();
        this.mapUpdateVariantInput(this.stickyTarget);
        this.mapUpdateVariantChecked(this.stickyTarget);
        this.updateURL();
        this.updateShareUrl();
        this.updateIncomingStatus(this.productTarget, variantQtyData);
        this.updateInventoryStatus(this.productTarget, variantQtyData);
        this.updateStockNotify(this.productTarget, variantQtyData);
      }else{
        this.mapUpdateVariantChecked(this.stickyTarget);
        this.setUnavailable();
        this.mapSetUnavailable(this.stickyTarget);
      }
      this.mapUpdateVariantStatuses(this.stickyTarget);
    }
  }
  customElements.define('variant-selects-page', VariantSelectsPage);

  class VariantRadiosSticky extends VariantRadios {
    constructor() {
      super();
    }
    onVariantChange(e) {
      e.preventDefault();
      const target = e.currentTarget;
      const master = document.querySelector("variant-radios-page") || document.querySelector("variant-selects-page"); 
      this.masterTarget = master.closest('.product__item-js');
      this.productTarget = target.closest('.product__item-js');
      const variantQtyData = JSON.parse(
        this.productTarget.querySelector(".productVariantsQty").textContent
      );
      this.updateOptions();
      this.currentVariant = this.updateMasterId(this.variantData);
      this.updatePickupAvailability();
      if (this.currentVariant) {
        this.updateMedia();
        this.mapUpdateMedia(this.masterTarget, false, e.target);
        this.updatePrice(this.productTarget);
        this.updatePrice(this.masterTarget);
        this.renderProductInfor(this.productTarget,variantQtyData);
        this.renderProductInfor(this.masterTarget,variantQtyData);
        this.updateVariantInput();
        this.mapUpdateVariantInput(this.masterTarget);
        this.mapUpdateVariantChecked(this.masterTarget);
        this.updateVariantStatuses();
        this.mapUpdateVariantStatuses(this.masterTarget);
        this.updateURL();
        this.updateShareUrl();
        this.updateIncomingStatus(this.masterTarget, variantQtyData);
        this.updateInventoryStatus(this.masterTarget, variantQtyData);
        this.updateStockNotify(this.masterTarget, variantQtyData);
      }else{
        this.mapUpdateVariantChecked(this.masterTarget);
        this.setUnavailable();
        this.mapSetUnavailable(this.masterTarget);
      }
    }
    updateMedia() {
      if (!this.currentVariant) return;
      if (!this.currentVariant.featured_media) return;
      if (this.productTarget.querySelector(".product__media img")) {
        this.productTarget.querySelector(".product__media img")
        .removeAttribute("srcset");
      }      
      if (this.productTarget.querySelector(".product__media img")) {
        this.productTarget.querySelector(".product__media img")
        .setAttribute("src", this.currentVariant.featured_media.preview_image.src);
      }
    }
  }
  customElements.define('variant-radios-sticky', VariantRadiosSticky);
  class VariantSelectsSticky extends VariantSelects {
    onVariantChange(e) {
      e.preventDefault();
      const target = e.currentTarget;
      const master = document.querySelector("variant-radios-page") || document.querySelector("variant-selects-page"); 
      this.masterTarget = master.closest('.product__item-js');
      this.productTarget = target.closest('.product__item-js');
      const variantQtyData = JSON.parse(
        this.productTarget.querySelector(".productVariantsQty").textContent
      );
      this.updateOptions();
      const currentVariant = this.updateMasterId(this.variantData);
      this.updateVariantStatuses();
      this.mapUpdateVariantStatuses(this.masterTarget);
      this.updatePickupAvailability();
      if (currentVariant) {
        this.updateMedia();
        this.mapUpdateMedia(this.masterTarget, false, e.target);
        this.updatePrice(this.productTarget);
        this.updatePrice(this.masterTarget);
        this.renderProductInfor(this.productTarget,variantQtyData);
        this.renderProductInfor(this.masterTarget,variantQtyData);
        this.updateVariantInput();
        this.mapUpdateVariantInput(this.masterTarget);
        this.mapUpdateVariantChecked(this.masterTarget);
        this.updateURL();
        this.updateShareUrl();
        this.updateIncomingStatus(this.masterTarget, variantQtyData);
        this.updateInventoryStatus(this.masterTarget, variantQtyData);
        this.updateStockNotify(this.masterTarget, variantQtyData);
      }else{
        this.mapUpdateVariantChecked(this.masterTarget);
        this.setUnavailable();
        this.mapSetUnavailable(this.masterTarget);
      }
    }
    updateMedia() {
      if (!this.currentVariant) return;
      if (!this.currentVariant.featured_media) return;
      if (this.productTarget.querySelector(".product__media img")) {
        this.productTarget.querySelector(".product__media img")
        .removeAttribute("srcset");
      }      
      if (this.productTarget.querySelector(".product__media img")) {
        this.productTarget.querySelector(".product__media img")
        .setAttribute("src", this.currentVariant.featured_media.preview_image.src);
      }
    }
  }
  customElements.define('variant-selects-sticky', VariantSelectsSticky);
  class ProductRecommendations extends BaseSlide {
    constructor() {
      super();
    }
    init(){
      this.connectedCallback();
    }
    connectedCallback() {
      const __this = this;
      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        fetch(this.dataset.url)
          .then(response => response.text())
          .then(text => {
            const html = document.createElement('div');
            html.innerHTML = text;
            const recommendations = html.querySelector('product-recommendations');
            if (recommendations && recommendations.innerHTML.trim().length) {
              this.innerHTML = recommendations.innerHTML;
            }
            if (recommendations.innerHTML.trim().length === 0) {
              this.remove();
            }
          })
          .finally(() => {
            initLazyloadItem();
            if (__this.classList.contains("related-products-slide") && !__this.classList.contains("complementary-products")) {
              const has_item_mb = __this.dataset?.freeScroll;
              if (has_item_mb) {
                if (window.innerWidth <= 767) {
                  __this.initProgressBar();
                }else{
                  __this.initSlide();
                }
              }
              __this.onResize();
            }else{
              __this.initSlide();
            }
          })
          .catch(e => {
            console.error(e);
          });
      }
      new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
    }
    onResize() {
      const _this = this;
      const has_item_mb = this.dataset?.freeScroll;
      let windowWidth = window.innerWidth;
      let isMobile = windowWidth <= 767;
      window.addEventListener("resize", function() {
        const newWindowWidth = window.innerWidth;
        const newIsMobile = newWindowWidth <= 767;
        if (newIsMobile !== isMobile) {
          windowWidth = newWindowWidth;
          isMobile = newIsMobile;
          if (has_item_mb) {
            if (isMobile) {
              _this.destroy();
              _this.initProgressBar();
            }else{
              _this.removeProgressBar();
              _this.destroy();
              _this.initSlide();
            }
          }
        }
      });
    }
    destroy(){
      if(!this.slider) return;
      this.slider.destroy();
      this.slider = null;
    }
    removeProgressBar() {
      if (this.querySelector(".tns-progress")) {
        this.querySelector(".tns-progress").remove();
      }
    }
    initProgressBar() {
      if (!this.querySelector(".tns-progress")) {
        var progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('tns-progress');
        var progressBar = document.createElement('div');
        progressBar.classList.add('tns-progress-bar');
        progressBar.style.width = "5%";
        progressBarContainer.appendChild(progressBar);
        this.appendChild(progressBarContainer);
        setTimeout(() => {
          this.actionScrollBar();
        });
      }
    }
    actionScrollBar() {
      var container = this.querySelector(".slide-container");
      if(!container) return;
      var progressBar = this.querySelector('.tns-progress-bar');
      if(!progressBar) return;
      container.addEventListener('scroll', () => {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        if (scrollPercentage <= 100) {
          progressBar.style.width = `${scrollPercentage}%`;
        }
        if (scrollPercentage <= 5) {
          progressBar.style.width = `5%`;
        }
      });
    }
  }
  customElements.define('product-recommendations', ProductRecommendations);
  class ProductRecentlyViewed extends BaseSlide {
    constructor() {
      super();
    }
    init(){
      this.connectedCallback();
    }
    initData(){
      var savedProductsArr = JSON.parse(
        localStorage.getItem("bl_recently-viewed-products")
      );
      this.getStoredProducts(savedProductsArr);

    }
    getStoredProducts(p) {
      const _this = this;
      const limit = this.dataset?.limit;
      var query = "";
      var productAjaxURL = ""
      if (p) {
        const arr = [...p].reverse();
        arr.forEach((e, key, pr) => {
          if (limit > (key+1)) {
            if (!Object.is(pr.length - 1, key)) {
              query += e.id + "%20OR%20id:";
            } else {
              query += e.id;
            }
          }
        });
        productAjaxURL =
          "&q=id:" +
          query;
        
      }
      fetch(`${this.dataset.url}${productAjaxURL}`)
        .then(response => response.text())
        .then(text => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const items = html.querySelectorAll('.product-wrapper');
          const arrHtml = [];
          if (items.length > 0) {
            const p_reverse = p.reverse()
            p_reverse.forEach(item => {
              items.forEach(e => {
                const itemId = e.querySelector(".product__item-js")?.dataset.itemId;
                if (itemId) {
                  if (item.id == Number(itemId)) {
                    arrHtml.push(e);
                  }
                }
              });
            });
            var node = document.createElement("div");
            const is_carousel = this.dataset.isCarousel;
            arrHtml.forEach((n) => {
              node.appendChild(n);
            });
            if (is_carousel) {
              node.classList.add("slide-container");
              this.innerHTML = node.outerHTML;
            }else{
              this.innerHTML = node.innerHTML;
            }
          }else{
            if (_this.closest(".section-recently-viewed-products")) {
              _this.closest(".section-recently-viewed-products").querySelector(".no-product")?.classList.remove("d-none");
              _this.closest(".section-recently-viewed-products").querySelector("recently-viewed-products")?.remove();
            }
          }
        })
        .finally(() => {
          initLazyloadItem();
          if (_this.classList.contains("recently-viewed-products-slide")) {
            const has_item_mb = _this.dataset?.freeScroll;
            if (has_item_mb) {
              if (window.innerWidth <= 767) {
                _this.initProgressBar();
              }else{
                _this.initSlide();
              }
            }
            _this.onResize();
          }
        })
        .catch(e => {
          console.error(e);
        });
    }
    onResize() {
      const _this = this;
      const has_item_mb = this.dataset?.freeScroll;
      let windowWidth = window.innerWidth;
      let isMobile = windowWidth <= 767;
      window.addEventListener("resize", function() {
        const newWindowWidth = window.innerWidth;
        const newIsMobile = newWindowWidth <= 767;
        if (newIsMobile !== isMobile) {
          windowWidth = newWindowWidth;
          isMobile = newIsMobile;
          if (has_item_mb) {
            if (isMobile) {
              _this.destroy();
              _this.initProgressBar();
            }else{
              _this.removeProgressBar();
              _this.destroy();
              _this.initSlide();
            }
          }
        }
      });
    }
    destroy(){
      if(!this.slider) return;
      this.slider.destroy();
      this.slider = null;
    }
    removeProgressBar() {
      if (this.querySelector(".tns-progress")) {
        this.querySelector(".tns-progress").remove();
      }
    }
    initProgressBar() {
      if (!this.querySelector(".tns-progress")) {
        var progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('tns-progress');
        var progressBar = document.createElement('div');
        progressBar.classList.add('tns-progress-bar');
        progressBar.style.width = "5%";
        progressBarContainer.appendChild(progressBar);
        this.appendChild(progressBarContainer);
        setTimeout(() => {
          this.actionScrollBar();
        });
      }
    }
    actionScrollBar() {
      var container = this.querySelector(".slide-container");
      if(!container) return;
      var progressBar = this.querySelector('.tns-progress-bar');
      if(!progressBar) return;
      container.addEventListener('scroll', () => {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        if (scrollPercentage <= 100) {
          progressBar.style.width = `${scrollPercentage}%`;
        }
        if (scrollPercentage <= 5) {
          progressBar.style.width = `5%`;
        }
      });
    }
    connectedCallback() {
      const __this = this;
      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        __this.initData();
      }
  
      new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
    }
  }
  customElements.define('recently-viewed-products', ProductRecentlyViewed);