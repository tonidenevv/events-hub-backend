const { Storage } = require('@google-cloud/storage');
const Multer = require('multer');

module.exports = (bucketName) => {
    const multer = Multer({
        storage: Multer.memoryStorage(),
        limits: {
            fileSize: 1024 * 1024,
        },
    });

    const projectId = process.env.STORAGE_PROJECT_ID;

    const storage = new Storage({
        projectId,
        credentials: JSON.parse(process.env.STORAGE_KEY_CREDENTIALS),
    });

    const bucket = storage.bucket(bucketName);

    return { multer, bucket };
}