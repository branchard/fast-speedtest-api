class ApiError extends Error {
  /**
   * Create new ApiError
   *
   * @param  {object} options {code<One of ApiError.CODES>, message<string>}
   */
  constructor(options) {
    if (options && options.code && Object.values(ApiError.CODES).indexOf(options.code) > -1) {
      const codeKey = Object.keys(ApiError.CODES).find(key => ApiError.CODES[key] === options.code);
      super(`${codeKey}: ${options.message || options.code}`);
      this.code = codeKey;
    } else if (options && options.message) {
      super(options.message);
    } else {
      super();
    }
  }
}

ApiError.CODES = {
  // CODE: Message
  BAD_TOKEN: 'Unknown app token',
  UNREACHABLE_HTTPS_API: 'Fast api is unreachable with https, try with http',
  UNREACHABLE_HTTP_API: 'Fast api is unreachable, check your network connection',
  UNKNOWN: 'Unknown error',
};

module.exports = ApiError;
