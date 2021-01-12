const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Usuario = new Schema({
    login: {
        type: String   
    },
    senha:{
        type:String
    }
});
mongoose.model("usuario", Usuario)
