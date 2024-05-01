// don't change the prewritten code
// change the code for 'join' event

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { messageModel } from './message.schema.js';

export const app = express();
app.use(cors());

export const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Connection made.");

    socket.on("join", async (data) => {
        try {
            // Emit a welcome message to the user who joined
            socket.emit("message", { text: `Welcome, ${data.username}!` });

            // Retrieve previous messages from the database based on timestamp range
            const previousMessages = await messageModel.find({
                room: data.room,
                timestamp: { $gte: new Date(data.startTime), $lte: new Date(data.endTime) }
            }).sort({ timestamp: 1 });

            // Emit the previous messages to the user
            socket.emit("previousMessages", previousMessages);

            // Broadcast a message to all other users in the same room
            socket.broadcast.to(data.room).emit("message", {
                text: `${data.username} has joined the room.`
            });

            // Join the room
            socket.join(data.room);
        } catch (error) {
            console.error("Error retrieving previous messages:", error);
        }
    });

    socket.on("sendMessage", async (data) => {

        const message = new messageModel({
            username: data.username,
            text: data.message,
            room: data.room
        })

        await message.save();

        // Broadcast the received message to all users in the same room
        io.to(data.room).emit("message", {
            username: data.username,
            text: data.message
        });
    });

    socket.on("disconnect", () => {
        console.log("Connection disconnected.");
    });
});


