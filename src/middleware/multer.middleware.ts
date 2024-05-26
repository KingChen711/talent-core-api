import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage })

const multerMiddleware = upload.single('image')

export default multerMiddleware
