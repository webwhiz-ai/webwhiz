import { LauncherIconsSVGs } from "./LauncherIconSVGs";

export function getDomainFromUrl(url: string) {
    if (!url) return '';
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    const domain = matches && matches[1]; // domain will be null if no match is found
    return (domain || '').replace('www.', '');
}

export const uuidv4 = ()=> {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

export function getBrowserName(userAgent: string) {

  if(!userAgent) return 'Other';

  // Detect ARC Welder
  if (userAgent.indexOf('ARC') > -1) {
    return 'ARC Welder';
  }

  // Detect Chrome
  if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1 && userAgent.indexOf("OPR") === -1) {
    return "Google Chrome";
  }

  // Detect Firefox
  if (userAgent.indexOf("Firefox") > -1) {
    return "Mozilla Firefox";
  }

  // Detect Safari
  if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    return "Safari";
  }

  // Detect Internet Explorer or Legacy Edge
  if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
    return "Microsoft Internet Explorer";
  }

  // Detect Edge (Chromium)
  if (userAgent.indexOf("Edg") > -1) {
    return "Microsoft Edge";
  }

  // Detect Opera
  if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    return "Opera";
  }

  // Other
  return 'Other';
}

export const chatWidgetDefaultValues = {
	backgroundColor: "#000",
	heading: 'I am your AI assistant',
	description: `Ask me anything. I'll try to answer based on the data from this website.`,
  chatInputPlaceholderText: 'Type your message',
  assistantTabHeader: 'AI assistant',
  offlineMsgTabHeader: 'Offline message',
  readMoreText: 'Read more:',
	fontColor: "#FFF",
	borderRadius: "12px",
	placement: "right",
	offlineMessage: false,
	showReadMore: true,
  showAsPopup: false,
  popupDelay: 3000,
  collectEmail: false,
  adminEmail: '',
  collectEmailText: 'What is your email address?',
  questionExamples: [
    {question: 'How can I contact you?', label: 'Contact'},
  ],
  welcomeMessages: [
    'Hello! How can I assist you today?'
  ],
  welcomeMessage: 'Hello! How can I assist you today?',
  customCSS: '',
  prompt: 'You are a very enthusiastic chatbot who loves to help people! Your name is {{chatbotName}} and you are designed to respond only based on the given context, outputted in Markdown format.',
  defaultAnswer: "I don't know how to answer that",
  launcherIcon: { 
    id: 'icon1', 
    svgElement: LauncherIconsSVGs.get('icon1') 
  },
  offlineMsgHeading: "Offlne message",
  offlineMsgDescription: "Please fill out the form below and we will get back to you as soon as possible.",
  nameFieldLabel: "Name",
  nameFieldPlaceholder: "Enter your name",
  emailFieldLabel: "Email",
  emailFieldPlaceholder: "Enter your email",
  msgFieldLabel: "Message",
  msgFieldPlaceholder: "Enter your message",
  requiredFieldMsg: "This field is required",
  invalidEmailMsg: "Please enter a valid email",
  formSubmitBtnLabel: "Submit",
  formSubmitBtnSubmittingText: "Submitting...",
  formSubmitSuccessMsg: "Your message sent successfully!",
  formSubmitErrorMsg: "Oops! Something went wrong",
  formSendAgainBtnLabel: "Send again",
  formTryAgainBtnLabel: "Try again",
  model: 'gpt-3.5-turbo-1106'
};


export function formatNumber(num:number, precision = 0) {
  const map = [
    { suffix: 'T', threshold: 1e12 },
    { suffix: 'B', threshold: 1e9 },
    { suffix: 'M', threshold: 1e6 },
    { suffix: 'K', threshold: 1e3 },
    { suffix: '', threshold: 1 },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
    return formatted;
  }

  return num;
}
