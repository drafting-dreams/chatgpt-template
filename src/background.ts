// Listen for the extension icon click event
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel for the current tab
  chrome.sidePanel.open({
    tabId: tab.id,
  })
})
