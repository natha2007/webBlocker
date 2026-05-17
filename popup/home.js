// On attend que le DOM soit totalement chargé
document.addEventListener("DOMContentLoaded", () => {
    
    console.log("Popup chargée et script actif");

    const form = document.getElementById("form-url-id");
    const btnHome1 = document.getElementById("btn-home-1");
    const firstButtonDiv = document.getElementById("firstButton");
    const buttonBloquer = document.getElementById("btn-bloquer");
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
    
    // Gestion du bouton Activer/Désactiver
    
    browser.storage.local.get("visibleUrls").then((data) => {
        let visible = data.visibleUrls;
        if (visible){
            showUrls();
        } else {
            hideUrls();
        }
    });


    
    EnableDisableBtn.addEventListener("click", () => {
        
        // à résoudre :
        // faire en sorte de pouvoir enregistrer la liste avant de la mettre à vide 

        

        browser.storage.local.get("visibleUrls").then((data) => {
            let visible = data.visibleUrls;
            console.log("visible : ", visible);
            browser.storage.local.get("lastUrlsList").then((data) => {
                console.log("urls bloquées", data.lastUrlsList);
                const lastUrlsList = data.lastUrlsList;
                if (visible) {
                    console.log("Extension désactivée");
                    hideUrls();
                    browser.storage.local.set({ blockedUrls: [], visibleUrls : false });
                    browser.tabs.reload();
                } else {
                    console.log("Extension activée");
                    showUrls();
                    browser.storage.local.set({ blockedUrls: lastUrlsList, visibleUrls : true });
                    browser.tabs.reload();
                }
            })
        });

        

        
    });

    
    // GESTION DU SUBMIT (Le coeur du problème)
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const urlCible = document.getElementById("url-input").value.trim().toLowerCase();

            

            if (!urlCible) return;

            // Récupérer liste actuelle (tableau vide par défaut)
            browser.storage.local.get({ blockedUrls: [] }).then((data) => {
                const listeAjour = data.blockedUrls;

                // Ajouter URL si pas déjà dans la liste
                if (!listeAjour.includes(urlCible)) {
                    listeAjour.push(urlCible);
                }

                
                // Sauvegarder  nouvelle liste
                return browser.storage.local.set({ blockedUrls: listeAjour, lastUrlsList : listeAjour }).then(() => {

                    // Ajouter dans la liste des URls bloquées celle qu'on vient d'ajouter
                    const listElements = document.getElementById("blocked-urls-list");
                    console.log(listElements);
                    listElements.innerHTML = "";
                    listeAjour.forEach(url => {
                        const li = document.createElement("li");
                        li.textContent = url; // Plus sécurisé que innerHTML
                        li.className = "blocked-urls-li";
                        li.id = "li" + url.replace(/[^a-z0-9]/gi, '-');
                        listElements.appendChild(li);
                        const suppBtn = document.createElement("button");
                        suppBtn.textContent = "Supprimer";
                        suppBtn.type = "button";
                        suppBtn.className = "supp-btn";
                        li.appendChild(suppBtn);
                    });
                });


            }).then(() => {
                console.log("Liste mise à jour");
                browser.tabs.reload(); // Rafraîchir pour appliquer
            });
        });
    } else {
        console.error("ERREUR : Le formulaire 'form-url-id' n'existe pas dans le HTML");
    }

    const ul = document.getElementById("blocked-urls-list");
    ul.addEventListener('click', (e)=>{
        const suppButton = e.target.closest(".supp-btn");
        const suppLi = e.target.closest(".blocked-urls-li");
        console.log(suppLi.textContent);
        if (suppButton && suppLi){
            const idBtnASupp = suppButton.id;
            const idLiASupp = suppLi.id;
            browser.storage.local.get("lastUrlsList").then((data)=>{
                let listeAjour = data.lastUrlsList || [];
                console.log("liste à jour : ", listeAjour);
                listeAjour = listeAjour.filter(url => "li" + url.replace(/[^a-z0-9]/gi, '-') !== idLiASupp);
                console.log("liste à jour après modif: ", listeAjour);
                browser.storage.local.set({ lastUrlsList: listeAjour, blockedUrls : listeAjour}).then(() => {
                    const elementLi = document.getElementById(idLiASupp);
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


function hideUrls(){
    let hiddenButtons = document.getElementsByClassName("hidden-2");
    for (let hidden of hiddenButtons) { hidden.style.display = "none"; }
}

function showUrls(){
    let hiddenButtons = document.getElementsByClassName("hidden-2");
    for (let hidden of hiddenButtons) { hidden.style.display = "block"; }
    // Réafficher les sites bloqués
    browser.storage.local.get("lastUrlsList").then((data)=>{
        const listeAjour = data.lastUrlsList;
        const listElements = document.getElementById("blocked-urls-list");
        console.log(listElements);
        listElements.innerHTML = "";
        listeAjour.forEach(url => {
            const li = document.createElement("li");
            li.textContent = url; // Plus sécurisé que innerHTML
            li.className = "blocked-urls-li";
            li.id = "li" + url.replace(/[^a-z0-9]/gi, '-');
            listElements.appendChild(li);
            const suppBtn = document.createElement("button");
            suppBtn.textContent = "Supprimer";
            suppBtn.type = "button";
            suppBtn.className = "supp-btn";
            li.appendChild(suppBtn);
        });
    });
}


function onGot(item) {
  console.log(item);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function showPage(pageId){
    //cacher toutes les pages
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");

    //afficher la page voulue
    document.getElementById(pageId).style.display = "block";

    //Mettre dans le storage en tant que dernière page affichée
    browser.storage.local.set({ lastActivePage : pageId});
}

// injection du script doit pas bloquer le reste
browser.tabs
  .executeScript({ file: "/content_scripts/block.js" })
  .catch(err => console.warn("Script de contenu non injecté (normal sur pages système) :", err.message));