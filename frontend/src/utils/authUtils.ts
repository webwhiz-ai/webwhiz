import axios from 'axios';
import { baseURL } from '../config';

export const setAuthDetails = (token: string) => {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  axios.defaults.baseURL = baseURL;
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  localStorage.setItem('accesstoken', token);
};
export const removeAuthenticationDetails = () => {
  //axios.defaults.headers.common['Authorization'] = '';
  localStorage.removeItem('accesstoken');
};
