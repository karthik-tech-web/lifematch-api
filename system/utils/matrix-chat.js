const sdk = require('matrix-js-sdk');
const axios = require('axios');
const jwtAuth = require('./jwt-auth');
const stringConfig = require('./config');

const serverURL = ' https://elementio.hydrameet.net/_matrix/client/r0';
const baseURL = ' https://elementio.hydrameet.net';

const matrixSync = async(client) => new Promise(async(resolve, reject) => {
    client.once('sync', (state, prevState, res) => {
        if (state === 'PREPARED') {
            resolve(state);
        } else {
            console.log(state);
            process.exit(1);
        }
    });
});

const createMatrixclient = async(sender, receiver) => new Promise(async(resolve, reject) => {
    try {
        const clientMod = await sdk.createClient('https://elementio.hydrameet.net');
        const payload = { sub: sender._id, name: `${sender.displayName} Name`, displayname: `${sender.displayName} DIS` };
        const modToken = await jwtAuth.tokenCreation(payload, stringConfig.chatSecret);
        await clientMod.login('org.matrix.login.jwt', { token: modToken });
        await clientMod.startClient();
        await matrixSync(clientMod);
        const receiverId = `@${receiver._id}:elementio.hydrameet.net`;
        const userArray = [`@${sender._id}:elementio.hydrameet.net`, receiverId];
        let roomId = null;
        console.log('-=======clientMod.store.rooms=====>', clientMod.store.rooms);
        Object.keys(clientMod.store.rooms).forEach((roomID) => {
            clientMod.getRoom(roomID).timeline.forEach((data) => {
                const { event } = data;
                if (event.type === 'm.room.member' && event.content && event.content.is_direct === true && userArray[event.sender] !== -1 && userArray[event.state_key] !== -1) {
                    roomId = event.room_id;
                }
            });
            const getRoomDetails = clientMod.getRoom(roomID);
            clientMod.getRoom(roomID).events.forEach((data) => {
                console.log('=======data=======>', data);
            });
            console.log('=======getRoomDetails=========>', getRoomDetails);
            console.log('=======getRoomDetails=members========>', getRoomDetails.members);
            // return;
        });
        // return;
        if (!roomId) {
            const chatRoom = await clientMod.createRoom({
                preset: 'trusted_private_chat',
                invite: [
                    receiverId,
                ],
                name: 'new test',
                is_direct: true,
            });
            roomId = chatRoom.room_id;
        }
        const result = {
            client: clientMod,
            roomId,
        };
        console.log('========roomId===>', roomId);
        resolve(result);
    } catch (err) {
        reject(err);
    }
});

const sendMessage = async(client, roomId, content) => new Promise(async(resolve) => {
    await client.sendEvent(roomId, 'm.room.message', content, '').then((res) => {
        resolve(res);
        // message sent successfully
    }).catch((err) => {
        console.log(err);
    });
});

const registerUserInMatrix = async(user, displayname) => new Promise(async(resolve, reject) => {
    try {
        const newpass = (Math.random() + 1).toString(36).substring(7);
        const clientMod = await sdk.createClient('https://elementio.hydrameet.net');
        const muser = await clientMod.registerRequest({
            username: user,
            password: newpass,
            auth: { type: 'm.login.dummy' },
        }, '', (err, data) => {
            if (!err) {
                axios.put(`https://elementio.hydrameet.net/_matrix/client/r0/profile/${data.user_id}/displayname?access_token=${data.access_token}`, { displayname }).then((err, data) => {});
                resolve(data.user_id);
            }
        });
    } catch (err) {
        resolve(err.errcode);
    }
});

module.exports = {
    createMatrixclient,
    registerUserInMatrix,
    sendMessage,
};