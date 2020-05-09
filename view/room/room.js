let localStream;
let socket = io();
let peerConnections = {}
localVideo = document.getElementById('video');

navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(function (stream) {
    localStream = stream;
    getOrCreateVideo(socket.id, stream)
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
                getOrCreateVideo(socketId, event.streams[0])
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

function getOrCreateVideo(socketId, stream) {
    let socketVideo = document.getElementById("video-" + socketId);
    if (socketVideo == null) {
        socketVideo = document.createElement("video");
        let videoContainer = document.getElementsByClassName("video-container")[0];
        socketVideo.id = ("video-" + socketId)
        socketVideo.autoplay = true;
        videoContainer.appendChild(socketVideo)
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
    videos = document.querySelectorAll("video");
    videoWidth = videos.length;

    if(videos.length === 1) {
        videos[0].style.width = "cal"
    } else {
        for(let i=0;i<videos.length; i++) {
            videos[i].style.width = "calc((90%/" + videos.length + ") - (" + videos.length + "* 10px))";
        }
    }
}

window.onload = function () {
    Particles.init({selector: '.background', connectParticles: true, color: ['#86B7FF']});
};
