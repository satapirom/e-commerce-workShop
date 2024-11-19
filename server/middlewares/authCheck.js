const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

exports.authCheck = async (req, res, next) => {
    try {
        const headerToken = req.headers.authorization
        if (!headerToken) {
            return res.status(401).json({ message: 'Token not found' })
        }
        const token = headerToken.split(' ')[1]

        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode

        const user = await prisma.user.findFirst({
            where: {
                email: req.user.email
            }
        })

        if (!user.enabled) {
            res.status(401).json({ message: 'This account cannot access' })
        }

        next()

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Token not valid" })
    }
}

exports.adminCheck = async (req, res, next) => {
    try {
        const { email } = req.user;
        const adminUser = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(401).json({ message: 'You are not admin' });
        }

        console.log(adminUser);
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Admin check failed" });
    }
};
