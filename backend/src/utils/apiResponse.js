const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
  });
};

const sendError = (res, message = 'An error occurred', statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error: process.env.NODE_ENV === 'development' ? error : null,
  });
};

const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    message,
    error: null,
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
