const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const route = require("./route")
const { addUser, disconnectUser } = require("./users")

const app = express()

app.use(cors({ origin: "*" }))
app.use(route)

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

let messages = []

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    socket.join(room)
    console.log(`join user: ${name} in room: ${room}`)

    const { userList } = addUser({ name, room })

    socket.emit("users", { users: userList.filter((u) => u.room === room) })
    socket.emit(
      "message",
      messages.filter((m) => m.room === room)
    )
    socket.broadcast.to(room).emit("users", { users: userList.filter((u) => u.room === room) })

    socket.on("send-message", (data) => {
      messages.push({ room: data.room, user: data.name, message: data.message })
      socket.emit("message", [{ room: data.room, user: data.name, message: data.message }])
      socket.broadcast.to(room).emit("message", [{ room: data.room, user: data.name, message: data.message }])
    })
  })

  socket.on("disconnect-user", ({ name, room }) => {
    const { userList } = disconnectUser(name, room)
    socket.broadcast.to(room).emit("users", { users: userList.filter((u) => u.room === room) })
    console.log(`disconnect ${name} from room ${room}`)
  })
})

server.listen(5000, () => {
  console.log("Example app listening on port 5000")
})
