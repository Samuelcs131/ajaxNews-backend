const mysql = require('mysql2');

if(global.conectDB && global.conectDB.state !== 'disconected'){
    return global.conectDB
}
const connectionDataBase = mysql.createConnection({
    host     : process.env.HOST_DATABASE,
    user     : process.env.USER_DATABASE,
    password : process.env.PASSWORD_DATABASE,
    database : process.env.SCHEMA_DATABASE
})
connectionDataBase.connect( 
    (erro)=> {
    if(erro){
        global.conectDB
    } else {
        console.log('Banco conectado!')
    }
})
global.conectDB = connectionDataBase


module.exports = connectionDataBase