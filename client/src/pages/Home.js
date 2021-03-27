import { useHistory, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import axios from "../api/axios";
import CardHistory from "../components/CardHistory";
import { socket } from "../connections/socketio.js";
import Table from "../components/Table";
import ChessVSBot from "./ChessVSBot";

export default function Home() {
  const { state } = useLocation();
  const history = useHistory();
  const [openModalCreateRoom, setOpenModalCreateRoom] = useState(false);
  const [inputRoomId, setInputRoomId] = useState("");
  const [histories, setHistories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isDropdown, setIsDropdown] = useState(true);
  const [userLogin, setUserLogin] = useState({});
  function vsPlayer() {
    setOpenModalCreateRoom(true);
    setIsDropdown(false);
  }
  function handleBack() {
    setIsDropdown(true);
  }
  function createRoom() {
    history.push(`/dashboard/player/new`, userLogin);
  }
  function joinRoom() {
    history.push(`/dashboard/player/${inputRoomId}`, userLogin);
  }
  function onChangeInputRoomId(e) {
    setInputRoomId(e.target.value);
  }
  function matchmaking() {
    socket.emit("matchmaking", userLogin);
    history.push("/dashboard/player/matchmaking", userLogin);
  }

  useEffect(() => {
    // const ac = new AbortController();
    async function getHistoryUser() {
      try {
        // console.log(userLogin, "<<<<<<<<");
        const { data } = await axios({
          method: "get",
          url: `/histories/${userLogin.id || state.id}`,
          headers: {
            access_token: localStorage.access_token,
          },
        });
        setHistories(data);
      } catch ({ response }) {
        console.log(response);
      }
    }
    async function getLeaderboard() {
      try {
        const { data } = await axios({
          method: "get",
          url: "users/leaderboard",
          headers: {
            access_token: localStorage.access_token,
          },
        });
        setLeaderboard(data);
      } catch (response) {
        console.log(response);
      }
    }
    async function getUser() {
      try {
        const { data } = await axios({
          method: "get",
          url: `users/${localStorage.access_token}`,
        });
        setUserLogin(data);
      } catch ({ response }) {
        console.log(response);
      }
    }
    getHistoryUser();
    getLeaderboard();
    getUser();
    return () => {
      setUserLogin([]);
    };
  }, [openModalCreateRoom, state]);

  return (
    <>
      <Nav />
      <div className="container-fluid">
        {/* {console.log(userLogin)} */}
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 my-3">
            <div
              className="card text-center"
              style={{
                // height: "300px",
                // width: "825px",
                backgroundColor: "#262421",
              }}
            >
              <div className="card-header h1" style={{ color: "#999999" }}>
                Want to play now?
              </div>
              <div className="card-body">
                {isDropdown ? (
                  <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-4 mt-1">
                      <button
                        className="btn btn-outline-dark p-2"
                        style={{
                          height: "150px",
                          width: "150px",
                          borderColor: "#999999",
                        }}
                        onClick={vsPlayer}
                      >
                        <div className="row justify-content-center">
                          <div className="col-10" style={{ color: "#999999" }}>
                            <i className="fas fa-user-friends fa-5x"></i>
                          </div>
                          <div
                            className="col-10 mt-2"
                            style={{ color: "#999999" }}
                          >
                            VS Friend
                          </div>
                        </div>
                      </button>
                    </div>
                    <div className="col-12 col-md-8 col-lg-4 mt-1">
                      <button
                        className="btn btn-outline-dark p-2"
                        style={{
                          height: "150px",
                          width: "150px",
                          borderColor: "#999999",
                        }}
                        onClick={matchmaking}
                      >
                        <div className="row justify-content-center">
                          <div className="col-10" style={{ color: "#999999" }}>
                            <i className="fas fa-user fa-5x"></i>
                          </div>
                          <div
                            className="col-10 mt-2"
                            style={{ color: "#999999" }}
                          >
                            Matchmaking
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row justify-content-center">
                      <div className="col-4 my-3">
                        <button
                          className="btn btn-outline-dark"
                          type="button"
                          style={{ color: "#999999", borderColor: "#999999" }}
                          onClick={createRoom}
                        >
                          Create Room
                        </button>
                      </div>
                    </div>
                    <div className="row justify-content-center">
                      <div className="col-8 my-3">
                        <label className="text-white mr-2">
                          <p style={{ color: "#999999" }}>Input Room ID</p>
                        </label>
                        <input
                          type="text"
                          style={{ backgroundColor: "#999999" }}
                          onChange={(e) => onChangeInputRoomId(e)}
                        />
                        <button
                          className="btn btn-outline-dark ml-2"
                          type="button"
                          style={{ color: "#999999", borderColor: "#999999" }}
                          onClick={joinRoom}
                        >
                          Join Room
                        </button>
                      </div>
                    </div>
                    <div className="row justify-content-center">
                      <div className="col-4 my-3">
                        <button
                          className="btn btn-outline-dark"
                          type="button"
                          style={{ color: "#999999", borderColor: "#999999" }}
                          onClick={handleBack}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-8 col-lg-3 my-3">
            <div
              className="card"
              style={{
                // height: "150px",
                // width: "420px",
                backgroundColor: "#262421",
              }}
            >
              <div className="d-flex justify-content-around">
                <div className="col-4 my-3">
                  <img
                    src={userLogin.pictureUrl}
                    className="img-thumbnail bg-dark border-dark"
                    alt=""
                  />
                </div>
                <div className="col-8 my-3">
                  <h3 className="font-minecraft" style={{ color: "#999999" }}>
                    {userLogin.username}
                  </h3>
                  <h3 className="" style={{ color: "#999999" }}>
                    <i className="fas fa-chess-pawn"></i>
                    &nbsp; : {userLogin.eloRating}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 my-3">
            <div
              className="card text-center"
              style={{
                // height: "650px",
                // width: "825px",
                backgroundColor: "#262421",
              }}
            >
              <div className="card-header h1" style={{ color: "#999999" }}>
                Practice your skill with AI
              </div>
              <ChessVSBot userData={state} />
            </div>
          </div>
          <div className="col-12 col-md-8 col-lg-3 my-3">
            <div className="row">
              <div className="col-12 mb-3">
                <div
                  className="card text-center"
                  style={{
                    height: "300px",
                    // width: "350px",
                    backgroundColor: "#262421",
                  }}
                >
                  <div
                    className="card-header h3 font-minecraft"
                    style={{ color: "#999999" }}
                  >
                    History
                  </div>
                  <div className="overflow-auto">
                    {histories
                      ? histories.map((history, i) => (
                          <CardHistory
                            history={history}
                            user={state}
                            key={`data ke${i + 1}`}
                          />
                        ))
                      : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div
                  className="card text-center"
                  style={{
                    height: "370px",
                    // width: "350px",
                    backgroundColor: "#262421",
                  }}
                >
                  <div
                    className="card-header h3 font-minecraft"
                    style={{ color: "#999999" }}
                  >
                    Leaderboard
                  </div>
                  <table className="table text-light table-dark table-hover">
                    <thead>
                      <tr>
                        <th scope="col">
                          <i
                            className="fas fa-crown"
                            style={{ color: "#999999" }}
                          ></i>
                        </th>
                        <th scope="col" style={{ color: "#999999" }}>
                          Username
                        </th>
                        <th scope="col" style={{ color: "#999999" }}>
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="mb-3">
                      {leaderboard
                        ? leaderboard.map((data, i) => (
                            <Table
                              data={{ data, i }}
                              key={`data ke ${i + 1}`}
                            />
                          ))
                        : null}
                    </tbody>
                    <tfoot>
                      {leaderboard
                        ? leaderboard.map((data, i) => {
                            if (data.email === userLogin.email) {
                              return (
                                <tr
                                  className="text-dark"
                                  style={{ backgroundColor: "#999999" }}
                                  key={`data ke ${i + 1}`}
                                >
                                  <th scope="row">{i + 1}</th>
                                  <td>{data.username}</td>
                                  <td>{data.eloRating}</td>
                                </tr>
                              );
                            }
                          })
                        : null}
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="container-fluid">
        {openModalCreateRoom ? (
          <div className="row">
            <button className="btn" type="button" onClick={createRoom}>
              createRoom
            </button>
            <>
              <label>input room id</label>
              <input type="text" onChange={(e) => onChangeInputRoomId(e)} />
              <button className="btn" type="button" onClick={joinRoom}>
                joinRoom
              </button>
            </>
          </div>
        ) : (
          <div></div>
        )}
        <div className="row" style={{ height: "100vh" }}>
          <div className="col-6 bg-warning">
            <h1 className="text-center">Want to play now?</h1>
            <div className="row">
              <div
                className="dropdown"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button
                  className="btn btn-outline-primary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ height: "100px", width: "100px" }}
                >
                  Play
                </button>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton1"
                >
                  <li>
                    <button className=" dropdown-item" onClick={vsPlayer}>
                      <i className="fas fa-user"> V.S. Player</i>
                    </button>
                  </li>
                  <li>
                    <button className=" dropdown-item" onClick={vsBot}>
                      <i className="fas fa-robot"> V.S. Bot</i>
                    </button>
                  </li>
                  <li>
                    <button className=" dropdown-item" onClick={matchmaking}>
                      <i className="fas fa-robot"> Matchmaking</i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="row">{JSON.stringify(histories, null, 2)}</div>
          </div>
          <div className="col-6 bg-danger">
            <div className="row">
              <div
                className="col-2"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <img
                  src={state.pictureUrl}
                  className="img-thumbnail"
                  height="100"
                  width="100"
                  alt=""
                />
              </div>
              <div className="col-8">
                <div className="row">
                  <span>
                    Name<h3>{state ? state.username : ""}</h3>
                  </span>
                </div>
              </div>
            </div>
            <div className="row" style={{ height: "50vh" }}>
              <h1 className="text-center">Leaderboard</h1>
            </div>
            <div className="row" style={{ height: "50vh" }}>
              <div className="col">
                <h1 className="text-center">History</h1>
                <div
                  tabIndex="0"
                  style={{
                    overflowY: "scroll",
                    minHeight: "100x",
                    maxHeight: "220px",
                    border: "5px solid black",
                  }}
                  className="row"
                >
                  {histories
                    ? histories.map((history, i) => (
                        <CardHistory
                          history={history}
                          key={`data ke${i + 1}`}
                        />
                      ))
                    : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}
