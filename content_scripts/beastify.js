(function () {
  /**
   * On vérifie et on initialise une variable globale
   * permettant de s'assurer que le script ne fera rien
   * s'il est injecté plusieurs fois sur la page.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;


  // check stockage au chargement
    browser.storage.local.get("blockedUrls").then((data) => {
        if (data.blockedUrls && data.blockedUrls.length > 0) {
            const urlActuelle = window.location.href;
            console.log("URL actuelle :", urlActuelle);
            for (let urlBloquee of data.blockedUrls) {
                if (urlActuelle.includes(urlBloquee)) {
                    const overlay = document.createElement("div");
                    overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:red; color:white; z-index:999999; display:flex; align-items:center; justify-content:center; font-size:30px;";
                    overlay.innerText = "SITE BLOQUÉ !";
                    document.documentElement.appendChild(overlay);
                }
            }
        }
    });

  
})();