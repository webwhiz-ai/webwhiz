import { io } from 'socket.io-client';
import { baseURL } from './config';

export const socket =  io(baseURL as string, { transports: ["websocket"], query: { id: 'Admin', isAdmin: true } });