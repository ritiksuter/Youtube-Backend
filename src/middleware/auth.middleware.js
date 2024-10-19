import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';

const verifyJWT = asyncHandler (async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken;

        console.log(token);
        
        if(!token) {
            throw new ApiError(401, "No Access Token is generated");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        if(!decodedToken) {
            throw new ApiError(401, "Not verified");
        }

        const user = await User.findById(decodedToken._id);

        if(!user) {
            throw new ApiError(404, "User not found");
        }

        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError(404, "Access and Refresh Tokens are not present");
    }
});

export { verifyJWT };