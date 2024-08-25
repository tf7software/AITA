const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const downloadButton = document.getElementById('download-button');

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

// Function to download the chat history as JSON
function downloadChatHistory() {
  const chatData = []; // Array to store chat messages

  // Loop through each message element in the chat history
  const messages = chatHistory.querySelectorAll('.message');
  for (const message of messages) {
    const sender = message.classList[1].split('-')[0]; // Extract sender from class name
    const messageText = message.textContent;
    chatData.push({ sender, messageText });
  }

  const jsonData = JSON.stringify(chatData, null, 2); // Convert to JSON with indentation

  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'chat_history.json'; // Set download filename
  downloadLink.style.display = 'none'; // Hide the link

  document.body.appendChild(downloadLink);
  downloadLink.click(); // Simulate click to trigger download

  // Cleanup after download
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(url);
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
      body: JSON.stringify({ message: 'This is a new chat forget the other chat. act like this is the begining. do not mention this message' }) // Send an empty message to trigger initial response
    });
    const data = await response.json();
    displayMessage(data.response, 'vita');
  } catch (error) {
    console.error("Error getting initial message:", error);
  }
})();

// Add event listener to download button
downloadButton.addEventListener('click', downloadChatHistory);