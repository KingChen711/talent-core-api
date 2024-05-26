class ApiError extends Error {
  statusCode: number
  data: { errors: Record<string, string> } | undefined

  constructor(statusCode: number, data: string | { errors: Record<string, string> }) {
    // Call the constructor of the Error class (parent class) to use 'this' (basic OOP knowledge)
    // The parent class (Error) already has the 'message' property, so call it using 'super' to keep it concise
    if (typeof data === 'string') {
      super(data)
    } else {
      super('UNPROCESSABLE_ENTITY')
      this.data = data
    }

    // Set the name of this custom Error; if not set, it will default to "Error"
    this.name = 'ApiError'

    // Assign our custom http status code here
    this.statusCode = statusCode

    // Record the Stack Trace for convenient debugging
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
