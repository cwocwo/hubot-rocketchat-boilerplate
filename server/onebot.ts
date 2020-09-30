import { driver } from '@rocket.chat/sdk'
// customize the following with your server and BOT account information
const HOST = 'rocket.iaman.app'
const USER = 'onebot'
const PASS = 'onebot'
const BOTNAME = 'onebot' // name  bot response to
const SSL = true // server uses https ?
const ROOMS = ['general']

let myuserid: any
// this simple bot does not handle errors, different message types, server resets
// and other production situations

// callback for incoming messages filter and processing
const processMessages = async (err, message, messageOptions) => {
  if (!err) {
    // filter our own message
    if (message.u._id === myuserid) return
    // can filter further based on message.rid
    const roomname = await driver.getRoomName(message.rid)
    console.log(message.msg.toLowerCase())
    if (message.msg.toLowerCase().startsWith(`@${BOTNAME}`)) {
      const response = `${message.u.username
      }, how can ${BOTNAME} help you with ${
        message.msg.substr(BOTNAME.length + 1)}`
      const sentmsg = await driver.sendToRoom(response, roomname)
    }
  }
}

const runbot = async () => {
  const conn = await driver.connect({ host: HOST, useSsl: SSL })
  myuserid = await driver.login({ username: USER, password: PASS })
  const roomsJoined = await driver.joinRooms(ROOMS)
  console.log('joined rooms')

  // set up subscriptions - rooms we are interested in listening to
  const subscribed = await driver.subscribeToMessages()
  console.log('subscribed')

  // connect the processMessages callback
  const msgloop = await driver.reactToMessages(processMessages)
  console.log('connected and waiting for messages')

  // when a message is created in one of the ROOMS, we
  // receive it in the processMesssages callback

  // greets from the first room in ROOMS
  const sent = await driver.sendToRoom(`${BOTNAME} is listening ...`, ROOMS[0])
  console.log('Greeting message sent')
}

// const runbot = async () => {
//   driver.connect({ host: HOST, useSsl: SSL }).then(() => function () {
//     console.log('connected')
//   }).then(() => function () {
//     driver.connect({ host: HOST, useSsl: SSL })
//   }).then(() => function () {
//     driver.joinRooms(ROOMS)
//     console.log('joined rooms')
//   })
//     .then(() => function () {
//       // set up subscriptions - rooms we are interested in listening to
//       driver.subscribeToMessages()
//       console.log('subscribed ')
//     })
//     .then(() => function () {
//       // connect the processMessages callback
//       driver.reactToMessages(processMessages)
//       console.log('connected and waiting for messages')
//     })
//     .then(() => function () {
//       // when a message is created in one of the ROOMS, we
//       // receive it in the processMesssages callback

//       // greets from the first room in ROOMS
//       driver.sendToRoom(`${BOTNAME} is listening ...`, ROOMS[0])
//       console.log('Greeting message sent')
//     }).catch
// }

runbot()
