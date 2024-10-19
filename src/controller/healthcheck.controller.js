import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler (async (req, res) => {
    return res.json({
        message: "OK"
    });
});

export { healthcheck };