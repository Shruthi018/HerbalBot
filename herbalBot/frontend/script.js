// DOM Elements
const homepage = document.getElementById('homepage');
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const chatPage = document.getElementById('chatPage');
const feedbackPage = document.getElementById('feedbackPage');

// Header buttons
const loginBtnHeader = document.getElementById('loginBtnHeader');
const registerBtnHeader = document.getElementById('registerBtnHeader');
const startChatBtn = document.getElementById('startChatBtn');

// Auth page elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegisterLink');
const showLoginLink = document.getElementById('showLoginLink');
const backToHomeFromLogin = document.getElementById('backToHomeFromLogin');
const backToHomeFromRegister = document.getElementById('backToHomeFromRegister');

// Chat page elements
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatInterfaceMessages = document.getElementById('chatInterfaceMessages');
const chatLogoutBtn = document.getElementById('chatLogoutBtn');
const chatFeedbackBtn = document.getElementById('chatFeedbackBtn');

const newChatBtn = document.querySelector('.new-chat-btn');
const languageButtons = document.querySelectorAll('.language-btn');
const voiceInputBtn = document.getElementById('voiceInputBtn');

// Feedback page elements
const feedbackForm = document.getElementById('feedbackForm');
const backToChatFromFeedback = document.getElementById('backToChatFromFeedback');

// Authentication state
let isAuthenticated = false;
let authToken = null;
let currentLanguage = 'en';
let currentProjectId = null;
let currentChatId = Date.now();

// API Configuration
const API_BASE_URL = 'http://localhost:8083';
const TRANSLATE_API_URL = 'https://api.mymemory.translated.net/get'; // Free translation API

// Event Listeners
// Navigation
loginBtnHeader.addEventListener('click', () => showPage(loginPage));
registerBtnHeader.addEventListener('click', () => showPage(registerPage));
startChatBtn.addEventListener('click', () => {
    if (!isAuthenticated) {
        showPage(loginPage);
    } else {
        showPage(chatPage);
    }
});

// Auth pages
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(registerPage);
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(loginPage);
});

backToHomeFromLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(homepage);
});

backToHomeFromRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(homepage);
});

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleLogin();
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleRegister();
});

// Chat page
sendMessageBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

chatLogoutBtn.addEventListener('click', handleLogout);
chatFeedbackBtn.addEventListener('click', () => showPage(feedbackPage));

newChatBtn.addEventListener('click', startNewChat);

// Language selection
languageButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        languageButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentLanguage = this.getAttribute('data-lang');

        // Update placeholder text based on language
        if (currentLanguage === 'en') {
            chatInput.placeholder = "Type your message here...";
        } else {
            chatInput.placeholder = "உங்கள் செய்தியை இங்கே தட்டச்சு செய்க...";
        }
    });
});

// Voice input with Web Speech API
voiceInputBtn.addEventListener('click', function() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        if (currentLanguage === 'en') {
            alert("Speech recognition not supported in this browser. Using simulated input.");
        } else {
            alert("இந்த உலாவியில் குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை. உருவகப்படுத்தப்பட்ட உள்ளீடு பயன்படுத்தப்படுகிறது.");
        }
        useSimulatedVoiceInput();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentLanguage === 'en' ? 'en-US' : 'ta-IN';

    if (currentLanguage === 'en') {
        recognition.start();
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Listening...';
        voiceInputBtn.style.color = 'var(--primary-color)';
    } else {
        recognition.start();
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> கேட்டுக்கொண்டிருக்கிறது...';
        voiceInputBtn.style.color = 'var(--primary-color)';
    }

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';

        // Reset voice button
        resetVoiceButton();
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        resetVoiceButton();

        if (currentLanguage === 'en') {
            alert("Voice input failed. Using simulated input.");
        } else {
            alert("குரல் உள்ளீடு தோல்வியடைந்தது. உருவகப்படுத்தப்பட்ட உள்ளீடு பயன்படுத்தப்படுகிறது.");
        }
        useSimulatedVoiceInput();
    };

    recognition.onend = function() {
        resetVoiceButton();
    };
});

function resetVoiceButton() {
    if (currentLanguage === 'en') {
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i> Voice';
    } else {
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i> குரல்';
    }
    voiceInputBtn.style.color = '';
}

function useSimulatedVoiceInput() {
    setTimeout(() => {
        if (currentLanguage === 'en') {
            chatInput.value = "I have been experiencing stomach pain and indigestion.";
        } else {
            chatInput.value = "நான் வயிற்று வலி மற்றும் செரிமான பிரச்சனைகளை அனுபவித்து வருகிறேன்.";
        }
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    }, 1000);
}

// Feedback page
backToChatFromFeedback.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(chatPage);
});

feedbackForm.addEventListener('submit', function(e) {
    e.preventDefault();
    submitFeedback();
});

// Translation functions using free API
async function translateText(text, fromLang, toLang) {
    if (fromLang === toLang) return text;

    try {
        const response = await fetch(`${TRANSLATE_API_URL}?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`);
        const data = await response.json();

        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        } else {
            console.warn('Translation failed, using original text');
            return text;
        }
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original text if translation fails
    }
}

// Functions
function showPage(page) {
    // Hide all pages
    homepage.classList.add('hidden');
    loginPage.classList.add('hidden');
    registerPage.classList.add('hidden');
    chatPage.classList.add('hidden');
    feedbackPage.classList.add('hidden');

    // Show the requested page
    page.classList.remove('hidden');

    // If showing chat page, initialize history
    if (page === chatPage) {
        updateChatHistory();
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            isAuthenticated = true;

            // Create a new project for this chat session
            await createNewProject("Herbal Consultation");

            showPage(chatPage);
            loginForm.reset();
        } else {
            const error = await response.text();
            alert(`Login failed: ${error}`);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            showPage(loginPage);
            registerForm.reset();
        } else {
            const error = await response.text();
            alert(`Registration failed: ${error}`);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

async function createNewProject(projectName) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name: projectName })
        });

        if (response.ok) {
            const project = await response.json();
            currentProjectId = project.id;
            console.log('Created new project:', project);
        } else {
            console.error('Failed to create project');
        }
    } catch (error) {
        console.error('Error creating project:', error);
    }
}

async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;

    // Add user message to chat
    addMessageToChat(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';

    try {
        let symptomToSend = message;

        // If user is typing in Tamil, translate to English for backend
        if (currentLanguage === 'ta') {
            symptomToSend = await translateText(message, 'ta', 'en');
        }

        // Call the Spring Boot API to get herb recommendations
        const herbs = await getHerbRecommendations(symptomToSend);

        // Display the recommendations
        displayHerbRecommendations(herbs);

        // Update chat history
        updateChatHistory();
    } catch (error) {
        console.error('Error getting herb recommendations:', error);
        addMessageToChat("Sorry, I encountered an error while processing your request. Please try again.", 'bot');
    }
}

async function getHerbRecommendations(symptom) {
    if (!currentProjectId) {
        await createNewProject("Herbal Consultation");
    }

    const response = await fetch(`${API_BASE_URL}/api/herbs/recommend?projectId=${currentProjectId}&symptom=${encodeURIComponent(symptom)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to get herb recommendations');
    }

    return await response.json();
}

async function displayHerbRecommendations(herbs) {
    if (herbs.length === 0) {
        let noResultsMessage = "I couldn't find any specific herbal recommendations for your symptoms. Please try describing your symptoms in more detail.";
        if (currentLanguage === 'ta') {
            noResultsMessage = await translateText(noResultsMessage, 'en', 'ta');
        }
        addMessageToChat(noResultsMessage, 'bot');
        return;
    }

    let response = "Based on your symptoms, I recommend the following herbs:";
    if (currentLanguage === 'ta') {
        response = await translateText(response, 'en', 'ta');
    }

    addMessageToChat(response, 'bot');

    // Create herb recommendations display
    setTimeout(async () => {
        const herbRecommendation = document.createElement('div');
        herbRecommendation.className = 'herb-recommendation';

        let herbHTML = '';

        if (currentLanguage === 'en') {
            herbHTML = `
                <h4><i class="fas fa-leaf"></i> Recommended Herbs</h4>
                <ul>
                    ${herbs.map(herb => `
                        <li>
                            <span class="herb-name">${herb.commonName}</span>
                            ${herb.botanicalName ? `(${herb.botanicalName})` : ''}
                            ${herb.description ? `- ${herb.description}` : ''}
                            ${herb.howToUse ? `<br><small><strong>How to use:</strong> ${herb.howToUse}</small>` : ''}
                            ${herb.link ? `<br><small><a href="${herb.link}" target="_blank">Picture</a></small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            // Translate herb information to Tamil
            const translatedHerbs = await Promise.all(
                herbs.map(async (herb) => {
                    const translatedName = await translateText(herb.commonName, 'en', 'ta');
                    const translatedDescription = herb.description ? await translateText(herb.description, 'en', 'ta') : '';
                    const translatedUsage = herb.howToUse ? await translateText(herb.howToUse, 'en', 'ta') : '';

                    return {
                        name: translatedName,
                        botanicalName: herb.botanicalName,
                        description: translatedDescription,
                        howToUse: translatedUsage,
                        link: herb.link
                    };
                })
            );

            herbHTML = `
                <h4><i class="fas fa-leaf"></i> பரிந்துரைக்கப்பட்ட மூலிகைகள்</h4>
                <ul>
                    ${translatedHerbs.map(herb => `
                        <li>
                            <span class="herb-name">${herb.name}</span>
                            ${herb.botanicalName ? `(${herb.botanicalName})` : ''}
                            ${herb.description ? `- ${herb.description}` : ''}
                            ${herb.howToUse ? `<br><small><strong>பயன்படுத்தும் முறை:</strong> ${herb.howToUse}</small>` : ''}
                            ${herb.link ? `<br><small><a href="${herb.link}" target="_blank">படம்</a></small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            `;
        }

        herbRecommendation.innerHTML = herbHTML;

        // Find the last bot message and append the recommendation
        const botMessages = document.querySelectorAll('.chat-interface-bot-message');
        const lastBotMessage = botMessages[botMessages.length - 1];
        lastBotMessage.appendChild(herbRecommendation);

        // Scroll to bottom again to show the full recommendation
        chatInterfaceMessages.scrollTop = chatInterfaceMessages.scrollHeight;
    }, 500);
}

function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-interface-message chat-interface-${sender}-message`;

    const messageHeader = document.createElement('div');
    messageHeader.className = 'chat-interface-message-header';

    const avatar = document.createElement('div');
    avatar.className = 'chat-interface-message-avatar';
    avatar.textContent = sender === 'user' ? 'JD' : 'HB';

    const senderName = document.createElement('div');
    senderName.className = 'chat-interface-message-sender';
    senderName.textContent = sender === 'user' ? 'You' : 'HerbalBot';

    messageHeader.appendChild(avatar);
    messageHeader.appendChild(senderName);

    const messageContent = document.createElement('div');
    messageContent.className = 'chat-interface-message-content';
    messageContent.textContent = message;

    const messageTime = document.createElement('div');
    messageTime.className = 'chat-interface-message-time';
    messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(messageHeader);
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);

    chatInterfaceMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatInterfaceMessages.scrollTop = chatInterfaceMessages.scrollHeight;
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Save current chat before logout
        saveCurrentChat();

        isAuthenticated = false;
        authToken = null;
        currentProjectId = null;

        // Update UI
        showPage(homepage);

        // Reset chat
        startNewChat();
    }
}

function startNewChat() {
    // Save current chat before starting new one
    saveCurrentChat();

    // Clear the current chat (keep the first bot message)
    const messages = document.querySelectorAll('.chat-interface-message');
    messages.forEach((message, index) => {
        if (index > 0) {
            message.remove();
        }
    });

    // Update chat title
    document.querySelector('.chat-interface-title').textContent = 'New Chat';

    // Create a new project for the new chat
    if (isAuthenticated) {
        createNewProject("New Herbal Consultation");
    }

    // Generate new chat ID
    currentChatId = Date.now();

    // Update chat history
    updateChatHistory();
}

// Chat History Management
function updateChatHistory() {
    const chatHistoryList = document.getElementById('chatHistoryList');

    // Clear existing history
    chatHistoryList.innerHTML = '';

    // Add current chat to history
    const currentChatItem = document.createElement('li');
    currentChatItem.className = 'active';
    currentChatItem.innerHTML = `
        <i class="fas fa-comment"></i>
        <div class="chat-preview">
            <div class="chat-title">Current Chat</div>
            <div class="chat-date">${new Date().toLocaleDateString()}</div>
        </div>
    `;
    chatHistoryList.appendChild(currentChatItem);

    // Load previous chats
    loadPreviousChats();
}

function loadPreviousChats() {
    // Load previous chats from localStorage
    const previousChats = JSON.parse(localStorage.getItem('herbalChatHistory') || '[]');
    const chatHistoryList = document.getElementById('chatHistoryList');

    // Filter out the current chat from previous chats
    const filteredChats = previousChats.filter(chat => chat.id !== currentChatId);

    // Show only last 5 chats to avoid clutter
    const recentChats = filteredChats.slice(-5).reverse();

    recentChats.forEach((chat, index) => {
        const chatItem = document.createElement('li');
        chatItem.innerHTML = `
            <i class="fas fa-comment"></i>
            <div class="chat-preview">
                <div class="chat-title">${chat.title || `Chat ${chat.date}`}</div>
                <div class="chat-date">${chat.date || 'Previous'}</div>
            </div>
        `;
        chatItem.addEventListener('click', () => loadChat(chat.id));
        chatHistoryList.appendChild(chatItem);
    });
}

function saveCurrentChat() {
    // Get ALL current chat messages including bot responses
    const messages = Array.from(chatInterfaceMessages.children).map(msg => {
        const content = msg.querySelector('.chat-interface-message-content')?.textContent || '';
        const sender = msg.classList.contains('chat-interface-user-message') ? 'user' : 'bot';
        const time = msg.querySelector('.chat-interface-message-time')?.textContent || '';

        // For bot messages with herb recommendations, get the full content including herbs
        let fullContent = content;
        if (sender === 'bot' && msg.querySelector('.herb-recommendation')) {
            const herbContent = msg.querySelector('.herb-recommendation').textContent || '';
            fullContent = content + ' ' + herbContent;
        }

        return {
            content: fullContent,
            sender: sender,
            time: time
        };
    }).filter(msg => msg.content.trim() !== '');

    // Don't save if only initial message or empty
    if (messages.length > 1) {
        const chatHistory = JSON.parse(localStorage.getItem('herbalChatHistory') || '[]');
        const existingChatIndex = chatHistory.findIndex(chat => chat.id === currentChatId);

        // Generate chat title from first user message
        const firstUserMessage = messages.find(msg => msg.sender === 'user');
        const chatTitle = firstUserMessage ?
            firstUserMessage.content.substring(0, 20) + (firstUserMessage.content.length > 20 ? '...' : '') :
            'New Chat';

        const chatData = {
            id: currentChatId,
            title: chatTitle,
            date: new Date().toLocaleDateString(),
            messages: messages,
            timestamp: Date.now(),
            language: currentLanguage // Save the language used in this chat
        };

        if (existingChatIndex !== -1) {
            // Update existing chat
            chatHistory[existingChatIndex] = chatData;
        } else {
            // Add new chat
            chatHistory.push(chatData);
        }

        // Keep only last 20 chats to prevent storage issues
        const trimmedHistory = chatHistory.slice(-20);
        localStorage.setItem('herbalChatHistory', JSON.stringify(trimmedHistory));
    }
}

function loadChat(chatId) {
    const chatHistory = JSON.parse(localStorage.getItem('herbalChatHistory') || '[]');
    const chatToLoad = chatHistory.find(chat => chat.id === chatId);

    if (chatToLoad) {
        // Save current chat before loading another
        saveCurrentChat();

        // Clear current chat completely
        chatInterfaceMessages.innerHTML = '';

        // Restore the language setting if saved
        if (chatToLoad.language) {
            currentLanguage = chatToLoad.language;
            languageButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-lang') === currentLanguage) {
                    btn.classList.add('active');
                }
            });

            // Update placeholder based on language
            if (currentLanguage === 'en') {
                chatInput.placeholder = "Type your message here...";
            } else {
                chatInput.placeholder = "உங்கள் செய்தியை இங்கே தட்டச்சு செய்க...";
            }
        }

        // Load all messages from saved chat
        chatToLoad.messages.forEach(msg => {
            addMessageToChat(msg.content, msg.sender);
        });

        // Update chat title
        document.querySelector('.chat-interface-title').textContent = chatToLoad.title || 'Previous Chat';

        // Update current chat ID
        currentChatId = chatToLoad.id;

        // Update chat history display
        updateChatHistory();

        // Scroll to bottom
        chatInterfaceMessages.scrollTop = chatInterfaceMessages.scrollHeight;
    }
}

async function submitFeedback() {
    const rating = document.querySelector('input[name="rating"]:checked');
    const category = document.getElementById('feedbackCategory').value;
    const feedbackText = document.getElementById('feedbackText').value;

    if (!rating) {
        alert('Please provide a rating');
        return;
    }

    if (!feedbackText.trim()) {
        alert('Please provide feedback text');
        return;
    }

    try {
        // Create the feedback object with the correct structure
        const feedbackData = {
            projectId: currentProjectId || 1, // Fallback to project ID 1 if not set
            feedbackText: feedbackText, // This is the correct field name
            rating: parseInt(rating.value),
            category: category
            // The score will be calculated automatically by the backend
        };

        console.log('Submitting feedback:', feedbackData);

        const response = await fetch(`${API_BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            body: JSON.stringify(feedbackData)
        });

        if (response.ok) {
            const savedFeedback = await response.json();
            console.log('Feedback saved successfully:', savedFeedback);

            if (currentLanguage === 'en') {
                alert('Thank you for your feedback!');
            } else {
                alert('உங்கள் கருத்துக்கு நன்றி!');
            }

            showPage(chatPage);
            feedbackForm.reset();
        } else {
            const errorText = await response.text();
            console.error('Feedback submission failed:', errorText);

            if (currentLanguage === 'en') {
                alert('Failed to submit feedback. Please try again.');
            } else {
                alert('கருத்து சமர்ப்பிப்பது தோல்வியடைந்தது. தயவு செய்து மீண்டும் முயற்சிக்கவும்.');
            }
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);

        if (currentLanguage === 'en') {
            alert('Failed to submit feedback. Please try again.');
        } else {
            alert('கருத்து சமர்ப்பிப்பது தோல்வியடைந்தது. தயவு செய்து மீண்டும் முயற்சிக்கவும்.');
        }
    }
}
// API helper function with error handling
async function apiCall(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Initialize the page
showPage(homepage);