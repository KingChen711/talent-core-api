import RequestValidationException from '../../helpers/errors/request-validation.exception'

export type ValidationErrors = Record<string, string>

class OpenRecruitmentDriveException extends RequestValidationException {
  constructor() {
    super({ isOpening: 'Cannot open a recruitment drive while there is another recruitment drive is opening' })

    this.name = 'OpenRecruitmentDriveException'
    Object.setPrototypeOf(this, OpenRecruitmentDriveException.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default OpenRecruitmentDriveException
