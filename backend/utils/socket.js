import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected", socket.id);

        socket.on("join-project", (projectId) => {
            socket.join(`project-${projectId}`);
            console.log(`User ${socket.id} joined project ${projectId}`);
        });

        socket.on("leave-project", (projectId) => {
            socket.leave(`project-${projectId}`);
            console.log(`User ${socket.id} left project ${projectId}`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
