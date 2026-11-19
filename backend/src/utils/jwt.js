const jwt = require("jsonwebtoken");

const getAccessSecret = () => {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_ACCESS_SECRET is not set in environment variables");
    return secret;
};
const getRefreshSecret = () => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error("JWT_REFRESH_SECRET is not set in environment variables");
    return secret;
};

const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        getAccessSecret(),
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
        }
    );
};

const generateRefreshToken = (payload) => {
    return jwt.sign(
        payload,
        getRefreshSecret(),
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
        }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, getAccessSecret());
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, getRefreshSecret());
};

const signToken = (user) => {
    return generateAccessToken({
        userId: user.id || user.userId,
        email: user.email,
        tenantId: user.tenantId,
        roleId: user.roleId
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    signToken
};
