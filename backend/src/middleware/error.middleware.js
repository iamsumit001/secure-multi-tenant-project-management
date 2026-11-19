const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === "production";

    res.status(statusCode).json({
        success: false,
        // Hide internal error details in production
        message: statusCode === 500 && isProduction
            ? "Internal server error"
            : err.message || "Internal server error"
    });
};

module.exports = {
    errorHandler
};