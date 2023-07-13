var __WEBWHIZ__URL = __WEBWHIZ__getWidgetURL();

function __WEBWHIZ__ready(fn) {
  if (document.readyState !== "loading") {
    fn();
    return;
  }
  document.addEventListener("DOMContentLoaded", fn);
}


const widgetStyle = `
.webwhiz-widget {
  position: fixed;
  z-index: 9999999;
  max-height: calc(100% - 30px);
  right: 20px;
  bottom: 20px;
  min-width: 80px;
  height: 80px;
  width: 80px;
  max-width: calc(100% - 40px);
}
.webwhiz-widget.wb-align-left {
  left: 0;
  right: auto;
}
.webwhiz-widget.wb-expand {
  width: 416px;
  height: 610px;
  min-width: 370px;
}
.webwhiz-widget.wb-maximize {
  width: 50%;
  height: calc(100% - 30px)
}
@media only screen and (device-width: 768px),
       only screen and (max-width: 768px){
  .webwhiz-widget.wb-maximize {
    width: 100%;
    height: 100%;
  }
  .webwhiz-widget {
    right: 0;
    bottom: 0;
  }
  .webwhiz-widget.wb-expand {
    width: 100%;
    height: 100%;
    min-width: 0;
    left: 0;
    right: 10px;
    bottom: 10px;
    top: 0;
    max-width: 100%;
    max-height: 100%;
  }
}
`


function __WEBWHIZ__addIframe() {
  var ifrm = document.createElement("iframe");
  const kbId = __WEBWHIZ__getChatbotId();
  ifrm.setAttribute("class", "webwhiz-widget");
  ifrm.setAttribute("id", "webwhiz-widget");
  ifrm.setAttribute("data-powered-by", "https://www.webwhiz.ai/");
  ifrm.setAttribute("frameborder", "0");

  const container = document.getElementById("__webwhizSdk__").getAttribute('container');


  if (container) {
    const $container = document.querySelector(container);
    if ($container) {
      $container.appendChild(ifrm);
    }
  } else {
    var styleSheet = document.createElement('style');
    styleSheet.innerText = widgetStyle;
    document.head.appendChild(styleSheet);
    document.body.appendChild(ifrm);
  }

  const baseUrl = __WEBWHIZ__getBaseURL();
  ifrm.setAttribute("src", __WEBWHIZ__URL + '?kbId=' + kbId +'&baseUrl=' + baseUrl);
  return ifrm;
}

function __WEBWHIZ__getEventHandler(ifrm) {
  const iframe = document.getElementById("webwhiz-widget");
  function webWhizEventHandler(e) {
    if (e.data === "webwhiz:widget_expand") {
      iframe.classList.add("wb-expand");
    } else if (e.data === "webwhiz:widget_collapse") {
      setTimeout(() => {
        iframe.classList.remove("wb-expand", "wb-maximize");
      }, 350);
    } else if (e.data === "webwhiz:widget_maximize") {
      iframe.classList.add("wb-maximize");
    } else if (e.data === "webwhiz:widget_minimize") {
      iframe.classList.remove("wb-maximize");
    } else if (e.data === "webwhiz:widget_align_left") {
      iframe.classList.add("wb-align-left");
    } else if (e.data === "webwhiz:widget_clear_history") {
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('sessionId');
    } else if (e.data === "webwhiz:request_meta_data") {
      const container = document.getElementById("__webwhizSdk__").getAttribute('container');
      e.source.postMessage({ messageType: 'webwhiz:recieve_meta_data', url: window.location.href, container: container }, '*');
    } else if (e.data === "webwhiz:request_chat_data") {
      const chatHistoryData = localStorage.getItem("chatHistory");
      const chatHistory = JSON.parse(chatHistoryData || '[]');
      e.source.postMessage({ messageType: 'webwhiz:recieve_chat_data', chatHistory: chatHistory }, '*');
    } else if (e.data === "webwhiz:request_session_id") {
      const sessionId = localStorage.getItem("sessionId");
      e.source.postMessage({ messageType: 'webwhiz:recieve_session_id', sessionId: sessionId }, '*');
    } else if(e.data && e.data.messageType === 'webwhiz:recieve_new_message') {
      const chatHistoryData = localStorage.getItem("chatHistory");
      let chatHistory = JSON.parse(chatHistoryData || '[]');
      const msg = e.data.message || []
      chatHistory = [...chatHistory, ...msg];
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    } else if(e.data && e.data.messageType === 'webwhiz:recieve_new_session_id') {
      localStorage.setItem("sessionId", e.data.sessionId);
    }
  }

  return webWhizEventHandler;
}

function __WEBWHIZ__addEventListeners(ifrm) {
  window.onmessage = __WEBWHIZ__getEventHandler(ifrm);
}

function __WEBWHIZ__getChatbotId() {
  const chatbotId = document.getElementById("__webwhizSdk__").getAttribute('chatbotId');
  return chatbotId;
}

function __WEBWHIZ__getWidgetURL() {
  const baseURL = document.getElementById("__webwhizSdk__").getAttribute('widgetUrl');
  return baseURL || 'https://widget.webwhiz.ai/';
}

function __WEBWHIZ__getBaseURL() {
  const baseURL = document.getElementById("__webwhizSdk__").getAttribute('baseUrl');
  return baseURL || 'https://api.webwhiz.ai';
}

__WEBWHIZ__ready(() => {
  setTimeout(() => {
    var ifrm = __WEBWHIZ__addIframe();
    __WEBWHIZ__addEventListeners(ifrm);
  }, 1000);
});
