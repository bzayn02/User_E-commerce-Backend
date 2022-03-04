import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();

import helmet from 'helmet';
const PORT = process.env.PORT || 8000;

//Connect MongoDB
import mongoClient from './config/db.js';
mongoClient();

//middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('tiny'));
app.use(express.urlencoded());
app.use(express.json());

//load routers
import userRouter from './routers/userRouter.js';
import tokenRouter from './routers/tokenRouter.js';

// isUser authentication
import { isUser } from './middlewares/auth.middleware.js';

//use routers
app.use('/api/v1/user', userRouter);
app.use('/api/v1/token', tokenRouter);

app.use('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.listen(PORT, (error) => {
    if (error) {
        return console.log(error);
    }
    console.log(`Server is running at http://localhost:${PORT}`);
});
