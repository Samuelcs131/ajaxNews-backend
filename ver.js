 // VERIFICA ARQUIVOS DA PASTA UPLOAD
 const listarArquivosDiretorio = async (diretorio) =>{
    let listaDeArquivos = await fs.readdir(diretorio)
    
    let searchArquivo = listaDeArquivos.some(arquivo => arquivo = `${upload}.${extenseImg}`)
    
    console.log(searchArquivo)

    return searchArquivo
}

let lista = await listarArquivosDiretorio('./upload')
 