const localStrategy = require('passport-local').Strategy
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require('../models/Usuario');
const Usuario = mongoose.model('usuario');



module.exports = function(passport){
    passport.use(new localStrategy({usernameField:'login',passwordField:'senha'},function(login,senha,done){
        Usuario.findOne({login:login}).then((admin) => {
            bcrypt.compare(senha,admin.senha,function(err,batem){
                if(batem){
                    return done(null,admin)
                }else{
                    return done(null,false,{mensagem:"Senha incorreta!"});
                }
            });
        }).catch((err) => {
            return done(null,false,{mensagem:"Essa conta nao existe: " + err});
        });
    }));

    passport.serializeUser(function(user,done){
        done(null,user.id);
    });
    passport.deserializeUser(function(id,done){
        Usuario.findById(id,function(err,user){
            done(err,user)
        });
    });
}