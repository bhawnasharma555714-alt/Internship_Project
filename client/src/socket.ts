import { io } from 'socket.io-client';
import { API_BASE_URL } from './services/api';

// Derive the base server origin by removing the '/api' suffix if present
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem("token")
  },
  transports: ["polling", "websocket"], 
});

export default socket;