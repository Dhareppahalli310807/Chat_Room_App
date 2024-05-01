import dotenv from 'dotenv';
dotenv.config();
import { connectToDatabase } from './db.config.js';
import { server } from './server.js';
server.listen(8080, () => {
    console.log("Listening on port 8080");
    connectToDatabase();
});
