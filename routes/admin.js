const express = require("express");
const routes = express.Router();
const mongoose = require("mongoose");
require('../models/Item');
require('../models/link');
require('../models/Categoria');
const Item = mongoose.model('item');
const Link = mongoose.model('link');
const Categoria = mongoose.model('categoria');
const moment = require('moment');
const {eadmin} = require("../helpers/eadmin"); 



//ADICIONAR CATEGORIA
routes.post("/adicionarcategoria",eadmin,function(req,res){
    console.log(req.body.categoria.toUpperCase());
    new Categoria({categoria:req.body.categoria.toUpperCase()}).save().then(function(){
        res.redirect("/admin/configuracao/home");
        console.log("Categoria adicionada com sucesso!")
    }).catch(function(err){
        console.log("Erro ao criar categoria:" + err)
        res.redirect("/admin/configuracao/home");
    });
});
//REMOVER CATEGORIA
routes.get("/removercategoria/:id",eadmin, function(req,res){
    Item.exists({categoria:req.params.id},function(err,bol){
        if(bol){
            res.redirect("/admin/configuracao/home");
        }else{
            Categoria.findByIdAndDelete(req.params.id).then(function(){
                res.redirect("/admin/configuracao/home");
            }).catch(function(err){
                console.log("Erro ao excluir categoria: " + err);
            });
        }
    });
});
//EDITAR CATEGORIA
routes.post("/editarcategoria/:id",eadmin,function(req,res){
    Categoria.findByIdAndUpdate(req.params.id,{categoria:req.body.editarcategoria.toUpperCase()}).then(function(){
        res.redirect("/admin/configuracao/home");
    }).catch(function(err){
        console.log("Erro ao editar categoriaa: " + err);
        res.redirect("/admin/configuracao/home");
    });
});
//ADIONAR ITEM
routes.post("/adiconaritem",eadmin,function(req,res){
    var data = Date.now();
    var Array = [];
    Array[0] = req.body.titulo.toUpperCase();
    Array[1] = req.body.sinopse.toUpperCase();
    Array[2] = dataLancamento;   
    var slug = "download-"+req.body.titulo.split(' ').join('-').toLowerCase();
    var dataLancamento = req.body.lacamento;
    dataLancamento = moment(dataLancamento).format('DD/MM/YYYY');
    data = moment(data).format('DD/MM/YYYY')
    console.log(dataLancamento)
    const item=({
        titulo: req.body.titulo.toUpperCase(),
        sinopse: req.body.sinopse,
        dataLancamento: req.body.lancamento,
        categoria:req.body.categoria,
        linkimg:req.body.link_img_capa,
        dataFormadata: data,
        dataLancamentoFormatada:dataLancamento,
        tag:Array,
        slug:slug
    })
    new Item(item).save().then(function(item){
        console.log("Sucesso ao criar item");
        res.redirect("/admin/edit/" + item._id);
    }).catch(function(err){
        console.log("Erro ao criar item: " + err);
        res.redirect("/admin/configuracao/home");
    });
});
//REMOVER ITEM
routes.get("/removeritem/:id",eadmin,function(req,res){
    Item.findByIdAndDelete(req.params.id).then(function(){
        console.log("Sucesso ao remover item");
        res.redirect("/admin/configuracao/home");
    }).catch(function(err){
        console.log("Erro ao remover item: "+ err);
        res.redirect("/admin/configuracao/home");
    });
});
//FILTRAR ITEM ADMIN
routes.post("/filtro",eadmin,function(req,res){
    var filtro = req.body.input_admin;
    res.redirect("/admin/configuracao/" + filtro);
});
routes.get("/configuracao/:filtro",eadmin,function(req,res){
    var filtro = req.params.filtro.toUpperCase();
    if(filtro == "HOME"){
        Categoria.find().then(function(categorias){
            Item.find().sort({dataAdd:"desc"}).then(function(itens){
                res.render("admin/config",{categorias:categorias,itens:itens});
               }).catch(function(err){
                console.log("Erro ao buscar itens:" + err);
               });
       }).catch(function(err){
           console.log("Erro ao buscar todas categorias: " + err);
       });
    }else{
        Categoria.find().then(function(categorias){
            Item.find({titulo: {$regex: filtro}}).then(function(itens){
                res.render("admin/config",{categorias:categorias,itens:itens});
               }).catch(function(err){
                console.log("Erro ao buscar itens:" + err);
               });
       }).catch(function(err){
           console.log("Erro ao buscar todas categorias: " + err);
       });
    }
    
});
routes.get("/edit/:id",eadmin,function(req,res){
    Item.findById(req.params.id).populate("categoria").then(function(item){
        Categoria.find({}).then(function(categorias){
            Link.find({item:req.params.id}).then(function(links){
                res.render("admin/configlink",{item:item,categorias:categorias,links:links});
            }).catch(function(err){
                console.log("Erro ao selecionar links: " + err);
            });
        }).catch(function(err){
            console.log("Erro ao selecionar categorias: " + err);
        });
    }).catch(function(err){
        console.log("Erro ao selecionar item: " + err);
        res.redirect("/admin/configuracao/");
    });
});
routes.post("/editar/:campo/:id",eadmin,function(req,res){
 switch(req.params.campo){
     case 'titulo':{
        var slug = "download-"+req.body.dado.split(' ').join('-').toLowerCase();
         Item.findByIdAndUpdate(req.params.id,{titulo:req.body.dado.toUpperCase(),slug:slug,$addToSet:{tag:req.body.dado}}).then(function(){
            res.redirect("/admin/edit/" + req.params.id);
            console.log("Campo " + req.params.campo + " atualizado");
         }).catch(function(err){
            console.log("Erro ao atualizar o campo " +req.params.campo +" :"+ err);
            res.redirect("/admin/edit/" + req.params.id);
         })
         break;
     }
     case 'sinopse':{
        Item.findByIdAndUpdate(req.params.id,{sinopse:req.body.dado,$addToSet:{tag:req.body.dado}}).then(function(){
            res.redirect("/admin/edit/" + req.params.id);
            console.log("Campo " + req.params.campo + " atualizado");
         }).catch(function(err){
            console.log("Erro ao atualizar o campo " +req.params.campo +" :"+ err);
            res.redirect("/admin/edit/" + req.params.id);
         })
         break;
     }
     case 'dataLancamento':{
        Item.findByIdAndUpdate(req.params.id,{dataLancamento:req.body.dado}).then(function(){
            res.redirect("/admin/edit/" + req.params.id);
            console.log("Campo " + req.params.campo + " atualizado");
         }).catch(function(err){
            console.log("Erro ao atualizar o campo " +req.params.campo +" :"+ err);
            res.redirect("/admin/edit/" + req.params.id);
         })
         break;
     }
     case 'categoria':{
        Item.findByIdAndUpdate(req.params.id,{categoria:req.body.dado}).then(function(){
            res.redirect("/admin/edit/" + req.params.id);
            console.log("Campo " + req.params.campo + " atualizado");
         }).catch(function(err){
            console.log("Erro ao atualizar o campo " +req.params.campo +" :"+ err);
            res.redirect("/admin/edit/" + req.params.id);
         })
         break;
     }
     case 'linkimg':{
        Item.findByIdAndUpdate(req.params.id,{linkimg:req.body.dado}).then(function(){
            res.redirect("/admin/edit/" + req.params.id);
            console.log("Campo " + req.params.campo + " atualizado");
         }).catch(function(err){
            console.log("Erro ao atualizar o campo " +req.params.campo +" :"+ err);
            res.redirect("/admin/edit/" + req.params.id);
         })
         break;
     }
 } 
});
//ADICIONAR LINK
routes.post("/adicionarlink/:id",eadmin,function(req,res){
    const link = {
        link:req.body.linkDownload,
        descricao:req.body.descricao.toUpperCase(),
        item:req.params.id
    }
    new Link(link).save().then(function(){
        res.redirect("/admin/edit/"+req.params.id);
    }).catch(function(err){
        console.log("Erro ao adicionar link: " + err);
        res.redirect("/admin/edit/"+req.params.id);
    });
});
//REMOVER LINK
routes.get("/removerlink/:iditem/:idlink",eadmin, function(req,res){
    Link.findByIdAndDelete(req.params.idlink).then(function(){
        res.redirect("/admin/edit/"+ req.params.iditem);
    }).catch(function(err){
        console.log("Erro ao deletar link: " + err);
        res.redirect("/admin/edit/"+ req.params.iditem);
    });
});



module.exports = routes;