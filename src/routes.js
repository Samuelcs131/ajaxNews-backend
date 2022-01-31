const express = require('express') 
const routers = express.Router()
const multer = require('multer')
const  { multerConfig, removeImage} = require('./config/multer')

// CONDIÇÃO CASO ESTEJA EM LOCALHOST OU HOSPEDADO
let URL_API
process.env.URL_API !== 'http://localhost:' ? 
URL_API = process.env.URL_API:
URL_API = process.env.URL_API + process.env.PORT + '/upload/';

// DATABASE
const conectDataBase = require('./database')

// DATA HOJE
function dataNow(func){ return Intl.DateTimeFormat('pt-BR', func).format()} 
let [day,year,month] = [dataNow({day: 'numeric'}), dataNow({year: 'numeric'}),dataNow({month: 'numeric'})]

// ROUTES

    routers.post('/test', multer(multerConfig).single('imagem'), async(req,res)=>{
        res.status(200).send('Imagem salva')
        console.log('Imagem salva')
    })

     // POST - Cadastrar um artigo
    routers.post('/artigos', multer(multerConfig).single('imagem'), async(req, res)=>{
        try {
            connectionDataBase = await conectDataBase()

            const {titulo, descricao, categoria, texto, autor} = req.body
            const imageUpload = req.file.filename || req.file.key
            const dataCriacao = year + '-' + month + '-' + day
            const dataAtualizacao = dataCriacao
 
            // CAMPOS
            let errosEnvios = [];

            if(
                titulo == undefined || titulo == '' || 
                descricao == undefined || descricao == '' || 
                categoria == undefined || categoria == '' || 
                texto == undefined || texto == '' || 
                autor == undefined || autor == ''
            ){
                errosEnvios.push({erro: 'Preencha todos os campos!'})
            }

            if(errosEnvios.length == 0){
               
                 // ADICIONANDO AO BANCO DE DADOS
            let querySQL = "INSERT INTO artigos (titulo, descricao, categoria, texto, autor, imagem, dataCriacao, dataAtualizacao) VALUES (?,?,?,?,?,?,?,?)"

            connectionDataBase.query(
                querySQL,
                [titulo, descricao, categoria, texto, autor, imageUpload, dataCriacao, dataAtualizacao],
                (erro,result)=>{

                    if(erro == null && result !== undefined){
                        connectionDataBase.destroy();
                        res.status(200).send('Cadastrado com sucesso!')
                        console.log('Cadastrado com sucesso!')
                    } else { 
                        connectionDataBase.destroy();
                        res.status(400).send('Erro ao enviar 3!')
                        console.log(erro)
                    }

                })

            } else {
                console.log('Erro ao cadastrar 2')
                connectionDataBase.destroy();
                return res.status(400).send(errosEnvios)
            }

        } catch(error) {
            console.log('Erro ao cadastrar 1')
            connectionDataBase.destroy();
            res.status(400).send('Houve um erro ao cadastrar! ' + error)
            
        }
    })
    
    // GET - Consultar todos os artigos
    routers.get('/artigos', async(req,res)=>{
       try{
            // CONEXAO COM BANCO
        connectionDataBase = await conectDataBase()

        let querySQL = "SELECT * FROM artigos"

        connectionDataBase.query(querySQL, (erro, result)=> {
            if(erro){
                connectionDataBase.destroy();
                res.status(400).send('Erro ao procurar')
            } else {
                let response = result.map( (artigo => {
                    return({
                        id: artigo.id_artigo,
                        titulo: artigo.titulo,
                        descricao: artigo.descricao,
                        categoria: artigo.categoria,
                        texto: artigo.texto,
                        autor: artigo.autor,
                        imagem: URL_API + artigo.imagem,
                        dataCriacao: artigo.dataCriacao,
                        dataAtualizacao: artigo.dataAtualizacao
                    })
                }))

                res.status(200).send(response)
                connectionDataBase.destroy();
            }
        })
       } catch(erro){
        connectionDataBase.destroy();
        console.log('Erro ao buscar')
        res.status(400).send('Erro ao buscar')
    }
    }) 
    
    // GET - Consultar um artigo específico por titulo
    routers.get('/artigos/titulo', async(req,res)=>{
        // CONEXAO COM BANCO
        connectionDataBase = await conectDataBase()
        
        let searchNews  = (req.query.titulo).toLocaleLowerCase()
  
        let querySQL = "SELECT * FROM artigos"

        connectionDataBase.query(querySQL, (erro, result)=> {
            if(erro){
                connectionDataBase.destroy();
                res.status(400).send('Erro ao procurar')
            } else {
                let response = result.filter( artigo => {
                    return (artigo.titulo.toLowerCase().includes(searchNews))
                }).map( artigo => {
                    return ({id: artigo.id_artigo,
                        titulo: artigo.titulo,
                        descricao: artigo.descricao,
                        categoria: artigo.categoria,
                        texto: artigo.texto,
                        autor: artigo.autor,
                        imagem: URL_API + artigo.imagem,
                        dataCriacao: artigo.dataCriacao,
                        dataAtualizacao: artigo.dataAtualizacao})
                })
                connectionDataBase.destroy();
                res.status(200).send(response)
            }
        })
    })
 
    // GET - Consultar um artigo específico por ID
    routers.get('/artigos/id/:id', async(req,res)=>{
        try {
            // CONEXAO COM BANCO
        connectionDataBase = await conectDataBase()

        const {id} = req.params

        let querySQL = "SELECT * FROM artigos WHERE id_artigo = ?"

        connectionDataBase.query(querySQL, [id],(erro, result)=> {
            if(erro){
                connectionDataBase.destroy();
                res.status(400).send('Erro ao procurar')
            } else {
                connectionDataBase.destroy();
                res.status(200).send({
                    id: result[0].id_artigo,
                    titulo: result[0].titulo,
                    descricao: result[0].descricao,
                    categoria: result[0].categoria,
                    texto: result[0].texto,
                    autor: result[0].autor,
                    imagem: URL_API + result[0].imagem,
                    dataCriacao: result[0].dataCriacao,
                    dataAtualizacao: result[0].dataAtualizacao
                })
            }
        })
        } catch(erro) {
            connectionDataBase.destroy();
            console.log('Erro ao pesquisar ou conectar ao banco')
            res.status(400).send('Erro ao pesquisar ou conectar ao banco')
        }
    })

    // GET - Consultar um artigo específico por categoria
    routers.get('/artigos/categoria/:id', async(req,res)=>{
        try{
            // CONEXAO COM BANCO
        connectionDataBase = await conectDataBase()

        const {id} = req.params

        let querySQL = "SELECT * FROM artigos WHERE categoria = ?"

        connectionDataBase.query(querySQL, [id],(erro, result)=> {
            if(erro){
                connectionDataBase.destroy();
                res.status(400).send('Erro ao procurar!')
            } else {
                
                let response = result.map( (artigo => {
                    return({
                        id: artigo.id_artigo,
                        titulo: artigo.titulo,
                        descricao: artigo.descricao,
                        categoria: artigo.categoria,
                        texto: artigo.texto,
                        autor: artigo.autor,
                        imagem: URL_API + artigo.imagem,
                        dataCriacao: artigo.dataCriacao,
                        dataAtualizacao: artigo.dataAtualizacao
                    })
                }))
                connectionDataBase.destroy();
                res.status(200).send(response)
            }
        })
        }catch(erro){
            connectionDataBase.destroy();
            res.status(400).send('Erro ao pesquisar')
            console.log('Erro ao pesquisar')
        }
    })
 
    // PUT - Atualizar um artigo específico
    routers.put('/artigos/:id', async (req,res) => {
        try{
            // CONEXAO AO BANCO DE DADOS
        connectionDataBase = await conectDataBase()

        const {id} = req.params

        // ENTRADAS
        const {titulo, descricao, categoria, texto, autor} = req.body
        const dataAtualizacao = year + '-' + month + '-' + day
     
        // PESQUISA ID IMAGEM
        let querySQL = "SELECT * FROM artigos WHERE id_artigo = ?"

        connectionDataBase.query(querySQL, [id],(erro, result)=> {
            if(erro || result.length == 0 || result == 'undefined'){ 
                connectionDataBase.destroy();
                res.status(400).send('Artigo não encontrado!')
                console.log('Artigo não encontrado!')
            } else {

                // CAMPOS
                let errosEnvios = [];
 
                if( titulo == undefined || titulo == '' || descricao == undefined || descricao == '' || categoria == undefined || categoria == '' || texto == undefined || texto == '' || autor == undefined || autor == '' ){
                    errosEnvios.push({erro: 'Erro em um dos textos'})
                }

                if(errosEnvios.length == 0){
                    // APAGA ARTIGO
                querySQL = "UPDATE artigos SET titulo = ?, descricao = ?, categoria = ?, texto = ?, autor = ?, dataAtualizacao = ? WHERE id_artigo = ?"

                connectionDataBase.query(querySQL, [titulo, descricao, categoria, texto, autor, dataAtualizacao, id], (erro, result)=>{
                    if(erro){
                        console.log(erro) 
                        connectionDataBase.destroy();
                        res.status(400).send('Houve um erro ao cadastrar!')
                    } else {
                        connectionDataBase.destroy();
                        console.log('Atualizado com sucesso!')
                        res.status(200).send('Atualizado com sucesso!')
                    }
                })
                } else {
                    connectionDataBase.destroy()
                    console.log(errosEnvios)
                    res.status(400).send(errosEnvios)
                }
            }
        })
        } catch(erro) {
            connectionDataBase.destroy();
            console.log('Erro ao atualizar 1'+ erro)
            res.status(400).send('Erro ao atualizar 1')
        }
    })

    // DELETE - Deletar um artigo específico
    routers.delete('/artigos/:id', async(req, res)=>{
        try{
        // CONEXAO COM O BANCO DE DADOS
        connectionDataBase = await conectDataBase() 

        const {id} = req.params

        // PESQUISA ID IMAGEM
        let querySQL = "SELECT * FROM artigos WHERE id_artigo = ?"

        connectionDataBase.query(querySQL, [id],(erro, result)=> {
            if(erro || result.length == 0 || result == 'undefined'){
                connectionDataBase.destroy();
                res.status(400).send('Erro ao encontrar o artigo')
                console.log('Erro ao encontrar o artigo')
            } else {
                
                // APAGAR IMAGEM
                let imagem = result[0].imagem
                // APAGA ARTIGO
                querySQL = "DELETE FROM artigos WHERE id_artigo = ?"

                connectionDataBase.query(querySQL, [id], (erro, result)=>{
                    if(erro){
                        console.log(erro) 
                        connectionDataBase.destroy();
                        res.status(400).send('Erro ao apagar artigo!')
                        console.log('Erro ao apagar artigo!')
                    } else {
                        removeImage(imagem)
                        connectionDataBase.destroy();
                        res.status(200).send('Artigo apagado com sucesso!')
                        console.log('Artigo apagado com sucesso!')
                    }
                })
                        
            }
        })
        } catch(error) {
            console.log(error)
            connectionDataBase.destroy();
            res.status(400).send(error)
        }
        
    }) 
 
 

// Exportando rotas
module.exports = routers