import { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../../context/Socket";
import { usePeer } from "../../context/Peer";

const Room = () => {
  const [remoteEmailId, setRemoteEmailId] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    acceptAnswer,
    remoteStream,
    sendStream,
  } = usePeer();

  useEffect(() => {
    const handleUserJoined = async ({ emailId }) => {
      setRemoteEmailId(emailId);
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
    };

    const handleIncommingCall = async ({ from, offer }) => {
      setRemoteEmailId(from);
      const answer = await createAnswer(offer);
      socket.emit("call-accepted", { answer, emailId: from });
    };

    const handleAcceptedCall = async ({ answer }) => {
      await acceptAnswer(answer);
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleAcceptedCall);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleAcceptedCall);
    };
  }, [socket, createOffer, createAnswer, acceptAnswer]);

  useEffect(() => {
    let currentStream = null;

    const getUserMediaStream = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      currentStream = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    };

    getUserMediaStream();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const handleNegotiationneeded = async () => {
      if (remoteEmailId) {
        const offer = await createOffer();
        socket.emit("call-user", { emailId: remoteEmailId, offer });
      }
    };

    peer.addEventListener("negotiationneeded", handleNegotiationneeded);

    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiationneeded);
    };
  }, [peer, socket, createOffer, remoteEmailId]);

  const handleSendMyStream = useCallback(() => {
    if (stream) {
      sendStream(stream);
    }
  }, [stream, sendStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div>
      <h2>Room Page</h2>
      <h3>Connected to: {remoteEmailId || "Waiting for remote user..."}</h3>
      <button onClick={handleSendMyStream} disabled={!stream}>
        Send my Stream
      </button>
      <div>
        <h4>My Video</h4>
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          style={{ width: "400px", height: "300px", border: "2px solid blue" }}
        />
      </div>
      <div>
        <h4>Remote Video</h4>
        <video
          ref={remoteVideoRef}
          playsInline
          autoPlay
          style={{
            width: "400px",
            height: "300px",
            border: "2px solid green",
          }}
        />
      </div>
    </div>
  );
};

export default Room;
