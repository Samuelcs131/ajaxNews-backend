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
                        res.status(400).send('Erro ao enviar!')
                        console.log(erro)
                    }

                })

            } else {
                console.log('Erro ao cadastrar')
                connectionDataBase.destroy();
                return res.status(400).send(errosEnvios)
            }

        } catch(error) {
            console.log('Erro ao cadastrar')
            connectionDataBase.destroy();
            res.status(400).send('Houve um erro ao cadastrar! ' + error)
            
        }
    })
    
    // GET - Consultar todos os artigos
    routers.get('/artigos', async(req,res)=>{
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
    }) 
    
    // GET - Consultar um artigo específico por titulo
    routers.get('/artigos/titulo', async(req,res)=>{
        // CONEXAO COM BANCO
        connectionDataBase = await conectDataBase()
        
        let searchNews  = (req.query.searchNews).toLocaleLowerCase()
  
        let querySQL = "SELECT * FROM artigos"

        connectionDataBase.query(querySQL, (erro, result)=> {
            if(erro){
                connectionDataBase.destroy();
                res.status(400).send('Erro ao procurar')
            } else {
                let response = result.filter( artigo => artigo.titulo.toLowerCase().includes(searchNews) )
                connectionDataBase.destroy();
                res.status(200).send({
                    id: response[0].id_artigo,
                    titulo: response[0].titulo,
                    descricao: response[0].descricao,
                    categoria: response[0].categoria,
                    texto: response[0].texto,
                    autor: response[0].autor,
                    imagem: URL_API + response[0].imagem,
                    dataCriacao: response[0].dataCriacao,
                    dataAtualizacao: response[0].dataAtualizacao
                }) 
            }
        })
    })
 
    // GET - Consultar um artigo específico por ID
    routers.get('/artigos/id/:id', async(req,res)=>{
        // CONEXAO COM BANCO
        connectionDataBase = await conectDataBase()

        let querySQL = "SELECT * FROM artigos WHERE id_artigo = ?"

        connectionDataBase.query(querySQL, [req.params.id],(erro, result)=> {
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
    })

    // GET - Consultar um artigo específico por categoria
    routers.get('/artigos/categoria/:id', async(req,res)=>{
        // CONEXAO COM BANCO
        connectionDataBase = await conectDataBase()

        let querySQL = "SELECT * FROM artigos WHERE categoria = ?"

        connectionDataBase.query(querySQL, [req.params.id],(erro, result)=> {
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
    })
 
    // PUT - Atualizar um artigo específico
    routers.put('/artigos/:id', multer(multerConfig).single('imagem'), async (req,res) => {
        try{
            // CONEXAO AO BANCO DE DADOS
        connectionDataBase = await conectDataBase()

        // ENTRADAS
        const {titulo, descricao, categoria, texto, autor} = req.body
        const imageUpload = req.file.filename || req.file.key
        const dataAtualizacao = year + '-' + month + '-' + day
 
        // PESQUISA ID IMAGEM
        let querySQL = "SELECT * FROM artigos WHERE id_artigo = ?"

        connectionDataBase.query(querySQL, [req.params.id],(erro, result)=> {
            if(erro || result.length == 0 || result == 'undefined'){ 
                connectionDataBase.destroy();
                res.status(400).send('Artigo não encontrado!')
                console.log('Artigo não encontrado!')
            } else {
                // APAGA FOTO
                let idImg = result[0].imagem

                // CAMPOS
                let errosEnvios = [];
 
                if( titulo == undefined || titulo == '' || descricao == undefined || descricao == '' || categoria == undefined || categoria == '' || texto == undefined || texto == '' || autor == undefined || autor == '' ){
                    errosEnvios.push({erro: 'Erro em um dos textos'})
                }

                // APAGA ARTIGO
                querySQL = "UPDATE artigos SET titulo = ?, descricao = ?, categoria = ?, texto = ?, autor = ?, imagem = ?, dataAtualizacao = ? WHERE id_artigo = ?"

                connectionDataBase.query(querySQL, [titulo, descricao, categoria, texto, autor, imageUpload, dataAtualizacao, req.params.id], (erro, result)=>{
                    if(erro){
                        console.log(erro) 
                        connectionDataBase.destroy();
                        res.status(400).send('Houve um erro ao cadastrar!')
                    } else {
                        // APAGANDO FOTO ANTIGA
                        removeImage(idImg)
                        connectionDataBase.destroy();
                        res.status(200).send('Atualizado com sucesso!')
                    }
                })
            }
        })
        } catch(eror) {
            console.log('Erro ao atualizar')
            res.send('Erro ao atualizar')
        }
    })

    // DELETE - Deletar um artigo específico
    routers.delete('/artigos/:id', async(req, res)=>{
        try{
        // CONEXAO COM O BANCO DE DADOS
        connectionDataBase = await conectDataBase() 

        // PESQUISA ID IMAGEM
        let querySQL = "SELECT * FROM artigos WHERE id_artigo = ?"

        connectionDataBase.query(querySQL, [req.params.id],(erro, result)=> {
            if(erro || result.length == 0 || result == 'undefined'){
                connectionDataBase.destroy();
                res.status(400).send('Erro ao encontrar o artigo')
                console.log('Erro ao encontrar o artigo')
            } else {
                
                // APAGAR IMAGEM
                let imagem = result[0].imagem
                // APAGA ARTIGO
                querySQL = "DELETE FROM artigos WHERE id_artigo = ?"

                connectionDataBase.query(querySQL, [req.params.id], (erro, result)=>{
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