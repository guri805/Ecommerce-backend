const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    try {
        // Extract token from cookies OR Authorization header
        const token = req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

        console.log("Extracted Token:", token); //  Debugging log

        if (!token) {
            return res.status(401).json({
                message: "Access token missing. Please log in.",
                error: true,
                success: false
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded Token Data:", decoded); //  Debugging log

        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized access. Invalid token.",
                error: true,
                success: false
            });
        }

        // Attach user ID to request
        req.userId = decoded.id;
        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({
            message: "Authentication failed. Please log in again.",
            error: true,
            success: false
        });
    }
};

module.exports = auth;
