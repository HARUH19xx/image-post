import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import AWS from "aws-sdk";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: "./.env" });

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

const uploader = (app, connectionExecute) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            cb(null, path.join(__dirname, '../assets/uploads'));
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });

    const upload = multer({ storage: storage });

    const ensureAuthenticated = (req, res, next) => {
        if (req.session.user) {
            next();
        } else {
            res.status(401).json({ success: false, message: 'ログインが必要です。' });
        }
    };

    app.post('/upload-image', ensureAuthenticated, async (req, res) => {
        try {
            await upload.single('image')(req, res, async (err) => {

                // 画像ファイルを受け取る
                const image = req.file;

                // コメントを受け取る
                const comment = req.body.comment;

                // S3への画像アップロード
                const fileContent = await fs.readFile(image.path);
                const s3Params = {
                    Bucket: 'my-image-post',
                    Key: `uploads/${image.filename}`,
                    Body: fileContent,
                    ContentType: image.mimetype
                };

                s3.upload(s3Params, async (err, data) => {
                    if (err) {
                        console.error("Error uploading to S3:", err);
                        res.status(500).json({ success: false, message: "S3へのアップロード中にエラーが発生しました。" });
                    } else {
                        console.log("Image uploaded to S3:", data.Location);

                        // データベースにコメントと画像のURLを保存
                        try {
                            const imageUrl = data.Location;
                            const query = 'INSERT INTO posts (user_id, image_url, comment) VALUES (?, ?, ?)';
                            const rows = await connectionExecute(query, [req.session.user.id, imageUrl, comment]);
                            console.log('Image and comment saved to database:', rows);
                        } catch (error) {
                            console.error('Error during saving to database:', error);
                            res.status(500).json({ success: false, message: 'データベースへの保存中にエラーが発生しました。' });
                        }

                        // ローカルの画像ファイルを削除
                        await fs.unlink(image.path);

                        res.status(200).json({ success: true, message: '画像をアップロードしました。', imageUrl: data.Location });
                    }
                });
            });
        } catch (error) {
            console.error('Error during image upload:', error);
            res.status(500).json({ success: false, message: 'サーバーエラーが発生しました。' });
        }
    });
};

export default uploader;