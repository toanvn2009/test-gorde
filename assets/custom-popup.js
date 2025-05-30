class Popup extends HTMLElement {
    constructor() {
      super();
      this.popup = null;
    }
    init() {
        this.initPopupJs()
    }
    initPopupJs(content = "", title = "", id = "", header=true, footer=true, timeShow = 0) { 
        const _this = this;
        this.popup = EasyDialogBox.create(id, `dlg ${header==false?"dlg-disable-heading ":""}${footer==false?"dlg-disable-footer ":""}dlg-disable-drag`, title, content);
        this.popup.onClose = function()
        {
            removeTrapFocus();
            _this.popup.destroy();
            rootAction.remove();
            root.style.removeProperty("padding-right");
            if (_this.querySelector("button") && _this.querySelector("button").id) {
                if (document.querySelector("#"+_this.querySelector("button").id)) {
                    document.querySelector("#"+_this.querySelector("button").id).focus();
                }
            }
            getHeightHeader.init();
        };
        this.popup.show(timeShow);
    }
}