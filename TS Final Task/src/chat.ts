// References to DOM elements
const chatButton = document.getElementById('chat-button') as HTMLElement | null;
const chatInterface = document.getElementById('chat-interface') as HTMLElement | null;
const chatMessages = document.getElementById('chat-messages') as HTMLElement | null;
const userInput = document.getElementById('user-input') as HTMLInputElement | null;
const closeChat = document.getElementById('close-chat') as HTMLElement | null;
const sendMessage = document.getElementById('send-message') as HTMLElement | null;

// Add event listeners with null-checks
chatButton?.addEventListener('click', toggleChat);
closeChat?.addEventListener('click', toggleChat);
userInput?.addEventListener('keypress', handleUserInput);
sendMessage?.addEventListener('click', sendUserMessage);

// Toggle the visibility of the chat interface
function toggleChat(): void {
    if (chatInterface) {
        chatInterface.classList.toggle('hidden');
    }
}

// Handle user input keypresses
function handleUserInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
        sendUserMessage();
    }
}

// Send the user's message and fetch a response
function sendUserMessage(): void {
    if (userInput && chatMessages) {
        const message = userInput.value.trim();
        if (message) {
            appendMessage('user', message);
            userInput.value = '';
            getBotResponse(message);
        }
    }
}

// Append a message to the chat interface
function appendMessage(sender: 'user' | 'bot', message: string): void {
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('flex', sender === 'user' ? 'justify-end' : 'justify-start', 'mb-2');
    messageElement.innerHTML = `
        <div class="${sender === 'user' ? 'user-message' : 'bot-message'}">
            ${message}
        </div>
    `;
    chatMessages.appendChild(messageElement);

    // Scroll to the bottom to show the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fetch a response from the bot (API Call)
async function getBotResponse(message: string): Promise<void> {
    const API_KEY = 'AIzaSyDQP0dLJApqSBshnfRBLWny3gEIMFYn0kM';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `You are a helpful travel assistant. Provide concise, travel-focused responses. User query: ${message}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.9,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Log the entire response for debugging

        // Handle the response structure from the API
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            const botMessage = data.candidates[0].content.parts[0].text;
            appendMessage('bot', botMessage);
        } else {
            throw new Error('Unexpected response structure from the API');
        }
    } catch (error) {
        console.error('Error:', error);
        appendMessage('bot', 'Sorry, I encountered an error. Please try again later.');
    }
}