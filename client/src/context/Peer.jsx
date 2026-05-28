import { useCallback, useState, useEffect, useContext, useMemo, createContext } from "react";
import PropTypes from "prop-types";

const PeerContext = createContext(null);

export const usePeer = () => {
  return useContext(PeerContext);
};

const PeerProvider = ({ children }) => {
  const [remoteStream, setRemoteStream] = useState();

  const peer = useMemo(() => {
    return new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });
  }, []);

  const createOffer = useCallback(async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  }, [peer]);

  const createAnswer = useCallback(
    async (offer) => {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(new RTCSessionDescription(answer));
      return answer;
    },
    [peer],
  );

  const acceptAnswer = useCallback(
    async (answer) => {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    },
    [peer],
  );

  const handleAddRemoteStream = useCallback((ev) => {
    setRemoteStream(ev.streams[0]);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleAddRemoteStream);

    return () => {
      peer.removeEventListener("track", handleAddRemoteStream);
    };
  }, [peer, handleAddRemoteStream]);

  const sendStream = useCallback(
    (stream) => {
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    },
    [peer],
  );

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        acceptAnswer,
        remoteStream,
        sendStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

PeerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PeerProvider;
