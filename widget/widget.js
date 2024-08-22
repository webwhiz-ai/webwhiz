const STREAM_RESPONSE = true;


// message format

let origin = '';
let container = '';
let socketData;

let showReadMore = true;
let readMoreText = 'Read More:';

let isFirstMessage = true;

let collectEmail = false;
let enableHumanChat = false;
let isManualChat = false;
let collectEmailText = 'Read More:';

const chatWithHumanButton = document.getElementById('chat-with-human');
const chatWithBotButton = document.getElementById('chat-with-bot');

const defaultWelcomeMessage = 'Hello! How can I assist you today?';
const submitBtnSubmittingText = 'Submitting...';


let sessionId = '';

function getDomainFromUrl(url) {
    if (!url) return '';
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    const domain = matches && matches[1]; // domain will be null if no match is found
    return (domain || '').replace('www.', '');
}

const urlParams = new URLSearchParams(window.location.search);

let knowledgebaseId;
const baseURL = urlParams.get('baseUrl') || 'https://api.webwhiz.ai';
const chatWidget = document.querySelector('.chat-wrap');

if (urlParams.get('embed') === 'true') {
    chatWidget.classList.add('widget-open');
}
if (urlParams.get('hide-chat-actions') === 'true') {
    chatWidget.classList.add('hide-chat-actions');
}

/**
 * Iframe communications
 */
// Msg listener
window.onmessage = function(event) {
    if (event.data.messageType === 'webwhiz:recieve_meta_data') {
        origin = event.data.url;
        container = event.data.container;

        if (container) {
            const $chatLauncher = document.getElementById('chat-launcher');
            const $chatActions = document.getElementById('chat-actions');
            $chatLauncher.parentNode.removeChild($chatLauncher);
            $chatActions.parentNode.removeChild($chatActions);
            chatWidget.classList.add('widget-open');

            notifyParentWidgetExpand();
            setTimeout(() => {
                document.getElementById('chat-input').focus();
            }, 320);
        }
    } else if (event.data.messageType === 'webwhiz:recieve_session_id') {
        sessionId = event.data.sessionId;
    } else if (event.data.messageType === 'webwhiz:recieve_is_manual_chat') {
        isManualChat = event.data.isManualChat;
    } else if (event.data.messageType === 'webwhiz:expandWidget') {
        expandWidget();
    }
}

requestSessionId();
requestIsManualChat();
setTimeout(() => {
    getWidgetMessages()
}, 50);

const defaultWidgetData = {
    backgroundColor: "#000",
    fontColor: "#FFF",
    borderRadius: "12px",
    placement: "right"
}

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const uuidv4 = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        const hl = hljs.highlight(code, { language: 'javascript' }).value;
        return hl;
    },
    langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
});

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}


function resetChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    sessionId = '';
    isManualChat = false;
    if (enableHumanChat) {
        chatWithHumanButton.style.display = 'flex';
        chatWithBotButton.style.display = 'none';
    }
    notifyClearHistory();
}


autosize(document.querySelector('#chat-input'));

// toggle class on chat widget on chat-launcher-btn
const chatLauncherBtn = document.querySelector('.chat-launcher-btn');
const chatCloseBtn = document.querySelector('#chat-close-btn');
const chatMaximizeBtn = document.querySelector('#chat-maximize-btn');
const chatMinimizeBtn = document.querySelector('#chat-minimize-btn');
const chatClearHistoryBtn = document.querySelector('#chat-clear-session-btn');
chatLauncherBtn.addEventListener('click', () => {
    expandWidget();
});
chatCloseBtn.addEventListener('click', () => {
    chatWidget.classList.remove('widget-open');
    chatWidget.classList.remove('widget-maximize');
    notifyParentWidgetCollapse();
});
chatMaximizeBtn.addEventListener('click', () => {
    chatWidget.classList.toggle('widget-maximize');
    notifyParentWidgetMaximize();
});
chatMinimizeBtn.addEventListener('click', () => {
    chatWidget.classList.toggle('widget-maximize');
    notifyParentWidgetMinimize();
});
chatClearHistoryBtn.addEventListener('click', resetChatHistory);

function expandWidget() {
    chatWidget.classList.add('widget-open');

    notifyParentWidgetExpand();
    setTimeout(() => {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
        document.getElementById('chat-input').focus();
    }, 320);
}

async function getWidgetData() {
    //const domain = 'chat.timemaster.ai';
    let url;
    const kbId = urlParams.get('kbId');
    if (kbId) {
        knowledgebaseId = kbId;
        url = `${baseURL}/knowledgebase/${knowledgebaseId}/chat_widget_data`;
    } else {
        const domain = getDomainFromUrl(window.location.href);
        url = `${baseURL}/knowledgebase/chat_widget_data_for_domain?domain=${domain}`;
        chatWidget.classList.add('hide-chat-actions', 'widget-open');
    }
    const response = await fetch(
        url,
        {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            // body data type must match "Content-Type" header
        }
    );

    if (response.status === 200) {
        const releaseBody = await response.json();
        const chatWidgeData = releaseBody.chatWidgeData || defaultWidgetData;
        return {
            ...releaseBody,
            chatWidgeData: chatWidgeData
        }
    } else {
        console.log('error');
    }
    //return response;
}


async function getWidgetMessages() {
    const url = `${baseURL}/chatbot/session/${sessionId}/messages`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
        });

        if (response.status === 200) {
            const { messages: _messages } = await response.json();

            const messages = _messages.map(({ role, content, id }) => ({
                role: role === 'admin' || role === 'bot' ? 'assistant' : role,
                content,
                id,
            }));

            if (messages.length > 0) {
                isFirstMessage = false;
            }

            const msgHTML = messages.map(msg => {
                let msgContent = msg.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<br\/>/g, '\n');
                const markdownRes = marked.parse(msgContent);

                if (msg.role === 'divider') {
                    return createChatWithDivider(msgContent);
                }

                const type = msg.role === 'user' ? 'user' : 'chatbot';
                return `<div class="chat-message ${type}"><div class="chat-message-text">${markdownRes}</div></div>`;
            }).join('');

            const chatMessages = document.getElementById('chat-messages');
            chatMessages.insertAdjacentHTML("beforeend", msgHTML);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            console.error('Failed to fetch messages: Status', response.status);
        }

        if (response.status === 404) {
            resetChatHistory()
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

async function initSocketConnection(sessionId) {
    var socket = io(`${baseURL}`, { transports: ["websocket"], query: { id: sessionId, knowledgeBaseId: knowledgebaseId } });
    socket.on('connect', function() {
        console.log('connected');
    });
    socket.on('user_chat', function(msgData) {
        // append to UI
        const chatMessage = createChatMessage(msgData.msg, true);
        insertMessageIntoUI(chatMessage);
    });
    return socket;
}

(async () => {

    const data = await getWidgetData();
    if (!knowledgebaseId) {
        knowledgebaseId = data.id;
    }
    const chatWidgetData = data.chatWidgeData;
    showReadMore = chatWidgetData.showReadMore;
    collectEmail = chatWidgetData.collectEmail;

    enableHumanChat = chatWidgetData.enableHumanChat
    if (enableHumanChat) {
        chatWithHumanButton.style.display = isManualChat ? 'none' : 'flex';
        chatWithBotButton.style.display = isManualChat ? 'flex' : 'none';
    } else {
        isManualChat = false;
        updateIsManualChat(false)
    }

    requestMetaData();
    socketData = await initSocketConnection(sessionId)

    const heading = document.getElementById('chat-heading');
    const description = document.getElementById('chat-description');
    const offlineMsgHeading = document.getElementById('offline-message-heading');
    const offlineMsgDescription = document.getElementById('offline-message-description');
    const branding = document.getElementById('powered-by');
    const buttonElement = document.getElementById("chat-launcher-btn");
    const chatInputElement = document.getElementById("chat-input");
    const offlineMsgNameLabel = document.getElementById("label-offline-message-name");
    const offlineMsgEmailLabel = document.getElementById("label-offline-message-email");
    const offlineMsgMessageLabel = document.getElementById("label-offline-message-message");
    const offlineMsgNameInput = document.getElementById("offline-message-name");
    const offlineMsgEmailInput = document.getElementById("offline-message-email");
    const offlineMsgMessageInput = document.getElementById("offline-message-message");
    const requiredFieldErrorMsg = document.querySelectorAll('.required-field');
    const invalidEmailErrorMsg = document.getElementById('invalid-feedback-email-invalid');
    const formSubmitSuccessMsg = document.getElementById("message-success-text");
    const formSubmitErrorMsg = document.getElementById("message-error-text");
    const formSendAgainBtn = document.getElementById("offline-message-success-close");
    const formTryAgainBtn = document.getElementById("offline-message-error-close");

    const defaultLauncherIcon = `<svg
        focusable="false"
        stroke="currentColor"
        fill="none"
        stroke-width="2"
        viewBox="0 0 24 24"
        stroke-linecap="round"
        stroke-linejoin="round"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        style=" width: 38px; height: 38px;">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path
            d="M5.821 4.91c3.898 -2.765 9.469 -2.539 13.073 .536c3.667 3.127 4.168 8.238 1.152 11.897c-2.842 3.447 -7.965 4.583 -12.231 2.805l-.232 -.101l-4.375 .931l-.075 .013l-.11 .009l-.113 -.004l-.044 -.005l-.11 -.02l-.105 -.034l-.1 -.044l-.076 -.042l-.108 -.077l-.081 -.074l-.073 -.083l-.053 -.075l-.065 -.115l-.042 -.106l-.031 -.113l-.013 -.075l-.009 -.11l.004 -.113l.005 -.044l.02 -.11l.022 -.072l1.15 -3.451l-.022 -.036c-2.21 -3.747 -1.209 -8.392 2.411 -11.118l.23 -.168z"
            stroke-width="0" fill="currentColor"></path>
    </svg>`

    const iconContainer = document.createElement("div");
    iconContainer.innerHTML = data?.launcherIcon?.svgElement || defaultLauncherIcon;
    buttonElement.appendChild(iconContainer);

    if (data.customKey || chatWidgetData.hideBranding || data.whitelabelling?.removeBranding) {
        branding.style.display = 'none';
    }

    if (chatWidgetData.offlineMsgTabHeader) {
        offlineMsgTab.innerText = chatWidgetData.offlineMsgTabHeader;
    }

    if (chatWidgetData.assistantTabHeader) {
        aiAssistantTab.innerText = chatWidgetData.assistantTabHeader;

        requestAnimationFrame(() => {
            const width = aiAssistantTab.offsetWidth;
            tabsActive.style.width = `${width - 5}px`;
        });
    }

    if (chatWidgetData.heading) {
        heading.innerText = chatWidgetData.heading;
    }
    if (chatWidgetData.description) {
        description.innerText = chatWidgetData.description;
    }

    if (chatWidgetData.chatInputPlaceholderText) {
        chatInputElement.placeholder = chatWidgetData.chatInputPlaceholderText;
    }

    let welcomeMessages = [];

    if (chatWidgetData.welcomeMessage) {
        welcomeMessages.push(chatWidgetData.welcomeMessage);
    } else {
        welcomeMessages = chatWidgetData.welcomeMessages || [defaultWelcomeMessage];
    }
    const welcomeMessagesHTML = welcomeMessages.map(msg => {
        return `<div class="chat-message chatbot"><div class="chat-message-text">${msg}</div></div>`
    }).join('');

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.insertAdjacentHTML("afterbegin", welcomeMessagesHTML)

    if (chatWidgetData.offlineMessage) {
        const chatWrap = document.getElementById('chat-wrap');
        chatWrap.classList.add('has-offline-message');
    }

    if (chatWidgetData.readMoreText) {
        readMoreText = chatWidgetData.readMoreText;
    }

    collectEmailText = chatWidgetData.collectEmailText || collectEmailText;

    if (chatWidgetData.offlineMsgHeading) {
        offlineMsgHeading.innerText = chatWidgetData.offlineMsgHeading;
    }

    if (chatWidgetData.offlineMsgDescription) {
        offlineMsgDescription.innerText = chatWidgetData.offlineMsgDescription;
    }

    if (chatWidgetData.nameFieldLabel) {
        offlineMsgNameLabel.innerText = chatWidgetData.nameFieldLabel;
    }

    if (chatWidgetData.emailFieldLabel) {
        offlineMsgEmailLabel.innerText = chatWidgetData.emailFieldLabel;
    }

    if (chatWidgetData.msgFieldLabel) {
        offlineMsgMessageLabel.innerText = chatWidgetData.msgFieldLabel;
    }

    if (chatWidgetData.nameFieldPlaceholder) {
        offlineMsgNameInput.placeholder = chatWidgetData.nameFieldPlaceholder;
    }

    if (chatWidgetData.emailFieldPlaceholder) {
        offlineMsgEmailInput.placeholder = chatWidgetData.emailFieldPlaceholder;
    }

    if (chatWidgetData.msgFieldPlaceholder) {
        offlineMsgMessageInput.placeholder = chatWidgetData.msgFieldPlaceholder;
    }

    if (chatWidgetData.requiredFieldMsg) {
        requiredFieldErrorMsg.forEach(div => {
            div.innerText = chatWidgetData.requiredFieldMsg;
        });
    }

    if (chatWidgetData.invalidEmailMsg) {
        invalidEmailErrorMsg.innerText = chatWidgetData.invalidEmailMsg;
    }

    if (chatWidgetData.formSubmitBtnLabel) {
        offlineMessageBtn.innerText = chatWidgetData.formSubmitBtnLabel;
    }

    formSubmitBtnSubmittingText = chatWidgetData.formSubmitBtnSubmittingText ?? submitBtnSubmittingText;

    if (chatWidgetData.formSubmitSuccessMsg) {
        formSubmitSuccessMsg.innerText = chatWidgetData.formSubmitSuccessMsg;
    }

    if (chatWidgetData.formSubmitErrorMsg) {
        formSubmitErrorMsg.innerText = chatWidgetData.formSubmitErrorMsg;
    }

    if (chatWidgetData.formSendAgainBtnLabel) {
        formSendAgainBtn.innerText = chatWidgetData.formSendAgainBtnLabel;
    }

    if (chatWidgetData.formTryAgainBtnLabel) {
        formTryAgainBtn.innerText = chatWidgetData.formTryAgainBtnLabel;
    }

    var styleSheet = document.createElement('style');
    styleSheet.type = "text/css";

    const styles = `
        .chat-widget { border-radius: ${chatWidgetData.borderRadius}!important}
        .chat-header, .chat-loading-dot, .chat-launcher-btn { background-color: ${chatWidgetData.backgroundColor}!important}
        .chat-wrap {
            opacity: 1 !important;
        }
        .chat-launcher-btn {
            color: ${chatWidgetData.fontColor}!important
        }
        .chat-header, .chat-tabs button, .btn-primary {color: ${chatWidgetData.fontColor}!important}
        .tabs-active, .btn-primary {background-color: ${chatWidgetData.backgroundColor}!important}
        .chat-submit-btn svg, .message-feedback, .lead-done-icon {
            color: ${chatWidgetData.backgroundColor}!important
        }
        .chat-message.user .chat-message-text {background-color: ${chatWidgetData.backgroundColor}!important; color: ${chatWidgetData.fontColor}!important}
    `
    styleSheet.textContent = (chatWidgetData?.customCSS || '') + styles;


    if (chatWidgetData.questionExamples && chatWidgetData.questionExamples.length > 0 || chatWidgetData.enableHumanChat) {
        const sampleMessages = document.getElementById('chat-sample-messages');
        sampleMessages.classList.remove('hide-sample-messages');
        chatWidgetData.questionExamples.forEach((message) => {
            if(!message.label || !message.question) return;
            const sampleMessage = document.createElement('div');
            sampleMessage.classList.add('chat-sample-message');
            sampleMessage.setAttribute('data-message', message.question);
            sampleMessage.innerText = message.label;
            sampleMessages.appendChild(sampleMessage);
        });
    }

    document.getElementById('chat-sample-messages').addEventListener('click', (e) => {
        if (e.target.classList.contains('chat-sample-message')) {
            const message = e.target.getAttribute('data-message') || e.target.innerText;
            addMessageToChat(message);
        }
    });



    chatWithHumanButton.addEventListener('click', async (e) => {
        if (!enableHumanChat) return;
        chatWithHumanButton.style.display = 'none';
        chatWithBotButton.style.display = 'flex';
        if (!sessionId) {
            sessionId = await createSession({
                userAgent: getUserAgent(),
                origin: origin
            });
            notifyNewSession(sessionId);
        }
        await initManualChat(sessionId);
        document.getElementById('chat-input').focus();

    });

    chatWithBotButton.addEventListener('click', async (e) => {
        chatWithBotButton.style.display = 'none';
        chatWithHumanButton.style.display = 'flex';
        if (!sessionId) {
            sessionId = await createSession({
                userAgent: getUserAgent(),
                origin: origin
            });
            notifyNewSession(sessionId);
        }
        await initBotChat(sessionId);
        document.getElementById('chat-input').focus();
    });

    const widgetConfig = {}

    if (chatWidgetData.placement === 'left') {
        const chatLauncher = document.getElementById('chat-launcher');
        chatLauncher.style.left = '20px';
        chatLauncher.style.right = 'auto';
        widgetConfig.position = 'left';
    }
    if (chatWidgetData.showAsPopup) {
        widgetConfig.showAsPopup = true;
        widgetConfig.popupDelay = chatWidgetData.popupDelay;
        widgetConfig.welcomeMessages = chatWidgetData.welcomeMessages;
    }
    notifyWidgetConfig(widgetConfig);

    setTimeout(() => {
        document.head.appendChild(styleSheet);
    }, 400);


})();


async function createSession(userData) {
    const response = await fetch(
        `${baseURL}${'/chatbot/session?src=widget'}`,
        {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({
                "knowledgebaseId": knowledgebaseId,
                userData: userData
            }), // body data type must match "Content-Type" header
        }
    );

    if (response.status === 200) {
        const result = await response.text()
        socketData = await initSocketConnection(result);
        return result;
    } else {
        console.log('error');
    }
    //return response;
}

async function initManualChat(sessionId) {
    const url = `${baseURL}/chatbot/session/${sessionId}/initiate-manual`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({}),
        });

        if (response.status === 200) {
            const result = await response.text();
            insertMessageIntoUI(createChatWithDivider(`Chat with the Team!`));

            isManualChat = true;
            updateIsManualChat(isManualChat)

        } else {
            console.error('Error:', response.status);
        }
    } catch (error) {
        console.error('Network error:', error.message);
    }
}
async function initBotChat(sessionId) {
    const url = `${baseURL}/chatbot/session/${sessionId}/initiate-bot`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({}),
        });

        if (response.status === 200) {
            const result = await response.text();
            insertMessageIntoUI(createChatWithDivider('Chat with the bot!'));
            isManualChat = false;
            updateIsManualChat(isManualChat)

        } else {
            console.error('Error:', response.status);
        }
    } catch (error) {
        console.error('Network error:', error.message);
    }
}

async function updateSession(sessionId, userData) {
    const response = await fetch(
        `${baseURL}/chatbot/session/${sessionId}`,
        {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({
                userData: userData
            }), // body data type must match "Content-Type" header
        }
    );
    if (response.status === 200) {
        const result = await response.text()
        return result;
    } else {
        console.log('error');
    }
    //return response;
}

async function getAnswer(sessionId, query) {
    const response = await fetch(
        `${baseURL}${'/chatbot/answer'}`,
        {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({
                "sessionId": sessionId,
                "query": query
            }), // body data type must match "Content-Type" header
        }
    );

    if (response.status === 200) {
        const result = await response.text()
        return result;
    } else {
        console.log('error');
    }
    //return response;
}

function getAnswerStream(sessionId, query, cb, errorCb) {
    const url = `${baseURL}${'/chatbot/answer_stream'}?session=${sessionId}&query=${encodeURIComponent(query)}`;
    let source = new EventSource(url);

    source.onmessage = (e) => {
        cb(e.data);
        if (e.data == "[DONE]") {
            source.close();
        }
    };

    source.onerror = (err) => {
        source.close();
        errorCb();
    };
}

function getUserAgent() {
    return navigator.userAgent || navigator.vendor || window.opera
}

function createChatWithDivider(chatWithWhom) {
    return `
        <div class="divider">
            <span class="divider-line"></span>
            <span class="divider-text">${chatWithWhom}</span>
            <span class="divider-line"></span>
        </div>
        `;
};


function createChatMessage(msg, isChatbot) {
    const messageType = isChatbot ? 'chatbot' : 'user';
    return `<div class="chat-message ${messageType}">
        <div class="chat-message-text">${msg}</div>
    </div>
    `;
};

function insertMessageIntoUI(message) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.insertAdjacentHTML('beforeend', message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

async function addMessageToChat(message) {

    const input = document.getElementById('chat-input');
    message = message || input.value.trim();
    if (!message) return;
    const newMessageUser = {
        role: "user",
        content: message,
        id: uuidv4(),
    };

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.insertAdjacentHTML("beforeend",
        `<div class="chat-message user"><div class="chat-message-text">${message}</div></div>`)

    const lastMesage = chatMessages.lastChild.querySelector('.chat-message-text');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    input.value = '';
    autosize.update(input);


    if (isManualChat) {
        if(!sessionId) {
            sessionId = await createSession({
                userAgent: getUserAgent(),
                origin: origin
            });
            notifyNewSession(sessionId);
        }
        const msgData = { 'sender': 'user', 'msg': message,  id: uuidv4(), 'sessionId': sessionId }
        // send message to admin
        socketData.emit('user_chat', msgData);

        return;
    }
    if (STREAM_RESPONSE) {
        chatMessages.insertAdjacentHTML("beforeend",
            `<div class="chat-message chatbot"><div class="chat-message-text"><div class='chat-loading-dot-cont'>
              <div class="chat-loading-dot"></div>
              <div class="chat-loading-dot"></div>
              <div class="chat-loading-dot"></div>
            </div></div></div>`)
        chatMessages.scrollTop = chatMessages.scrollHeight;
        const msgHolder = chatMessages.lastChild.querySelector('.chat-message-text');
        let msg = '';
        if (!sessionId) {
            sessionId = await createSession({
                userAgent: getUserAgent(),
                origin: origin
            });
            notifyNewSession(sessionId);
        }
        const response = getAnswerStream(sessionId, message, (data) => {

            if (data !== "[DONE]") {
                data = JSON.parse(data);
                let content = data.content;
                let sources = data.sources;
                content = replaceAll(content, '<', '&lt;')
                content = replaceAll(content, '>', '&gt;')
                content = replaceAll(content, '\n', '<br/>')

                let sourcesBtns = '';
                if (showReadMore && sources && sources.length > 0) {

                    sources = sources.filter((p, i) => {
                        return i === sources.findIndex(q => q.url === p.url);
                    });

                    sourcesBtns = sources.map((source) => {
                        const parts = source.url.split('/');
                        const lastSegment = parts.pop() || parts.pop();
                        return `<a href="${source.url}" target="_blank" class="chat-source-btn">${lastSegment}</a>`
                    }).join('');
                    sourcesBtns = `<div class="chat-sources"><div class="chat-source-read-more">${readMoreText}</div>${sourcesBtns}</div>`
                }

                //data = data.replace(/\n/g, '<br/>')
                msg = `${msg}${content}${sourcesBtns}`
                msgHolder.innerHTML = msg;
            } else {
                const newMessageAssistant = {
                    role: "assistant",
                    content: msg,
                    id: uuidv4(),
                };
                msg = replaceAll(msg, '&lt;', '<')
                msg = replaceAll(msg, '&gt;', '>')
                msg = replaceAll(msg, '<br/>', '\n')
                const markdownRes = marked.parse(msg);
                msgHolder.innerHTML = markdownRes;
                if (collectEmail && isFirstMessage) {
                    const collectEmailMarkup = `<div class="chat-message chatbot">
                            <div
                                class="chat-message-text chat-message-form"
                                id="chat-message-form-email"
                            >
                                <div class="form-group">
                                    <label
                                        for="lead-email-input"
                                        >${collectEmailText}</label
                                    >
                                    <div id="lead-email-form" class="input-group">
                                        <input
                                            type="text"
                                            class="form-control"
                                            id="lead-email-input"
                                            placeholder="hi@example.com"
                                        />
                                        <button
                                            class="chat-submit-btn"
                                            id="lead-email-input-submit"
                                            type="submit"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                fill-rule="evenodd"
                                                clip-rule="evenodd"
                                                d="M4.394 14.7L13.75 9.3c1-.577 1-2.02 0-2.598L4.394 1.299a1.5 1.5 0 00-2.25 1.3v3.438l4.059 1.088c.494.132.494.833 0 .966l-4.06 1.087v4.224a1.5 1.5 0 002.25 1.299z"
                                                fill="currentColor"
                                                ></path>
                                            </svg>
                                        </button>
                                        <svg class="lead-done-icon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="18px" width="18px" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1.999 14.413-3.713-3.705L7.7 11.292l2.299 2.295 5.294-5.294 1.414 1.414-6.706 6.706z"></path></svg>
                                        <div class='chat-loading-dot-cont'>
                                            <div class="chat-loading-dot"></div>
                                            <div class="chat-loading-dot"></div>
                                            <div class="chat-loading-dot"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    chatMessages.insertAdjacentHTML("beforeend", collectEmailMarkup);
                    enableEmailCollection();
                    isFirstMessage = false;
                }
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, () => {
            msgHolder.innerHTML = 'Oops! I am unable to answer right now!';
        });
    } else {
        if (!sessionId) {
            sessionId = await createSession({
                userAgent: userAgent
            });
            notifyNewSession(sessionId);
        }
        const response = await getAnswer(sessionId, message);
        const markdownRes = marked.parse(
            response.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "")
        )
        chatMessages.insertAdjacentHTML("beforeend",
            `<div class="chat-message chatbot"><div class="chat-message-text">${markdownRes}</div></div>`)
    }
}

async function saveEmail(email) {
    const input = document.getElementById('lead-email-input');
    email = email || input.value.trim();
    if (!email) return;
    const $emailFormCont = document.getElementById('chat-message-form-email');
    $emailFormCont.classList.add('chat-message-form-loading');
    try {
        await updateSession(sessionId, {
            email: email,
            userAgent: getUserAgent(),
            origin: origin
        });
    } catch (error) {
        console.log(error);
    } finally {
        $emailFormCont.classList.remove('chat-message-form-loading');
        $emailFormCont.classList.add('chat-message-form-submitted');
    }
}

function enableEmailCollection() {
    const leadInputForm = document.getElementById('lead-email-form');
    const emailInput = document.getElementById('lead-email-input');
    emailInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 13 || e.key === "Enter") {
            e.preventDefault();
            saveEmail();
        }
        const $emailFormCont = document.getElementById('chat-message-form-email');
        $emailFormCont.classList.remove('chat-message-form-submitted');
    });
    document.getElementById('lead-email-input-submit').addEventListener('click', (e) => {
        e.preventDefault();
        saveEmail();
    })
}


// JavaScript code to handle the chat form submission
const form = document.getElementById('chat-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    addMessageToChat();
});

document.getElementById('chat-input').onkeydown = function(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        addMessageToChat();
    }
};


function notifyParentWidgetExpand() {
    window.top.postMessage('webwhiz:widget_expand', '*');
}
function notifyParentWidgetMaximize() {
    window.top.postMessage('webwhiz:widget_maximize', '*');
}
function notifyParentWidgetMinimize() {
    window.top.postMessage('webwhiz:widget_minimize', '*');
}
function notifyClearHistory() {
    window.top.postMessage('webwhiz:widget_clear_history', '*');
}

function notifyParentWidgetCollapse() {
    window.top.postMessage('webwhiz:widget_collapse', '*');
}

function notifyWidgetConfig(config) {
    window.top.postMessage({
        messageType: 'webwhiz:widget_config',
        config: config
    }, '*');
}

function notifyNewSession(sessionId) {
    window.top.postMessage({
        messageType: 'webwhiz:recieve_new_session_id',
        sessionId: sessionId || ''
    }, '*');
}

function requestMetaData() {
    window.top.postMessage('webwhiz:request_meta_data', '*');
}



function requestSessionId() {
    window.top.postMessage('webwhiz:request_session_id', '*');
}

function requestIsManualChat() {
    window.top.postMessage('webwhiz:request_is_manual_chat', '*');
}

function updateIsManualChat(isManualChat) {
    window.top.postMessage({
        messageType: 'webwhiz:update_is_manual_chat',
        isManualChat: isManualChat || false
    }, '*');
}


const offlineMessageBtn = document.getElementById('offline-message-submit');

if (offlineMessageBtn) {
    const $name = document.getElementById('offline-message-name')
    const $email = document.getElementById('offline-message-email')
    const $message = document.getElementById('offline-message-message')
    const $invlidEmail = document.getElementById('invalid-feedback-email');
    const $invlidEmailInvalid = document.getElementById('invalid-feedback-email-invalid');
    const $invlidName = document.getElementById('invalid-feedback-name')
    const $invlidMessage = document.getElementById('invalid-feedback-message')

    $name.addEventListener('blur', (e) => {
        if (e.target.value) {
            $invlidName.classList.remove('feedback-visible')
        } else {
            $invlidName.classList.add('feedback-visible')
        }
    })
    $email.addEventListener('blur', (e) => {
        if (e.target.value) {
            const email = e.target.value;
            const isValidEmail = validateEmail(email);
            if (!isValidEmail) {
                $invlidEmailInvalid.classList.add('feedback-visible');
            } else {
                $invlidEmailInvalid.classList.remove('feedback-visible');
            }
            $invlidEmail.classList.remove('feedback-visible');
        } else {
            $invlidEmail.classList.add('feedback-visible');
            $invlidEmailInvalid.classList.remove('feedback-visible');
        }
    })
    $message.addEventListener('blur', (e) => {
        if (e.target.value) {
            $invlidMessage.classList.remove('feedback-visible')
        } else {
            $invlidMessage.classList.add('feedback-visible')
        }
    })

    offlineMessageBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = $name.value;
        const email = $email.value;
        const message = $message.value;



        const isValidEmail = validateEmail(email);

        console.log(isValidEmail, name, message)

        if (isValidEmail && name && message) {

            const prevBtnText = offlineMessageBtn.innerHTML;
            offlineMessageBtn.innerHTML = formSubmitBtnSubmittingText;
            offlineMessageBtn.setAttribute('disabled', true);
            if (!sessionId) {
                sessionId = await createSession({
                    userAgent: getUserAgent(),
                    origin: origin
                });
                notifyNewSession(sessionId);
            }

            const response = await fetch(
                `${baseURL}${'/offline_msg'}`,
                {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors', // no-cors, *cors, same-origin
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "name": name,
                        "email": email,
                        "knowledgebaseId": knowledgebaseId,
                        "message": message,
                        "sessionId": sessionId,
                    }), // body data type must match "Content-Type" header
                }
            );

            const $offlineMessage = document.getElementById('offline-message');

            if (response.status === 201) {
                const result = await response.text()
                $name.value = '';
                $email.value = '';
                $message.value = '';
                $invlidEmail.classList.remove('feedback-visible');
                $invlidName.classList.remove('feedback-visible');
                $invlidEmailInvalid.classList.remove('feedback-visible');
                $invlidMessage.classList.remove('feedback-visible');

                $offlineMessage.classList.add('show-success-msg');
            } else {
                $offlineMessage.classList.add('show-error-msg');
            }
            offlineMessageBtn.innerHTML = prevBtnText;
            offlineMessageBtn.removeAttribute('disabled');
        } else {
            if (email && !isValidEmail) {
                $invlidEmail.classList.remove('feedback-visible');
                $invlidEmailInvalid.classList.add('feedback-visible');
            }
            if (!email) {
                $invlidEmail.classList.add('feedback-visible');
                $invlidEmailInvalid.classList.remove('feedback-visible');
            }

            if (email && isValidEmail) {
                $invlidEmail.classList.remove('feedback-visible');
                $invlidEmailInvalid.classList.remove('feedback-visible');
            }

            if (!name) {
                $invlidName.classList.add('feedback-visible');
            } else {
                $invlidName.classList.remove('feedback-visible');
            }
            if (!message) {
                $invlidMessage.classList.add('feedback-visible');
            } else {
                $invlidMessage.classList.remove('feedback-visible');
            }
        }
    });

    const $offlineMessageClose = document.getElementById('offline-message-success-close');
    const $offlineMessageErrorClose = document.getElementById('offline-message-error-close');
    const $offlineMessage = document.getElementById('offline-message');

    $offlineMessageClose.addEventListener('click', () => {
        $offlineMessage.classList.remove('show-success-msg');
    })
    $offlineMessageErrorClose.addEventListener('click', () => {
        $offlineMessage.classList.remove('show-error-msg');
    })

}


const aiAssistantTab = document.getElementById('tab-ai-assistant');
const offlineMsgTab = document.getElementById('tab-offline-msg');
const tabsActive = document.getElementById('tabs-active');

const chatWrap = document.getElementById('chat-wrap');

if (offlineMsgTab) {
    offlineMsgTab.addEventListener('click', function() {
        const width = offlineMsgTab.offsetWidth;
        const left = aiAssistantTab.offsetWidth;
        tabsActive.style.width = `${width - 5}px`;
        tabsActive.style.left = `${left + 5}px`;
        chatWrap.classList.add('chat-wrap-offline');
        chatWrap.classList.remove('chat-wrap-ai-assistant');

    });
}
if (aiAssistantTab) {
    aiAssistantTab.addEventListener('click', function() {
        const width = aiAssistantTab.offsetWidth;
        tabsActive.style.width = `${width - 5}px`;
        tabsActive.style.left = `4px`;
        chatWrap.classList.add('chat-wrap-ai-assistant');
        chatWrap.classList.remove('chat-wrap-offline');
    });
}
