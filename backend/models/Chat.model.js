import mongoose from 'mongoose';

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