const mysql = require('mysql2');

module.exports = async function connection(){

const connectionDataBase = mysql.createConnection({
    host     : process.env.HOST_DATABASE,
    user     : process.env.USER_DATABASE,
    password : process.env.PASSWORD_DATABASE,
    database : process.env.SCHEMA_DATABASE
})

connectionDataBase.connect( 
    (erro)=> {
    if(erro){
        console.log('Falha ao se conectar com o banco!')
    } else {
        console.log('Banco conectado!')
    }
})

return connectionDataBase
}