import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});
connectDB()
.then(
    ()=>{
        app.listen(process.env.PORT || 8000,(e)=>{
            console.log(`server is running at port : ${process.env.PORT} ${e}`)
        })
        app.on("error", (error) => {
          console.log("ERROR : ", error);
        });
    }
)
.catch((err)=>{
    console.log(`MONGO DB connection failed : ${err}`);
    
})
















/*import express from "express"
const app = experss()

;(async()=>{
    try {
        mongoose.connect(`${process.env.MONGODB_URI} / ${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("ERROR : ",error);
            
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listining on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("ERROR : ",error)
        throw error
    }
})()*/
