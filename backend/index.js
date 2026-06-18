import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});
import connectDB from './db/index.js';
import { app } from './app.js';
import http from 'http';
import { initializeSocket } from './utils/socket.js';

console.log("Backend is running");

const server = http.createServer(app);
initializeSocket(server);

connectDB()
.then(() => {
    server.listen(process.env.PORT || 5000, () =>{
        console.log(`Server is running on port ${process.env.PORT || 5000}`);
    })
})
.catch((error) => {
    console.log("Error while connecting to the database:", error);
})
