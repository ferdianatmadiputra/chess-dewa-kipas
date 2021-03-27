import { io } from "socket.io-client";
// const instance = axios.create({
//   baseURL: "https://server-chess-dewa-kipas.herokuapp.com/",
// });
export const ENDPOINT = "https://server-chess-dewa-kipas.herokuapp.com/";
// export const ENDPOINT = "http://localhost:4000/";
export const socket = io(ENDPOINT);

// export default { socket, ENDPOINT }
