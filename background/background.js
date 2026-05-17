browser.runtime.onInstalled.addListener(() => {
  
  browser.storage.local.set({ 
    blockedUrls: [],
    lastActivePage : 'home',
    visibleUrl : true,
    lastUrlsList : [],
    isEnabled : true,
  });
  console.log("Stockage initialisé !");
});