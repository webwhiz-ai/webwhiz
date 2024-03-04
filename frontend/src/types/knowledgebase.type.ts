export interface CrawlData {
    stats: {
        crawledPages: number;
        failedPages: number;
        runTime: number;
    };
}

export interface DocsKnowledgeData {
    docs: CrawlDataList[];
    pages: number;
    knowledgebaseId: string;
}

export enum KnowledgebaseStatus {
    CREATED = 'CREATED',
    CRAWLING = 'CRAWLING',
    CRAWLED = 'CRAWLED',
    CRAWL_ERROR = 'CRAWL_ERROR',
    GENERATING_EMBEDDINGS = 'GENERATING_EMBEDDINGS',
    EMBEDDING_ERROR = 'EMBEDDING_ERROR',
    READY = 'READY',
}

export interface WebsiteData {
    websiteUrl: string;
    exclude: string[];
    include: string[];
    urls: string[];
    name?: string;
}

export interface ProductSetupData {
    websiteData: WebsiteData;
    files?: File[];
}

export interface CrawlDataDetail {
    content: string;
    createdAt: string;
    knowledgebaseId: "64588edb0d197ba22fe686b9"
    status: KnowledgebaseStatus;
    title: string;
    type: "WEBPAGE" | "CUSTOM"
    updatedAt: string;
    url: string;
    _id: string;
}

export interface CrawlDataList {
    createdAt: string;
    status : "CREATED"
    title : string;
    type : "WEBPAGE"
    updatedAt : string;
    url : string;
    _id : string;
}

export interface launcherIcon {
    id: string;
    svgElement: string;
}

export interface ChatBotCustomizeData {
    backgroundColor: string;
    borderRadius:  string;
    description: string;
    fontColor: string;
    heading: string;
    prompt?: string;
    defaultAnswer?: string;
    placement: 'left' | 'right';
    showReadMore: boolean;
    showAsPopup: boolean;
    popupDelay: number;
    offlineMessage: boolean;
    adminEmail: string,
    enableHumanChat: boolean;
    collectEmail: boolean,
    collectEmailText: string,
    welcomeMessage?: string;
    customCSS: string;
    questionExamples: {
        question: string;
        label: string;
    },
    welcomeMessages: string[]
    launcherIcon: launcherIcon;
    chatInputPlaceholderText: string;
    assistantTabHeader: string;
    offlineMsgTabHeader: string;
    readMoreText: string;
    offlineMsgHeading: string;
    offlineMsgDescription: string;
    nameFieldLabel: string;
    nameFieldPlaceholder: string;
    emailFieldLabel: string;
    emailFieldPlaceholder: string;
    msgFieldLabel: string;
    msgFieldPlaceholder: string;
    requiredFieldMsg: string;
    invalidEmailMsg: string;
    formSubmitBtnLabel: string;
    formSubmitBtnSubmittingText: string;
    formSubmitSuccessMsg: string;
    formSubmitErrorMsg: string;
    formSendAgainBtnLabel: string;
    formTryAgainBtnLabel: string;
    model: string;
}
export interface CrawlDataListPagination {
    pages: number;
    results: CrawlDataList[];
}

export interface Knowledgebase {
	name: string;
	createdAt: string;
	owner: string;
	updatedAt: string;
	_id: string;
	status: string;
    websiteData: WebsiteData;
	crawlData: CrawlData;
    chatWidgeData: ChatBotCustomizeData;
    monthUsage: {
        count: number;
        month: string;
    }
    participants: Array<{
        id: string;
        email: string;
        role: "admin" | "editor" | "reader"
    }>;
    model: string;
    prompt: string;
    defaultAnswer: string;
    adminEmail: string;
    customDomain: string
}

export interface KnowledgeBaseWebsiteData {
    exclude: string[],
    include: string[],
    urls: string[],
}

export interface TrainingData {
	createdAt: string;
	status: string;
	title: string;
	updatedAt: string;
	type: string;
	_id: string;
}
export interface TrainingDataDetail {
	content: string;
	createdAt: string;
	knowledgebaseId: string;
	status: string;
    title: string;
    updatedAt: string;
	type: string;
	_id: string;
}

export interface MessageList {
    sender: string;
    a: string;
    aTokens: number;
    q: string;
    qTokens: number;
    ts: string;
    msg: string
    type: 'MANUAL' | 'BOT'
    id: string;
    sessionId: string;
}

export interface UserData {
    ip: string;
    userAgent: string;
    origin: string;
}

export interface ChatSession {
    isUnread: boolean;
    firstMessage: MessageList;
    firstMessage: MessageList;
    startedAt: string;
    updatedAt: string;
    userData?: UserData;
    _id: string;
}


export interface SubscriptionData {
    name: string;
    type: string;
    maxChatbots: number;
    maxTokens: number;
    maxPages: number;
    maxChunksPerPage: number;
}

export interface ChatSessionDetail {
    _id: string;
    knowledgebaseId: string;
    kbName: string;
    defaultAnswer: null;
    prompt: null;
    isDemo: null;
    subscriptionData: SubscriptionData;
    userId: string;
    startedAt: string;
    updatedAt: string;
    messages: MessageList[];
    userData: UserData;
    src: null;
}

export interface OfflineMessage {
    _id: string;
    chatSessionId: string;
    name: string;
    email: string;
    message: string;
    url: null,
    createdAt: string;
}

export interface OfflineMessagePagination {
    pages: number;
    results: OfflineMessage[];
}
export interface ChatSessionPagination {
    pages?: number;
    results: ChatSession[];
}

export interface CustomDataPagination {
    pages: number;
    results: TrainingDataDetail[];
}
