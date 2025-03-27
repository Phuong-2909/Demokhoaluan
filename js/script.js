const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const themeToggle = document.querySelector("#theme-toggle-btn");


//API setup
const API_KEY = "AIzaSyDmi1zMoQc7_97LT1Nn8m5k5mF2Nxq8Om8";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory = [];

const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior:"smooth"});


//simulate typing effect for bot response
const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    //set an interval to type each word
    const typingInterval = setInterval(() => {
        if(wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            scrollToBottom();
        } else {
            clearInterval(typingInterval);
            botMsgDiv.classList.remove("loading");
            document.body.classList.remove("bot-responding");
        }
    }, 40);
}

//Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");


    //Add user message to the chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try{
        //Send the chat history to the API to get a response
        const response = await fetch(API_URL,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ contents: chatHistory})
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        //process the response text and display with typing effect
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        typingEffect(responseText, textElement, botMsgDiv);
    }catch (error) {
        textElement.style.color = "#d62939";
        textElement.textContent = error.name === "AbortError" ? "Response generation stopped." : error.message;
        botMsgDiv.classList.remove("loading");
        document.body.classList.remove("bot-responding");
        scrollToBottom();
    }
}

const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage || document.body.classList.contains("bot-responding")) return;

    promptInput.value = "";

    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() => {
    const botMsgHTML = `<img src="img/pngtree-chatbot-symbol-3d-icon-isolated-on-a-transparent-background-symbolizing-ai-png-image_15359543-removebg-preview.png" class="avatar"><p class="message-text">Chờ một lát...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
    }, 600);
}

//Delete all chats
document.querySelector("#delete-chats-btn").addEventListener("click", () =>{
    chatHistory.length=0;
    chatsContainer. innerHTML = "";
    document.body.classList.remove("bot-responding");
});

//Toggle dark/ Dark theme
themeToggle.addEventListener("click", () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("themeColor", isDarkTheme ? "dark_mode" : "light_mode");
    themeToggle.textContent = isDarkTheme ? "light_mode" : "dark_mode";
});

//set initial theme from local storage
const isDarkTheme = localStorage.getItem("themeColor") === "dark-mode";
document.body.classList.toggle("dark-theme", isDarkTheme);
themeToggle.textContent = isDarkTheme ? "light_mode" : "dark_mode";

promptForm.addEventListener("submit", handleFormSubmit);