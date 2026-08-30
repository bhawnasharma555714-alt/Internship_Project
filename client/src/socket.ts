import {io} from 'socket.io-client'
const socket = io("http://localhost:3000",{
    auth: {
        token: localStorage.getItem("token")
    }
});
export default socket;