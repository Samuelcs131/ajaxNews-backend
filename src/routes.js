const express = require('express')
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const routers = express.Router()

const ROOT_PATH = require('app-root-path').path 
const URL_API = process.env.URL_API + process.env.PORT + '/upload/'


// DATABASE
const connectionDataBase = require('./database')
 
// DATA HOJE
function dataNow(func){ return Intl.DateTimeFormat('pt-BR', func).format()} 
let [day,year,month] = [dataNow({day: 'numeric'}), dataNow({year: 'numeric'}),dataNow({month: 'numeric'})]

// ROUTES
    // ROTA PRINCIPAL
    routers.get('/', (req,res)=>{
        res.send('API funcionando!')
    })

    // NOVO CADASTRO
    routers.post('/cadastro/artigo', async (req,res)=>{

        try{
        
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
                        res.status(200).send('Cadastrado com sucesso!')
                        console.log('Cadastrado com sucesso!')
                    } else {
                        res.status(400).send('Erro ao enviar!')
                        console.log(erro)
                    }

                })
        
        } else {

            console.log('Erro ao cadastrar')
            return res.status(400).send(errosEnvios)

        } 
        
        } catch(erro){
            res.status(400).send('Houve um erro')
        }
    })

    // CONSULTAR TODOS ARTIGOS
    routers.get('/artigos', async(req,res)=>{

        let querySQL = "SELECT * FROM artigos"

        connectionDataBase.query(querySQL, (erro, result)=> {
            if(erro){
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
            }
        })
    })

    // CONSULTAR ARTIGO POR ID
    routers.get('/artigo/:id', async(req,res)=>{

        let querySQL = "SELECT * FROM artigos WHERE id_artigo = ?"
        
        connectionDataBase.query(querySQL, [req.params.id],(erro, result)=> {
            if(erro){
                res.status(400).send('Erro ao procurar')
            } else {
                res.status(200).send(result)
            }
        })
    })














    // DELETAR ARTIGO
    routers.delete('/deletar/artigo/:id', async(req,res)=>{

        // PESQUISA ID IMAGEM
        let querySQL = "SELECT * FROM artigos WHERE id_artigo = ?"

        connectionDataBase.query(querySQL, [req.params.id],(erro, result)=> {
            if(erro){
                res.status(400).send('Erro ao encontrar o artigo')
                console.log('Erro ao encontrar o artigo')
            } else {

                // APAGA FOTO
                let idImg = result[0].imagem 
                let deletedFileImg = async () => await fs.unlink(`../upload/${idImg}`)

                // APAGA ARTIGO
                querySQL = "DELETE FROM artigos WHERE id_artigo = ?"

                connectionDataBase.query(querySQL, [req.params.id], (erro, result)=>{
                    if(erro){
                        console.log(erro)
                        res.status(400).send('Erro ao apagar artigo!')
                        console.log('Erro ao apagar artigo!')
                    } else {
                        deletedFileImg()
                        res.status(200).send('Artigo apagado com sucesso!')
                        console.log('Artigo apagado com sucesso!')
                    }
                })
                     
            }
        })
    })















    // ATUALIZAR ARTIGO
    routers.put('/atualizar/artigo/:id', async(req,res)=>{

        const {titulo, descricao, categoria, texto, autor} = req.body
        const {imagem} = req.files || 0
        const dataAtualizacao = year + '-' + month + '-' + day

        let querySQL = "UPDATE noticias SET titulo = ?, descricao = ?, categoria = ?, texto = ?, autor = ?, dataAtualizacao = ? WHERE id_artigo = ?"

        connectionDataBase.query(querySQL, [titulo, descricao, categoria, texto, autor, imagem, dataAtualizacao], (erro, result)=>{
        if(erro){
        console.log('Erro ao atualizar!')
        res.status(400).send('Erro ao atualizar!')
        } else {
        console.log('Artigo atualizado com sucesso!')
        res.status(200).send('Artigo atualizado com sucesso!')
        }
        })
        
    })





// Exportando rotas
module.exports = routers