import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../config';
import { ChatBotCustomizeData, ChatSession, ChatSessionDetail, CrawlDataDetail, CrawlDataListPagination, Knowledgebase, OfflineMessage, OfflineMessagePagination, TrainingData, TrainingDataDetail } from '../types/knowledgebase.type';
export interface Product {
	id: string;
	name: string;
	previewUrl: string;
}

export async function createKnowledgebase(data: Knowledgebase): Promise<AxiosResponse<Knowledgebase>> {
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
export async function updateWebsiteData(id:string, data: ChatBotCustomizeData): Promise<AxiosResponse<Knowledgebase[]>> {
	return await axios({
		baseURL: baseURL,
		method: 'put',
		data: data,
		useAlternateParser: true,
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
export async function getTrainingData(id: string): Promise<AxiosResponse<{
	results: TrainingData[],
}>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/knowledgebase/${id}/datastore?type=CUSTOM&page_size=30`,
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


export async function getChatSessions(id: string, page: string): Promise<AxiosResponse<ChatSession[]>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/chatbot/${id}/session?page_size=10&page=${page}`,
	});
}
export async function getOfflineMessages(id: string, page: string): Promise<AxiosResponse<OfflineMessagePagination>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/offline_msg/${id}?page_size=10&page=${page}`,
	});
}
export async function getChatSessionDetails(sessionId: string): Promise<AxiosResponse<ChatSessionDetail>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: `/chatbot/session/${sessionId}`,
	});
}
