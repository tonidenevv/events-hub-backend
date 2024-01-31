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
    // const keyFilename = process.env.STORAGE_FILE_NAME;
    // const credentials = {
    //     type: process.env.KEY_FILENAME_TYPE,
    //     project_id: process.env.KEY_FILENAME_PROJECTID,
    //     private_key_id: process.env.KEY_FILENAME_PROJECT_KEY_ID,
    //     private_key: process.env.KEY_FILENAME_PRIVATE,
    //     client_email: process.env.KEY_FILENAME_CLIENT_EMAIL,
    //     client_id: process.env.KEY_FILENAME_CLIENTID,
    //     auth_uri: process.env.KEY_FILENAME_AUTH_URI,
    //     token_uri: process.env.KEY_FILENAME_TOKEN_URI,
    //     auth_provider_x509_cert_url: process.env.KEY_FILENAME_CERT_URL_AUTH,
    //     client_x509_cert_url: process.env.KEY_FILENAME_CERT_URL_CLIENT,
    //     universe_domain: process.env.KEY_FILENAME_UNIVERSE_DOMAIN,
    // }

    console.log(credentials);

    const storage = new Storage({
        projectId,
        // keyFilename,
        credentials: JSON.parse(process.env.STORAGE_KEY_CREDENTIALS),
        // credentials,
    });

    const bucket = storage.bucket(bucketName);

    return { multer, bucket };
}