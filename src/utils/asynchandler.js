const asynchnadler = (fn) => {
    (res, req, next) => {
        Promise.resolve(fn(res, req, next)).catch((error) => next(error))
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