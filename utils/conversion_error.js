// Error handling

class ConversionError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.name = 'ConversionError';
    }
  }

module.exports = ConversionError;