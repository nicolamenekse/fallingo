const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Sunucu hatası oluştu.';

  if (err.name === 'CastError') {
    message = 'Geçersiz ID formatı.';
    statusCode = 400;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldLabels = { email: 'E-posta adresi' };
    message = `${fieldLabels[field] || field} zaten kullanımda.`;
    statusCode = 409;
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((e) => e.message).join('. ');
    statusCode = 400;
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Dosya boyutu 10MB\'dan büyük olamaz.';
    } else {
      message = 'Dosya yükleme hatası.';
    }
    statusCode = 400;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Endpoint bulunamadı: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
