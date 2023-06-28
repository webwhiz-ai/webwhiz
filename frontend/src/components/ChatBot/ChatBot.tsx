import * as React from 'react';
import { createChatBotSession, getChatBotAnswer } from '../../services/knowledgebaseService';

import TextareaAutosize from 'react-textarea-autosize';
import { uuidv4 } from '../../utils/commonUtils';
import { CurrentUser } from '../../services/appConfig';
import { ChatBotCustomizeData } from '../../types/knowledgebase.type';
import ChatBotLauncher from '../../containers/ChatBotLauncher/ChatBotLauncher';
export interface ChatBotProps {
	customStyle: ChatBotCustomizeData,
	knowledgeBaseId: string,
	showCloseButton?: boolean,
	showLauncher?: boolean,
	height?: number | string,
	defaultMessageNumber: number,
}

const maxMessages = 20;

const getMessageClassName = (type: string) => {
	if(type === 'bot') {
		return 'chat-message chatbot'
	} else if(type === 'bot-error') {
		return 'chat-message chatbot-error'
	} else {
		return 'chat-message user'
	}
}
const getMessageStyle = (type: string, customStyle) => {
	if(type === 'bot') {
		return {}
	} else if(type === 'bot-error') {
		return { backgroundColor: 'rgb(255 205 205)', color: '#000' }
	} else {
		return { backgroundColor: customStyle.backgroundColor, color: customStyle.fontColor }
	}
}


export const ChatBot = ({
	customStyle,
	knowledgeBaseId,
	defaultMessageNumber = 0,
	showCloseButton = true,
	showLauncher = true,
	height = '520px',
}) => {

	const user = CurrentUser.get();

	const [sessionId, setSessionId] = React.useState<string>('');
	const [numberOfMessagesLeft, setNumberOfMessagesLeft] = React.useState<number>(maxMessages - defaultMessageNumber);

	const [messages, setMessages] = React.useState<any[]>([
		{
			type: 'bot',
			id: uuidv4(),
			message: customStyle?.welcomeMessage || 'Hello! How can I assist you today?',
		}
	]);

	const [question, setQuestion] = React.useState<string>('');

	// submit form on ctrl+ enter

	

	// const han

	// onEnterPress = (e) => {
	// 	if(e.keyCode == 13 && e.shiftKey == false) {
	// 	  e.preventDefault();
	// 	  this.myFormRef.submit();
	// 	}
	//   }


	const handleChatChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		console.log('e', e.target.value);
		setQuestion(e.target.value)
	}, []);
	

	const handleSubmit = React.useCallback(async (e) => {

		
		setQuestion('')
		const newMessages = [...messages, { type: 'user', message: question, id: uuidv4(), }, {type: 'bot', isLoading: true, id: uuidv4(),}]
		setMessages(newMessages)
		let newSessionId = sessionId;
		if(!sessionId) {
			try {
				const res = await createChatBotSession(knowledgeBaseId);
				console.log('res', res);
				newSessionId = res.data;
				setSessionId(res.data)
			} catch (error) {
				console.log('Unable to create session', error);
			} finally {
			}
		}

		try {
			const response = await getChatBotAnswer(newSessionId, question);
			setNumberOfMessagesLeft(numberOfMessagesLeft - 1);
			const messagesToUpdate = newMessages.filter(message => !message.isLoading);

			if(response.data?.response) {
				setMessages([...messagesToUpdate, { type: 'bot', message: response.data?.response, id: uuidv4(), }])
			} else if(typeof response.data === 'string' && response.data.trim() === 'Sorry I cannot respond right now')  {
				setMessages([...messagesToUpdate, { type: 'bot-error', message: 'You have exceeded token limit. Please upgrade to a higher plan.', id: uuidv4(), }])
			}
	
		} catch (error) {
			const messagesToUpdate = newMessages.filter(message => !message.isLoading);
			setMessages([...messagesToUpdate, { type: 'bot', message: `Oops! Unfortunately, I'm unable to answer right now.`, id: uuidv4(), }])
		}
		
	}, [knowledgeBaseId, messages, numberOfMessagesLeft, question, sessionId])

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
			handleSubmit(e);
		}
	}

	return (
		<div className="chat-wrap widget-open" id="chat-wrap">


			<div className="chat-widget" style={{ borderRadius: customStyle.borderRadius, height: height, minHeight:"410px" }}>
				<div className="chat-header" style={{ backgroundColor: customStyle.backgroundColor, color: customStyle.fontColor }}>
					{showCloseButton && <div className="chat-close">
						<button className="chat-close-btn" id="chat-close-btn">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</button>
					</div>}
					<h2>
						{customStyle.heading}
					</h2>
					<p dangerouslySetInnerHTML={{ __html: customStyle.description }}></p>
				</div>
				<div id="chat-messages" className="chat-messages">
					{messages.map((message, index) => {
						
						const style = getMessageStyle(message.type, customStyle)

						const className = getMessageClassName(message.type);

						if (message.isLoading) {
							return <div className={className} key={message.id} >
								<div className="chat-message-text" style={style}>
									<div className='chat-loading-dot-cont'>
										<div className="chat-loading-dot" style={{ backgroundColor: customStyle.backgroundColor}}></div>
										<div className="chat-loading-dot" style={{ backgroundColor: customStyle.backgroundColor}}></div>
										<div className="chat-loading-dot" style={{ backgroundColor: customStyle.backgroundColor}}></div>
									</div>
								</div>
								
							</div>
						}

						return <div className={className} key={message.id}>
							<div className="chat-message-text" style={style}>{message.message}</div>
						</div>
					})}
				</div>
				<div className="chat-input-wrap">
					{/* {user && user?.subscriptionData?.name === 'FREE' && <div className='chat-message-warning'>{numberOfMessagesLeft} messages left</div>} */}
					<TextareaAutosize value={question} onChange={handleChatChange} onKeyDown={handleKeyDown} rows="1" className="chat-input textarea js-auto-size" id="chat-input" placeholder="Type your message" />
					<button onClick={handleSubmit}  className="chat-submit-btn" type="submit"><svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fillRule="evenodd" clipRule="evenodd" d="M4.394 14.7L13.75 9.3c1-.577 1-2.02 0-2.598L4.394 1.299a1.5 1.5 0 00-2.25 1.3v3.438l4.059 1.088c.494.132.494.833 0 .966l-4.06 1.087v4.224a1.5 1.5 0 002.25 1.299z" style={{ fill: customStyle.backgroundColor }}></path>
					</svg></button>
				</div>
			</div>
			{showLauncher && <ChatBotLauncher backgroundColor= {customStyle.backgroundColor} fontColor= {customStyle.fontColor} />}
			
		</div>
	);
};
