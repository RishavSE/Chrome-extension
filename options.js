document.addEventListener("DOMContentLoaded", () => {
     chrome.storage.sync.get(["gemini_api_key"], ({ gemini_api_key }) => {
       if (gemini_api_key)  document.getElementById("api-key").value = gemini_api_key; 
});
    document.getElementById("save-btn").addEventListener("click", () => {
      const apiKey = document.getElementById("api-key").value.trim();
      if(!apiKey) {
        alert("Please enter a valid Gemini API key.");
        return;
      }
      chrome.storage.sync.set({ gemini_api_key: apiKey }, () => {
        document.getElementById("sucess-message").style.display = "block";
          setTimeout(() => window.close(), 1000);
      });

    });

});