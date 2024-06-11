import RequestValidationException from 'src/helpers/errors/request-validation.exception'

export type ValidationErrors = Record<string, string>

class AlreadyUsedCodeException extends RequestValidationException {
  constructor() {
    super({ code: 'This code is already used' })

    this.name = 'AlreadyUsedCodeException'
    Object.setPrototypeOf(this, AlreadyUsedCodeException.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default AlreadyUsedCodeException
