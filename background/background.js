browser.runtime.onInstalled.addListener(() => {
  
  browser.storage.local.set({ 
    blockedUrls: [],
    lastActivePage : 'home',
    visibleUrl : true,
  });
  console.log("Initialised storage !");
});