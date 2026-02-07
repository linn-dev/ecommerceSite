const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if(err.code === "P2002") {
        const field = err.meta?.target ? `field: ${err.meta.target}` : "record";
        return res.status(400).json({
            success: false,
            message: `This record already exists (${field})`
        });
    }

    if(err.code === "P2025") {
        return res.status(400).json({
            success: false,
            message: "Record not found"
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Server Error"
    });
}

export default errorHandler;