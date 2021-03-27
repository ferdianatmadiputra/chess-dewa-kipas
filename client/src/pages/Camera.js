import React, { useEffect, useState, useRef } from "react";
import { socket } from "../connections/socketio";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid gray;
  width: 100%;
  max-width: 400px;
`;

function WebRtc(props) {
  // console.log(props);
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [isCalled, setisCalled] = useState(false);
  const [callerUser, setCallerUser] = useState("");

  const userVideo = useRef();
  const partnerVideo = useRef();
  const socketVid = useRef();

  useEffect(() => {
    socketVid.current = socket;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
        // return
        // })
        // .then(() => {
        //   console.log(props.color, 'ini color di useEffect awal')
        //   if (props.color === 'black') {
        //     console.log(stream, 'ini stream sebelum nelpon')
        //     callPeer(props.enemy.id)
        // }
      });

    socketVid.current.on("yourID", (id) => {
      setYourID(id);
    });

    socketVid.current.on("allUsers", (users) => {
      setUsers(users);
    });

    socketVid.current.on("hey", (data) => {
      setisCalled(true);
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
      setCallerUser(data.callerUsername);
      // console.log(stream, 'ini isi stream ketika hey dan sebelum accept call')
    });
  }, []);

  function callPeer(id) {
    setisCalled(true);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socketVid.current.emit("callUser", {
        roomid: props.roomid,
        userToCall: id,
        signalData: data,
        from: props.userData.id,
        callerUsername: props.userData.username,
      });
    });

    peer.on("stream", (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socketVid.current.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
  }

  function acceptCall() {
    setReceivingCall(false);
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socketVid.current.emit("acceptCall", {
        signal: data,
        roomid: props.roomid,
        to: caller,
      });
    });

    peer.on("stream", (stream) => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  }

  let UserVideo;
  if (stream) {
    UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = <Video playsInline ref={partnerVideo} autoPlay />;
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div>
        <h5>{callerUser} is asking you to open cam</h5>
        <button onClick={acceptCall} className="btn btn-dark">
          Accept
        </button>
      </div>
    );
  }
  return (
    <Container>
      <div className="row justify-content-start">
        <div className="col-10">{PartnerVideo}</div>
        <div className="col-10">{UserVideo}</div>
      </div>
      {isCalled ? (
        <> </>
      ) : (
        <div className="row justify-content-start">
          <div className="col-10">
            <button
              onClick={() => callPeer(props.enemy.id)}
              className="btn btn-dark"
            >
              Ask your opponent to open cam
            </button>
          </div>
        </div>
      )}
      <Row>{incomingCall}</Row>
    </Container>
  );
}

export default WebRtc;
