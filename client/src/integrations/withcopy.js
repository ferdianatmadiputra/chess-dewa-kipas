import React, { Component } from "react";
import PropTypes from "prop-types";
import Chess from "chess.js"; // import Chess from  "chess.js"(default) if recieving an error about new Chess() not being a constructor
import Chessboard from "chessboardjsx";
import axios from "../api/axios";
import MatchmakingQueueDialogs from '../components/loaderMatchmaking'
import { socket, ENDPOINT } from "../connections/socketio.js";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import VidCam from "../pages/Camera";
import { Timer } from "react-countdown-clock-timer";

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
    console.log(this.props.roomid, "<<<<<<<<<< ini yang di class");
    // console.log(this.props.userData, "ini props userdata di class component");
    // console.log(this.state.userData, "ini state userdata di class component");
    if (this.state.roomid === "new") {
      let uuid = uuidv4();
      this.setState({ roomid: uuid });
      socket.emit("create-room", {
        roomid: uuid,
        playerData: this.state.userData,
      });
      console.log(
        this.state.roomid,
        "<<<<<<<<<<<<<<<<<<<< DI COMPONENT DID MOUNT"
      );
    } else if (this.state.roomid === "matchmaking") {
      this.setState({openMatchmakingLoader: true})
    }else {
      this.setState({ color: "black" });
      socket.emit("join-room", {
        roomid: this.state.roomid,
        playerData: this.state.userData,
      });
    }
    this.game = new Chess();

    socket.on("matchStart", (dataRoom) => {
      console.log("matchstart dapet")
      this.setState({openMatchmakingLoader: false})
      if (this.state.userData.id === dataRoom.playerOne.id){
        this.setState({ color: "white", roomid: dataRoom.roomid });
        this.setState({ enemy: dataRoom.playerTwo });
        this.handleTimerEnemy();
      } else {
        this.setState({ color: "black", roomid: dataRoom.roomid });
        this.setState({ enemy: dataRoom.playerOne });
        this.handleTimerKita();
      }
    })
    

    socket.on("fullroom", (dataRoom) => {
      // console.log("fullroom", dataRoom);
      // console.log(this.state.color);
      if (this.state.color === "white") {
        this.setState({ enemy: dataRoom.selectedRoom.playerTwo });
        this.handleTimerEnemy();
        console.log(this.state.enemy, "ini enemyku di white");
      } else {
        this.setState({ enemy: dataRoom.selectedRoom.playerOne });
        this.handleTimerKita();
        console.log(this.state.enemy, "ini enemyku di black");
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
      console.log("kamu loser");
      this.setState({ openGameOverModal: true });
      console.log("dapat socket you lose");
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
      })
      console.log("kamu winner");
      this.setState({
        playerWinStatus: `Nice Job, You Win versus ${this.state.enemy.username}!!`,
      });
      this.setState({ openGameOverModal: true });
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
    return (enemyRating+(400*status))/10
  }

  onDrop = ({ sourceSquare, targetSquare }) => {
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
        this.postHistory({
          playerOne: this.state.userData.id,
          playerTwo: this.state.enemy.id,
          status: 3,
        });
        this.setState({
          playerWinStatus: `Stalemate, You get draw versus ${this.state.enemy.username}!!`,
        });
        this.setState({ openGameOverModal: true });
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
              status: 1,
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
            this.setState({ openGameOverModal: true });
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
    let newScore = this.state.userData.eloRating - 10;
    this.updateScore({
      id: this.state.userData.id,
      eloRating: newScore,
    });
    socket.emit("enemyTimeout", { roomid: this.state.roomid });
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
        url: `${ENDPOINT}users/updatescore`,
        data: data,
        headers: { access_token: localStorage.getItem("access_token") },
      });
      console.log(response);
    } catch ({ response }) {
      console.log(response);
    }
  };

  postHistory = async (input) => {
    try {
      const response = await axios({
        method: "post",
        url: `${ENDPOINT}histories/`,
        data: input,
        headers: { access_token: localStorage.getItem("access_token") },
      });
      console.log(response);
    } catch ({ response }) {
      console.log(response.data);
    }
  };

  handleCloseGameOver = () => {
    this.setState({ openGameOverModal: false });
    this.props.history.push("/home", {...this.state.userData});
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
      openMatchmakingLoader: this.state.openMatchmakingLoader
    });
  }
}

export default function WithMoveValidation(props) {
  const param = useParams();
  const history = useHistory();
  const { userData } = props;

  return (
    <div>
      <HumanVsHuman roomid={param.roomid} userData={userData} history={history}>
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
          openMatchmakingLoader
        }) => (
          <div style={{color: "#999999"}}>
            <MatchmakingQueueDialogs
              openMatchmakingLoader={openMatchmakingLoader}
              userData={userData}
            />
            <div>room ID: {roomid}</div>
            <Chessboard
              id="humanVsHuman"
              width={540}
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
            <VidCam
              roomid={roomid}
              userData={userData}
              enemy={enemy}
              color={color}
            />
            <div className="timer-container">
              <Timer
                durationInSeconds={20}
                formatted={true}
                isPaused={pauseTimerKita}
                onFinish={timeIsOut}
              />
              <Timer
                durationInSeconds={20}
                formatted={true}
                isPaused={pauseTimerEnemy}
              />
            </div>

            <Dialog
              open={openGameOverModal}
              onClose={handleCloseGameOver}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{`${playerWinStatus}`}</DialogTitle>
              {/* <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {playerWinStatus}
              </DialogContentText>
            </DialogContent> */}
              <DialogActions>
                <Button onClick={handleCloseGameOver} color="primary" autoFocus>
                  Back to Lobby
                </Button>
              </DialogActions>
            </Dialog>
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
