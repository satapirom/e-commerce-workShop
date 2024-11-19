const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body
        //step1: validate body
        if (!email, !password) {
            return res.status(400).json({ message: 'Email and password is require' })
        }

        //step2: check email in db already?
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if (user) {
            return res.status(400).json({ message: 'Email already in use' })
        }

        //step3: hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        //step4: create user
        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword
            }
        })

        res.send('Register success')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }

}

exports.login = async (req, res) => {

    try {
        const { email, password } = req.body
        //step1: check email&password in db
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            }
        })
        if (!user || !user.enabled) {
            return res.status(400).json({ message: 'User not  or Enabled' })
        }

        //step2: check password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Password not match' })
        }

        //step2: create Payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        //step3: Generate Token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1d'
        }, (err, token) => {
            if (err) {
                res.status(500).json({ message: "server Error" })
            }
            res.json({
                payload,
                token
            })

        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}


exports.currentUser = async (req, res) => {
    try {

        res.send('Hello current User In controller')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}





