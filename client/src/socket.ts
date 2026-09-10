import { io } from 'socket.io-client';
import { API_BASE_URL } from './services/api';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem("token")
  },
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5, // Stop infinite retries if backend is unreachable
  reconnectionDelay: 3000,
});

export default socket; 