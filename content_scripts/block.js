(function () {
  /**
    *We check and initialize a global variable
    * to ensure that the script will do nothing
    * if it is injected multiple times on the page.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;


  // storage checking at loading
  browser.storage.local.get("visibleUrl").then((dt)=>{
    let visible = dt.visibleUrl;
    if (visible){
        browser.storage.local.get("blockedUrls").then((data) => {
            if (data.blockedUrls && data.blockedUrls.length > 0) {
                const currentUrl = window.location.href;
                //console.log("Current URL :", currentUrl);
                for (let blockedUrl of data.blockedUrls) {
                    if (currentUrl.includes(blockedUrl)) {
                        const overlay = document.createElement("div");
                        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:red; color:white; z-index:999999; display:flex; align-items:center; justify-content:center; font-size:30px;";
                        overlay.innerText = "WEBSITE BLOCKED !";
                        document.documentElement.appendChild(overlay);
                    }
                }
            }
        });
    }
  })
    

  
})();