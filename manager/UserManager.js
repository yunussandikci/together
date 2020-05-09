class User {

}

class UserManager {

    constructor() {
        this.rooms = {}
    }

    addUser(room, socketId) {
        if (this.rooms[room] == null) {
            this.rooms[room] = []
        }
        this.rooms[room][socketId] = new User();
    }

    removeUser(socketId) {
        for (let i = 0; i < Object.keys(this.rooms).length; i++) {
            const room = this.rooms[Object.keys(this.rooms)[i]];
            delete room[socketId];
        }
    }

    getRoomSockets(room) {
        return Object.keys(this.rooms[room]);
    }

    getSocketRoom(socketId) {
        for (let i = 0; i < Object.keys(this.rooms).length; i++) {
            const room = this.rooms[Object.keys(this.rooms)[i]];
            if(room.indexOf(socketId) != null) {
                return Object.keys(this.rooms)[i]
            }
        }
    }

}

module.exports.UserManager = UserManager;
