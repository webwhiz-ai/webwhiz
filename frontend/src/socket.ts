import { io } from 'socket.io-client';

export const socket =  io('https://api.webwhiz.ai', { transports: ["websocket"], query: { id: 'Admin', isAdmin: true } });