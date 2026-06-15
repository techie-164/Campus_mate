import mongoose from 'mongoose';
import { User } from './User.model.js';

const ProjectSchema = new mongoose.Schema({
    project_id :{
        type : String,
        required : true,
        unique : true
    },
    project_name :{
        type : String,
        required : true
    },
    description :{
        type : String
    },
    owner_id :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    members : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    ]
    }, 
    {timestamps : true}
);

export const Project = mongoose.model('Project', ProjectSchema);