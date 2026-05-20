// On attend que le DOM soit totalement chargé
document.addEventListener("DOMContentLoaded", () => {
    
    //console.log("Loaded popup and active script");

    const form = document.getElementById("form-url-id"); // Url submission form 
    const EnableDisableBtn = document.getElementById("btn-enable-disable");
    

    //Gestion conservation session popup
    document.querySelectorAll('.page').forEach(p => p.style.display = "none");
    document.getElementById('starting-page').style.display = "block";

    document.querySelectorAll("button[data-target]").forEach(btn => {
        const target = btn.getAttribute("data-target");
        btn.addEventListener("click", () => {
            showPage(target);
        })
    })

    browser.storage.local.get("lastActivePage").then((lp) => {
        if (lp.lastActivePage){
            showPage(lp.lastActivePage);
        }
    })
    

    // Enable/Disable button managing
    browser.storage.local.get("visibleUrl").then((data) => {
        let visible = data.visibleUrl;
        if (visible){
            showUrls();
        } else {
            hideUrls();
        }
    });

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

    
    // Block (url) button (form submission managing)
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

    // show/hide blocked URLs
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


});

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

// script injection 
browser.tabs
  .executeScript({ file: "/content_scripts/block.js" })
  .catch(err => console.warn("Script de contenu non injecté (normal sur pages système) :", err.message));