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



export interface InviteUserParams {	
	id?: string
	email: string;
	role: 'editor' | 'admin' | 'reader'
}

export const inviteUser = async (kb_id: string, { email, role }: InviteUserParams) => {
	return await axios({
		baseURL: baseURL,
		method: 'post',
		data: {
			email,
			role
		},
		url: `knowledgebase/${kb_id}/invite_user`,
	});
};


export const deleteUser = async (kb_id: string, user_id: string) => {
	return await axios({
		baseURL: baseURL,
		method: 'delete',
		url: `knowledgebase/${kb_id}/delete_user/${user_id}`,
	});
};

