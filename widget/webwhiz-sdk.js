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
.webwhiz__msg-popup {
  position: fixed;
  bottom: 106px;
  max-width: fit-content;
  display: flex;
  flex-direction: column;
  max-width: 320px;
  opacity: 0;
  align-items: end;
  transition: all 0.3s ease-in-out;
  transform: translate3d(0px, 10px, 0px);
}
.webwhiz__msg-popup.webwhiz__msg-popup-left {
  left: 20px;
}
.webwhiz__msg-popup.webwhiz__msg-popup-right {
  right: 20px;
}
.webwhiz__msg-popup.webwhiz__msg-popup--show {
  opacity: 1;
  transform: translate3d(0px, 0px, 0px);
}

.webwhiz__msg-popup-item {
  cursor: pointer;
  padding: 20px;
  background-color: #FFF;
  display: inline-flex;
  width: auto;
  margin: 5px 0;
  font-size: 14px;
  border-radius: 6px;
  line-height: 1.5;
  color: #333;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.webwhiz__msg-popup-close-btn {
  cursor: pointer;
  border-radius: 12px;
  background-color: #fff;
  font-size: 12px;
  color: rgba(0,0,0,0.65);
  border: 1px solid rgba(0,0,0,0.18);
  opacity: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: opacity 0.3s ease-in-out;
}

.webwhiz__msg-popup-close-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.webwhiz__msg-popup:hover .webwhiz__msg-popup-close-btn {
  opacity: 0.8;
}
.webwhiz__msg-popup .webwhiz__msg-popup-close-btn:hover {
  opacity: 1;
}
`


function __WEBWHIZ__addIframe() {
  var ifrm = document.createElement("iframe");
  const kbId = __WEBWHIZ__getChatbotId();
  ifrm.setAttribute("class", "webwhiz-widget");
  ifrm.setAttribute("id", "webwhiz-widget");
  ifrm.setAttribute("data-powered-by", "https://www.webwhiz.ai/");
  ifrm.setAttribute("frameborder", "0");

  const scriptEl = document.getElementById("__webwhizSdk__");
  const container = scriptEl.getAttribute('container') || scriptEl.getAttribute('data-container');


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

function addPopup(config) {
  const welcomeMessagesHTML = config.welcomeMessages.map(msg => {
    return `<div class="webwhiz__msg-popup-item">${msg}</div>`
  }).join(''); 
  const closeBtn = `<button class="webwhiz__msg-popup-close-btn" id="webwhiz__msg-popup-close-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
  </button>`
  let popupPositionClass = ''
  if(config.position === 'left') {
    popupPositionClass = 'webwhiz__msg-popup-left'
  } else {
    popupPositionClass = 'webwhiz__msg-popup-right'
  }
  document.body.insertAdjacentHTML('beforeend', `<div id="webwhiz__msg-popup" class="webwhiz__msg-popup ${popupPositionClass}">${closeBtn}${welcomeMessagesHTML}</div>`);
  document.getElementById('webwhiz__msg-popup-close-btn').onclick = () => {
    removePopup();
  }
  const popupItems = document.getElementsByClassName('webwhiz__msg-popup-item');
  for (const popupItem of popupItems) {
    popupItem.onclick = () => {
      openWidget();
    };
  }
  setTimeout(() => {
    const popup = document.getElementById('webwhiz__msg-popup');
    if(popup) {
      popup.classList.add('webwhiz__msg-popup--show');
    }
  }, config.popupDelay || 3000);
}

function openWidget() {
  const iframe = document.getElementById("webwhiz-widget");

  iframe.contentWindow.postMessage({ messageType: 'webwhiz:expandWidget' }, '*');
}

function removePopup() {
  const popup = document.getElementById('webwhiz__msg-popup');
  if(popup) {
    popup.classList.remove('webwhiz__msg-popup--show');
    localStorage.setItem("webwhiz__popupRemoved", true);
    setTimeout(() => {
      popup.remove();
    }, 350);
  }
}

function __WEBWHIZ__getEventHandler(ifrm) {
  const iframe = document.getElementById("webwhiz-widget");
  const scriptEl = document.getElementById("__webwhizSdk__");
  const container = scriptEl.getAttribute('container') || scriptEl.getAttribute('data-container');
  function webWhizEventHandler(e) {
    if (e.data === "webwhiz:widget_expand") {
      iframe.classList.add("wb-expand");
      removePopup();
    } else if (e.data === "webwhiz:widget_collapse") {
      setTimeout(() => {
        iframe.classList.remove("wb-expand", "wb-maximize");
      }, 350);
    } else if (e.data === "webwhiz:widget_maximize") {
      iframe.classList.add("wb-maximize");
    } else if (e.data === "webwhiz:widget_minimize") {
      iframe.classList.remove("wb-maximize");
    } else if (e.data && e.data.messageType === 'webwhiz:widget_config') {
      const config = e.data.config || {};
      if (config.position === 'left'){
        iframe.classList.add("wb-align-left");
      }
      const popupRemoved = JSON.parse(localStorage.getItem("webwhiz__popupRemoved"));
      if(!popupRemoved && config.showAsPopup && config.welcomeMessages && config.welcomeMessages.length > 0 && !container) {
        addPopup(config);
      }
    } else if (e.data === "webwhiz:widget_clear_history") {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('isManualChat');
      e.source.postMessage({ messageType: 'webwhiz:recieve_session_id', sessionId: '' }, '*');
    } else if (e.data === "webwhiz:request_meta_data") {
      const scriptEl = document.getElementById("__webwhizSdk__");
      const container = scriptEl.getAttribute('container') || scriptEl.getAttribute('data-container');
      e.source.postMessage({ messageType: 'webwhiz:recieve_meta_data', url: window.location.href, container: container }, '*');
    } else if (e.data === "webwhiz:request_session_id") {
      const sessionId = localStorage.getItem("sessionId");
      e.source.postMessage({ messageType: 'webwhiz:recieve_session_id', sessionId: sessionId }, '*');
    } else if(e.data && e.data.messageType === 'webwhiz:recieve_new_session_id') {
      localStorage.setItem("sessionId", e.data.sessionId);
    } else if(e.data === 'webwhiz:request_is_manual_chat') {
      e.source.postMessage({ messageType: 'webwhiz:recieve_is_manual_chat', isManualChat: JSON.parse(localStorage.getItem("isManualChat") || 'false') }, '*');
    }  else if(e.data && e.data.messageType === 'webwhiz:update_is_manual_chat') {
      localStorage.setItem("isManualChat", e.data.isManualChat);
    }
  }

  return webWhizEventHandler;
}

function __WEBWHIZ__addEventListeners(ifrm) {
  window.onmessage = __WEBWHIZ__getEventHandler(ifrm);
}

function __WEBWHIZ__getChatbotId() {
  const scriptEl = document.getElementById("__webwhizSdk__");
  const chatbotId = scriptEl.getAttribute('chatbotId') || scriptEl.getAttribute('data-chatbot-id');
  return chatbotId;
}

function __WEBWHIZ__getWidgetURL() {
  const scriptEl = document.getElementById("__webwhizSdk__");
  const baseURL = scriptEl.getAttribute('widgetUrl') || scriptEl.getAttribute('data-widget-url');
  return baseURL || 'https://widget.webwhiz.ai/';
}

function __WEBWHIZ__getBaseURL() {
  const scriptEl = document.getElementById("__webwhizSdk__");
  const baseURL = scriptEl.getAttribute('baseUrl') || scriptEl.getAttribute('data-base-url');
  console.log(baseURL);
  return baseURL || 'https://api.webwhiz.ai';
}

__WEBWHIZ__ready(() => {
  setTimeout(() => {
    var ifrm = __WEBWHIZ__addIframe();
    __WEBWHIZ__addEventListeners(ifrm);
  }, 1000);
});
