import { io } from 'socket.io-client';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

let socketInstance = null;

export function getSocket(token) {
	if (!token) {
		throw new Error('Token required for socket connection');
	}
	if (!socketInstance) {
		socketInstance = io(backendUrl, {
			autoConnect: false,
			transports: ['websocket']
		});
	}
	const hasDifferentToken = socketInstance.auth?.token !== token;
	if (hasDifferentToken && socketInstance.connected) {
		socketInstance.disconnect();
	}
	socketInstance.auth = { token };
	if (!socketInstance.connected) {
		socketInstance.connect();
	}
	return socketInstance;
}

export function disconnectSocket() {
	if (socketInstance?.connected) {
		socketInstance.disconnect();
	}
}

