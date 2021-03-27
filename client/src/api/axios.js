import axios from "axios";
// const instance = axios.create({
//   baseURL: "http://localhost:4000/",
// });
const instance = axios.create({
  baseURL: "https://server-chess-dewa-kipas.herokuapp.com/",
});

export default instance;
