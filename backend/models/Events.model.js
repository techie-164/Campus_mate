import mongoose from 'mongoose';

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
    },
    complete : {
        type : Boolean,
        default : false
    }
   },
  {timestamps : true}
)

export const Event = mongoose.model('Event', Eventsschema);