const addMessage = ({ name, room, newMessage, prevMessageList }) => {
  prevMessageList = messages.push({ name: name, room: room, message: newMessage })
  console.log(messages)

  return { messageList: messages }
}

module.exports = { addMessage }
