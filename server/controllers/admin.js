const prisma = require('../config/prisma')

exports.changeOrderStatus = async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body
        console.log(req.body)
        const orderUpdate = await prisma.order.update({
            where: {
                id: Number(orderId)
            },
            data: {
                orderStatus: orderStatus
            }

        })

        res.json(orderUpdate)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.getOrderAdmin = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                products: {
                    include: {
                        product: true // includes product details within each order
                    }
                },
                orderedBy: { // correctly include the 'orderedBy' relation
                    select: {
                        id: true,
                        email: true,
                        address: true,
                    }
                }
            }
        })
        res.send(orders)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}
