import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'
import {Document,RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'
import { getEmbeddings } from "./embeddings";
import md5 from 'md5'
import { FileKey } from "lucide-react";
import { convertToAscii } from "./utils";


export const getPineconeClient =async () => {
     return new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
}

type PDFPage = {
    pageContent:string,
    metadata:{
        loc:{pageNumber:number}
    }
}


export async function loads3IntoPinecone(file_key:string){
    //1. obtain the pdf - download and read from s3
    console.log('downloading s3 into file system')
    const file_name = await downloadFromS3(file_key);
    if(!file_name){
        throw new Error('could not download from s3')
    }
    const loader = new PDFLoader(file_name);
    //The result of the asynchronous operation is then cast as an array of PDFPage objects using (as PDFPage[]). 
    //This casting tells TypeScript to treat the result of the operation as an array of objects conforming to the PDFPage type.
    const pages = (await loader.load()) as PDFPage[];

    //2 split and segment the pdf into smaller documents

    const documents = await Promise.all(pages.map(prepareDocument))

    //3 vectorize and embedd the documents
    const vectors = await Promise.all(documents.flat().map(embedDocument))

    //4 upload to pinecone
    const client = await getPineconeClient();
  const pineconeIndex = await client.index("chatpdf");
  const namespace = pineconeIndex.namespace(convertToAscii(file_key));

  console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);

  return documents[0];
}

async function embedDocument(doc:Document){
    try {
        const embeddings = await getEmbeddings(doc.pageContent)
        //hasing to id the vector within pinecone
        const hash = md5(doc.pageContent)
        return {
            id:hash,
            values:embeddings,
            metadata:{
                text:doc.metadata.text,
                pageNumber:doc.metadata.pageNumber
            }
        } as PineconeRecord
    } catch (error) {
        console.log("error embedding documents",error);
        throw error;
    }
}


//The purpose of this function is to truncate a string to a specified number of bytes while ensuring that the resulting truncated string is still valid UTF-8. 
//This can be useful in scenarios where you need to limit the length of a string in a way that doesn't break its encoding or introduce invalid characters.
export const truncateStringByBytes =  (str:string ,bytes:number) =>{
    const enc= new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0,bytes ))
}

async function prepareDocument(page:PDFPage) {
    let {pageContent,metadata} = page
    //replace all the new line character with a empty string
    pageContent = pageContent.replace('/\n/g','')
    //split the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([new Document({
        pageContent,
        metadata:{
            pageNumber:metadata.loc.pageNumber,
            text:truncateStringByBytes(pageContent,36000)
        }
})])
return docs 
    
}