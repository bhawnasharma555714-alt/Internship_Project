import {io} from 'socket.io-client'
const socket = io("https://internship-project-backend-8lwm.onrender.com",{
    auth: {
        token: localStorage.getItem("token")
    }
});
export default socket;