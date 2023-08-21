import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../config';
import { User } from './appConfig';


export async function getUserProfile(): Promise<AxiosResponse<User>> {
	return await axios({
		baseURL: baseURL,
		method: 'get',
		url: 'user/profile/',
	});
}

export async function setOpenAIKey(key: string, useOwnKey: boolean): Promise<AxiosResponse<User>> {
	return await axios({
		baseURL: baseURL,
		method: 'put',
		data: {
			"useOwnKey": useOwnKey,
			"keys": key ? [key] : []
		},
		url: 'knowledgebase/custom_keys',
	});
}

