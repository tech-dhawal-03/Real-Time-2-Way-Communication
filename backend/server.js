import express from 'express';
import dotenv from 'dotenv';
import { setupSocket } from './config/socket.js';
import {createServer} from 'http';
import cors from 'cors';
import { connectToDB } from './config/db.js';


dotenv.config();

const app = express();
const httpServer = createServer(app);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.BACKEND_PORT;


const allowedOrigins = [
    'https://real-time-2-way-communication.vercel.app',
    'http://localhost:8080'
]

app.use(cors({
    origin : function (origin,callback){
        if(!origin) return callback(null,true);
        if(allowedOrigins.includes(origin)){
            return callback(null,true)
        } else {
            return callback(new Error('Not allowed ny CORS policy'));
        }
    }
 
},

    
))

//connect to DB
const connectionDB = await connectToDB();
console.log(connectionDB);


//setting up socket.io
setupSocket(httpServer);


app.get('/',(req,res)=>{
    console.log("ALL OK !")
    res.json("ALL OK")
})

httpServer.listen(PORT,()=>{
    console.log(`Node.js Backend Server is listening on PORT : ${PORT} `)

})