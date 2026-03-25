document.getElementById("summarize").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '<div class="loading"><div class="loader"></div></div>';

  const summaryType = document.getElementById("summary-type").value;

  chrome.storage.sync.get(["gemini_api_key"], async (result) => {
    if (!result.gemini_api_key) {
      resultDiv.innerHTML = "API key not found. Please set your API key.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_ARTICLE_TEXT" },
        async (res) => {
          if (!res || !res.text) {
            resultDiv.innerText = "Could not extract article text.";
            return;
          }

          try {
            const summary = await getGeminiSummary(
              res.text,
              summaryType,
              result.gemini_api_key,
            );
            resultDiv.innerText = summary;
          } catch (error) {
            resultDiv.innerText = `Error: ${error.message || "Failed to generate summary."}`;
          }
        },
      );
    });
  });
});

document.getElementById("copy-btn").addEventListener("click", () => {
  const summaryText = document.getElementById("result").innerText;
  if (summaryText.trim()) {
    navigator.clipboard.writeText(summaryText).then(() => {
      const copyBtn = document.getElementById("copy-btn");
      const originalText = copyBtn.innerText;
      copyBtn.innerText = "Copied!";
      setTimeout(() => (copyBtn.innerText = originalText), 2000);
    });
  }
});

async function getGeminiSummary(text, summaryType, apiKey) {
  const maxLength = 20000;
  const truncatedText =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  let prompt;
  switch (summaryType) {
    case "Brief":
      prompt = `Provide a brief summary of the following article in 2-3 sentences:\n\n${truncatedText}`;
      break;
    case "detailed":
      prompt = `Provide a detailed summary of the following article, covering all main points:\n\n${truncatedText}`;
      break;
    case "Bullet":
      prompt = `Summarize the following article in bullet points (5-7). Each point should start with "- ":\n\n${truncatedText}`;
      break;
    default:
      prompt = `Summarize the following article:\n\n${truncatedText}`;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "API request failed");
  }

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available."
  );
}
