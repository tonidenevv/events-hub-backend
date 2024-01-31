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
    const keyFilename = process.env.STORAGE_FILE_NAME;

    const storage = new Storage({
        projectId,
        keyFilename,
    });

    const bucket = storage.bucket(bucketName);

    return { multer, bucket };
}