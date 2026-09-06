import {io} from 'socket.io-client'
const socket = io("https://internship-project-backend-8lwm.onrender.com",{
    auth: {
        token: localStorage.getItem("token")
    },
    transports: ["polling", "websocket"], 
});
// const socket = io("http://localhost:3000",{
//     auth: {
//         token: localStorage.getItem("token")
//     },
//     transports: ["polling", "websocket"], 
// });
export default socket;