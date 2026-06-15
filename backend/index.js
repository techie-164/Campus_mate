import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});
import connectDB from './db/index.js';
import express from 'express';
const app = express();

console.log("Backend is running");

connectDB()
.then(() => {
    app.listen(process.env.PORT || 5000, () =>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Error whileconnecting to the database:", error);
})

