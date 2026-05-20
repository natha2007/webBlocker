/**
 * Initialise the URL blocker part of the popup
 */
export function initBlocker(){
    showHideUrlListUI();
    EnableDisableUrlBlocking();
    blockUrl();
    deleteUrl();

    // script injection 
    browser.tabs
    .executeScript({ file: "/content_scripts/block.js" })
    .catch(err => console.warn("Script de contenu non injecté (normal sur pages système) :", err.message));
}

/**
 * Hide or show the Url list on UI depending if it is enabled/disabled
 */
function showHideUrlListUI(){
    browser.storage.local.get("visibleUrl").then((data) => {
        let visible = data.visibleUrl;
        if (visible){
            showUrls();
        } else {
            hideUrls();
        }
    });
}

/**
 * Manage the button that allows the user to enable or disable the restrictions he added
 */
function EnableDisableUrlBlocking(){
    const EnableDisableBtn = document.getElementById("btn-enable-disable");
    EnableDisableBtn.addEventListener("click", () => {
        browser.storage.local.get("visibleUrl").then((data) => {
            let visible = data.visibleUrl;
            //console.log("visible : ", visible);
            browser.storage.local.get("blockedUrls").then((data) => {
                //console.log("urls bloquées", data.blockedUrls);
                const lastUrlsList = data.blockedUrls;
                if (visible) {
                    //console.log("Extension désactivée");
                    hideUrls();
                    browser.storage.local.set({visibleUrl : false });
                    browser.tabs.reload();
                } else {
                    //console.log("Extension activée");
                    showUrls();
                    browser.storage.local.set({visibleUrl : true });
                    browser.tabs.reload();
                }
            })
        });
    });
}

/**
 * When the block button is clicked (then submitted), the URL that has been written is added to the
 * blocked URLs list and displayed on the UI
 */
function blockUrl(){
    const form = document.getElementById("form-url-id"); // Url submission form 
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const targetUrl = document.getElementById("url-input").value.trim().toLowerCase();

            if (!targetUrl) return;

            // Retrieve current list (empty by default)
            browser.storage.local.get({ blockedUrls: [] }).then((data) => {
                const updatedList = data.blockedUrls;
                browser.storage.local.get("visibleUrl").then((data)=>{
                    let visible = data.visibleUrl;
                    if (visible){

                        // Add url to list if not yet
                        if (!updatedList.includes(targetUrl)) {
                            updatedList.push(targetUrl);
                        }
                        
                        // Save new list
                        return browser.storage.local.set({ blockedUrls: updatedList }).then(() => {
                            // Add element to UI list
                            const listElements = document.getElementById("blocked-urls-list");
                            //console.log(listElements);
                            listElements.innerHTML = "";
                            showBlockedUrls(updatedList, listElements);
                        });
                    }
                });
            }).then(() => {
                //console.log("List updated !");
                browser.tabs.reload(); // Refresh to apply
            });
        });
    } else {
        console.error("ERROR : The 'form-url-id' form doesn't exist in the HTML");
    }
}


/**
 * When the delete button of an URL is clicked, the URL will be removed from the list of the blocked URLs
 * and will be removed from the UI
 */
function deleteUrl(){
    const ul = document.getElementById("blocked-urls-list");
    ul.addEventListener('click', (e)=>{
        const deleteBtn = e.target.closest(".supp-btn");
        const deleteLi = e.target.closest(".blocked-urls-li");
        //console.log(deleteLi.textContent);
        if (deleteBtn && deleteLi){
            const btnId = deleteBtn.id;
            const idLi = deleteLi.id;
            browser.storage.local.get("blockedUrls").then((data)=>{
                let updatedList = data.blockedUrls || [];
                //console.log("Updated list : ", updatedList);
                updatedList = updatedList.filter(url => "li" + url.replace(/[^a-z0-9]/gi, '-') !== idLi);
                //console.log("updated list after filtering ", updatedList);
                browser.storage.local.set({blockedUrls : updatedList}).then(() => {
                    const elementLi = document.getElementById(idLi);
                        if (elementLi) {
                            elementLi.remove(); 
                        }
                });
            }).then(()=>{
                browser.tabs.reload();
            });
        }
    });
}


/**
 * Take a list (of urls) and a HTML ul element and proceed to display all urlList elements
 * onto the screen by transforming each URL into a li element with a delete button that is added 
 * to the ul element.
 * @param {*} urlList list of urls 
 * @param {*} listElements ul HTML element
 */
function showBlockedUrls(urlList, listElements){
    urlList.forEach(url => {
        const li = document.createElement("li");
        li.textContent = url; 
        li.className = "blocked-urls-li";
        li.id = "li" + url.replace(/[^a-z0-9]/gi, '-');
        listElements.appendChild(li);
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.type = "button";
        deleteBtn.className = "supp-btn";
        li.appendChild(deleteBtn);
    });
}

/**
 * Hide all Url blocking management part
 */
function hideUrls(){
    let hiddenButtons = document.getElementsByClassName("hidden-2");
    for (let hidden of hiddenButtons) { hidden.style.display = "none"; }
}

/**
 * Show all Url blocking management part (Also the blocked URLs list)
 */
function showUrls(){
    let hiddenButtons = document.getElementsByClassName("hidden-2");
    for (let hidden of hiddenButtons) { hidden.style.display = "block"; }
    // show blocked websites
    browser.storage.local.get("blockedUrls").then((data)=>{
        const updatedList = data.blockedUrls;
        const listElements = document.getElementById("blocked-urls-list");
        //console.log(listElements);
        listElements.innerHTML = "";
        showBlockedUrls(updatedList, listElements);
    });
}

