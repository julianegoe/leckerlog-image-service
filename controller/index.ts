const Minio = require('minio')
import express, { Express, Request, Response } from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import { BucketItem, BucketStream, ItemBucketMetadata, ResultCallback, UploadedObjectInfo } from 'minio';

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

app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Welcome to Leckerlog Images Service',
    })
});

app.get('/list', async (req: Request, res: Response) => {
    let data: BucketItem[] = []
    var stream: BucketStream<BucketItem> = client.listObjects('images', '', true)
    stream.on('data', function (obj) { data.push(obj) })
    stream.on("end", function () {
        res.status(200).json(data)
    })
    stream.on('error', function (err) {
        res.status(404).send(err.toString())
    })
})

app.post('/upload', upload.single("file"), async (req: Request, res: Response) => {
    var metaData: ItemBucketMetadata = {
        'Content-Type': 'application/octet-stream',
    }
    const { file } = req;
    if (file) {
        const path = file.path;
        const fileName = file.originalname;
        client.fPutObject("images", fileName, path, metaData, function (error: Error, objInfo: UploadedObjectInfo) {
            if (error) res.status(500).json(error)
            res.status(200).json(objInfo)
        });
    }
});

app.get("/download", function (req: Request, res: Response) {
    client.getObject('images', req.query.filename, (err: Error, dataStream: any) => {
        if (err) {
            res.status(404).send(err.toString())
        } else {
            dataStream.pipe(res)
        }
    });
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});