require('dotenv').config()
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express(); 
const cors = require('cors');
const PORT_SERVER = process.env.PORT

/* CONFIG SERVER */

    // EXPRESS
    app.use(cors())
    app.use(fileUpload())
    app.use(express.json())
    app.use('/upload', express.static('upload'))



/* ROTAS */ 
const routeMain = require('./src/routes')
app.use('/', routeMain)

/* SAIDA */
app.listen(PORT_SERVER, ()=>{
    console.log(`Servidor na porta ${process.env.URL_API}${PORT_SERVER}`)
})
