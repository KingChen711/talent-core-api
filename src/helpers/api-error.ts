class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    // Call the constructor of the Error class (parent class) to use 'this' (basic OOP knowledge)
    // The parent class (Error) already has the 'message' property, so call it using 'super' to keep it concise
    super(message)

    // Set the name of this custom Error; if not set, it will default to "Error"
    this.name = 'ApiError'

    // Assign our custom http status code here
    this.statusCode = statusCode

    // Record the Stack Trace for convenient debugging
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
