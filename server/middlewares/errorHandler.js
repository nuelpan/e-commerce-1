function errorHandler (err, req, res, next) {
  if (process.env.NODE_ENV === 'development') console.log(err)

  let status = ''
  let message = ''

  switch (err.name) {
    case 'ValidationError':
      status = 400
      let arr = []
      for (const key in err.errors) {
        arr.push(err.errors[key].message)
      }
      message = arr
      break;
    case 'JsonWebTokenError':
      status = 401
      if (err.message == 'jwt must be provided') {
        message = 'You must login to do that!'
      } else if (err.message == 'jwt malformed') {
        message = 'You are not authorized'
      } else {
        message = err.message
      }
      break;  
    default:
      status = err.status || 500
      message = err.message || err.msg || 'Internal server error'
      break;
  }
  res.status(status).json({
    code: status,
    message
  })
}

module.exports = errorHandler