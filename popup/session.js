/**
 * Initialise session by displaying the default display, making the user able to switch page
 * and to save last page the user visited
 */
export function initSession(){
    defaultDisplay();
    switchPage();
    getLastActivePage();
}

/**
 * Managing the popup to the default display (starting page)
 */
function defaultDisplay(){
    document.querySelectorAll('.page').forEach(p => p.style.display = "none");
    document.getElementById('starting-page').style.display = "block";
}

/**
 * Managing the buttons so that they allow user to "switch page"
 */
function switchPage(){
    document.querySelectorAll("button[data-target]").forEach(btn => {
        const target = btn.getAttribute("data-target");
        btn.addEventListener("click", () => {
            showPage(target);
        })
    })
}

/**
 * Retrieve the last page a user got on to keep it when the user leave and open the popup again
 */
function getLastActivePage(){
    browser.storage.local.get("lastActivePage").then((lp) => {
        if (lp.lastActivePage){
            showPage(lp.lastActivePage);
        }
    })
}

/**
 * this allows the user to switch page with the buttons by hiding other page containers
 * and by showing choosed container id
 * @param {*} pageId HTML id of the container 
 */
function showPage(pageId){
    // hide all pages
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");

    // display wanted page
    document.getElementById(pageId).style.display = "block";

    // Put in storage as last displayed page
    browser.storage.local.set({ lastActivePage : pageId});
}





