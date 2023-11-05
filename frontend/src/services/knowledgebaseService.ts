import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../config';
import { ChatBotCustomizeData, ChatSessionDetail, CrawlDataDetail, CrawlDataListPagination, Knowledgebase, OfflineMessagePagination, TrainingData, TrainingDataDetail, ChatSessionPagination, CustomDataPagination, WebsiteData } from '../types/knowledgebase.type';
export interface Product {
	id: string;
	name: string;
	previewUrl: string;
}

export async function createKnowledgebase(data: WebsiteData): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'post',
		data: data,
		url: '/knowledgebase/',
	});
}

export async function createChatBotSession(knowledgebaseId: string): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'post',
		data: {
			"knowledgebaseId": knowledgebaseId
		},
		url: `/chatbot/session/`,
	});
}
export async function getChatBotAnswer(sessionId: string, query: string): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'post',
		data: {
			"sessionId": sessionId,
			"query": query
		},
		url: `/chatbot/answer/?debug=true`,
	});
}
export async function deleteKnowledgebase(id: string): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'delete',
		url: `/knowledgebase/${id}/`,
	});
}

export async function fetchKnowledgebases(): Promise<AxiosResponse<Knowledgebase[]>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: '/knowledgebase/',
	});
}
export async function fetchKnowledgebaseDetails(id:string): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: '/knowledgebase/'+id,
	});
}
export async function fetchKnowledgebaseCrawlData(id:string, page: number): Promise<AxiosResponse<CrawlDataListPagination>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/knowledgebase/${id}/datastore?type=WEBPAGE&page=${page}`,
	});
}
export async function fetchKnowledgebaseCrawlDataForDocs(id:string, page: number): Promise<AxiosResponse<CrawlDataListPagination>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/knowledgebase/${id}/datastore?type=PDF&page=${page}`,
	});
}
export async function fetchKnowledgebaseCrawlDataDetails(id:string, crawlId:string): Promise<AxiosResponse<CrawlDataDetail>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/knowledgebase/${id}/datastore/${crawlId}?type=WEBPAGE`,
	});
}
export async function getDemoSesions(): Promise<AxiosResponse<Knowledgebase[]>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: '/chatbot/demo_session',
	});
}

export async function customizeWidget(id:string, data: ChatBotCustomizeData): Promise<AxiosResponse<Knowledgebase[]>> {
	return await axios({
		baseURL: baseURL,
		method: 'put',
		data: data,
		url: `knowledgebase/${id}/chat_widget_data`,
	});
}

export async function updatePrompt(id:string, prompt: string): Promise<AxiosResponse<Knowledgebase[]>> {
	return await axios({
		baseURL: baseURL,
		method: 'put',
		data: {
			prompt: prompt
		},
		url: `knowledgebase/${id}/prompt`,
	});
}

export async function updateDefaultAnswer(id:string, defaultAnswer: string): Promise<AxiosResponse<Knowledgebase[]>> {
	return await axios({
		baseURL: baseURL,
		method: 'put',
		data: {
			defaultAnswer: defaultAnswer
		},
		url: `knowledgebase/${id}/default_answer`,
	});
}
export async function updateAdminEmail(id:string, adminEmail: string): Promise<AxiosResponse<Knowledgebase[]>> {
	return await axios({
		baseURL: baseURL,
		method: 'put',
		data: {
			email: adminEmail
		},
		url: `knowledgebase/${id}/admin_email`,
	});
}

export async function updateWebsiteData(id:string, data: WebsiteData): Promise<AxiosResponse<Knowledgebase[]>> {
	return await axios({
		baseURL: baseURL,
		method: 'put',
		data: { ...data, useAlternateParser: true },
		url: `/knowledgebase/${id}/website_data`,
	});
}
export async function fetcKnowledgebase(id: string): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/knowledgebase/${id}/`,
	});
}
export async function generateEmbeddings(id: string): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'post',
		url: `/knowledgebase/${id}/generate_embeddings`,
	});
}
export async function addTrainingData(id: string, data): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'post',
		data: data,
		url: `/knowledgebase/${id}/datastore/custom_data`,
	});
}

export async function addTrainingDocs(id: string, files: File[]): Promise<AxiosResponse<Knowledgebase>> {
	const formData = new FormData();
	files.forEach((file) => {
		formData.append('file', file);
	});
	formData.append('knowledgebaseId', id);
	return await axios({
		baseURL: baseURL,
		method: 'post',
		data: formData,
		url: `knowledgebase/importers/document`,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
}

export async function addTrainingDoc(id : string, file: File): Promise<AxiosResponse<Knowledgebase>> {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('knowledgebaseId', id);
	return await axios({
		baseURL: baseURL,
		method: 'post',
		data: formData,
		url: `knowledgebase/importers/pdf`,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
}

export async function updateTrainingData(id: string, data): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'put',
		data: {
			"q": data.q,
			"a": data.a,
		},
		url: `/knowledgebase/${id}/datastore/${data._id}`,
	});
}
export async function getTrainingData(id: string, page: string): Promise<AxiosResponse<CustomDataPagination>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/knowledgebase/${id}/datastore?type=CUSTOM&page=${page}&page_size=20`,
	});
}
export async function deleteTrainingData(knowledgebaseId: string, id: string): Promise<AxiosResponse<Knowledgebase>> {
	return await axios({
		baseURL: baseURL,
		method: 'delete',
		url: `/knowledgebase/${knowledgebaseId}/datastore/${id}`,
	});
}

export async function getTrainingDataDetails(knowledgebaseId: string, id: string): Promise<AxiosResponse<TrainingDataDetail>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/knowledgebase/${knowledgebaseId}/datastore/${id}`,
	});
}

export async function setCustomDomain(knowledgebaseId: string, domain: string): Promise<AxiosResponse<TrainingDataDetail>> {
	return await axios({
		baseURL: baseURL,
		data: {
			domain: domain
		},
		method: 'put',
		url: `/knowledgebase/${knowledgebaseId}/custom_domain`,
	});
}


export async function getChatSessions(id: string, page: string): Promise<AxiosResponse<ChatSessionPagination>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/chatbot/${id}/session?page_size=10&page=${page}`,
	});
}

export async function readChatSession(sessionId: string) {
	return await axios({
		baseURL: baseURL,
		method: 'post',
		url: `/chatbot/session/${sessionId}/read`,
	});
}

export async function unReadChatSession(sessionId: string) {
	return await axios({
		baseURL: baseURL,
		method: 'post',
		url: `/chatbot/session/${sessionId}/unread`,
	});
}

export async function getOfflineMessages(id: string, page: string): Promise<AxiosResponse<OfflineMessagePagination>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/offline_msg/${id}?page_size=10&page=${page}`,
	});
}

export async function sendOfflineMessage(data: any): Promise<AxiosResponse<any>> {
	return await axios({
		baseURL: baseURL,
		method: 'post',
		data: data,
		url: `/offline_msg`,
	});
}
export async function getChatSessionDetails(sessionId: string): Promise<AxiosResponse<ChatSessionDetail>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/chatbot/session/${sessionId}`,
	});
}