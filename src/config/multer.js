const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')
const fs = require('fs').promises

const s3 = new aws.S3()

// CONFIGURAÇÃO LOCAL & AWS
const storageTypes = {
    saveLocal: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..','..','upload'))
        },
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (erro, hash) => {
                if(erro) cb(erro);

                const fileName = `${hash.toString('hex')}-${file.originalname}`

                cb(null, fileName)
            })
        }
    }),
    saveAWS: multerS3({
        s3: new aws.S3(),
        bucket: process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) =>{
            crypto.randomBytes(16, (erro, hash) => {
                if(erro) cb(erro);

                const fileName = `${hash.toString('hex')}-${file.originalname}`

                cb(null, fileName)
            })
        }
    })
}

// REMOVE IMAGEM
const removeImage = (idImg) => {

    if(process.env.LOCAL_SAVE_STORAGE == 'saveAWS'){

        return new aws.S3().deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: idImg
        }).promise()

    } else {
        fs.unlink(path.resolve(__dirname, '..','..','upload', idImg))
    }

}

// CONFIGURAÇÃO FILTRO ARQUIVO
const multerConfig = {
    dest: path.resolve(__dirname, '..','..','upload'),
    
    storage: storageTypes[process.env.LOCAL_SAVE_STORAGE],
   
    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: (req, file, cb)=> {
        const allowedMimes = [ 'image/jpeg', 'image/pjpeg', 'image/png', 'image/gif' ];

        if(allowedMimes.includes(file.mimetype)){
            cb(null, true)
        } else { cb(new Error('Formato de imagem invalida!')) }
    }
}


module.exports = { multerConfig, removeImage}