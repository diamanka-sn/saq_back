const multer = require('multer');

const MIME_TYPE = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images/products/');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPE[file.mimetype];
        callback(null, name.split('.')[0] + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage: storage }).array('url', 5); 
