
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

export const chatWidgetDefaultValues = {
	backgroundColor: "#000",
	heading: 'I am your AI assistant',
	description: `Ask me anything. I'll try to answer based on the data from this website.`,
	fontColor: "#FFF",
	borderRadius: "12px",
	placement: "right",
	offlineMessage: false,
	showReadMore: true,
  questionExamples: [
    {question: 'How can I contact you?', label: 'Contact'},
  ],
  welcomeMessage: 'Hello! How can I assist you today?'
};
