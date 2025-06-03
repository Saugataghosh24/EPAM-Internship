"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// References to DOM elements
const chatButton = document.getElementById('chat-button');
const chatInterface = document.getElementById('chat-interface');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const closeChat = document.getElementById('close-chat');
const sendMessage = document.getElementById('send-message');
// Add event listeners with null-checks
chatButton === null || chatButton === void 0 ? void 0 : chatButton.addEventListener('click', toggleChat);
closeChat === null || closeChat === void 0 ? void 0 : closeChat.addEventListener('click', toggleChat);
userInput === null || userInput === void 0 ? void 0 : userInput.addEventListener('keypress', handleUserInput);
sendMessage === null || sendMessage === void 0 ? void 0 : sendMessage.addEventListener('click', sendUserMessage);
// Toggle the visibility of the chat interface
function toggleChat() {
    if (chatInterface) {
        chatInterface.classList.toggle('hidden');
    }
}
// Handle user input keypresses
function handleUserInput(event) {
    if (event.key === 'Enter') {
        sendUserMessage();
    }
}
// Send the user's message and fetch a response
function sendUserMessage() {
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
function appendMessage(sender, message) {
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
function getBotResponse(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const API_KEY = 'AIzaSyDQP0dLJApqSBshnfRBLWny3gEIMFYn0kM';
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        try {
            const response = yield fetch(`${API_URL}?key=${API_KEY}`, {
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
            const data = yield response.json();
            console.log('API Response:', data); // Log the entire response for debugging
            // Handle the response structure from the API
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                const botMessage = data.candidates[0].content.parts[0].text;
                appendMessage('bot', botMessage);
            }
            else {
                throw new Error('Unexpected response structure from the API');
            }
        }
        catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, I encountered an error. Please try again later.');
        }
    });
}
