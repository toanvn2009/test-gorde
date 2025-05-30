class FaqItem extends HTMLElement {
    constructor() {
        super();
        const _this = this;
        if (_this.querySelectorAll(".bls_faq-section-title").length > 0) {
            _this.querySelectorAll(".bls_faq-section-title").forEach((e) => {
                e.addEventListener("click", _this.onToggle.bind(e), false);
                e.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter') {
                        _this.onToggle.bind(e)(event);
                    }
                }.bind(e), false);
            });
        }
    }
    onToggle(e) {
        e.preventDefault();
        const items = this.closest(".bls_faq-section-items");
        const title = this.closest(".bls_faq-section-title");
        if (items) {
            const target = items.querySelector(".bls_faq-section-content");
            if (target) {
                slideAnime({
                    target: target,
                    animeType: "slideToggle",
                    parent: title
                });
            }
        }
    }
}
customElements.define("faq-item", FaqItem);
class NewsletterPopup extends Popup {
    constructor() {
        super();
        this.init();
        this.initMessage();
    }
    init() {
        const _this = this;
        const content = this.querySelector(".bls-newsletter-popup-wrapper");
        const dataShowPage = this.dataset.enablePage;
        const cookie = getCookie("newsletter_popup");
        if ((dataShowPage == "show-on-homepage" || dataShowPage == "show-all-page") && cookie === "") {
            if (!Shopify.designMode) {
                this.initPopupJs(content.innerHTML, "", "newsletterPopup", false, false, 2000);
                if (!this.popup) return;
                this.popup.onShow = function () {
                    _this.onShowNewletter();
                    _this.remove();
                    if (document.querySelector(`#newsletterPopup_0_1`) && !document.querySelector("age-verifier[open]")) {
                        trapFocus(document.querySelector(`#newsletterPopup_0_1`));
                    }
                };
            }
        }
        if (Shopify.designMode) {
            document.addEventListener("shopify:section:select", (e) => {
                if (!this.closest("section")) return;
                if (!this.closest("section").dataset.shopifyEditorSection) return;
                if (!e.detail.sectionId) return;
                if (
                    JSON.parse(this.closest("section").dataset.shopifyEditorSection)
                        .id === e.detail.sectionId
                ) {
                    this.initPopupJs(content.innerHTML, "", "newsletterPopup", true, false);
                    this.popup.onShow = function () {
                        _this.onShowNewletter();
                    };
                } else {
                    if (!this.popup) return;
                    this.popup.hide();
                }
            });
            document.addEventListener('shopify:section:load', (e) => {
                const target = e.target;
                const newsletterPopup = target.closest('body').querySelector('[id^=newsletterPopup_0]');
                if (newsletterPopup) {
                    this.popup.hide();
                    setTimeout(() => {
                        this.initPopupJs(document.querySelector(".bls-newsletter-popup-wrapper").innerHTML, "", "newsletterPopup", true, false);
                    }, 650);
                }
            });

        }
    }
    onShowNewletter() {
        const _this = this;
        const setC = document.querySelector('#newsletterPopup_0 .dont-show');
        if (!setC) return;
        setC.addEventListener('click', _this.notShow.bind(_this));
        setC.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                _this.notShow.bind(_this)(event);
            }
        }.bind(_this), false);
    }

    notShow(e){
        const _this = this;
        e.preventDefault();
        setCookie("newsletter_popup", 30, "bls");
        _this.popup.hide();
        removeTrapFocus();
    }

    initMessage() {
        const _this = this;
        let newsletterSuccess = "";
        let newsletterError = "";
        fetch(window.location.origin+"?section_id=form-infor")
        .then(response => response.text())
        .then(text => {
          const html = parser.parseFromString(text, "text/html");
          if (!html) return;
          if (html.querySelector(".newsletter-form-success")) {
            newsletterSuccess = html.querySelector(".newsletter-form-success").innerHTML;
          }
          if (html.querySelector(".newsletter-form-error")) {
            newsletterError = html.querySelector(".newsletter-form-error").innerHTML;
          }
          const urlInfo = window.location.href;
          if (urlInfo.indexOf('customer_posted=true') >= 1) {
            setCookie("newsletter_popup", 30, "bls");
            _this.initToastJs(newsletterSuccess);
            if (this.popup) {
                _this.popup.hide();
            }
            const newURL = location.href.split("?")[0];
            window.history.pushState('object', document.title, newURL);
          }
          if (urlInfo.indexOf('contact%5Btags%5D=newsletter&form_type=customer') >= 1) {
            _this.initToastJs(newsletterError);
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
customElements.define("newsletter-popup", NewsletterPopup);

class SocialShare extends HTMLElement {
    constructor() {
        super();
        this.init();
    }
    init() {
        this.querySelectorAll('.blog-sharing .btn-sharing').forEach(share => {
            share.addEventListener("click", event => {
                event.preventDefault();
                const target = event.currentTarget;
                const social = target.getAttribute('data-social');
                const nameSocial = target.getAttribute('data-name');
                window.open(social,nameSocial,'height=500,width=500');
            }, false);
        });
    }
}
customElements.define("social-share", SocialShare);

class PaginateLoadmore extends HTMLElement {
    constructor() {
        super();
        this.initLoadMore();
    }
    initLoadMore() {
        this.querySelectorAll('.actions-load-more').forEach(loadMore => {
            var _this = this;
            if (loadMore.classList.contains('infinit-scrolling')) {
                var observer = new IntersectionObserver(function (entries) {
                    entries.forEach(entry => {
                        if (entry.intersectionRatio === 1) {
                            _this.loadMorePosts(loadMore);
                        }
                    });
                }, { threshold: 1.0 });
                observer.observe(loadMore);
            } else {
                loadMore.addEventListener("click", event => {
                    event.preventDefault();
                    const target = event.currentTarget;
                    _this.loadMorePosts(target);
                }, false);
            }
        });
    }
    loadMorePosts(target) {
        const loadMore_url = target.getAttribute('href');
        const _this = this;
        _this.toggleLoading(target, true);
        fetch(`${loadMore_url}`)
            .then((response) => {
                if (!response.ok) {
                    var error = new Error(response.status);
                    throw error;
                }
                return response.text();
            })
            .then(responseText => {
                const resultNodes = parser.parseFromString(responseText, 'text/html');
                const resultNodesHtml = resultNodes.querySelectorAll('#main-items .bls__item-load');
                resultNodesHtml.forEach(prodNode => document.getElementById("bls-content-items").appendChild(prodNode));
                const load_more = resultNodes.querySelector('.actions-load-more');
                document.querySelector(".load-more-amount").innerHTML = resultNodes.querySelector('.load-more-amount').textContent;
                if (load_more) {
                    target.setAttribute("href", load_more.getAttribute('href'));
                } else {
                    target.remove();
                }
                _this.toggleLoading(target, false);
            })
            .catch((error) => {
                throw error;
            });
    }
    toggleLoading(event, loading) {
        if (event) {
            const method = loading ? 'add' : 'remove';
            event.classList[method]('loading');
        }
    }
}

customElements.define("loadmore-button", PaginateLoadmore);

class CookiesPopup extends HTMLElement {
    constructor() {
        super();
        this.init();
    }
    init() {
        const _this = this;
        if (!Shopify.designMode) {
            if (!getCookie("allow_cookie")) {
                setTimeout(() => {
                    _this.setAttribute("open","");
                }, 450);
            }
        }
            this
                .querySelectorAll(".bls_cookies .cookies-allow-js")
                .forEach((closeCookie) => {
                    closeCookie.addEventListener(
                        "click",
                        (e) => {
                            e.preventDefault();
                            _this.setAttribute("closing","true");
                            setTimeout(() => {
                                this.removeAttribute("closing");
                                this.removeAttribute("open");
                              }, 450);
                            setCookie("allow_cookie", "365", true);
                        },
                        false
                    );
                });
            this
                .querySelectorAll(".bls_cookies .cookies-refuse-js")
                .forEach((closeCookie) => {
                    closeCookie.addEventListener(
                        "click",
                        (e) => {
                            e.preventDefault();
                            _this.setAttribute("closing","true");
                            setTimeout(() => {
                                this.removeAttribute("closing");
                                this.removeAttribute("open");
                              }, 450);
                            setCookie("allow_cookie", "365", false);
                        },
                        false
                    );
                });
    }
}
customElements.define("cookies-popup", CookiesPopup);