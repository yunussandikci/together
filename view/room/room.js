let localStream;
let socket = io();
let peerConnections = {}
localVideo = document.getElementById('video');

navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(function (stream) {
    localStream = stream;
    getOrCreateVideo(socket.id, stream, true)
    socket.emit("room", getRoomKey());
})

socket.on("startPeering", function (sockets) {
    for (let i = 0; i < sockets.length; i++) {
        const peerConnection = getOrCreatePeering(sockets[i]);
        peerConnection.createOffer().then(function (description) {
            peerConnection.setLocalDescription(description).then(function () {
                socket.emit("sdp", sockets[i], peerConnection.localDescription);
            });
        });
    }
})

socket.on("deletePeering", function (socketId) {
    deletePeering(socketId)
    deleteVideo(socketId)
})

socket.on('sdp', function (fromSocket, data) {
    const peerConnection = getOrCreatePeering(fromSocket);
    peerConnection.setRemoteDescription(new RTCSessionDescription(data)).then(function () {
        if (data.type === "offer") {
            peerConnection.createAnswer().then(function (description) {
                peerConnection.setLocalDescription(description).then(function () {
                    socket.emit("sdp", fromSocket, peerConnection.localDescription)
                });
            });
        }
    })
});

socket.on('ice', function (fromSocket, data) {
    const peerConnection = getOrCreatePeering(fromSocket);
    peerConnection.addIceCandidate(new RTCIceCandidate(data));
});

function deletePeering(socketId) {
    delete peerConnections[socketId]
}

function getOrCreatePeering(socketId) {
    if (peerConnections[socketId] == null) {
        let peerConnection = peerConnections[socketId];
        if (peerConnection == null) {
            peerConnection = new RTCPeerConnection({'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]});
            peerConnection.addStream(localStream);
            peerConnection.ontrack = function (event) {
                getOrCreateVideo(socketId, event.streams[0], false)
            }
            peerConnection.onicecandidate = function (event) {
                if (event.candidate != null) {
                    socket.emit("ice", socketId, event.candidate);
                }
            };
            peerConnections[socketId] = peerConnection;
            return peerConnection;
        }
    } else {
        return peerConnections[socketId]
    }
}

function getRoomKey() {
    return new URLSearchParams(window.location.search).get("key");
}

function getOrCreateVideo(socketId, stream, isMuted) {
    let socketVideo = document.getElementById("video-" + socketId);
    if (socketVideo == null) {
        socketVideo = document.createElement("video");
        let videoContainer = document.getElementsByClassName("video-container")[0];
        socketVideo.id = ("video-" + socketId)
        socketVideo.autoplay = true;
        socketVideo.muted = isMuted
        //video div
        var videoItem = document.createElement("DIV");
        videoItem.className="video-item";
        videoItem.appendChild(socketVideo);
        videoContainer.appendChild(videoItem);
        //video div
        onVideoCountChange()
    }
    socketVideo.srcObject = stream;
}

function deleteVideo(socketId) {
    let socketVideo = document.getElementById("video-" + socketId);
    socketVideo.parentNode.removeChild(socketVideo);
    onVideoCountChange()
}

function onVideoCountChange() {
    videoItem = document.getElementsByClassName("video-item");
    videoWidth = videoItem.length;

    let height = document.body.clientHeight;
    let videoHeight=100;

    if(videoItem.length>=2){
      videoHeight=40;
    }
    if(videoItem.length>4){
      videoHeight=24;
    }

    if(videoItem.length === 1) {
        videoItem[0].style.height = "100%";
    } else {
        for(let i=0;i<videoItem.length; i++) {
            videoItem[i].style.height = videoHeight+"%";
        }
    }
}

window.onload = function () {
    Particles.init({selector: '.background', connectParticles: true, color: ['#86B7FF']});
};
