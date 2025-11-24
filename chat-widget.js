(function() {
    // Create and inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
        }

        .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
        }

        .n8n-chat-widget .close-button {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            opacity: 0.6;
        }

        .n8n-chat-widget .close-button:hover {
            opacity: 1;
        }

        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
        }

        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

        .n8n-chat-widget .new-conversation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            text-align: center;
            width: 100%;
            max-width: 300px;
        }

        .n8n-chat-widget .welcome-text {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
        }

        .n8n-chat-widget .new-chat-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 16px 24px;
            gap: 8px;
            background: linear-gradient(135deg, var(--chat--color-primary), var(--chat--color-secondary));
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin-bottom: 12px;
        }

        .n8n-chat-widget .chat-interface {
            display: none;
            flex-direction: column;
            height: 100%;
        }

        .n8n-chat-widget .chat-interface.active {
            display: flex;
        }

        .n8n-chat-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
        }

        .n8n-chat-widget .chat-message {
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
        }

        .n8n-chat-widget .chat-message.user {
            background: linear-gradient(135deg, var(--chat--color-primary), var(--chat--color-secondary));
            color: white;
            align-self: flex-end;
        }

        .n8n-chat-widget .chat-message.bot {
            background: white;
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: black;
            align-self: flex-start;
        }

        .n8n-chat-widget .chat-input {
            padding: 16px;
            display: flex;
            gap: 8px;
        }

        .n8n-chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            resize: none;
        }

        .n8n-chat-widget .chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--chat--color-primary), var(--chat--color-secondary));
            color: white;
            cursor: pointer;
        }
    `;

    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Default config
    const config = window.ChatWidgetConfig || {};

    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = "";
    let messageCount = 0;
    const MAX_MESSAGES = 5;

    // Create widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "n8n-chat-widget";

    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-container";

    chatContainer.innerHTML = `
        <div class="brand-header">
            <img src="${config.branding?.logo || ""}">
            <span>${config.branding?.name || ""}</span>
            <button class="close-button">×</button>
        </div>

        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding?.welcomeText || ""}</h2>
            <button class="new-chat-btn">Send us a message</button>
        </div>

        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding?.logo || ""}">
                <span>${config.branding?.name || ""}</span>
                <button class="close-button">×</button>
            </div>

            <div class="chat-messages"></div>

            <div class="chat-input">
                <textarea placeholder="Type a message..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
        </div>
    `;

    const toggleButton = document.createElement("button");
    toggleButton.className = "chat-toggle";
    toggleButton.textContent = "💬";

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const newChatBtn = chatContainer.querySelector(".new-chat-btn");
    const chatInterface = chatContainer.querySelector(".chat-interface");
    const messagesContainer = chatContainer.querySelector(".chat-messages");
    const textarea = chatContainer.querySelector("textarea");
    const sendButton = chatContainer.querySelector("button[type='submit']");

    const closeButtons = chatContainer.querySelectorAll(".close-button");

    // Generate session
    function generateUUID() {
        return crypto.randomUUID();
    }

    // Open new conversation WITHOUT sending POST
    function startNewConversation() {
        currentSessionId = generateUUID();
        messageCount = 0; // reset message limit

        chatContainer.querySelector(".brand-header").style.display = "none";
        chatContainer.querySelector(".new-conversation").style.display = "none";
        chatInterface.classList.add("active");

        textarea.disabled = false;
        sendButton.disabled = false;
    }

    // Send message
    async function sendMessage(message) {
        if (messageCount >= MAX_MESSAGES) {
            const botMessageDiv = document.createElement("div");
            botMessageDiv.className = "chat-message bot";
            botMessageDiv.textContent = "Has alcanzado el límite de mensajes de esta conversación.";
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            textarea.disabled = true;
            sendButton.disabled = true;

            return;
        }

        const messageData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook?.route,
            chatInput: message,
            metadata: { userId: "" }
        };

        const userMessageDiv = document.createElement("div");
        userMessageDiv.className = "chat-message user";
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        messageCount++;

        try {
            const response = await fetch(config.webhook?.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messageData)
            });

            const data = await response.json();

            const botMessageDiv = document.createElement("div");
            botMessageDiv.className = "chat-message bot";
            botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;

            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Listeners
    newChatBtn.addEventListener("click", startNewConversation);

    sendButton.addEventListener("click", () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = "";
        }
    });

    textarea.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                textarea.value = "";
            }
        }
    });

    toggleButton.addEventListener("click", () => {
        chatContainer.classList.toggle("open");
    });

    closeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            chatContainer.classList.remove("open");
        });
    });

})();
