import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import dotenv from 'dotenv';

dotenv.config({
    path: "./.env",
});

const port = 8000 || process.env.PORT;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`http://localhost:${port}`)
        });
    }).catch(() => {
        console.log("Some error occured while connecting to the server");
    });