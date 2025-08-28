const asyncHandler  = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => next(error))
    }
}

/*
const asynchnadler = (fn) => async(res,req,next) =>{
try {
    await fn(res,req,next)
} catch (error) {
    res.status(error.code || 5000).json({
        success:false,
        message:error.message
    })
}
}
*/

export { asyncHandler};