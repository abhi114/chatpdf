import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loads3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// /api/create-chat hit this endpoint and this function will be called
//You can insert a row and get it back in PostgreSQL and SQLite

//await db.insert(users).values({ name: "Dan" }).returning();
 
// partial return
//await db.insert(users).values({ name: "Partial Dan" }).returning({ insertedId: users.id });

export async function POST(req:Request,res:Response) {
    const {userId} = await auth();
    if(!userId){
        return NextResponse.json({error:"unauthorized"},{status:401})
    }
    try {
        const body = await req.json()
        const {file_key,file_name} = body
        await loads3IntoPinecone(file_key)
        //it will return all the inserted values but since we have inserted only 1 value here so to retrive id we traverse to chat_id[0]
        const chat_id = await db.insert(chats).values({
            fileKey:file_key,
            pdfName:file_name,
            pdfUrl:getS3Url(file_key),
            userId,
        }).returning({
            insertedId:chats.id,
        })
        return NextResponse.json({chat_id:chat_id[0].insertedId},{status:200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"internal server error"}, {status:500})
    }

}