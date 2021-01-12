const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Link = new Schema({
    link:{
        type:String,
        required:true
    },
    descricao:{
        type:String,
        required:true
    },
    item:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'item'
    }
})


mongoose.model("link",Link);