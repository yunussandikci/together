createButton = document.getElementById("createRoom");
joinButton = document.getElementById("joinRoom");
roomKeyInput = document.getElementById("roomKey");
createButton.onclick = function () {
    window.location.href = '/room?key=' + create_UUID();
}

joinButton.onclick = function () {
    if (roomKeyInput.value !== "") {
        window.location.href = '/room?key=' + roomKeyInput.value;
    }
}

function create_UUID() {
    var dt = new Date().getTime();
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
