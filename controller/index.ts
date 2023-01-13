const Minio = require('minio')
import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const client = new Minio.Client({
    endPoint: process.env.MINIO_STORANGE_ENDPOINT,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

const app: Express = express();
const port = process.env.PORT;
const upload = multer({ dest: 'uploads/' })

app.use(cors({
    origin: ['http://localhost:5173', 'https://prod.leckerlog.dwk.li'],
}));
app.use(express.json());
// app.use('/', checkJwt);

app.get('/', async (req: Request, res: Response) => {
    res.status(200).json('Hello world')
})

app.post('/image/upload', upload.single("file"), async (req: Request, res: Response) => {
    var metaData = {
        'Content-Type': 'application/octet-stream',
      }
    const { file } = req;
    const path = file?.path
    const fileName = file?.originalname;
    if (file) {
        client.fPutObject("images", fileName, path, metaData, function (error: any, objInfo: any) {
            if (error)  res.status(500).json(error)
            res.status(200).json(objInfo)
        });
    }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});