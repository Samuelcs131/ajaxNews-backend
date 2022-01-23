require('dotenv').config()
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express(); 
const cors = require('cors');
const PORT_SERVER = process.env.PORT

/* CONFIG SERVER */

    // EXPRESS
    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use('/upload', express.static('upload'))



/* ROTAS */
const routeMain = require('./routes')
app.use('/ajaxNews', routeMain)

app.get('/', (req,res) =>{ 
    res.send
    (`
                <h1>API AjaxNews</h1> 
                <hr>
                <p><b>GET - Consultar</b> todos os artigos - /ajaxNews/artigos</p>
                <p><b>GET - Consultar</b> um artigo específico por titulo- /ajaxNews/artigos/titulo</p>
                <p><b>GET - Consultar</b> um artigo específico por ID - /ajaxNews/artigos/id/:idArtigo</p>
                <p><b>GET - Consultar</b> um artigo específico por categoria - /ajaxNews/artigos/id/:categoria</p>
                <p><b>POST - Cadastrar</b> um artigo - /ajaxNews/artigos</p>
                <p><b>PUT - Atualizar</b> um artigo específico - /ajaxNews/artigos/:idArtigo</p>
                <p><b>DELETE - Deletar</b> um artigo específico - /ajaxNews/artigos/:idArtigo</p>
    `) 
})

/* SAIDA */
app.listen(PORT_SERVER, ()=>{
    console.log(`Servidor na porta ${process.env.URL_API}${PORT_SERVER}`)
})
