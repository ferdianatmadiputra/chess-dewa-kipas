import { useHistory, useLocation, useParams } from "react-router-dom";
import ChessVSBot from "./ChessVSBot";
import WithMoveValidation from "../integrations/WithMoveValidation";
import angry from "../images/angry.gif";
import smile from "../images/smile.gif";
import love from "../images/love.gif";
import { socket } from "../connections/socketio";
import Test from "../components/Test";
import { Modal } from "@material-ui/core";
import { useState } from "react";

export default function Dashboard() {
  let { loc, roomid } = useParams();
  const { state } = useLocation();
  const [openEmoji, setOpenEmoji] = useState(false);
  const [emojiToShow, setEmojiToShow] = useState("");
  // console.log(roomid, "ini room id");
  const history = useHistory();

  function back() {
    socket.emit("leave-room");
    history.push("/home", state);
  }

  function sendEmot(input) {
    setEmojiToShow(input);
    setOpenEmoji(true);
    socket.emit("sendEmote", input);
    setTimeout(() => {
      setOpenEmoji(false);
    }, 5000);
  }

  socket.on("", (msg) => {
    setOpenEmoji(true);
  });

  return (
    <div className="row">
      <div className="col-12">
        <button className="btn btn-primary" onClick={() => back()}>
          Back
        </button>
        <div className="row">
          <div className="col-12 ">
            <div className="row" style={{ height: "90vh" }}>
              <div
                className="col-8"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {loc === "player" ? (
                  <div style={boardsContainer}>
                    <WithMoveValidation roomid={roomid} userData={state} />
                  </div>
                ) : (
                  <ChessVSBot userData={state} />
                )}
              </div>
              <div className="col-4 bg-danger">
                <div className="row">
                  <h2 className="text-center">Chatbox</h2>
                  {/* <Modal
                    open={open}
                    onClose={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    closeAfterTransition={open}
                  >
                    <div>Testing</div>
                  </Modal> */}
                  {openEmoji ? (
                    <img src={emojiToShow} alt="smile" width="100" />
                  ) : (
                    <> </>
                  )}
                </div>
                <div
                  className="row bg-secondary"
                  style={{ height: "80%" }}
                ></div>
                <div className="row">
                  <div className="col-10">
                    <div className="btn-group dropup">
                      <button
                        type="button"
                        className="btn btn-secondary dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="fas fa-paper-plane"> Send</i>
                      </button>
                      <div className="dropdown-menu">
                        <div className="row" style={{ width: "420px" }}>
                          <div className="col-4">
                            <button
                              className="dropdown-item"
                              onClick={() => sendEmot(angry)}
                            >
                              <img src={angry} alt="angry" width="50" />
                            </button>
                            {/* client/src/pages/Dashboard.js */}
                          </div>
                          <div className="col-4">
                            <button
                              className="dropdown-item"
                              onClick={() => sendEmot(smile)}
                            >
                              <img src={smile} alt="smile" width="50" />
                            </button>
                          </div>
                          <div className="col-4">
                            <button
                              className="dropdown-item"
                              onClick={() => sendEmot(love)}
                            >
                              <img src={love} alt="love" width="50" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-2">
                    <button className="btn btn-primary">
                      <i className="fas fa-paper-plane"> Send</i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const boardsContainer = {
  marginTop: 30,
  marginBottom: 50,
};
