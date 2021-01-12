//CARREGANDO MODULOS
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const app = express();
require ("./models/Usuario");
require ("./models/Categoria");
require ("./models/Item");
require ("./models/link");
require ("./config/auth")(passport);
const admin = require ("./routes/admin");
const session  = require('express-session');
const Usuario = mongoose.model("usuario")
const Categoria = mongoose.model("categoria");
const Item = mongoose.model("item");
const Link = mongoose.model("link");

//SESSION
app.use(session({
    secret:"xpirax",
    resave:true,
    saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());
//MIDDLEWARE
app.use(function(req,res,next){
    res.locals.user =req.user || null
    next();
}); 
//PUBLIC

//BODYPARSER
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//EJS
app.use(expressLayouts);    
app.set('view engine', 'ejs');
//MONGOOSE
mongoose.connect("mongodb://adminxpirax:rerogu361@mongo_xpirax:27017/xpirax").then(function () {
    console.log("Conectado com o banco de dados...")
}).catch(function (erro) {
    console.log("Erro ao conectar com o bando de dados: " + erro)
})
app.post("/login",function(req,res,next){
    passport.authenticate('local',{
        successRedirect:"/admin/configuracao/home",
        failureRedirect:"/entrar"
    })(req,res,next)


});
app.get("/entrar",function(req,res){
    Categoria.find().then(function(categorias){
        res.render('registro',{categorias:categorias});
    }).catch(function(err){
        console.log("Erro ao selecionar categorias:" + err);
    });
    
});
app.post("/addregistro",function(req,res){
    const admin = {
        login:req.body.login,
        senha:req.body.senha
    }
    async function senha(){
    const salt =  await bcrypt.genSalt(10);
    const hashedPassword =   await bcrypt.hash(req.body.senha, salt);
    admin.senha = hashedPassword;
    new Usuario(admin).save().then(function(){
        res.redirect('/');
    }).catch(function(err){
        res.redirect('/');
        console.log("Erro ao salvar admin:" + err);
    });
    }
    senha();
    
});
app.get("/categoria/:categoria",function(req,res){
    Categoria.find().then(function(categorias){
        Item.find().sort({dataAdd:"desc"}).limit(4).then(function(itens){
            Item.find({categoria:req.params.categoria}).then(function(itensCont){
                Item.find().sort({acessos:'desc'}).limit(5).then(function(destaques){
                    res.render('index',{categorias:categorias,itens:itens,itensCont:itensCont,destaques:destaques});
                }).catch(function(err){
                    console.log("Erro ao selecionar destaques: " + err);
                });
            }).catch(function(err){
                console.log("Erro ao selecionar itens para conteudo: "+err);
            });
        }).catch(function(err){
            console.log("Erro ao selecionar itens:" + err);
        });
    }).catch(function(err){
        console.log("Erro ao selecionar categorias:" + err);
    
    });
});
app.get("/logout",function(req,res){
    req.logOut();
    res.redirect('/');
});
app.get("/:id",function(req,res){
    var acesso = 0;
    Categoria.find().then(function(categorias){
        Item.findOne({slug:req.params.id}).populate('categoria').then(function(item){
            acesso = item.acessos + 1;
            Item.findByIdAndUpdate(item._id,{acessos:acesso}).then(function(){
                Link.find({item:item._id}).then(function(links){
                    res.render("item",{item:item,categorias:categorias,links:links});
                }).catch(function(err){
                    console.log("Erro ao selecionar links: " + err);
                    res.redirect('/');
                });
            }).catch(function(err){
                console.log("Erro ao adicionar acesso: " + err);
            });
        }).catch(function(err){
            console.log("Erro ao selecionar item: " + err);
            res.redirect('/');
        });
    }).catch(function(err){
        res.redirect("/");
        console.log("Erro ao selecionar categorias:" + err);
    });
});
app.get("/", function(req,res){
    Categoria.find().then(function(categorias){
        Item.find().sort({dataAdd:"desc"}).limit(4).then(function(itens){
            Item.find().then(function(itensCont){
                Item.find().sort({acessos:'desc'}).limit(5).then(function(destaques){
                    res.render('index',{categorias:categorias,itens:itens,itensCont:itensCont,destaques:destaques});
                }).catch(function(err){
                    console.log("Erro ao selecionar destaques: " + err);
                });
            }).catch(function(err){
                console.log("Erro ao selecionar itens para conteudo: "+err);
            });
        }).catch(function(err){
            console.log("Erro ao selecionar itens:" + err);
        });
    }).catch(function(err){
        console.log("Erro ao selecionar categorias:" + err);
    
    });
    
});
app.post("/filter", function(req,res){
    Categoria.find().then(function(categorias){
        Item.find().sort({dataAdd:"desc"}).limit(4).then(function(itens){
            Item.find({tag:{$regex:req.body.pesquisaInput.toUpperCase()}}).then(function(itensCont){
                Item.find().sort({acessos:'desc'}).limit(5).then(function(destaques){
                    res.render('index',{categorias:categorias,itens:itens,itensCont:itensCont,destaques:destaques});
                }).catch(function(err){
                    console.log("Erro ao selecionar destaque: " + err);
                });
            }).catch(function(err){
                console.log("Erro ao selecionar itens filtrados: " + err);
            });
        }).catch(function(err){
            console.log("Erro ao selecionar itens:" + err);
        });
    }).catch(function(err){
        console.log("Erro ao selecionar categorias:" + err);
    });
    
});
app.use("/admin", admin);
app.get("/404", function (req, res) {
    res.send("Erro 404 - por favor tente mais tarde")
})
const port = 3000;
app.listen(port, function () {  
    console.log("Servidor rodando...")
   
})

//mongodb://localhost/crud
//mongodb://adminxpirax:rerogu361@mongo_xpirax:27017/xpirax