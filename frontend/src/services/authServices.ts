import axios, { AxiosResponse } from 'axios';
import { SignUp } from '../types/types';
import { baseURL } from '../config';
export async function signUp(payload: {
  email: string;
  password: string;
}): Promise<AxiosResponse<SignUp>> {
  return await axios({
    baseURL: baseURL,
    method: 'post',
    url: '/auth/signup/',
    data: payload,
  });
}
export async function logIn(payload: {
  email: string;
  password: string;
}): Promise<AxiosResponse<SignUp>> {
  return await axios({
    baseURL: baseURL,
    method: 'post',
    url: '/auth/login/',
    data: payload,
  });
}
export async function authGoogle(payload: {
  token: string;
}): Promise<AxiosResponse<any>> {
  return await axios({
    baseURL: baseURL,
    method: 'post',
    url: '/auth/google_auth',
    data: payload,
  });
}
