export function errorHandler(err, req, res, next) {
  console.error(err);

  const response = {
    error: 'Internal server error'
  };

  if (process.env.NODE_ENV === 'development') {
    response.message = err.message;
  }

  res.status(500).json(response);
}

export default errorHandler;
