const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Function to display a message
function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;
    chatHistory.appendChild(messageElement);

    // Scroll to the bottom of the chat history
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Function to send a message to the server and get a response
async function sendMessage() {
    const message = userInput.value;
    if (message.trim() !== "") { 
        displayMessage(message, 'user');
        userInput.value = "";

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message }) 
            });

            const data = await response.json();
            displayMessage(data.response, 'aita');

        } catch (error) {
            console.error("Error sending message:", error);
            // Handle errors, e.g., display an error message to the user
        }
    }
}

// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Send message when Enter key is pressed
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Get the AI's initial message on page load
(async () => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: '' }) // Send an empty message to trigger initial response
        });
        const data = await response.json();
        displayMessage(data.response, 'aita');
    } catch (error) {
        console.error("Error getting initial message:", error);
    }
})();