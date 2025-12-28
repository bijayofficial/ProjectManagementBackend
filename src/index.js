import dotenv from "dotenv";
// import express from "express";
import app from "./app.js"
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

// const myUsername = process.env.USERNAME;
// const database = process.env.DATABASE;

// console.log(`starter backend project ${myUsername}`);
// console.log(`database: ${database}`);


// const app = express();
const port = process.env.PORT || 5000;


// app.get('/', (req , res, err)=>{
//   res.send('Hello');

// })


// app.listen(port, ()=>{
//   console.log(`Server is  listening at ${port}`)
// })

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is  listening at http://localhost:${port}`)
   
  })
}).catch((err) => {
  console.error("MongoDB connection error", err);
  process.send(1);
})