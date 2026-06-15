import mongoose from 'mongoose';
import { User } from './User.model.js';

const Eventsschema = new mongoose.Schema({
    id : {
        type : String,
        required : true,
        unique : true
    },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
    },
    target_date : {
        type : Date,
        required : true
    }
   },
  {timestamps : true}
)

export const Event = mongoose.model('Event', Eventsschema);