"use-strict";

var Shopify = Shopify || {};
var root = document.getElementsByTagName( 'html' )[0];
let parser = new DOMParser();
function setCookie(cname, exdays, cvalue) {
  const date = new Date();
  date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + date.toUTCString();
  let cookieString = cname + "=" + cvalue + ";" + expires + ";path=/";
  cookieString += ";secure";
  document.cookie = cookieString;
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}

const slideAnime = (() => {
  let isAnimating = false;

  return (setOptions) => {
    const defaultOptions = {
      target: false,
      animeType: "slideToggle",
      duration: 250,
      easing: "ease",
      isDisplayStyle: "block",
      parent: false,
    };
    const options = Object.assign({}, defaultOptions, setOptions);
    const target = options.target;
    const parent = options.parent;
    if (!target) {
      return;
    }

    if (isAnimating) {
      return;
    }
    isAnimating = true;
    parent.classList?.toggle("opened");

    let animeType = options.animeType;
    const styles = getComputedStyle(target);
    if (animeType === "slideToggle") {
      animeType = styles.display === "none" ? "slideDown" : "slideUp";
    }
    if (
      (animeType === "slideUp" && styles.display === "none") ||
      (animeType === "slideDown" && styles.display !== "none") ||
      (animeType !== "slideUp" && animeType !== "slideDown")
    ) {
      isAnimating = false;
      return false;
    }
    target.style.overflow = "hidden";
    const duration = options.duration;
    const easing = options.easing;
    const isDisplayStyle = options.isDisplayStyle;

    if (animeType === "slideDown") {
      target.style.display = isDisplayStyle;
    }
    const heightVal = {
      height: target.getBoundingClientRect().height + "px",
      marginTop: styles.marginTop,
      marginBottom: styles.marginBottom,
      paddingTop: styles.paddingTop,
      paddingBottom: styles.paddingBottom,
    };

    Object.keys(heightVal).forEach((key) => {
      if (parseFloat(heightVal[key]) === 0) {
        delete heightVal[key];
      }
    });
    if (Object.keys(heightVal).length === 0) {
      isAnimating = false;
      return false;
    }
    let slideAnime;
    if (animeType === "slideDown") {
      Object.keys(heightVal).forEach((key) => {
        target.style[key] = 0;
      });
      slideAnime = target.animate(heightVal, {
        duration: duration,
        easing: easing,
      });
    } else if (animeType === "slideUp") {
      Object.keys(heightVal).forEach((key) => {
        target.style[key] = heightVal[key];
        heightVal[key] = 0;
      });
      slideAnime = target.animate(heightVal, {
        duration: duration,
        easing: easing,
      });
    }
    slideAnime.finished.then(() => {
      target.style.overflow = "";
      Object.keys(heightVal).forEach((key) => {
        target.style[key] = "";
      });
      if (animeType === "slideUp") {
        target.style.display = "none";
      }
      isAnimating = false;
    });
  };
})();

function initLazyload() {
  window.addEventListener("scroll", () => {
    this.scrollLazyload();
  });
  let pos = window.pageYOffset;
  if (pos > 1) {
    this.scrollLazyload();
  }
}
initLazyload();

function scrollLazyload() {
  document.querySelectorAll("video.lazyload-video").forEach((el) => {
    scrollLazyloadItem(el);
  });
}

function scrollLazyloadItem(el) {
  const src = el.dataset.src;
  if (src) {
    el.setAttribute("src", src);
    el.removeAttribute("data-src");
  }
  el.classList.remove("lazyload-video");
}

Shopify.formatMoney = function (cents, format) {
  if (typeof cents == "string") {
    cents = cents.replace(".", "");
  }
  var value = "";
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || this.money_format;
  function defaultOption(opt, def) {
    return typeof opt == "undefined" ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split("."),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
      cents = parts[1] ? decimal + parts[1] : "";

    return dollars + cents;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
  }
  return formatString.replace(placeholderRegex, value);
};
function checkDeviceIsMobile() {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ["android", "iphone", "ipod", "ipad", "windows phone"];
  for (let keyword of mobileKeywords) {
    if (userAgent.indexOf(keyword) > -1) {
      return true;
    }
  }
  return false;
}
let windowWidth = window.innerWidth;

function windowResize() {
  window.addEventListener("resize", function(){
    calWidthTiktokItem.setWidthDiv();
    windowWidth = window.innerWidth;
    if (windowWidth > 1024) {
      const hasOpens = document.querySelectorAll(".has-open");
      if (hasOpens.length != 0) {
        hasOpens.forEach(e => {
          e.setAttribute("open", "");
        });
      }
    }
  });
}
windowResize();

function pauseAllMedia(s) {
  if (!s) return;

  s.querySelectorAll('.js-youtube').forEach((video) => {
    if (!video.paused) {
      video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    }
  });
  s.querySelectorAll('.js-vimeo').forEach((video) => {
    if (video.contentWindow && video.contentWindow.postMessage) {
      video.contentWindow.postMessage('{"method":"pause"}', '*');
    }
  });
  s.querySelectorAll('video').forEach((video) => {
    if (!video.paused) {
      video.pause();
    }
  });
}

var responsiveImage = (function () {
  return {
    init: function () {
      const img = document.querySelectorAll("img[data-sizes='auto']");
      if (img.length != 0) {
        img.forEach(e => {
          if (e.offsetWidth != 0) {
            e.setAttribute("sizes", e.offsetWidth+"px");
          }
        });
      }
    }
  };
})();
responsiveImage.init();

var removeIdSvg = (function () {
  return {
    onLoading: function () {
      const svg = document.querySelectorAll("svg.img-placeholder");
      if (svg.length != 0) {
        svg.forEach(e => {
          const defs = e.querySelector("defs"); 
          if (defs) { 
              defs.parentNode.removeChild(defs);  
          } 
          const g_tag = e.querySelector("g"); 
          if (defs) { 
              g_tag.removeAttribute('clip-path'); 
          } 
        });
      }
    }
  };
})();
removeIdSvg.onLoading();

var calWidthTiktokItem = (function () {
  return {
    setWidthDiv: function () {
      const g_item = document.querySelectorAll("div.tiktok-items");
      if (g_item.length > 0) {
        g_item.forEach(i_t => {
          const child_div = i_t.querySelector("div.tiktock-video");
          if(child_div){ 
            let width = "--item-width: " + i_t.offsetWidth;
            child_div.setAttribute("style", width);
          } 
        });
      }
    }
  };
})();
calWidthTiktokItem.setWidthDiv();

var closePopup = (function () {
  return {
    hide: function () {
      rootAction.remove();
      const os = document.querySelector(".overlay-section .bls__canvas.active") || document.querySelector(".overlay-section .bls__canvas-mb.active");
      if (!os) return;
      os.classList.remove("active");
      const fi = os.dataset?.focusItem;
      if (fi && document.querySelector("#"+fi)) {
        removeTrapFocus(document.querySelector("#"+fi));
      }
    },
    onEscKeyUp: function () {
      document.addEventListener("keyup", (event) => {
        if(event.code?.toUpperCase() === 'ESCAPE') this.hide();
      });
    }
  };
})();

var getHeightHeader = (function () {
  return {
    init: function () {
      const _this = this;
      window.addEventListener("resize", function(){
        _this.getHeight();
      });
      _this.getHeight();
    },
    getHeight() {
      if (!document.querySelector(".section-header header")) return;
      var rect = document.querySelector(".section-header header").getBoundingClientRect();
      var divTop = 0;
      if (window.scrollY == 0) {
        divTop = rect.top + document.querySelector(".section-header header").offsetHeight;
      }else{
        if (rect.top > 0) {
          divTop = rect.top + document.querySelector(".section-header header").offsetHeight;
        }else{
          divTop = document.querySelector(".section-header header").offsetHeight;
        }
      }
      const sectionHeader = document.querySelector('.section-header');
      const sectionAB = document.querySelector('.section-announcement-bar');
      if (this.checkPositionAnnouncementBar(sectionHeader, sectionAB)) {
        const ab = sectionAB.querySelector("announcement-bar");
        if (ab) {
          divTop += ab.offsetHeight;
        }
      }
      root.style.setProperty("--header-height", divTop+"px");
    },

    checkPositionAnnouncementBar(sectionHeader, sectionAB) {
      if (sectionHeader && sectionAB) {
        const rectA = sectionHeader.getBoundingClientRect();
        const rectB = sectionAB.getBoundingClientRect();

        const isAOnTopOfB = rectA.bottom <= rectB.top;

        if (isAOnTopOfB) {
          return true;
        } else {
          return false;
        }
      }
    }
  };
})();
getHeightHeader.init();

var getScrollBarWidth = (function () {
  return {
    init: function () {
      var scrollDiv = document.createElement("div");
      scrollDiv.style.width = "100px";
      scrollDiv.style.height = "100px";
      scrollDiv.style.overflow = "scroll";
      scrollDiv.style.position = "absolute";
      scrollDiv.style.top = "-9999px";
      document.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    },
  };
})();

var rootAction = (function () {
  return {
    add: function () {
      root.style.setProperty("--padding-right", getScrollBarWidth.init()+"px");
    },
    addNoneHeight: function () {
      root.style.setProperty("--padding-right", getScrollBarWidth.init()+"px");
    },
    remove: function () {
      root.style.removeProperty('--padding-right');
      root.classList.remove("open-canvas");
      root.classList.remove("open-search");
      root.classList.remove("open-nav");
    },
    toggle: function () {
      if (getComputedStyle(root).getPropertyValue('--padding-right')) {
        root.style.removeProperty('--padding-right');
      } else {
        root.style.setProperty("--padding-right", getScrollBarWidth.init()+"px");
      }
      root.classList.toggle("open-canvas");
      root.classList.toggle("open-search");
      root.classList.toggle("open-nav");
    },
  };
})();

//
class Announcementbar extends HTMLElement {
  constructor(){
    super();
    root.style.setProperty("--announcement-height", this.offsetHeight+"px");
    window.addEventListener("resize", () => {
      root.style.setProperty("--announcement-height", this.offsetHeight+"px");
    });
  }
  reload(){
    let maxHeight = 0;
    const slides = this.querySelectorAll(".tns-item");
    if (slides.length != 0) {
      slides.forEach(function(e){
        if (e.offsetHeight > maxHeight) {
          maxHeight = e.offsetHeight;
        }
      });
    }
    const ss = this.querySelector("slide-section");
    const as = this.querySelector(".announcement-slide");
    if (!ss) return;
    if (as) {
      as.style.height = maxHeight+"px";
      ss.classList.add("d-none");
    }
    setTimeout(() => {
      ss.style.height = maxHeight+"px";
      ss.classList.remove("d-none");
      as.style.removeProperty('height');
    }, 1000);
  }
}
customElements.define('announcement-bar', Announcementbar);

class BaseSlide extends HTMLElement {
  constructor() {
    super();
    this.slider = null; 
  }
  init(){}
  initSlide() {
    const _this = this;
    const items = this.dataset?.items;
    const itemsMb = this.dataset?.itemsMb;
    const atto = this.dataset?.autoplayTimeout;
    const cp = this.dataset?.controlsPosition;
    const np = this.dataset?.navPosition;
    const a = this.dataset?.axis;
    const m = this.dataset?.mode;
    const nc = this.dataset?.navContainer;
    const t = this.dataset?.productType;
    let sti = this.dataset?.startIndex;
    const mh = this.dataset?.maxHeight;
    const im = this.dataset?.mobile;
    const ctn = this.querySelector(".slide-container");
    const c = this.dataset?.controls !== "false";
    const n = this.dataset?.nav !== "false";
    const l = this.dataset?.loop !== "false";
    const at = this.dataset?.autoplay !== "false";
    const md = this.dataset?.mouseDrag !== "false";
    const nat = this.dataset?.navAsThumbnails !== "false";
    const fh = this.dataset?.fixHeight !== "false";
    const lazyload = this.dataset?.lazyload !== "false";
    const next = this.dataset?.next;
    const prev = this.dataset?.prev;
    const center = this.dataset?.navCenterPostion;
    const speed = this.dataset?.speed;
    const pause_video = this.dataset?.pauseVideo ? this.dataset?.pauseVideo : "true";
    const event_custom = this.dataset?.eventCustom ? this.dataset?.eventCustom : "true";
    let psot = "auto";
    if(this.dataset?.psot !== undefined){
      psot = false;
    }

    if (this.closest("media-gallery")) {
      const parent = this.closest("media-gallery").closest(".product__item-js");
      if (parent && parent.querySelector(".productJson") && this.closest("media-gallery").dataset.variantId) {
        let stix = JSON.parse(
          parent.querySelector(".productJson").textContent
        );
        if (parent.classList.contains("main__product")) {
          const is_variant_group =  parent.querySelector(".is_variant_group");
          if (!is_variant_group) {
            sti = this.getPosition(this.closest("media-gallery").dataset.variantId, stix.variants) - 1;
          }
        }
      }
    }
    if (!ctn) return;
    this.slider = tns({
      "container": ctn,
      "autoplay": at,
      "items": itemsMb?itemsMb:im?im:t?items>1?2:1:items?items:1,
      "responsive": {
        768: {
          "items": t&&items>2?2:items?items:1
        },
        992: {
          "items": t&&items>3?4:items?items:1,
        },
        1025: {
          "items": items?items:1,
        }
      }, 
      "autoplayHoverPause": true,
      "mouseDrag": md,
      "lazyload": lazyload,
      "autoplayTimeout": atto?atto:5000,
      "controls": c,
      "controlsPosition": cp?cp:"top",
      "loop": l,
      "axis": a?a:"horizontal",
      "swipeAngle": false,
      "mode": m?m:"carousel",
      "navContainer": nc?`#${nc}`:false,
      "onInit": _this.tnsInitialized(ctn),
      "startIndex": sti?sti:0,
      "centerNav": center?`.${center}`:false,
      "nextButton": next?`#${next}`:false,
      "prevButton": prev?`#${prev}`:false,
      "navAsThumbnails": nat,
      "nav": n,
      "navPosition": np?np:"bottom",
      "autoplayButtonOutput": false,
      "animateIn": "fadeIn",
      "animateOut": "fadeOut",
      "speed": speed?speed:300,
      "preventScrollOnTouch": psot
    });
    if (fh) {
      _this.fixHeightFunction(mh);
    }
    if (this.slider && event_custom == "true") {
      this.slider.events.on('indexChanged', function(info) {
        if (pause_video == "true") {
          _this.pauseMedia(info);
        } else {
          _this.indexChanged(info);
        }
      });
    }
    calWidthTiktokItem.setWidthDiv();
  }
  tnsInitialized(ctn) {
    ctn.classList.add("tns-initialized");
    const is_product_slide = this.dataset.slideProduct;
    if (is_product_slide) {
      var t;
      const swatch_items = this.querySelectorAll(".swatch-items-js");
      if (swatch_items.length != 0) {
        swatch_items.forEach((e) => {
          const productTarget = e.closest(".product__item-js");
          const parent = e.closest("product-recommendations") || e.closest("recently-viewed-products") || e.closest("slide-section")
          if (productTarget) {
            e.addEventListener("mouseout", function () {
              if (parent) {
                t = setTimeout(() => {
                  parent.classList.remove("show-tooltip");
                }, 400);
              }
            }, false);
            e.addEventListener("mouseover", () => {
              clearTimeout(t);
              if (parent) {
                parent.classList.add("show-tooltip");
              }
            });
          }

        });
      }
    }
  }
  pauseMedia(s){
    if (!s.container) return;
    window.pauseAllMedia(s.container);
  }

  indexChanged(s){
    if (!s.container) return;
    var testimonials = s.container.closest("image-testimonials");
    var shopable_video = s.container.closest(".shopable-video-slide");
    if (testimonials) {
      const slide = testimonials.querySelector("slide-section.image-testimonials-slide");
      if (!slide) return;
      slide.gotoFunction(s.displayIndex-1);
    }
    if (shopable_video && window.innerWidth < 768) {
      const active_video = shopable_video.querySelector(".tns-slide-active");
      if (active_video) {
        active_video.closest(".bls__shopable-video").querySelectorAll("shopable-video").forEach((el) => {
          el.classList.remove("active-video");
          if (el.querySelector(".mute-button")) {
            el.querySelector(".mute-button").classList.remove("active");
          }
          const video = el.querySelector("video");
          if (video && !video.paused) {
            video.pause();
          }
        });
        if (active_video.querySelector("video") && !active_video.classList.contains("active-video")) {
          active_video.querySelector("video").muted = true;
          active_video.querySelector("video").play();
          active_video.classList.add('active-video');
        }
      }
    }
  }
  fixHeightFunction(mh) {
    const _this = this;
    const sl = this.querySelectorAll('.tns-item');
    window.setTimeout(() => {
      _this.fixHeight(mh,sl, _this);
    }, 500);
    window.addEventListener("resize", function() {
      _this.fixHeight(mh,sl, _this);
    })
  }
  fixHeight(mh,sl, _this){
    if (mh) {
      _this.style.height = `${mh}px`;
    }else{
      let maxh = 0;
      if (sl.length) {
        sl.forEach(s => {
          const slh = s.offsetHeight;
          if (slh > maxh) {
            maxh = slh;
          }
        });
      }
      _this.style.height = `${maxh}px`;
    }
  }
  getPosition(variantValue, stix){
    if (variantValue && stix) {
      var currentURL = window.location.href;
      var queryString = currentURL.split('?')[1];
      if (queryString) {
        var params = queryString.split('&');
        if (params) {
          var queryVars = {};
          params.forEach(function(param) {
            var keyValue = param.split('=');
            var key = decodeURIComponent(keyValue[0]);
            var value = decodeURIComponent(keyValue[1]);
            queryVars[key] = value;
          });
          variantValue = queryVars['variant'];
        }
      }
      var foundVariant = stix.find(function(variant) {
        return variant.id === Number(variantValue);
      });
      var position = foundVariant ? foundVariant.featured_image?.position : 0;
      return position;
    }
  }
}

class SlideSection extends BaseSlide {
  constructor(){
    super();
    this.init()
  }

  init(){
    this.initSlide();
    const _this = this;
    const has_item_mb = this.dataset?.freeScroll;
    if (has_item_mb) {
      if (window.innerWidth <= 767) {
        _this.destroy();
        _this.slider = null;
        _this.initProgressBar();
      }else{
        _this.destroy();
        _this.slider = null;
        _this.initSlide();
      }
    }
    const noResize = this.classList.contains("slide-section-tiktok");
    if (!noResize) {
      this.onResize();
    }
    if (this.classList.contains("slide-section-slideshow")) {
      _this.lazyloadImage();
    }
  }

  onResize() {
    const _this = this;
    const has_item_mb = this.dataset?.freeScroll;
    let windowWidth = window.innerWidth;
    let isMobile = windowWidth <= 767;
    window.addEventListener("resize", function() {
      const newWindowWidth = window.innerWidth;
      const newIsMobile = newWindowWidth <= 767;
      if(windowWidth == newWindowWidth){
        return false;
      }
      _this.refresh();
      _this.onSlideChange();
      if (newIsMobile !== isMobile) {
        windowWidth = newWindowWidth;
        isMobile = newIsMobile;
        if (has_item_mb) {
          if (isMobile) {
            _this.destroy();
            _this.slider = null;
            _this.initProgressBar();
          }else{
            _this.removeProgressBar();
            _this.destroy();
            _this.slider = null;
            _this.initSlide();
          }
        }
        _this.customForMediaGallery(isMobile);
      }
    });
    _this.customForMediaGallery(isMobile);
  }

  customForMediaGallery(isMobile) {
    const isThumb = this.classList.contains("slide-section-thumbnail");
    if (!isThumb) return;
    const mediaGallery = this.closest("media-gallery[data-media-type='thumbnail_slider']");
    if (mediaGallery) {
      const sl_thumb = this.closest(".slide-thumbnail");
      const mobileSlideStatus = mediaGallery.dataset.mobiSlideStatus;
      const position = mediaGallery.dataset.slidePosition;
      
      if (sl_thumb) {
        if (mobileSlideStatus == "false") {
          if (isMobile) {
            sl_thumb.classList.add("d-none");
          } else {
            sl_thumb.classList.remove("d-none");
          }
        }else{
          if (isMobile != false) {
            mediaGallery.classList.remove("thumbnail-position-left");
            mediaGallery.classList.add("thumbnail-position-bottom", "column-reverse");
            this.setAttribute("data-axis", "horizontal");
            this.refresh();
          } else {
            sl_thumb.classList.remove("d-none");
            if (position && position == "vertical") {
              mediaGallery.classList.add("thumbnail-position-left");
              mediaGallery.classList.remove("thumbnail-position-bottom", "column-reverse");
              this.setAttribute("data-axis", "vertical");
              this.refresh();
            }
          }
        }
      }
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
  removeProgressBar() {
    if (this.querySelector(".tns-progress")) {
      this.querySelector(".tns-progress").remove();
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
  gotoFunction(item) {
    this.slider.goTo(item);
  }
  addClass(item, custom_class) {
    if (this.slider.getInfo().container) {
      if (this.slider.getInfo().container.querySelectorAll(".tns-item").length == 0) return;
      this.slider.getInfo().container.querySelectorAll(".tns-item").forEach(e => {
        e.classList.remove(custom_class);
        const order = e.dataset.order;
        if (order && order === item) {
          e.classList.add(custom_class);
        }
      })
    };
  }
  onSlideChange(){
    const _this = this;
    const s = this.slider;
    if (!s) return;
    if (checkDeviceIsMobile()) {
      s.events.on('touchEnd', _this.customFunction.bind(s));
    }else{
      s.events.on('dragEnd', _this.customFunction.bind(s));
    }
    if (s.getInfo().container) {
      const next = s.getInfo().container.closest("slide-section")?.querySelector(".tns-controls>button[data-controls='next']");
      const prev = s.getInfo().container.closest("slide-section")?.querySelector(".tns-controls>button[data-controls='prev']");
      if (next) {
        next.addEventListener("click", function () {
          setTimeout(() => {
            _this.customFunction(s.getInfo());
          });
        });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          setTimeout(() => {
            _this.customFunction(s.getInfo());
          });
        });
      }
    }
  }
  customFunction(s) {
    if (!s.container) return;
    if (s.container.closest("media-gallery")) {
      const thumb = s.container.closest("media-gallery").querySelector("slide-section.slide-section-thumbnail");
      if (s.container.querySelector(".tns-slide-active") && thumb) {
        thumb.gotoFunction(s.container.querySelector(".tns-slide-active").dataset.position-1);
      }
    }
  }
  refresh(){
    const item3d = this.querySelector('.shopify-model-viewer-ui');
    if (item3d) return;
    if(!this.slider || this.classList.contains("slide-section-slideshow")) return;
    this.slider.destroy();
    this.slider = null;
    this.initSlide();
  }
  destroy(){
    if(!this.slider) return;
    this.slider.destroy();
    this.slider = null;
  }
  rebuild(){
    if(!this.slider) return;
    this.slider.rebuild();
  }
  lazyloadImage(){
    if (this.querySelectorAll(".loading-animation").length != 0) {
      this.querySelectorAll(".loading-animation").forEach((e, index) => {
        var img = new Image();
        if (e.getAttribute("src")) {
          img.src = e.getAttribute("src");
          img.addEventListener('load', function() {
            setTimeout(() => {
              e.classList.add("loaded-animation");
              e.classList.remove("loading-animation");
            }, 100);
          });
        }else{
          setTimeout(() => {
            e.classList.add("loaded-animation");
            e.classList.remove("loading-animation");
          }, 200);
        }
      });
    }
  }
}
customElements.define('slide-section', SlideSection);

class CountdownTimer extends HTMLElement {
  constructor(){
    super();
    this.countdownBtn = this.closest("div")?.querySelector('div.countdown-btn a');
    this.init();
  }
  init(){
    const cddl = this.dataset?.deadline;
    const customeTimeOutMessage = this.dataset?.message;
    let timeLeft = {};
    if (cddl) {
      let isoDate = "";
      if (this.isISODate(cddl)) {
        isoDate = cddl;
        this.mainFunction(isoDate, customeTimeOutMessage);
      }else{
        if (this.isValidDate(cddl)) {
          const dateParts = cddl.split("-");
          isoDate = dateParts[2] + "-" + dateParts[0].padStart(2, "0") + "-" + dateParts[1].padStart(2, "0") + "T00:00:00Z";
          this.mainFunction(isoDate, customeTimeOutMessage);
        }else{
          if (customeTimeOutMessage) {
            this.innerHTML = this.appendChildHtmlTimeOut(customeTimeOutMessage).innerHTML;
          }else{
            this.innerHTML = this.appendChildHtml().innerHTML;
            timeLeft = {
              days_timer: 0,
              hours_timer: 0,
              minutes_timer: 0,
              seconds_timer: 0,
            };
            Object.entries(timeLeft).forEach(([key, value]) => {
              this.querySelector("." + key).innerHTML = value.toString().padStart(2, '0');
            });
          };
          this.countdownBtn?.setAttribute("aria-disabled", true);
        }
      }
    }
    else{
      if (customeTimeOutMessage) {
        this.innerHTML = this.appendChildHtmlTimeOut(customeTimeOutMessage).innerHTML;
      }else{
        this.innerHTML = this.appendChildHtml().innerHTML;
        timeLeft = {
          days_timer: 0,
          hours_timer: 0,
          minutes_timer: 0,
          seconds_timer: 0,
        };
        Object.entries(timeLeft).forEach(([key, value]) => {
          this.querySelector("." + key).innerHTML = value.toString().padStart(2, '0');
        });
      };
      this.countdownBtn?.setAttribute("aria-disabled", true);
    }
  }

  mainFunction(isoDate,customeTimeOutMessage) {
    let timeLeft = {};
    if (Date.parse(isoDate)) {
      const deadline = new Date(isoDate);
      const calculateTimeLeft = () => {
      let difference = +deadline - +new Date();
      if (difference > 0) {
        this.innerHTML = this.appendChildHtml().innerHTML;
        timeLeft = {
          days_timer: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours_timer: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes_timer: Math.floor((difference / 1000 / 60) % 60),
          seconds_timer: Math.floor((difference / 1000) % 60),
        };
      }else{
        if (customeTimeOutMessage) {
          this.innerHTML = this.appendChildHtmlTimeOut(customeTimeOutMessage).innerHTML;
        }else{
          this.innerHTML = this.appendChildHtml().innerHTML;
          difference = 0;
          timeLeft = {
            days_timer: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours_timer: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes_timer: Math.floor((difference / 1000 / 60) % 60),
            seconds_timer: Math.floor((difference / 1000) % 60),
          };
        };
        this.countdownBtn?.setAttribute("aria-disabled", true);
      };
      return timeLeft;
      };
      const updateCountdown = () => {
        const t = calculateTimeLeft();
        Object.entries(t).forEach(([key, value]) => {
          this.querySelector("." + key).innerHTML = value.toString().padStart(2, '0');
        });
      };
      setInterval(updateCountdown, 1000);
    }
    else{
      if (customeTimeOutMessage) {
        this.innerHTML = this.appendChildHtmlTimeOut(customeTimeOutMessage).innerHTML;
      }else{
        this.innerHTML = this.appendChildHtml().innerHTML;
        timeLeft = {
          days_timer: 0,
          hours_timer: 0,
          minutes_timer: 0,
          seconds_timer: 0,
        };
        Object.entries(timeLeft).forEach(([key, value]) => {
          this.querySelector("." + key).innerHTML = value.toString().padStart(2, '0');
        });
      };
      this.countdownBtn?.setAttribute("aria-disabled", true);
    }
  }

  appendChildHtml() {
    const days = this.dataset?.days;
    const hours = this.dataset?.hours;
    const mins = this.dataset?.mins;
    const secs = this.dataset?.secs;
    const container = document.createElement('div');
    container.innerHTML = `<div class="countdown-container d-flex align-center lh-1"><span class="days_timer"></span><span class="timer-announcementbar-text">${days?days:'days'}</span></div><div class="countdown-container d-flex align-center lh-1"><span class="hours_timer"></span><span class="timer-announcementbar-text">${hours?hours:'hours'}</span></div><div class="countdown-container d-flex align-center lh-1"><span class="minutes_timer"></span><span class="timer-announcementbar-text">${mins?mins:'mins'}</span></div><div class="countdown-container d-flex align-center lh-1"><span class="seconds_timer"></span><span class="timer-announcementbar-text">${secs?secs:'secs'}</span></div>`;
    return container;
  }

  appendChildHtmlTimeOut(customeTimeOutMessage) {
    const container = document.createElement('div');
    container.innerHTML = `<span class="timeout">${customeTimeOutMessage}</span>`;
    return container;
  }

  isISODate(dateString) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    return isoRegex.test(dateString);
  }

  isValidDate(dateString) {
    var regex = /^\d{2}-\d{2}-\d{4}$/;
    if (regex.test(dateString)) {
      return true;
    } else {
      return false;
    }
  }
}
customElements.define('countdown-timer', CountdownTimer);

class Close extends HTMLElement {
  constructor(){
    super();
    this.init();
  }
  init(){
    const _this = this;
    this.addEventListener("click", this.onClose.bind(this), false);
    this.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        const divParent = _this.closest(".bls__canvas");
        if (divParent) {
          if (!divParent.classList.contains("quick_shop-popup")) {
            if (divParent.classList.contains("cart-drawer")) {
              const elementToFocus = divParent.dataset.focusItem;
              removeTrapFocus(document.querySelector("#"+elementToFocus));
              divParent.close();
            }else{
              const elementToFocus = divParent.dataset.focusItem;
              removeTrapFocus(document.querySelector("#"+elementToFocus));
              this.onClose.bind(this)(event);
            }
          };
        }else{
          this.onClose.bind(this)(event);
        }
      }
    }.bind(this), false);
  }
  onClose(e){
    e.preventDefault();
    const cb = e.currentTarget.closest(".has-close-btn");
    if (!cb) return;
    if (cb.classList.contains("close-slide-up")) {
      rootAction.remove();
      const os = document.querySelectorAll(".overlay-section");
      if (os.length > 0) {
        os.forEach(function(e){
          const divCanvas = e.querySelector(".bls__canvas") || e.querySelector(".main-menu");
          if (divCanvas) {
            divCanvas.classList.remove("active");
            divCanvas.removeAttribute("open");
            const details_tag = divCanvas.closest("details");
            if (details_tag && !details_tag.classList.contains("has-open")) {
              setTimeout(() => {
                details_tag.removeAttribute("open");
              }, 300);
            }
          }
        });
      };
    }else{
      cb.remove();
    }
  }
}
customElements.define('close-button', Close);

class Overlay extends Close {
  constructor(){
    super();
  }
  onClose(e){
    e.preventDefault();
    rootAction.remove();
    const os = document.querySelectorAll(".overlay-section");
    if (os.length > 0) {
      os.forEach(function(e){
        const divCanvas = e.querySelector(".bls__canvas") || e.querySelector(".main-menu");
        if (divCanvas) {
          divCanvas.classList.remove("active");
          divCanvas.removeAttribute("open");
          const details_tag = divCanvas.closest("details");
          if (details_tag && !details_tag.classList.contains("has-open")) {
            setTimeout(() => {
              details_tag.removeAttribute("open");
            }, 300);
          }
        }
      });
    };
  }
}
customElements.define('overlay-opacity', Overlay);

class ToggleNav extends HTMLElement {
  constructor(){
    super();
    this.init();
  }
  init(){
    const item = this.dataset.item;
    if (this.classList.contains("toggle-action")) {
      const parent = this.closest(".overlay-custom-popup");
      const content = document.createElement('div');
      content.appendChild(parent.querySelector('template').content.firstElementChild.cloneNode(true));
      if (content.querySelector(".content-items") && document.querySelector('.'+item)) {
        document.querySelector('.'+item).innerHTML = content.querySelector(".content-items").innerHTML;
      }
    }
    this.addEventListener("click",  this.onClick.bind(this), false);
    this.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        this.onClick.bind(this)(event);
      }
    }.bind(this), false);
  }
  onClick(e){
    e.preventDefault();
    this.onMainClick();
  }
  onMainClick(){
    const _this = this;
    closePopup.hide();
    rootAction.addNoneHeight();
    const os = document.querySelectorAll(".overlay-section");
    const item = this.dataset.item;
    const overlaySection = document.querySelector(`.${item}`);
    if (overlaySection) {
      setTimeout(() => {
        trapFocus(overlaySection.querySelector(".bls__canvas"));
      }, 500);
    }
    if (os.length > 0) {
      os.forEach(function(e){
        if (e.classList.contains(item)) {
          if (e.querySelector(".bls__canvas")) {
            e.querySelector(".bls__canvas").classList.add("active");
            root.classList.add("open-canvas");
            Close.init;
          }
        }
      });
    };
    if (item === "overlay-filter") {
      const details_tag = _this.closest("details");
      if (details_tag) {
        details_tag.setAttribute("open","")
      }
    }
  }
  onToggle() {
    const _this = this;
    const os = document.querySelectorAll(".overlay-section");
    if (getComputedStyle(root).getPropertyValue('--padding-right')) {
      root.style.removeProperty('--padding-right');
    } else {
      root.style.setProperty("--padding-right", getScrollBarWidth.init()+"px");
    }
    const item = this.dataset.item;
    if (os.length > 0) {
      os.forEach(function(e){
        if (e.classList.contains(item)) {
          if (e.querySelector(".bls__canvas")) {
            if (_this.classList.contains("toggle-action")) {
              e.querySelector(".bls__canvas").classList.toggle("active");
              root.classList.toggle("open-canvas");
            }
            Close.init;
          }
        }
      });
    };
  }
}
customElements.define('toggle-nav', ToggleNav);

class StickyHeader extends HTMLElement {
  constructor(){
    super();
    const _this = this;
    const type = _this.dataset?.stickyType;
    if (!_this.closest(".section-header")) return;
    const header_parent = _this.closest(".section-header").querySelector('header');
    let cwpy = header_parent.offsetTop + header_parent.offsetHeight;
    let check = 0;
    window.addEventListener("scroll", () => {
      stickyFunction()
    })
      function stickyFunction() {
      let wpy = window.scrollY;
      if (type === "always") {
        if (wpy > 0) {
          _this.closest(".section-header").classList.add("shopify-section-header-sticky");
        }else{
          _this.closest(".section-header").classList.remove("shopify-section-header-sticky");
        }
      }else{
        if (wpy > 0) {
          if (wpy > cwpy) {
            _this.closest(".section-header").classList.add("scr-pass-header");
            if (wpy > check) {
              _this.closest(".section-header").classList.add("shopify-section-header-hidden");
            }
            else{
              _this.closest(".section-header").classList.remove("shopify-section-header-hidden");
              _this.closest(".section-header").classList.add("animate");
            }
            _this.closest(".section-header").classList.add("header-sticky");
            _this.closest(".section-header").classList.add("shopify-section-header-sticky");
            check = wpy;
          }else{
            _this.closest(".section-header").classList.remove("header-sticky");
            _this.closest(".section-header").classList.remove("scr-pass-header");
            check = 0;
          }
        }else{
          _this.closest(".section-header").classList.remove("shopify-section-header-hidden", "header-sticky");
          _this.closest(".section-header").classList.remove("animate", "shopify-section-header-sticky");
        }
      }
    }
  }
}
// customElements.define('sticky-header', StickyHeader);

class BackBtn extends HTMLElement {
  constructor(){
    super();
    this.container = this.closest(".overlay-section.overlay-menu");
    this.mainDetailsToggle = this.closest('details');
    this.summary = this.mainDetailsToggle.querySelector('summary');
    this.init();
  }
  init(){
    this.addEventListener("click", this.onClose.bind(this), false);
    this.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        this.onClose.bind(this)(event);
      }
    }.bind(this), false);
  }
  onClose(e){
    e.preventDefault();
    e.stopPropagation();
    trapFocus(this.container, this.summary);
    const sub_menu = this.closest(".menu-opening");
    const parent_menu = this.closest("ul.parent-menu");
    if (sub_menu) {
      sub_menu.classList.remove("menu-opening");
    }
    if (parent_menu) {
      parent_menu.classList.remove("submenu-open");
    }
    setTimeout(() => {
      this.mainDetailsToggle.removeAttribute('open');
    }, 500);
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}
customElements.define('back-button', BackBtn);

class ToggleMenu extends HTMLElement {
  constructor(){
    super();
    this.container = this.closest(".overlay-section.overlay-menu");
    this.button = this.querySelector("button#menu-bar-icon-bubble");
    this.mainMenu = this.container.querySelector("main-menu");
    this.init();
  }
  init(){
    this.addEventListener("click",  this.onClick.bind(this), false);
    this.container.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
  }
  onClick(e){
    e.preventDefault();

    if (root.classList.contains("open-nav")) {
      this.close();
    }else{
      this.open();
    }
  }
  open(){
    if (this.container && this.button) {
      trapFocus(this.container, this.button);
    }
    root.style.removeProperty('--padding-right');
    root.classList.remove("open-canvas");
    root.classList.remove("open-search");
    root.classList.add("open-nav");
  }
  close(focusToggle = true) {
    removeTrapFocus(focusToggle ? this.button : null);
    root.classList.remove("open-nav");
  }
}
customElements.define('toggle-menu', ToggleMenu);

class MainMenu extends HTMLElement {
  constructor() {
    super();
    this.details = this.querySelectorAll("details[id]");
    this.windowWidth = window.innerWidth;
    if (this.details.length == 0) return;
    this.onClick();
  }

  onResize(){
    const _this = this;
    document.addEventListener("resize", () => {
      _this.windowWidth = window.innerWidth;
    });
  }

  onClick(){
    const _this = this;
    this.details.forEach(e => e.addEventListener("click", function() {
      if (window.innerWidth <= 1024) {
        trapFocus(e.querySelector(".sub-menu"));
        this.classList.add("menu-opening");
        const ul = _this.querySelector("ul.parent-menu");
        if (ul) {
          ul.classList.add("submenu-open");
        }
      }else{
        this.classList.remove("menu-opening");
        const ul = _this.querySelector("ul.parent-menu");
        if (ul) {
          ul.classList.remove("submenu-open");
        }
      }
    }, false));
  }

  close(focusToggle = true) {
    removeTrapFocus();
    root.classList.remove("open-nav");
  }
}
customElements.define('main-menu', MainMenu);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.onResizeHandler = this.onResize.bind(this);
    this.onInit();
    window.addEventListener('resize', this.onResizeHandler);
  }

  onResize() {
    this.onInit();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.onResizeHandler);
  }

  onInit(){
    if (window.innerWidth > 1024) {
      document.addEventListener('focusin', this.onFocusIn.bind(this));
    } else {
      document.removeEventListener('focusin', this.onFocusIn.bind(this));
    }
  }
}
customElements.define('header-menu', HeaderMenu);

class VideoSection extends HTMLElement {
  constructor() {
    super();
    this.thumb = this.querySelector(".video-thumbnail");
    this.video_iframe = this.querySelector(".video-has-bg iframe");
    this.init();
  }
  
  init() {
    if (this.video_iframe) {
      this.video_iframe.addEventListener("load", () => {
        if (this.thumb) {
          this.thumb.remove();
        }
      });
    };
  }
}
customElements.define("video-section", VideoSection);

class VideoLocal extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init(){
    setTimeout(() => {
      this.loadContent();
    }, 100);
  }
  
  loadContent() {
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector("video"));
      const alt = deferredElement.getAttribute("alt");
      const img = deferredElement.querySelector("img");
      if (alt && img) {
        img.setAttribute("alt", alt);
      }
      this.thumb = this.querySelector(".video-thumbnail");
      if (this.thumb) {
        this.thumb.remove();
      }
      if (deferredElement.nodeName == 'VIDEO' && deferredElement.getAttribute('autoplay')) {
        deferredElement.play();
      }
    }
  }
}
customElements.define("video-local", VideoLocal);

class VideoLocalPlay extends VideoLocal {
  constructor() {
    super();
    this.init();
  }
  init(){
    const poster = this.querySelector('.video-thumbnail');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }
}
customElements.define("video-local-play", VideoLocalPlay);

class ShopableImage extends HTMLElement {
  constructor() {
    super();
    this.connectedCallback();
    this.dot = this.querySelectorAll(".shopable-image-hotspot");
    this.active = 1;
    this.type = this.dataset?.type;
    if (this.dot.length < 1) return;
    const _this = this;
    if (this.type === "default") {
      this.dot.forEach(e => {
        e.addEventListener("click",  _this.onClickPopup.bind(_this), false);
        e.addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
            this.onClickPopup.bind(this)(event);
          }
        }.bind(this), false);
      })
    }else{
      this.dot.forEach(e => {
        e.addEventListener("click",  _this.onClickSlide.bind(_this), false);
        e.addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
            this.onClickSlide.bind(this)(event);
          }
        }.bind(this), false);
      })
    }
    this.onResize();

  }
  initFunction(){
    this.onBodyClick();
  }
  connectedCallback() {
    const __this = this;
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      __this.initFunction();
    }

    new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px -400px 0px'}).observe(this);
  }
  onClickPopup(e) {
    if (window.innerWidth >= 768) {
      const target = e.currentTarget;
      if (target && target.closest(".shopable-image-item")) {
        const position = target.closest(".shopable-image-item").dataset.productPosition;
        if (position) {
          if (this.active === position ) {
            target.closest(".shopable-image-item").classList.toggle("active");
          }else{
            this.removeActive();
            target.closest(".shopable-image-item").classList.add("active");
          }
          this.active = position;
        }
      }
    }
  }
  onClickSlide(e) {
    const target = e.currentTarget;
    if (target && target.closest(".shopable-image-item")) {
      const position = target.closest(".shopable-image-item").dataset.productPosition;
      if (position) {
        if (this.active === position ) {
          target.closest(".shopable-image-item").classList.toggle("active");
        }else{
          this.removeActive();
          target.closest(".shopable-image-item").classList.add("active");
        }
        this.active = position;
        if (this.querySelector("slide-section")) {
          this.querySelector("slide-section").gotoFunction(position-1);
          this.querySelector("slide-section").addClass(position, "item-highlight");
        }
      }
    }
  }
  onBodyClick(){
    const _this = this;
    document.body.addEventListener("click", (e) => {
      const target = e.target;
        if (
          !target.closest(".shopable-image-item")
        ) {
          _this.removeActive();
        }
    })
  }
  removeActive(){
    if (this.dot.length < 1) return;
    this.dot.forEach(e => {
      if (!e.closest(".shopable-image-item")) return;
      e.closest(".shopable-image-item").classList.remove("active")
    })
    
  }
  onResize() {
    if (window.innerWidth < 1200) {
      this.removeActive()
    }
  }
}
customElements.define("shopable-image", ShopableImage);

if (!customElements.get('media-gallery')) {
  customElements.define('media-gallery', class MediaGallery extends HTMLElement {
    constructor() {
      super();
      this.elements = {
        viewer: this.querySelector('[id^="GalleryViewer"]'),
      }
      const mobileSlideStatus = this.dataset.mobiSlideStatus;
      if (!mobileSlideStatus) {
        this.onResize();
      }
    }

    setActiveMedia(mediaId, prepend) {
      const activeMedia = this.elements.viewer.querySelector(`[data-media-id="${ mediaId }"]`);
      this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
        element.classList.remove('is-active');
      });
      activeMedia.classList.add('is-active');

      if (prepend) {
        activeMedia.parentElement.prepend(activeMedia);
        if (this.elements.thumbnails) {
          const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${ mediaId }"]`);
          activeThumbnail.parentElement.prepend(activeThumbnail);
        }
        // if (this.elements.viewer.slider) this.elements.viewer.resetPages();
      }

      window.setTimeout(() => {
        if (this.elements.thumbnails) {
          activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft });
        }
        if (!this.elements.thumbnails || this.dataset.desktopLayout === 'stacked') {
          // activeMedia.scrollIntoView({behavior: 'smooth'});
        }
      });
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
        }
      });
      _this.actionResize(isMobile);
    }
    
    actionResize(isMobile) {
      const sl_thumb = this.querySelector(".slide-thumbnail");
      if (sl_thumb) {
        if (isMobile) {
          sl_thumb.classList.add("d-none");
        } else {
          sl_thumb.classList.remove("d-none");
        }
      }
    }
  });
}

if (!customElements.get('button-search')) {
  customElements.define('button-search', class Search extends ToggleNav {
    constructor() {
      super();
    }
    onClick(e){
      e.preventDefault();
      const items = this.dataset?.items;
      this.onMainClick(items);
      if (!this.closest("action-search")) return;
      if (!this.closest("action-search").querySelector('input[type="search"]')) return;
      setTimeout(() => {
        this.closest("action-search").querySelector('input[type="search"]').focus();
      }, 100);
    }
    
  });
}

class Quickview extends ToggleNav {
  constructor() {
    super();
  }

  init(){
    this.addEventListener("click",  this.onClick.bind(this), false);
    this.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        this.onClick.bind(this)(event);
        const cartNotification = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        if (cartNotification) cartNotification.setActiveElement(this);
      }
    }.bind(this), false);
  }

  onClick(e){
    e.preventDefault();
    const quickbuyCanvas = document.querySelector('quickbuy-canvas');
    if (quickbuyCanvas) quickbuyCanvas.setActiveElement(this);
    if (this.dataset.url) {
      this.quickview();
    }
  }

  quickview() {
    if (this.dataset.shopableImage) {
      if (window.innerWidth < 768) {
        this.fetchUrl();
      }
    }else{
      this.fetchUrl();
    }
    this.setAttribute('aria-disabled', true);
    this.classList.add('loading');
    this.querySelector('.loading-overlay__spinner')?.classList.remove('hidden');
  }
  fetchUrl(){
    fetch(this.dataset.url)
    .then(response => response.text())
    .then(text => {
      const html = parser.parseFromString(text, "text/html");
      if (!html.querySelector("#shopify-section-product-quickview .quickview-content")) return;
      document.querySelector(".quick_shop-popup").innerHTML = html.querySelector("#shopify-section-product-quickview .quickview-content").innerHTML;
    })
    .finally(() => {
      this.classList.remove('loading');
      this.removeAttribute('aria-disabled');
      this.querySelector('.loading-overlay__spinner')?.classList.add('hidden');
      this.onMainClick();
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
  }
}
customElements.define('button-quickview', Quickview);

class QuickbuyCanvas extends HTMLElement {
  constructor(){
    super();
    this.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
    this.closeBtn = this.querySelector("close-button");
    if (!this.closeBtn) return;
    this.closeBtn.addEventListener('click', this.close.bind(this));
    this.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.tagName === "CLOSE-BUTTON") {
          this.close.bind(this)(event);
        }
      }
    }.bind(this), false);
  }
  close() {
    rootAction.remove();
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
  }
  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define('quickbuy-canvas', QuickbuyCanvas);

class CollapsibleSection extends HTMLElement {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
    this.keyPressHandler = this.keyPressHandler.bind(this);
    this.init();
    window.addEventListener('resize', this.init.bind(this));
  }
  
  init(){
    if (!this.querySelector(".collapsible-title")) return;
    if (window.innerWidth < 768) {
      this.querySelector(".collapsible-title").addEventListener('click', this.onClick, false);
      this.addEventListener('keypress', this.keyPressHandler, false);
    } else {
      this.querySelector(".collapsible-title").removeEventListener('click', this.onClick, false);
      this.removeEventListener('keypress', this.keyPressHandler, false);
    }
  }
  
  onClick(e) {
    e.preventDefault();
    if (!this.querySelector(".footer-block-border")) return;
    if (!this.querySelector(".collapsible-content")) return;
    this.querySelector(".footer-block-border").classList.toggle("active");
    slideAnime({
      target: this.querySelector(".collapsible-content"),
      animeType: "slideToggle",
      parent: this.querySelector(".collapsible-title")
    });
  }

  keyPressHandler(event) {
    if (event.key === 'Enter') {
      this.onClick(event);
    }
  }
};
customElements.define('collapsible-block', CollapsibleSection);

class ActionSearch extends HTMLElement {
  constructor(){
    super();
    this.init();
    this.input = this.querySelector('input[type="search"]');
    this.form = this.querySelector("form#search_mini_form");
    this.fi = this.dataset?.focusItem;
    this.initClear(this.input.value);
    this.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
    this.form?.addEventListener('keyup', this.onKeyup.bind(this));
    this.form?.addEventListener('keydown', this.onKeydown.bind(this));  
  }
  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  init(){
    this.setHeaderSearchIconAccessibility();
    this.clear();
    this.initForm();
  }
  initForm() {
    const _this = this;
    const form = this.querySelector('form');
    if (!form) return;
    form.addEventListener('keypress', function(event) {
      if (event.key === 'Enter' && _this.input.value.trim() === '') {
        event.preventDefault();
      }
    });
    const submit = form.querySelector('button[type="submit"]');
    if (submit) {
      submit.addEventListener('click', function(e) {
        if (_this.input.value.trim() === '') {
          e.preventDefault();
        }
      });
    };
    this.querySelector('input[type="search"]').addEventListener('input', this.debounce(e => {
      _this.removeFirstSpace(e)
    }, 100).bind(this));
  }
  removeFirstSpace(e) {
    var value = e.target.value;
    if (value.charAt(0) === ' ') {
      this.input.value = "";
      if (!this.querySelector("predictive-search")) return;
      this.querySelector("predictive-search").onInput();
      this.input.focus();
    }
    this.initClear(value);
  }
  setHeaderSearchIconAccessibility() {
    const link = document.querySelector('#search-icon-bubble');
    if (!link) return;
    link.setAttribute('role', 'button');
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      event.preventDefault();
      this.openPopup()
      this.lazyloadImage()
    });
  }

  lazyloadImage() {
    if (this.querySelectorAll(".loading-animation").length != 0) {
      this.querySelectorAll(".loading-animation").forEach((e, index) => {
        var img = new Image();
        img.src = e.getAttribute("src");
        img.addEventListener('load', function() {
          e.classList.add("loaded-animation");
          e.classList.remove("loading-animation");
        });
      });
    }
  }
  
  openPopup() {
    rootAction.add();
    setTimeout(() => {this.classList.add('active')});
    root.classList.add('open-canvas', 'open-search');
    setTimeout(() => {
      if (this.form) {
        trapFocus(this.form);
      }
      this.input.focus();
    }, 300);
    this.setAttribute("open","");
  }
  togglePopup() {
    setTimeout(() => {this.classList.toggle('active')});
    root.classList.toggle('open-search');
    if (!this.input) return;
    this.input.focus();
    this.setAttribute("open","");
  }
  close() {
    const elementToFocus = this.dataset.focusItem;
    if (!Shopify.designMode) {
      removeTrapFocus(document.querySelector("#"+elementToFocus));
    }
    rootAction.remove();
    this.classList.remove("active");
    this.removeAttribute("open");
  }
  initClear(value) {
    if (!this.querySelector(".clear-btn")) return;
    if (value != "") {
      this.querySelector(".clear-btn").classList.remove("d-none");
    }else{
      this.querySelector(".clear-btn").classList.add("d-none");
    }
  }
  clear() { 
    const _this = this;
    if (!this.querySelector(".clear-btn")) return;
    this.querySelector(".clear-btn").addEventListener("click", () => {
      this.input.value = "";
      this.querySelector(".clear-btn").classList.add("d-none");
      if (!this.querySelector("predictive-search")) return;
      this.querySelector("predictive-search").onInput();
      this.input.focus();
      trapFocus(this.form);
    });
    this.querySelector(".clear-btn").addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        trapFocus(this.form);
        this.input.value = "";
        this.input.focus();
        _this.querySelector(".clear-btn").classList.add("d-none");
        if (!_this.querySelector("predictive-search")) return;
        _this.querySelector("predictive-search").onInput();
      }
    }.bind(this), false);
  }

  getQuery() {
    return this.input.value.trim();
  }
  
  onKeyup(event) {
    event.preventDefault();
    switch (event.code) {
      case 'ArrowUp':
        this.switchOption('up');
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }

  onKeydown(event) {
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      event.preventDefault();
    }
  }

  selectOption() {
    const selectedOption = this.querySelector('a[aria-selected="true"], button[aria-selected="true"]');

    if (selectedOption) selectedOption.click();
  }

  switchOption(direction) {

    const moveUp = direction === 'up';
    const selectedElement = this.querySelector('[aria-selected="true"]');

    // Filter out hidden elements (duplicated page and article resources) thanks
    // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
    const allVisibleElements = Array.from(this.querySelectorAll('a.recommend-search__item, a.predictive-search__item')).filter(
      (element) => element.offsetParent !== null
    );
    let activeElementIndex = 0;
    if (moveUp && !selectedElement) return;

    let selectedElementIndex = -1;
    let i = 0;

    while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
      if (allVisibleElements[i] === selectedElement) {
        selectedElementIndex = i;
      }
      i++;
    }
    if (!moveUp && selectedElement) {
      activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
    } else if (moveUp) {
      activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
    }

    if (activeElementIndex === selectedElementIndex) return;

    const activeElement = allVisibleElements[activeElementIndex];
    activeElement.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    activeElement.setAttribute('aria-selected', true);
    if (selectedElement) selectedElement.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', activeElement.id);
  }

}
customElements.define('action-search', ActionSearch);

class ProgressBar extends HTMLElement {
  constructor(){
    super();
    const orders = this.dataset.order;
    this.init(orders);
  }
  init(orders){
    const min = Number(this.dataset.feAmount);
    const threshold = Number(this.dataset.threshold);
    if (threshold > orders) {
      this.classList.add("notify");
    }else{
      this.classList.remove("notify");
    }
    if (!min) return;
    if (!orders) return;
    const order = Number(orders);
    if (!order) return;
    if ((order/min)*100 > 100) {
      this.setProgressBar(100);
    }else{
      this.setProgressBar((order/min)*100);
    }
  }
  setProgressBar(progress) {
    const p = this.querySelector(".progress");
    if (!p) return;
    const p_bar = p.closest(".progress-bar");
    p.style.width = progress + '%';
    if (!p_bar) return;
    if (progress <= 0) {
      p_bar.classList.add("d-none");
    }else{
      p_bar.classList.remove("d-none");
    }
  }
  
}
customElements.define('progress-bar', ProgressBar);

class InventoryProgressBar extends ProgressBar {
  constructor(){
    super();
    const orders = this.dataset.order;
    const available = this.dataset.available;
    this.init(orders, available);
  }
  init(orders, available){
    const min = Number(this.dataset.feAmount);
    const threshold = Number(this.dataset.threshold);
    if (threshold > orders) {
      if (orders > 0) {
        this.classList.add("notify","low_stock");
        this.classList.remove("instock", "pre_order", "outstock");
      }else{
        if (available == false || available == 'false') {
          this.classList.add("notify", "outstock");
          this.classList.remove("instock", "pre_order", "low_stock");
        }else{
          this.classList.remove("notify", "instock", "low_stock", "outstock");
          this.classList.add("pre_order");
        }
      }
    }else{
      this.classList.remove("notify","pre_order", "low_stock", "outstock");
      this.classList.add("instock");
    }
    if (!min) return;
    if (orders === undefined) return;
    const order = Number(orders);
    if (order === undefined) return;
    if ((order/min)*100 > 100) {
      this.setProgressBar(100);
    }else{
      this.setProgressBar((order/min)*100);
    }
    this.setProgressBarTitle(order, threshold, available);
  }

  setProgressBarTitle(order, threshold, available) {
    const lowStock = this.dataset.lowStock;
    const soldOut = this.dataset.soldOut;
    const preOrder = this.dataset.preOrder;
    const availableMessage = this.dataset.availableMessage;
    const title = this.querySelector(".progress-bar-message .message");
    if (!title) return;
    if (order > 0) {
      if (threshold > order) {
        title.innerHTML = `${lowStock.replace("{{ count }}", order)}`;
      }else{
        title.innerHTML = availableMessage;
      }
    }else{
      if (available == "true" || available == true) {
        title.innerHTML = preOrder;
      }else{
        title.innerHTML = soldOut;
      }
    }
  }
}
customElements.define('inventory-progress-bar', InventoryProgressBar);

class FSProgressBar extends ProgressBar {
  constructor(){
    super();
    this.init();
  }
  init(){
    const rate = Number(Shopify.currency.rate);
    const min = Number(this.dataset.feAmount);
    if (!min || !rate) return;
    const order = Number(this.dataset.order)/100;
    const min_by_currency = min*rate;
    if (order == undefined) return;
    if ((order/min_by_currency)*100 > 100) {
      this.setProgressBar(100);
    }else{
      this.setProgressBar((order/min_by_currency)*100);
    }
    this.setProgressBarTitle(order, min_by_currency);
  }
  setProgressBar(progress) {
    const p = this.querySelector(".progress");
    p.style.width = progress + '%';
    if (progress === 100) {
      if(this.closest('.drawer__inner,.js-contents').classList.contains('effect-end')) return;
      this.classList.add("free-shipping");
      this.closest('.drawer__inner,.js-contents').classList.add('effect-end');
    }else{
      this.classList.remove("free-shipping")
      if (this.closest('.drawer__inner,.js-contents').classList.contains('effect-end')){
        this.closest('.drawer__inner,.js-contents').classList.remove('effect-end')
      }
    }
  }
  setProgressBarTitle(order, min_by_currency) {
    let fe_unavaiable = this.dataset.feUnavaiable;
    const fe_avaiable = this.dataset.feAvaiable;
    const title = this.querySelector(".progress-bar-message .message");
    if (!title) return;
    if (order >= min_by_currency) {
      title.innerHTML = fe_avaiable;
    }else{
      const ammount = "{{ amount }}"
      fe_unavaiable = fe_unavaiable.replace("{{ amount }}","<strong class=\"heading-color\">{{ amount }}</strong>")
      title.innerHTML = fe_unavaiable.replace(ammount.trim(),Shopify.formatMoney((min_by_currency-order)*100, themeGlobalVariables.settings.money_format));
    }
  }
}
customElements.define('free-ship-progress-bar', FSProgressBar);

class ModalPopup extends Popup {
  constructor() {
    super();
    this.init();
  }
  init() {
      const title = this.dataset?.title;
      const id = this.dataset?.id;
      const btn = this.querySelector(".modal-btn");
      if (!btn) return;
      btn.addEventListener("click", () => {
          let content = this.querySelector(".content");
          if (content) {
            this.initPopupJs(content.innerHTML, title, id, true, false);
            setTimeout(() => {
              if (document.querySelector(`#${id}_0_1`) && id != "ask-question") {
                trapFocus(document.querySelector(`#${id}_0_1`), document.querySelector(".dlg-close-x"));
              }
            });
          }
      });
  }
}
customElements.define("modal-popup", ModalPopup);

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    document.body.classList.add("mobile-sticky-bar-enabled");
  }
  connectedCallback() {
    window.addEventListener("scroll", this.updateScrollNavigationbar.bind(this));
  }
  updateScrollNavigationbar() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 200) {
      this.classList.add("show");
    }else{
      this.classList.remove("show");
    }
  }
}
customElements.define("mobile-navigation-bar", NavBar);

class BackToTop extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.backToTop.bind(this), false);
  }

  connectedCallback() {
    window.addEventListener("scroll", this.updateScrollPercentage.bind(this));
  }

  backToTop() {
    if (document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  updateScrollPercentage() {
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
    this.style.setProperty("--scroll-percentage", scrollPercentage.toFixed(2)+"%");
    if (scrollTop > 200) {
      this.classList.add("show");
    }else{
      this.classList.remove("show");
    }
  }
}
customElements.define("back-to-top", BackToTop);

class AgeVerifier extends HTMLElement {
  constructor() {
    super();
    this.ageVerifyDetail = this.querySelector(".age-verify-detail");
    this.declineVerifyDetail = this.querySelector(".decline-verify-detail");
    this.init();
    this.mainFunction();
    if (Shopify.designMode) {
      document.addEventListener('shopify:section:load', () => this.init());
      document.addEventListener('shopify:section:load', () => this.mainFunction());
    }
  }
  init() {
    const _this = this;
    const designMode = _this.dataset.enableDesignMode;
    if (!Shopify.designMode) {
      if (!getCookie("bls_age_verifier")) {
        setTimeout(() => {
          _this.setAttribute("open","");
          this.declineVerifyDetail.classList.add("d-none");
          this.ageVerifyDetail.classList.remove("d-none");
          setTimeout(() => {
            trapFocus(this.ageVerifyDetail);
          });
        }, 1000);
      }
      else{
        if (getCookie("bls_age_verifier") == "false") {
          setTimeout(() => {
            _this.setAttribute("open","");
            this.declineVerifyDetail.classList.remove("d-none");
            this.ageVerifyDetail.classList.add("d-none");
            setTimeout(() => {
              trapFocus(this.declineVerifyDetail)
            });
          }, 1000);
        }else{
          _this.removeAttribute("open");
          removeTrapFocus();
        }
      }
    }else{
      if (designMode == "true") {
        document.addEventListener('shopify:section:select', (e) => {
          var qbe = document.querySelector(".overlay-age-verifier")?.dataset.shopifyEditorSection;
          if (qbe && JSON.parse(qbe).id === e.detail.sectionId) {
            _this.setAttribute("open","");
            this.declineVerifyDetail.classList.add("d-none");
            this.ageVerifyDetail.classList.remove("d-none");
          }else{
            _this.setAttribute("closing","true");
            setTimeout(() => {
              _this.removeAttribute("closing");
              _this.removeAttribute("open");
            }, 450);
          }
        });
      }else{
        _this.setAttribute("closing","true");
        setTimeout(() => {
          _this.removeAttribute("closing");
          _this.removeAttribute("open");
        }, 450);
      }
    }
  }
  
  mainFunction() {
    const approve = this.querySelector(".age-verifier-approve");
    const decline = this.querySelector(".age-verifier-decline");
    const returnBtn = this.querySelector(".age-verifier-return");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => this.handleReturn());
    }

    if (!approve || !decline) return;
    approve.addEventListener("click", () => this.handleApprove());
    decline.addEventListener("click", () => this.handleDecline());
  }
  handleReturn() {
    if (!Shopify.designMode) {
      setCookie("bls_age_verifier", "-1", false);
      this.init();
    }else{
      this.setAttribute("open","");
      this.declineVerifyDetail.classList.add("d-none");
      this.ageVerifyDetail.classList.remove("d-none");
    }
  }
  handleDecline() {
    if (!Shopify.designMode) {
      setCookie("bls_age_verifier", "365", false);
      this.init();
    }else{
      this.setAttribute("open","");
      this.declineVerifyDetail.classList.remove("d-none");
      this.ageVerifyDetail.classList.add("d-none");
    }
  }
  handleApprove() {
    if (!Shopify.designMode) {
      setCookie("bls_age_verifier", "365", true);
      this.setAttribute("closing","true");
      setTimeout(() => {
        this.removeAttribute("closing");
        this.removeAttribute("open");
        if (document.querySelector(`#newsletterPopup_0_1`)) {
          trapFocus(document.querySelector(`#newsletterPopup_0_1`));
        }
      }, 450);
    }else{
      this.setAttribute("closing","true");
      setTimeout(() => {
        this.removeAttribute("closing");
        this.removeAttribute("open");
      }, 450);
    }
  }
}
customElements.define("age-verifier", AgeVerifier);

class ShopableVideo extends HTMLElement {
  constructor() {
    super();
    this.hrefProduct = this.dataset.href;
    this.addEventListener("click", this.clickOpenVideo.bind(this), false);
    this.addEventListener("mouseover", this.openVideo.bind(this), false);
    if (this.querySelector(".mute-button")) {
      this.querySelector(".mute-button").addEventListener("click", this.clickMuteVideo.bind(this), false);
    }
  }

  openVideo(){
    if (this.querySelector("video") && !this.classList.contains("active-video")) {
      this.closest(".bls__shopable-video").querySelectorAll("shopable-video").forEach((el) => {
        el.classList.remove("active-video");
        if (el.querySelector(".mute-button")) {
          el.querySelector(".mute-button").classList.remove("active");
        }
        const video = el.querySelector("video");
        if (video && !video.paused) {
          video.pause();
        }
      });
      this.querySelector("video").muted = true;
      this.querySelector("video").play();
      if (window.innerWidth > 1199) {
        this.classList.add('active-video');
      }
    }
  }

  clickOpenVideo(e){
    const target = e.target;
    if (this.hrefProduct) {
      if (this.querySelector("video")) {
        if (this.classList.contains("active-video") && !target.closest(".mute-button")) {
          window.location.href = `${window.shopUrl}${this.hrefProduct}`;
        } else {
          this.classList.add('active-video');
        }
      } else {
        window.location.href = `${window.shopUrl}${this.hrefProduct}`;
      }
    }
  }

  clickMuteVideo(){
    if (this.querySelector("video").muted == false) {
      this.querySelector("video").muted = true;
      this.querySelector(".mute-button").classList.remove('active');
    } else {
      this.querySelector("video").muted = false;
      this.querySelector(".mute-button").classList.add('active');
    }
  }
}
customElements.define('shopable-video', ShopableVideo);

class ImageTabsItem extends HTMLElement {
  constructor() {
    super();
    this.position = this.dataset.position;
    this.querySelector("a").addEventListener("click", this.clickImageTabs.bind(this), false);
    this.addEventListener("mouseover", this.hoverImageTabs.bind(this), false);
  }

  hoverImageTabs(){
    if (!this.classList.contains("active") && window.innerWidth > 1199) {
      this.closest(".image-tabs__body").querySelectorAll("tabs-item").forEach((el) => {
        el.classList.remove("active");
      });
      this.classList.add('active');
      const slide = this.closest(".image-tabs").querySelector("slide-section.image-tabs-slide");
      if (!slide) return;
      slide.gotoFunction(this.position-1);
    }
  }

  clickImageTabs(e){
    if (!this.closest("tabs-item").classList.contains("active") && window.innerWidth < 1200) {
      this.closest(".image-tabs__body").querySelectorAll("tabs-item").forEach((el) => {
        el.classList.remove("active");
      });
      this.closest("tabs-item").classList.add('active');
      const slide = this.closest(".image-tabs").querySelector("slide-section.image-tabs-slide");
      if (!slide) return;
      slide.gotoFunction(this.position-1);
      e.preventDefault();
    }
  }
}
customElements.define('tabs-item', ImageTabsItem);

class ImageComparisonSlide extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init(){
    var image = this.querySelector(".image-comparison__after");
    if (image) {
      this.compareImages(image);
    }
  }

  compareImages(img){
    var slider,
      img,
      clicked = 0,
      w;
    w = img.offsetWidth;
    const icc = img.closest(".image-comparison-container");
    if (icc) {
      slider = icc.querySelector(".image-comparison__button");
    }
    if (slider) {
      slider.addEventListener("touchstart", slideReady);
      slider.addEventListener("mousedown", slideReady);
    }
    window.addEventListener("mouseup", slideFinish);
    window.addEventListener("touchend", slideFinish);
    function slideReady(e) {
      e.preventDefault();
      clicked = 1;
      window.addEventListener("mousemove", slideMove);
      window.addEventListener("touchmove", slideMove);
    }
    function slideFinish() {
      clicked = 0;
    }
    function slideMove(e) {
      var pos;
      if (clicked == 0) return false;
      pos = getCursorPos(e);
      if (pos < 0) pos = 0;
      if (pos > w) pos = w;
      slide(pos);
    }
    function getCursorPos(e) {
      var a,
        x = 0;
      e = e.changedTouches ? e.changedTouches[0] : e;
      a = img.getBoundingClientRect();
      x = e.pageX - a.left;
      x = x - window.pageXOffset;

      return x;
    }
    function slide(x) {
      if (slider) {
        var x_ps = x + slider.offsetWidth / 2;
        var percent = (x_ps / w) * 100;
        if (percent >= 100 - ((slider.offsetWidth / 2) / w) * 100) {
          percent = 100 - ((slider.offsetWidth / 2) / w) * 100;
        }
      }

      img
        .closest(".image-comparison-container")
        .setAttribute("style", "--percent: " + percent.toFixed(4) + "%;");
    }
  }
}
customElements.define('image-comparison-slide', ImageComparisonSlide);

class BundleProducts extends HTMLElement {
  constructor() {
    super();
    this.dot = this.querySelectorAll(".bundle-products-hotspot");
    this.item = this.querySelectorAll("bundle-item");
    if (this.dot.length < 1) return;
    const _this = this;
    this.dot.forEach(e => {
      e.addEventListener("mouseenter",  _this.onMouseoverPopup.bind(_this), false);
      e.addEventListener("mouseleave",  _this.onMouseout.bind(_this), false);
    });
    this.item.forEach(e => {
      e.addEventListener("mouseenter",  _this.onMouseoverItem.bind(_this), false);
      e.addEventListener("mouseleave",  _this.onMouseout.bind(_this), false);
    })
  }

  onMouseoverPopup(e) {
    const target = e.target;
    if (window.innerWidth >= 768) {
      if (!target.closest(".bundle-products-quick-item").classList.contains("active")) {
        const position = target.closest(".bundle-products-quick-item").dataset.productPosition;
        this.removeActive();
        this.querySelector("bundle-item[data-product-position='"+position+"']").classList.add("active");
        this.classList.add("is-hover");
        target.closest(".bundle-products-quick-item").classList.add("active");
      }
    }
  }

  onMouseoverItem(e) {
    const target = e.target;
    if (window.innerWidth >= 768) {
      if (!target.closest("bundle-item").classList.contains("active")) {
        const position = target.closest("bundle-item").dataset.productPosition;
        this.removeActive();
        this.querySelector(".bundle-products-quick-item[data-product-position='"+position+"']").classList.add("active");
        this.classList.add("is-hover");
        target.closest("bundle-item").classList.add("active");
      }
    }
  }

  onMouseout() {
    this.removeActive();
  }

  removeActive(){
    if (this.dot.length < 1) return;
    this.dot.forEach(e => {
      if (!e.closest(".bundle-products-quick-item")) return;
      e.closest(".bundle-products-quick-item").classList.remove("active")
    });
    this.item.forEach(e => {
      e.classList.remove("active")
    });
    this.classList.remove("is-hover");
  }
}
customElements.define("bundle-products", BundleProducts);
function initLazyloadItem() {
  const lazyVideos = document.querySelectorAll('video.lazy-video-item');
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const video = entry.target;
          const poster = video.dataset.poster;
          const src = video.dataset.src;

          if (poster) {
            video.setAttribute('poster', poster);
            video.removeAttribute('data-poster');
            video.setAttribute('src', src);
            video.removeAttribute('data-src');
          }

          video.querySelectorAll('source').forEach((source) => {
            const source_src = source.dataset.src;
            if (source_src) {
              source.setAttribute('src', source_src);
              source.removeAttribute('data-src');
            }
          });

          video.classList.remove('lazy-video-item');
          observer.unobserve(video);
        }
      });
    },
    { threshold: 0.1 }
  );
  lazyVideos.forEach((video) => observer.observe(video));
}
initLazyloadItem();