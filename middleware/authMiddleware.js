const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const authMiddleware = {
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization;

        if(!token){
            return res.status(401).json({ message: 'Authentication failed' });
        }

        try {
            jwt.verify(token, config.SECRET_KEY, (err, decodedToken) => {
                if(err){
                    if(err.name === 'TokenExpiredError'){
                        return res.status(401).json({ message: 'Token expired' });
                    } else {
                        return res.status(401).json({ message: 'Authentication failed' });
                    }
                }

                req.userId = decodedToken.userId;
                next();
            });
        } catch(error){
            console.error('Error verifying token', error);
            return res.status(401).json({ message: 'Authentication failed' });
        }
    }
};

module.exports = authMiddleware;