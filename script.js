// Handle Prompt Form Submission
document
  .getElementById("prompt-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const apiKey = document.getElementById("apiKey").value;
    const userInput = document.getElementById("userInput").value;
    const maxTokens = parseInt(document.getElementById("tokens").value);

    if (!apiKey || !userInput || isNaN(maxTokens)) {
      alert("Please provide the API key, a valid prompt, and token limit!");
      return;
    }

    const triggerPrompt = `
  Generate a detailed and structured prompt based on the following user input. Organize the response into four sections:
  
  You are an expert in building solutions. Describe the user's background or goal, if relevant.
  Define the task or function of the system. Break down the task into clear steps or requirements.
  Provide a relevant example to clarify expectations.
  
  User Input: "${userInput}"
  
  Keep the output concise, professional, and under 500 characters.
`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              { role: "system", content: "Generate a structured response." },
              { role: "user", content: triggerPrompt },
            ],
            max_tokens: maxTokens,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      document.getElementById("response").value =
        data.choices[0].message.content;
    } catch (error) {
      document.getElementById("response").value = `Error: ${error.message}`;
    }
  });

// Handle Email Form Submission
document
  .getElementById("email-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const webhookUrl =
      "https://hook.eu2.make.com/ft54h6n9o8eo1f6l6u8quk7yefv41dg3"; // Your Make.com webhook URL

    if (!email || !email.includes("@")) {
      document.getElementById("responseMessage").textContent =
        "Please enter a valid email.";
      document.getElementById("responseMessage").style.color = "red";
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        document.getElementById("responseMessage").textContent =
          "Thank you! You'll be notified soon.";
        document.getElementById("responseMessage").style.color = "green";
        document.getElementById("email").value = "";
      } else {
        throw new Error("Failed to submit email.");
      }
    } catch (error) {
      console.error("Error submitting email:", error);
      document.getElementById("responseMessage").textContent =
        "Something went wrong. Please try again.";
      document.getElementById("responseMessage").style.color = "red";
    }
  });

// Edit Text
document.getElementById("editButton").addEventListener("click", () => {
  const responseField = document.getElementById("response");
  responseField.readOnly = false;
  responseField.focus();

  document.getElementById("saveButton").style.display = "inline-block";

  const draggable = document.getElementById("draggable");
  draggable.classList.add("editing");
});

// Save Edited Text
document.getElementById("saveButton").addEventListener("click", () => {
  const responseField = document.getElementById("response");
  responseField.readOnly = true;

  document.getElementById("saveButton").style.display = "none";

  const draggable = document.getElementById("draggable");
  draggable.classList.remove("editing");
});

// Copy Text
document.getElementById("copyButton").addEventListener("click", () => {
  const responseField = document.getElementById("response");
  responseField.select();
  document.execCommand("copy");

  alert("Prompt copied to clipboard!");
});

// Open in ChatGPT
document.getElementById("openChatGPT").addEventListener("click", () => {
  const responseField = document.getElementById("response").value;
  const chatGPTUrl = `https://chat.openai.com/?input=${encodeURIComponent(
    responseField
  )}`;
  window.open(chatGPTUrl, "_blank");
});

// Make Output Tab Draggable for Desktop Only
const draggable = document.getElementById("draggable");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

function enableDragging() {
  if (window.innerWidth >= 768) {
    // Enable dragging for desktop
    draggable.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);

    draggable.style.position = "absolute";
    draggable.style.cursor = "grab";
    draggable.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  } else {
    // Disable dragging for mobile
    draggable.removeEventListener("mousedown", startDrag);
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);

    draggable.style.position = "static";
    draggable.style.cursor = "default";
    draggable.style.boxShadow = "none";
  }
}

function startDrag(e) {
  if (draggable.classList.contains("editing")) return;
  isDragging = true;
  offsetX = e.clientX - draggable.offsetLeft;
  offsetY = e.clientY - draggable.offsetTop;
  draggable.style.cursor = "grabbing";
}

function drag(e) {
  if (isDragging) {
    draggable.style.left = `${e.clientX - offsetX}px`;
    draggable.style.top = `${e.clientY - offsetY}px`;
  }
}

function stopDrag() {
  isDragging = false;
  draggable.style.cursor = "grab";
}

// Initialize dragging behavior and handle window resize
enableDragging();
window.addEventListener("resize", enableDragging);
