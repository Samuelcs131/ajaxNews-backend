const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/* CONFIG SERVER */
const connectionDataBase = mysql.createConnection({
    host     : 'us-cdbr-east-05.cleardb.net',
    user     : 'b3de2a7fe3b263',
    password : '6919978e',
    database : 'heroku_9cfce6ba18c6ba1'
})
connectionDataBase.connect()

app.use(cors())
app.use(fileUpload())
app.use(express.json())

// DATA HOJE
function dataNow(func){ return Intl.DateTimeFormat('pt-BR', func).format()} 
let [day,year,month] = [dataNow({day: 'numeric'}), dataNow({year: 'numeric'}),dataNow({month: 'numeric'})]

/* ROTAS */
app.get('/', (req,res)=>{
    res.send('Funcionando!')
})


    // NOVO CADASTRO
    app.post('/cadastro/artigo', async (req,res)=>{

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
                        imagem.mv(__dirname+`/upload/${imageUpload}`)
                        res.status(200).send('Cadastrado com sucesso!')
                        console.log('Cadastrado com sucesso!')
                    } else {
                        res.status(400).send('Erro ao enviar ')
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
    app.get('/artigos', async(req,res)=>{
        let querySQL = "SELECT * FROM artigos"

        connectionDataBase.query(querySQL, (erro, result)=> {
            if(erro){
                res.status(400).send('Erro ao procurar')
            } else {
                res.status(200).send(result)
            }
        })
    })

    // CONSULTAR ARTIGO POR ID
    app.get('/artigo/:id', async(req,res)=>{

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
    app.delete('/deletar/artigo/:id', async(req,res)=>{

        // PESQUISA ID IMAGEM
        let querySQL = "SELECT * FROM artigos WHERE id_artigo = ?"

        connectionDataBase.query(querySQL, [req.params.id],(erro, result)=> {
            if(erro){
                res.status(400).send('Erro ao encontrar o artigo')
                console.log('Erro ao encontrar o artigo')
            } else {

                // APAGA FOTO
                let idImg = result[0].imagem 
                let deletedFileImg = async () => await fs.unlink(`./upload/${idImg}`)

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
    app.put('/atualizar/artigo/:id', async(req,res)=>{

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

    // EXIBIR IMAGEM
    app.get('/imagem/:id', (req,res)=>{
        try{
            res.sendFile(__dirname+'/upload/'+req.params.id)
            console.log(req.params.id)
        } catch(erro){
            res.redirect('/')
            console.log(erro)
        }
    })

/* SAIDA */
const PORT = process.env.PORT || 8085
app.listen(PORT, ()=>{
    console.log(`Servidor na porta http://localhost:${PORT}`)
})
