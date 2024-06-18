
import {integer, pgEnum, pgTable,serial, text, timestamp, varchar} from 'drizzle-orm/pg-core'
//we create it for the chats
//each chat in the chat feed will be 1 row in the database
//each chat will contain a name of pdf , url to pdf , user id related to it ,and all the conversation that has happened till then
//the use of enum basically defines that the role can be from the either of the 2 rather than a integer value
export const userSystemEnum = pgEnum('user_system_enum',['system','user'])
export const chats  = pgTable('chats',{
    id: serial('id').primaryKey(),
    pdfName: text('pdf_name').notNull(),
    pdfUrl : text('pdf_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: varchar('user_id',{length:256}).notNull(),
    fileKey:text('file_key').notNull(),
});

//chat id so that each message will belong to a chat one to many relation
export const messages = pgTable('messages',{
    id: serial('id').primaryKey(),
    chatId: integer('chat_id').references(()=>chats.id).notNull(),
    content: text('content').notNull(),
    createdAt:timestamp('created_at').notNull().defaultNow(),
    role: userSystemEnum('role').notNull()
});

//drizzle-kit - use for migration and to make sure the database is synced up with the schema written here
