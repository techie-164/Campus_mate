import mongoose from 'mongoose';
import { User } from './User.model.js';
import { Project } from './Project.model.js';

const chatschema = new mongoose.Schema({
    chat_id : {
        type : String,
        required : true,
        unique : true
    },
    project_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project'
    },
    sender_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    text : {
        type : String,
        required : true
    }
    }, 
    {timestamps : true}
);

export const Chat = mongoose.model('Chat', chatschema);