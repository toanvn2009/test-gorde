const parent = document.querySelectorAll(".facets-container");
let eventAttached = false;
function actionFilter() {
    if (!eventAttached) {
        if (parent.length != 0) {
            parent.forEach(element => {
                element.addEventListener("click", function (event) {
                    const target = event.target;
                    if (target.matches(".filter-title") || target.closest(".filter-title")) {
                        event.preventDefault();
                        const detail = target.closest("action-filter")?.querySelector(".filter-attribute.vertical-filter");
                        if (element.dataset.filterType === "vertical" || element.dataset.filterType === "canvas") {
                            if (target.matches(".filter-title")) {
                                slideAnime({
                                    target: detail,
                                    parent: target,
                                    animeType: "slideToggle",
                                });
                            }else{
                                slideAnime({
                                    target: detail,
                                    parent: target.closest(".filter-title"),
                                    animeType: "slideToggle",
                                });
                            }
                        } else {
                            document.body.addEventListener("click", function(evt){
                                const t = evt.target;
                                if (!t.closest(".facets-container")) {
                                    const filterTitles = element.querySelectorAll(".filter-title");
                                    filterTitles.forEach(function (filterTitle) {
                                        if (window.innerWidth > 1024) {
                                            filterTitle.classList.remove("opened");
                                        }
                                    });
                                }
                            });
                            if (target.matches(".filter-title")) {
                                if (detail) {
                                    slideAnime({
                                        target: detail,
                                        parent: target,
                                        animeType: "slideToggle",
                                    });
                                }else{
                                    if (target.classList.contains("opened")) {
                                        target.classList.remove("opened");
                                    } else {
                                        const filterTitles = element.querySelectorAll(".filter-title");
                                        filterTitles.forEach(function (filterTitle) {
                                        filterTitle.classList.remove("opened");
                                        });
                                        target.classList.add("opened");
                                        setTimeout(() => {
                                            target.closest("details")?.setAttribute("open", "");
                                        }, 100);
                                    }
                                }
                            }else{
                                if (detail) {
                                    slideAnime({
                                        target: detail,
                                        parent: target.closest(".filter-title"),
                                        animeType: "slideToggle",
                                    });
                                }else{
                                    if (target.closest(".filter-title").classList.contains("opened")) {
                                        target.closest(".filter-title").classList.remove("opened");
                                    } else {
                                        const filterTitles = element.querySelectorAll(".filter-title");
                                        filterTitles.forEach(function (filterTitle) {
                                            filterTitle.classList.remove("opened");
                                        });
                                        target.closest(".filter-title").classList.add("opened");
                                        setTimeout(() => {
                                            target.closest("details")?.setAttribute("open", "");
                                        }, 100);
                                    }
                                }
                            }
                            
                        }
                    }
                });
            });
        }
       
        eventAttached = true;
    }
}

actionFilter();