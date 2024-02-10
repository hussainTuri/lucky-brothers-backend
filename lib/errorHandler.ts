export class ValidationError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class CustomError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}
