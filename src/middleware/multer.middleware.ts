import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage })

const multerMiddleware = (fieldName: string) => upload.single(fieldName)

export default multerMiddleware
