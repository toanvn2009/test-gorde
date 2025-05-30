var Zoom = (function() {
    return {
        init: function () {
          this.initZoomImage();
        },

        initZoomImage: function(){
            const mainImg = document.querySelectorAll('.hover-zoom .slider-image img');
            if (mainImg.length != 0) {
                const zoomOption = document.querySelector('[data-zoom-option]')?.getAttribute('data-zoom-option');
                mainImg.forEach((trigger) => {
                    const paneContainer = trigger.closest('.main__product').querySelector('.zoom-external-area')
                    const inlineContainer = trigger.closest('[data-pane-container]');
                    new Drift(trigger, {
                        inlinePane: zoomOption === 'inner-2',
                        zoomFactor: 3,
                        containInline: false,
                        paneContainer: zoomOption === 'external' ? paneContainer : inlineContainer,
                        hoverBoundingBox: zoomOption === 'external',
                        onShow: function() {
                            inlineContainer?.classList.add('relative', "rounded-corner-item")
                        },
                        onHide: function() {
                            inlineContainer?.classList.remove('relative', "rounded-corner-item")
                        }
                    });
                })
            }
        }
    }
})();
if (window.innerWidth > 767) {
    setTimeout(() => {
        Zoom.init();
    });
}
window.addEventListener("resize", function() {
    if (window.innerWidth > 767) {
        setTimeout(() => {
            Zoom.init();
        });
    }
});
