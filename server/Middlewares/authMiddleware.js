import jwt from 'jsonwebtoken';

export const verifyToken = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({error: "Not authorized Login first"});
    }
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not authorized. Login first." });
    }
    const token = authHeader.substring(7); //here end is last ele by default 
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({error: "Invalid or expired token"});
    }
}
