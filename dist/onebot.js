"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@rocket.chat/sdk");
const HOST = 'rocket.iaman.app';
const USER = 'onebot';
const PASS = 'onebot';
const BOTNAME = 'onebot';
const SSL = true;
const ROOMS = ['general'];
let myuserid;
const processMessages = (err, message, messageOptions) => __awaiter(void 0, void 0, void 0, function* () {
    if (!err) {
        if (message.u._id === myuserid)
            return;
        const roomname = yield sdk_1.driver.getRoomName(message.rid);
        console.log(message.msg.toLowerCase());
        if (message.msg.toLowerCase().startsWith(`@${BOTNAME}`)) {
            const response = `${message.u.username}, how can ${BOTNAME} help you with ${message.msg.substr(BOTNAME.length + 1)}`;
            const sentmsg = yield sdk_1.driver.sendToRoom(response, roomname);
        }
    }
});
const runbot = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield sdk_1.driver.connect({ host: HOST, useSsl: SSL });
    myuserid = yield sdk_1.driver.login({ username: USER, password: PASS });
    const roomsJoined = yield sdk_1.driver.joinRooms(ROOMS);
    console.log('joined rooms');
    const subscribed = yield sdk_1.driver.subscribeToMessages();
    console.log('subscribed');
    const msgloop = yield sdk_1.driver.reactToMessages(processMessages);
    console.log('connected and waiting for messages');
    const sent = yield sdk_1.driver.sendToRoom(`${BOTNAME} is listening ...`, ROOMS[0]);
    console.log('Greeting message sent');
});
runbot();
//# sourceMappingURL=onebot.js.map