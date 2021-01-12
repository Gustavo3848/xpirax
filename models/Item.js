const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Item = new Schema({
    titulo:{
        type:String,
        required:true
    },
    sinopse:{
        type:String,
        required:true
    },
    dataLancamento:{
        type:Date,
        required:true
    },
    dataLancamentoFormatada:{
        type:String
    },
    categoria:{
        type: Schema.Types.ObjectId,
        ref:'categoria'
    },
    linkimg:{
        type:String,
        required:true
    },
    dataAdd:{
        type:Date,
        default: Date.now()
    },
    dataFormadata:{
        type: String
    },
    tag:{
        type:Array
    },
    slug:{
        type:String,
        
    },
    acessos:{
        type:Number,
        default: 0
    }
    
})






mongoose.model("item",Item);