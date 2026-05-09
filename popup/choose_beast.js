// On attend que le DOM soit totalement chargé
document.addEventListener("DOMContentLoaded", () => {
    
    console.log("Popup chargée et script actif");

    const form = document.getElementById("form-url-id");
    const btnBeast1 = document.getElementById("btn-beast-1");
    const firstButtonDiv = document.getElementById("firstButton");
    const buttonBloquer = document.getElementById("btn-bloquer");
    const EnableDisableBtn = document.getElementById("btn-enable-disable");

    // Sécurité : on cache au démarrage
    if (firstButtonDiv) firstButtonDiv.style.display = "none";

    // Gestion de l'affichage du formulaire
    if (btnBeast1) {
        btnBeast1.addEventListener("click", () => {
            console.log("Clic sur bouton 1");
            showPopUp();
        });
    }

    // Gestion du bouton Activer/Désactiver
    let count = 0
    const listeActuelle = browser.storage.local.get("blockedUrls");
    EnableDisableBtn.addEventListener("click", () => {
        count++;
         if (count % 2 === 1) {
            console.log("Extension désactivée");
            hideUrls();
            browser.storage.local.set({ blockedUrls: []}).then(() => {
                console.log("Liste des URLs bloquées réinitialisée", listeActuelle);
                browser.tabs.reload(); 
            });
        } else {
            console.log("Extension activée");
            showUrls();
            browser.storage.local.set({ blockedUrls: listeActuelle }).then(() => {
                for (let liste of listeActuelle) {
                    console.log("Liste des URLs débloquées ", liste);
                    browser.tabs.reload(); 
                }
            });
        }
    });

    // GESTION DU SUBMIT (Le coeur du problème)
    if (form) {
        console.log("salut je suis là !");

        buttonBloquer.addEventListener("click", () => {
            console.log("Clic sur le bouton de soumission du formulaire");
        });

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
                return browser.storage.local.set({ blockedUrls: listeAjour });
            }).then(() => {
                console.log("Liste mise à jour");
                browser.tabs.reload(); // Rafraîchir pour appliquer
            });
        });
    } else {
        console.error("ERREUR : Le formulaire 'form-url-id' n'existe pas dans le HTML");
    }
});

function showPopUp(){
    let hiddenButtons = document.getElementsByClassName("hidden-1");
    let visibleButtons = document.getElementsByClassName("button beast");
    for (let hidden of hiddenButtons) { hidden.style.display = "block"; }
    for (let visible of visibleButtons) { visible.style.display = "none"; }
}

function hideUrls(){
    let hiddenButtons = document.getElementsByClassName("hidden-2");
    for (let hidden of hiddenButtons) { hidden.style.display = "none"; }
}

function showUrls(){
    let hiddenButtons = document.getElementsByClassName("hidden-2");
    for (let hidden of hiddenButtons) { hidden.style.display = "block"; }
}

// injection du script doit pas bloquer le reste
browser.tabs
  .executeScript({ file: "/content_scripts/beastify.js" })
  .catch(err => console.warn("Script de contenu non injecté (normal sur pages système) :", err.message));