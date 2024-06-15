import { Request } from 'express'
import multer from 'multer'

import RequestValidationException from '../helpers/errors/request-validation.exception'

const storage = multer.memoryStorage()

const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  // Accept only pdf, doc, and docx files
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    callback(null, true)
  } else {
    callback(new RequestValidationException({ cv: 'Only .pdf, .doc, and .docx files are allowed' }))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter
})

const cvMulterMiddleware = upload.single('cv')

export default cvMulterMiddleware
