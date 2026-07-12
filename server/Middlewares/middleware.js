export const middleware = async(req, res, next) => {
    console.log(req.method, req.url);
    next();
};