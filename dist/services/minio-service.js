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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.getDownloadLink = void 0;
const Minio = require('minio');
const fs = require('file-system');
const client = new Minio.Client({
    endPoint: 'storage-s3.leckerlog.dwk.li',
    accessKey: 'admin',
    secretKey: 'SchiggykochtSpaghetti89!'
});
function getDownloadLink() {
    let data = [];
    const stream = client.listObjects('images');
    stream.on('data', function (obj) { data.push(obj); });
    stream.on("end", function (obj) {
        console.log(data);
        return data;
    });
    stream.on('error', function (err) { console.log(err); });
}
exports.getDownloadLink = getDownloadLink;
function uploadImage(originalname, path) {
    return __awaiter(this, void 0, void 0, function* () {
        var metaData = {
            'Content-Type': 'application/octet-stream',
        };
        return client.fPutObject("images", originalname, path, metaData, function (error, objInfo) {
            if (error)
                return { error };
            return objInfo;
        });
    });
}
exports.uploadImage = uploadImage;
