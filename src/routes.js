const express = require('express')
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const routers = express.Router()
const ROOT_PATH = require('app-root-path').path 

// CONDIÇÃO CASO ESTEJA EM LOCALHOST OU HOSPEDADO
let URL_API
process.env.URL_API !== 'http://localhost:' ? 
URL_API = process.env.URL_API + '/upload/' : 
URL_API = process.env.URL_API + process.env.PORT + '/upload/';

// DATABASE
const conectDataBase = require('./database')

// DATA HOJE
function dataNow(func){ return Intl.DateTimeFormat('pt-BR', func).format()} 
let [day,year,month] = [dataNow({day: 'numeric'}), dataNow({year: 'numeric'}),dataNow({month: 'numeric'})]

// ROUTES

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

    // GET - Consultar um artigo específico
    routers.get('/artigos/:id', async(req,res)=>{
        // CONEXAO COM BANCO
        connectionDataBase = await conectDataBase()
        
        let parameterSearch = req.params.id.toLowerCase()

        let querySQL = "SELECT * FROM artigos"

        connectionDataBase.query(querySQL, (erro, result)=> {
            if(erro){
                connectionDataBase.destroy();
                res.status(400).send('Erro ao procurar')
            } else {
                let response = result.filter( (artigo => {
                    return( 
                        artigo.titulo.toLowerCase().includes(parameterSearch)
                    )
                }))
                connectionDataBase.destroy();
                res.status(200).send(response)
            }
        })
    })

    // POST - Cadastrar um artigo
    routers.post('/artigos', async (req,res)=>{ 

        try{
        connectionDataBase = await conectDataBase()
        
        // DADOS 
        const {titulo, descricao, categoria, texto, autor} = req.body
        const {imagem} = req.files || 0
        const dataCriacao = year + '-' + month + '-' + day
        const dataAtualizacao = dataCriacao
    
        // CAMPOS
        let errosEnvios = [];

        if(!imagem || Object.keys(imagem).length == 0 || imagem.mimetype.split('/')[0] != 'image'){
            errosEnvios.push({erro: 'Erro ao enviar a imagem'})
        }

        if(
            titulo == undefined || titulo == '' || 
            descricao == undefined || descricao == '' || 
            categoria == undefined || categoria == '' || 
            texto == undefined || texto == '' || 
            autor == undefined || autor == ''
        ){
            errosEnvios.push({erro: 'Erro em um dos textos'})
        }
        
        if(errosEnvios.length == 0){

            // TRATAMENTO IMG
            const imageUpload = uuidv4(imagem.name) + '.' + imagem.mimetype.split('/')[1]

            // ADICIONANDO AO BANCO DE DADOS
            let querySQL = "INSERT INTO artigos (titulo, descricao, categoria, texto, autor, imagem, dataCriacao, dataAtualizacao) VALUES (?,?,?,?,?,?,?,?)"

            connectionDataBase.query(
                querySQL,
                [titulo,descricao, categoria, texto, autor, imageUpload, dataCriacao, dataAtualizacao],
                (erro,result)=>{

                    if(erro == null && result !== undefined){
                        imagem.mv(ROOT_PATH+`/upload/${imageUpload}`) 
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
        
        } catch(erro){ 
            connectionDataBase.destroy();
            console.log('Houve um erro')
            res.status(400).send('Houve um erro')
        }
    })

    // DELETE - Deletar um artigo específico
    routers.delete('/artigos/:id', async(req,res)=>{
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

                // APAGA FOTO
                let idImg = result[0].imagem 
                let deletedFileImg = async () => await fs.unlink(ROOT_PATH+`/upload/${idImg}`)

                // APAGA ARTIGO
                querySQL = "DELETE FROM artigos WHERE id_artigo = ?"

                connectionDataBase.query(querySQL, [req.params.id], (erro, result)=>{
                    if(erro){
                        console.log(erro) 
                        connectionDataBase.destroy();
                        res.status(400).send('Erro ao apagar artigo!')
                        console.log('Erro ao apagar artigo!')
                    } else {
                        deletedFileImg() 
                        connectionDataBase.destroy();
                        res.status(200).send('Artigo apagado com sucesso!')
                        console.log('Artigo apagado com sucesso!')
                    }
                })
                     
            }
        })
    })

    // PUT - Atualizar um artigo específico
    routers.put('/artigos/:id', async (req,res) => {
        try{
            // CONEXAO AO BANCO DE DADOS
        connectionDataBase = await conectDataBase()

        // ENTRADAS
        const {titulo, descricao, categoria, texto, autor} = req.body
        const {imagem} = req.files || 0
        const dataAtualizacao = year + '-' + month + '-' + day
        
        // TRATAMENTO IMG
        const imageUpload = uuidv4(imagem.name) + '.' + imagem.mimetype.split('/')[1]
        
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
                let deletedFileImg = async () => await fs.unlink(ROOT_PATH+`/upload/${idImg}`)

                // CAMPOS
                let errosEnvios = [];

                if(!imagem || Object.keys(imagem).length == 0 || imagem.mimetype.split('/')[0] != 'image'){
                    errosEnvios.push({erro: 'Erro ao enviar a imagem'})
                }

                if(
                    titulo == undefined || titulo == '' || 
                    descricao == undefined || descricao == '' || 
                    categoria == undefined || categoria == '' || 
                    texto == undefined || texto == '' || 
                    autor == undefined || autor == ''
                ){
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
                        deletedFileImg()
                        imagem.mv(ROOT_PATH+`/upload/${imageUpload}`) 
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


// Exportando rotas
module.exports = routers