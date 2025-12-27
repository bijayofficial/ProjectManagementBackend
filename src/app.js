import express from "express";
import cors  from "cors";

// basic config
const app = express();
app.use(express.json({limit: "20kb"}));
app.use(express.urlencoded({extended: true, limit: "20kb"}))
app.use(express.static("public"))// entire public folder is available to the browser

// cors configurations

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
        credentials:true,
        methods:["GET","POST", "PUT","PATCH", "DELETE", "OPTIONS"],
        allowedHeaders:["Content-Type", "Authorization"]
    }
));

// import the routes

import { healthCheck } from "./controllers/healthCheck.controller.js";
app.use("/api/v1/check", healthCheck);


export default app;
