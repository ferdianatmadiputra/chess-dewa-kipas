import React, { Component, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Chess from "chess.js"; // import Chess from  "chess.js"(default) if recieving an error about new Chess() not being a constructor
import Chessboard from "chessboardjsx";
import axios from "../api/axios";
import MatchmakingQueueDialogs from "../components/loaderMatchmaking";
import { socket, ENDPOINT } from "../connections/socketio.js";
import { v4 as uuidv4 } from "uuid";

import { Button, Dialog, DialogActions, DialogTitle } from "@material-ui/core";
import { useParams, useLocation, useHistory } from "react-router-dom";
import VidCam from "../pages/Camera";
import { Timer } from "react-countdown-clock-timer";
import { CopyToClipboard } from "react-copy-to-clipboard";
import wink from "../images/wink.gif";
import mindblown from "../images/mindblown.gif";
import sleep from "../images/sleep.gif";
import sad from "../images/sad.gif";
import sweat from "../images/sweat.gif";
import hugemoji from "../images/hugemoji.gif";

class HumanVsHuman extends Component {
  static propTypes = { children: PropTypes.func };
  constructor(props) {
    super(props);
    this.state = {
      fen: "start",
      // square styles for active drop square
      dropSquareStyle: {},
      // custom square styles
      squareStyles: {},
      // square with the currently clicked piece
      pieceSquare: "",
      // currently clicked square
      square: "",
      // array of past game moves
      history: [],
      //modifan baru
      play: true,
      color: "white",
      dataFetch: [],
      roomid: this.props.roomid,
      userData: this.props.userData,
      enemy: {},
      gameOver: false,
      openGameOverModal: false,
      playerWinStatus: "",
      // isi userData
      // {
      //   id: user.id,
      //   username: user.username,
      //   email: user.email,
      //   pictureUrl: user.pictureUrl,
      //   eloRating: user.eloRating,
      // }
      pauseTimerKita: true,
      pauseTimerEnemy: true,
      openMatchmakingLoader: false,
    };
  }

  componentDidMount() {
    // console.log(this.props, "<<<<<<<<<< ini yg di class");
    // console.log(this.props.roomid, "<<<<<<<<<< ini yang di class");
    // console.log(this.props.userData, "ini props userdata di class component");
    // console.log(this.state.userData, "ini state userdata di class component");
    if (this.state.roomid === "new") {
      let uuid = uuidv4().substring(0, 7);
      this.setState({ roomid: uuid });
      socket.emit("create-room", {
        roomid: uuid,
        playerData: this.state.userData,
      });
      socket.on("result", (data) => {
        // console.log(data, "<<<<<<<<<< DATA DARI SOCKET");
        this.setState({ roomid: data });
      });
      // console.log(
      //   this.state.roomid,
      //   "<<<<<<<<<<<<<<<<<<<< DI COMPONENT DID MOUNT"
      // );
    } else if (this.state.roomid === "matchmaking") {
      this.setState({ openMatchmakingLoader: true });
    } else {
      this.setState({ color: "black" });
      socket.emit("join-room", {
        roomid: this.state.roomid,
        playerData: this.state.userData,
      });
      socket.on("fullRoom", () => {
        this.props.history.push("/home", { ...this.state.userData });
      });
    }
    this.game = new Chess();

    socket.on("matchStart", (dataRoom) => {
      console.log("matchstart dapet");
      this.setState({ openMatchmakingLoader: false });
      if (this.state.userData.id === dataRoom.playerOne.id) {
        this.setState({ color: "white", roomid: dataRoom.roomid });
        this.setState({ enemy: dataRoom.playerTwo });
        this.handleTimerEnemy();
      } else {
        this.setState({ color: "black", roomid: dataRoom.roomid });
        this.setState({ enemy: dataRoom.playerOne });
        this.handleTimerKita();
      }
    });

    socket.on("fullroom", (dataRoom) => {
      // console.log("fullroom", dataRoom);
      // console.log(this.state.color);
      if (this.state.color === "white") {
        this.setState({ enemy: dataRoom.selectedRoom.playerTwo });
        this.handleTimerEnemy();
      } else {
        this.setState({ enemy: dataRoom.selectedRoom.playerOne });
        this.handleTimerKita();
      }
    });

    socket.on("enemymove", (data) => {
      let move = this.game.move({
        from: data.sourceSquare,
        to: data.targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });
      this.setState({
        fen: data.fen,
        history: data.history,
        squareStyles: data.squareStyles,
      });
      this.changeTurnTimer();
    });

    socket.on("youlose", () => {
      this.setState({
        playerWinStatus: `You lose versus ${this.state.enemy.username}, try harder next time...`,
      });
      this.setState({
        openGameOverModal: true,
        pauseTimerKita: true,
        pauseTimerEnemy: true,
      });

      let newScore = this.state.userData.eloRating - 10;
      // let newScore = EloRating(this.state.userData.eloRating, this.state.enemy.eloRating, false)
      this.updateScore({ id: this.state.userData.id, eloRating: newScore });
    });

    socket.on("youwin", () => {
      let newScore = this.state.userData.eloRating + 10;
      this.updateScore({
        id: this.state.userData.id,
        eloRating: newScore,
      });
      this.postHistory({
        playerOne: this.state.userData.id,
        playerTwo: this.state.enemy.id,
        status: 1,
      });
      console.log("kamu winner");
      this.setState({
        playerWinStatus: `Nice Job, You Win versus ${this.state.enemy.username}!!`,
      });
      this.setState({
        openGameOverModal: true,
        pauseTimerKita: true,
        pauseTimerEnemy: true,
      });
    });

    socket.on("onStalemate", () => {
      this.setState({
        playerWinStatus: `Stalemate, You get draw versus ${this.state.enemy.username}!!`,
      });
      this.setState({
        openGameOverModal: true,
        pauseTimerKita: true,
        pauseTimerEnemy: true,
      });
    });
  }

  // keep clicked square style and remove hint squares
  removeHighlightSquare = () => {
    this.setState(({ pieceSquare, history }) => ({
      squareStyles: squareStyling({ pieceSquare, history }),
    }));
  };

  // show possible moves
  highlightSquare = (sourceSquare, squaresToHighlight) => {
    const highlightStyles = [sourceSquare, ...squaresToHighlight].reduce(
      (a, c) => {
        return {
          ...a,
          ...{
            [c]: {
              backgroundColor: "rgba(255, 255, 0, 0.4)",
            },
          },
          ...squareStyling({
            history: this.state.history,
            pieceSquare: this.state.pieceSquare,
          }),
        };
      },
      {}
    );

    this.setState(({ squareStyles }) => ({
      squareStyles: { ...squareStyles, ...highlightStyles },
    }));
  };

  createEloRating = (currentRating, enemyRating, status) => {
    return (enemyRating + 400 * status) / 10;
  };

  onDrop = ({ sourceSquare, targetSquare }) => {
    if (!this.state.enemy.username) {
      return;
    }
    // see if the move is legal
    const nowTurn = this.game.fen().split(" ")[1];
    console.log(nowTurn, "<< seharunya ini yang boleh gerak");
    if (
      (this.state.color === "black" && nowTurn === "b") ||
      (this.state.color === "white" && nowTurn === "w")
    ) {
      // illegal move
      let move = this.game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });
      // console.log(this.game.move());
      // console.log(sourceSquare, targetSquare, "ini isi ondrop");
      // console.log(this.game, "ini isi this gameeeeee");
      // console.log(this.game.fen());
      if (move === null) return;

      this.setState(({ history, pieceSquare }) => ({
        fen: this.game.fen(),
        history: this.game.history({ verbose: true }),
        squareStyles: squareStyling({ pieceSquare, history }),
      }));

      this.changeTurnTimer();

      socket.emit("move", {
        sourceSquare,
        targetSquare,
        roomid: this.state.roomid,
        fen: this.state.fen,
        history: this.state.history,
        squareStyles: this.state.pieceSquare,
      });
      const isStaleMate = this.game.in_stalemate();
      if (isStaleMate) {
        // emit draw end game
        this.postHistory({
          playerOne: this.state.userData.id,
          playerTwo: this.state.enemy.id,
          status: 3,
        });
        console.log("draw");

        // harusnya disini update user score
        socket.emit("stalemate", { roomid: this.state.roomid });
        this.setState({
          playerWinStatus: `Stalemate, You get draw versus ${this.state.enemy.username}!!`,
        });
        this.setState({
          openGameOverModal: true,
          pauseTimerKita: true,
          pauseTimerEnemy: true,
        });
      } else {
        console.log(this.game.game_over(), "ini isi gameover ");
        const isGameOver = this.game.game_over();
        if (isGameOver) {
          const losercolor = this.game.fen().split(" ")[1];
          if (
            (losercolor === "b" && this.state.color === "black") ||
            (losercolor === "w" && this.state.color === "white")
          ) {
            // berarti client ini yang lose
            // let newScore = EloRating(this.state.userData.eloRating, this.state.enemy.eloRating, false)
            let newScore = this.state.userData.eloRating - 10;
            this.updateScore({
              id: this.state.userData.id,
              eloRating: newScore,
            });
            socket.emit("gameOver", { roomid: this.state.roomid });
            this.setState({
              playerWinStatus: `You lose versus ${this.state.enemy.username}, try harder next time...`,
            });
            console.log("kamu loser");

            this.setState({ openGameOverModal: true });
          } else {
            // berarti client ini yang win
            this.setState({ status: 1 });
            this.postHistory({
              playerOne: this.state.userData.id,
              playerTwo: this.state.enemy.id,
              status: 1, // playerOne yg win, 2 playerTwo yg win
            });
            // harusnya disini update user score
            // let newScore = EloRating(this.state.userData.eloRating, this.state.enemy.eloRating, true)
            let newScore = this.state.userData.eloRating + 10;
            this.updateScore({
              id: this.state.userData.id,
              eloRating: newScore,
            });
            console.log("kamu winner");
            socket.emit("gameOver", { roomid: this.state.roomid });
            this.setState({
              playerWinStatus: `Nice Job, You Win versus ${this.state.enemy.username}!!`,
            });
            this.setState({
              openGameOverModal: true,
              pauseTimerKita: true,
              pauseTimerEnemy: true,
            });
          }
        }
      }
      const losercolor = this.game.fen().split(" ")[1];
      console.log(losercolor, "move siapa ketika kita cek gameover");
    } else {
      console.log("its not your turn");
      return;
    }
  };

  handleTimerKita = () => {
    this.setState({ pauseTimerKita: true, pauseTimerEnemy: false });
  };

  handleTimerEnemy = () => {
    this.setState({ pauseTimerKita: false, pauseTimerEnemy: true });
  };

  changeTurnTimer = () => {
    this.setState({
      pauseTimerKita: !this.state.pauseTimerKita,
      pauseTimerEnemy: !this.state.pauseTimerEnemy,
    });
  };

  timeIsOut = () => {
    if (this.state.enemy.username) {
      let newScore = this.state.userData.eloRating - 10;
      this.updateScore({
        id: this.state.userData.id,
        eloRating: newScore,
      });
      socket.emit("enemyTimeout", { roomid: this.state.roomid });
    }
    this.setState({
      playerWinStatus: `You lose versus ${this.state.enemy.username}, try harder next time...`,
    });
    console.log("kamu loser");

    this.setState({ openGameOverModal: true });
  };

  updateScore = async (data) => {
    // data is obj with id and eloRating key
    try {
      const response = await axios({
        method: "put",
        url: `users/updatescore`,
        data: data,
        headers: { access_token: localStorage.getItem("access_token") },
      });
      console.log(response);
    } catch ({ response }) {
      console.log(response);
    }
  };

  postHistory = async (input) => {
    if (input.playerOne && input.playerTwo && input.status) {
      try {
        const response = await axios({
          method: "post",
          url: `histories/`,
          data: input,
          headers: { access_token: localStorage.getItem("access_token") },
        });
        console.log(response);
      } catch ({ response }) {
        console.log(response.data);
      }
    }
  };

  handleCloseGameOver = () => {
    this.setState({ openGameOverModal: false });
    this.props.history.push("/home", { ...this.state.userData });
  };

  onMouseOverSquare = (square) => {
    // get list of possible moves for this square
    let moves = this.game.moves({
      square: square,
      verbose: true,
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    let squaresToHighlight = [];
    for (var i = 0; i < moves.length; i++) {
      squaresToHighlight.push(moves[i].to);
    }

    this.highlightSquare(square, squaresToHighlight);
  };

  onMouseOutSquare = (square) => this.removeHighlightSquare(square);

  // central squares get diff dropSquareStyles
  onDragOverSquare = (square) => {
    this.setState({
      dropSquareStyle:
        square === "e4" || square === "d4" || square === "e5" || square === "d5"
          ? { backgroundColor: "cornFlowerBlue" }
          : { boxShadow: "inset 0 0 1px 4px rgb(255, 255, 0)" },
    });
  };

  onSquareRightClick = (square) =>
    this.setState({
      squareStyles: { [square]: { backgroundColor: "red" } },
    });

  render() {
    const { fen, dropSquareStyle, squareStyles } = this.state;

    return this.props.children({
      squareStyles,
      position: fen,
      onMouseOverSquare: this.onMouseOverSquare,
      onMouseOutSquare: this.onMouseOutSquare,
      onDrop: this.onDrop,
      dropSquareStyle,
      onDragOverSquare: this.onDragOverSquare,
      // onSquareClick: this.onSquareClick,
      onSquareRightClick: this.onSquareRightClick,
      color: this.state.color,
      roomid: this.state.roomid,
      openGameOverModal: this.state.openGameOverModal,
      handleCloseGameOver: this.handleCloseGameOver,
      playerWinStatus: this.state.playerWinStatus,
      userData: this.state.userData,
      enemy: this.state.enemy,
      pauseTimerKita: this.state.pauseTimerKita,
      pauseTimerEnemy: this.state.pauseTimerEnemy,
      timeIsOut: this.timeIsOut,
      openMatchmakingLoader: this.state.openMatchmakingLoader,
    });
  }
}

export default function WithMoveValidation(props) {
  // const param = useParams();
  const history = useHistory();

  const { state } = useLocation();
  console.log(state, "ini isi statee");
  // const { userData } = props;
  let { loc, roomid } = useParams();
  const [openEmoji, setOpenEmoji] = useState(false);
  const [emojiToShow, setEmojiToShow] = useState("");
  const [openEmojiEnemy, setOpenEmojiEnemy] = useState(false);
  const [emojiEnemyToShow, setEmojiEnemyToShow] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [boardWidth, setBoardWidth] = useState(0);

  // function back() {
  //   socket.emit("leaveRoom");
  //   history.push("/home", state);
  // }

  function calcBoardWidth(data) {
    if (data.screenWidth < 576) {
      setBoardWidth(data.screenWidth - 40);
      // setBoardWidth(2)
    } else if (data.screenWidth < 768) {
      setBoardWidth(450);
    } else if (data.screenWidth < 992) {
      setBoardWidth(560);
    } else {
      setBoardWidth(640);
    }
  }

  function sendEmot(input) {
    setEmojiToShow(input.emote);
    setOpenEmoji(true);
    socket.emit("sendEmote", { roomid: input.roomId, input: input.emote });
    setTimeout(() => {
      setOpenEmoji(false);
    }, 5000);
  }
  useEffect(() => {
    socket.on("enemyEmoji", (data) => {
      console.log(data, "masuk emoji enemy");
      setEmojiEnemyToShow(data.input);
      setOpenEmojiEnemy(true);
      setTimeout(() => {
        setOpenEmojiEnemy(false);
      }, 5000);
    });
  }, []);

  function onCopy() {
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 3000);
  }

  return (
    <div>
      <HumanVsHuman roomid={roomid} userData={state} history={history}>
        {({
          position,
          onDrop,
          onMouseOverSquare,
          onMouseOutSquare,
          squareStyles,
          dropSquareStyle,
          onDragOverSquare,
          // onSquareClick,
          onSquareRightClick,
          color,
          roomid,
          openGameOverModal,
          handleCloseGameOver,
          playerWinStatus,
          userData,
          enemy,
          pauseTimerKita,
          pauseTimerEnemy,
          timeIsOut,
          openMatchmakingLoader,
        }) => (
          <div style={{ color: "#999999" }}>
            <MatchmakingQueueDialogs
              openMatchmakingLoader={openMatchmakingLoader}
              userData={userData}
            />

            <div className="row m-2">
              <button className="btn btn-dark" onClick={timeIsOut}>
                <i class="fas fa-chevron-circle-left"></i>
              </button>
            </div>
            <div className="container">
              <div className="row justify-content-center">
                <div className="col align-items-center">
                  <Chessboard
                    id="humanVsHuman"
                    width={boardWidth}
                    calcWidth={calcBoardWidth}
                    position={position}
                    onDrop={onDrop}
                    orientation={color}
                    onMouseOverSquare={onMouseOverSquare}
                    onMouseOutSquare={onMouseOutSquare}
                    boardStyle={{
                      borderRadius: "5px",
                      boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
                    }}
                    squareStyles={squareStyles}
                    dropSquareStyle={dropSquareStyle}
                    onDragOverSquare={onDragOverSquare}
                    // onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                  />
                </div>
                <div className="col">
                  <div className="row">
                    {/* {roomid !== "matchmaking" ? (
                      <CopyToClipboard text={roomid} onCopy={onCopy}>
                        <span>Room ID: {roomid}</span>
                      </CopyToClipboard>
                    ) : (
                      <></>
                    )}
                    {showCopied ? (
                      <span style={{ color: "green" }}>&nbsp;Copied.</span>
                    ) : null} */}

                    <div className="col-10 col-md-8 col-lg-12 mb-3">
                      <div
                        className="card"
                        style={{
                          height: "150px",
                          backgroundColor: "#262421",
                          position: "relative",
                        }}
                      >
                        {openEmojiEnemy ? (
                          <img
                            src={emojiEnemyToShow}
                            style={{
                              position: "absolute",
                              bottom: "-10px",
                              zIndex: "100",
                              borderRadius: "40px",
                            }}
                            alt="smile"
                            width="80"
                          />
                        ) : (
                          <> </>
                        )}
                        {enemy.username ? (
                          <div className="d-flex justify-content-around">
                            <div className="col-4 p-3 justify-content-center">
                              <img
                                src={enemy.pictureUrl}
                                className="img-thumbnail bg-dark border-dark"
                                alt=""
                                width="120px"
                                height="120px"
                              />
                            </div>
                            <div className="col-8 p-3">
                              <h3 className="text-gray">{enemy.username}</h3>
                              <h5 className="gray">
                                <i class="fas fa-chess-pawn"></i>
                                &nbsp;{enemy.eloRating}
                              </h5>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-around">
                            <div className="col-4 p-3 justify-content-center"></div>
                            <div className="col-8 p-3">
                              <h3 className="text-gray">
                                Waiting for your opponent
                              </h3>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ position: "relative" }}>
                    <div className="col align-items-start">
                      <VidCam
                        roomid={roomid}
                        userData={userData}
                        enemy={enemy}
                        color={color}
                      />
                    </div>
                    <div className="col justify-content-center my-auto">
                      <div className="timer-wrapper h2 row">
                        <div className="col-8">
                          <Timer
                            durationInSeconds={600}
                            formatted={true}
                            isPaused={pauseTimerEnemy}
                            onFinish={timeIsOut}
                          />
                        </div>
                        {pauseTimerEnemy ? (
                          <>
                            <div className="col-2">
                              <span className="">
                                <i class="fas fa-circle text-dark"></i>
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="col-2">
                              <span className="">
                                <i class="fas fa-circle text-success"></i>
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      <hr
                        style={{
                          height: "2px",
                          width: "50%",
                          borderWidth: 0,
                          color: "grey",
                          backgroundColor: "grey",
                        }}
                      />
                      <div className="timer-wrapper h2 row">
                        <div className="col-8">
                          <Timer
                            durationInSeconds={600}
                            formatted={true}
                            isPaused={pauseTimerKita}
                          />
                        </div>
                        {pauseTimerEnemy ? (
                          <>
                            <div className="col-2">
                              <i class="fas fa-circle text-success"></i>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="col-2">
                              <i class="fas fa-circle text-dark"></i>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row justify-content-start">
                    <div className="col-10 col-md-8 col-lg-12 my-3">
                      <div
                        className="card"
                        style={{
                          height: "150px",
                          backgroundColor: "#262421",
                          position: "relative",
                        }}
                      >
                        {openEmoji ? (
                          <img
                            src={emojiToShow}
                            style={{
                              position: "absolute",
                              top: "-10px",
                              zIndex: "100",
                              borderRadius: "40px",
                            }}
                            alt="smile"
                            width="80"
                          />
                        ) : (
                          <> </>
                        )}
                        <div className="d-flex justify-content-around">
                          <div className="col-4 p-3 justify-content-center">
                            <img
                              src={state.pictureUrl}
                              className="img-thumbnail bg-dark border-dark"
                              alt=""
                              width="120px"
                              height="120px"
                            />
                          </div>
                          <div className="col-8 p-3">
                            <h3 className="text-gray">{state.username}</h3>
                            <h5 className="gray">
                              <i class="fas fa-chess-pawn"></i>
                              &nbsp;{state.eloRating}
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="btn-group dropup">
                        <button
                          type="button"
                          className="btn btn-dark dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fas fa-paper-plane" />
                          <span>&nbsp; Send Emoji</span>
                        </button>
                        <div className="dropdown-menu bg-dark">
                          <div
                            className="row bg-dark m-3"
                            style={{ width: "450px" }}
                          >
                            <div className="col-4">
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  sendEmot({ emote: hugemoji, roomId: roomid })
                                }
                              >
                                <img src={hugemoji} alt="hugemoji" width="50" />
                              </button>
                              {/* client/src/pages/Dashboard.js */}
                            </div>
                            <div className="col-4">
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  sendEmot({ emote: mindblown, roomId: roomid })
                                }
                              >
                                <img
                                  src={mindblown}
                                  alt="mindblown"
                                  width="50"
                                />
                              </button>
                            </div>
                            <div className="col-4">
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  sendEmot({ emote: sad, roomId: roomid })
                                }
                              >
                                <img src={sad} alt="sad" width="50" />
                              </button>
                            </div>
                            <div className="col-4">
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  sendEmot({ emote: sleep, roomId: roomid })
                                }
                              >
                                <img src={sleep} alt="sleep" width="50" />
                              </button>
                            </div>
                            <div className="col-4">
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  sendEmot({ emote: sweat, roomId: roomid })
                                }
                              >
                                <img src={sweat} alt="sweat" width="50" />
                              </button>
                            </div>
                            <div className="col-4">
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  sendEmot({ emote: wink, roomId: roomid })
                                }
                              >
                                <img src={wink} alt="wink" width="50" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-8">
                      {roomid !== "matchmaking" ? (
                        <CopyToClipboard text={roomid} onCopy={onCopy}>
                          <button className="btn btn-dark float-right">
                            Room ID : {roomid}
                          </button>
                          {/* <span>Room ID: {roomid}</span> */}
                        </CopyToClipboard>
                      ) : (
                        <></>
                      )}
                      {showCopied ? (
                        <span
                          className="text-center"
                          style={{ color: "green" }}
                        >
                          &nbsp;Copied.
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <Dialog
                  open={openGameOverModal}
                  onClose={handleCloseGameOver}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                  PaperProps={{
                    style: {
                      backgroundColor: "#2d2b28",
                      color: "grey",
                    },
                  }}
                >
                  <DialogTitle id="alert-dialog-title">{`${playerWinStatus}`}</DialogTitle>
                  {/* <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {playerWinStatus}
                </DialogContentText>
              </DialogContent> */}
                  <DialogActions>
                    <Button
                      onClick={handleCloseGameOver}
                      color="primary"
                      autoFocus
                    >
                      Back to Lobby
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </HumanVsHuman>
    </div>
  );
}

const squareStyling = ({ pieceSquare, history }) => {
  const sourceSquare = history.length && history[history.length - 1].from;
  const targetSquare = history.length && history[history.length - 1].to;

  return {
    [pieceSquare]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
    ...(history.length && {
      [sourceSquare]: {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
      },
    }),
    ...(history.length && {
      [targetSquare]: {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
      },
    }),
  };
};
