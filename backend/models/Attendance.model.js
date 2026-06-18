import mongoose from 'mongoose';

const attendanceschema = new mongoose.Schema({
    attendance_id : {
        type : String,
        required : true,
        unique : true
    },
    subject :{
        type : String,
        required : true
    },
    start_date : {
        type : Date,
        required : true,
        default : Date.now
    },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    status : [
        {
            date : {
                type : Date,
                required : true
            },
            flag : {
                type: String,
                enum: ["P", "A", "C"],
                required: true
            }
        }
    ],
    total_class : {
        type : Number, 
        default : 0,
        required : true
    },
    total_present : {
        type : Number,
        default : 0,
        required : true
    }
},{timestamps : true});

export const Attendance = mongoose.model('Attendance', attendanceschema);