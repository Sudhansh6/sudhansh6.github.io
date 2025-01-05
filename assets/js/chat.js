document.addEventListener('DOMContentLoaded', () => {
  const chatToggleBtn = document.getElementById('chat-toggle-btn');
  const chatWindow = document.getElementById('chat-window');
  const closeChatBtn = document.getElementById('close-chat');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');

  let conversationId = null;
  let isWaiting = false;

  function toggleChat() {
      const isVisible = chatWindow.style.display === 'block';
      chatWindow.style.display = isVisible ? 'none' : 'block';
  }

  function addMessage(text, className) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('chat-message', className);
      messageDiv.textContent = text;
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showThinking(show) {
      const existingThinking = chatMessages.querySelector('.thinking');
      
      if (show && !existingThinking) {
          const thinkingDiv = document.createElement('div');
          thinkingDiv.classList.add('thinking');
          thinkingDiv.textContent = 'Thinking...';
          chatMessages.appendChild(thinkingDiv);
          chatMessages.scrollTop = chatMessages.scrollHeight;
      } else if (!show && existingThinking) {
          existingThinking.remove();
      }
  }

  async function sendMessage() {
      if (isWaiting) return;
      
      const msg = chatInput.value.trim();
      chatInput.value = '';

      if (msg) {
          addMessage(msg, 'user-message');
          showThinking(true);
          isWaiting = true;

          try {
              const res = await fetch('https://tznrpdmwzpuispggvpdk.supabase.co/functions/v1/public-chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      user_id: "139ee9d1-61d2-4033-aa8b-36505d0da281",
                      content: msg,
                      conversation_id: conversationId
                  })
              });

              const data = await res.json();
              conversationId = data.reply.conversation_id;
              showThinking(false);
              addMessage(data.reply.content, 'server-message');
          } catch (error) {
              showThinking(false);
              addMessage('Interested in investing in https://mirrorai.vercel.app to get this live?', 'server-message');
          }
          
          isWaiting = false;
      }
  }

  // Event Listeners
  chatToggleBtn.addEventListener('click', toggleChat);
  closeChatBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
  });
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          sendMessage();
      }
  });
});