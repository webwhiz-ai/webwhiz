// SocketService.ts
import io, { Socket } from 'socket.io-client';
import { baseURL } from '../config';

class SocketService {
    private sockets: { [chatbotID: string]: Socket };

    constructor() {
        this.sockets = {};
    }

    public getSocket(chatbotID: string, userId: string): Socket {
        if (!this.sockets[chatbotID]) {
            this.sockets[chatbotID] = this.createSocket(chatbotID, userId);
        }
        return this.sockets[chatbotID];
    }

    private createSocket(chatbotID: string, userId: string): Socket {
        const socket: Socket = io(baseURL as string, { transports: ["websocket"], query: { id: userId, isAdmin: true, knowledgeBaseId: chatbotID } });

        return socket;
    }

    public disconnectSocket(chatbotID: string): void {
        if (this.sockets[chatbotID]) {
            this.sockets[chatbotID].disconnect();
            delete this.sockets[chatbotID];
        }
    }
}

const socketService = new SocketService();
export default socketService;


