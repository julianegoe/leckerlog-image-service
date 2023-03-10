"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Minio = require('minio');
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const client = new Minio.Client({
    endPoint: process.env.MINIO_STORANGE_ENDPOINT,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});
const app = (0, express_1.default)();
const port = process.env.PORT;
const upload = (0, multer_1.default)({ dest: 'uploads/' });
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'https://prod.leckerlog.dwk.li'],
}));
app.use(express_1.default.json());
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        message: 'Welcome to Leckerlog Images Service',
    });
}));
app.get('/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = [];
    var stream = client.listObjects('images', '', true);
    stream.on('data', function (obj) { data.push(obj); });
    stream.on("end", function () {
        res.status(200).json(data);
    });
    stream.on('error', function (err) {
        res.status(404).send(err.toString());
    });
}));
app.post('/upload', upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var metaData = {
        'Content-Type': 'application/octet-stream',
    };
    const { file } = req;
    if (file) {
        const path = file.path;
        const fileName = file.originalname;
        client.fPutObject("images", fileName, path, metaData, function (error, objInfo) {
            if (error)
                res.status(500).json(error);
            res.status(200).json(objInfo);
        });
    }
}));
app.get("/download", function (req, res) {
    client.getObject('images', req.query.filename, (err, dataStream) => {
        if (err) {
            res.status(404).send(err.toString());
        }
        else {
            dataStream.pipe(res);
        }
    });
});
app.get('/create/bucket', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bucketname } = req.query;
    client.makeBucket(bucketname, 'eu-east-1', function (err) {
        if (err)
            return console.log('Error creating bucket.', err);
        console.log('Bucket created successfully in "eu-east-1".');
        res.status(200).json({
            message: 'Bucket successfully created.'
        });
    });
}));
app.listen(port, () => {
    console.log(`??????[server]: Server is running at http://localhost:${port}`);
});
