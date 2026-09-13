import { io } from 'socket.io-client';
import { API_BASE_URL } from './services/api';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const socket = io(SOCKET_URL, {
  auth: (cb) => {
    cb({
      token: localStorage.getItem('token') || '',
    });
  },
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
  autoConnect: true,
});

export default socket;