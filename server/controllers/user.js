const prisma = require('../config/prisma');

exports.listUser = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                enabled: true,
                address: true
            }
        })
        res.send(users)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.changeStatus = async (req, res) => {
    try {
        const { id, enabled } = req.body
        console.log(id, enabled)
        const user = await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: {
                enabled: enabled
            }
        })
        res.send('Change Status Success')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.changeRole = async (req, res) => {
    try {
        const { id, role } = req.body;
        const user = await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: {
                role: role
            }
        });

        res.status(200).json({ message: 'Update Role Success', user });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.userCart = async (req, res) => {
    try {
        const { cart } = req.body;
        console.log(cart);
        console.log(req.user.id);

        // Fetch user by ID
        const user = await prisma.user.findFirst({
            where: {
                id: Number(req.user.id)
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete all products in the user's cart
        await prisma.productOnCart.deleteMany({
            where: {
                cart: {
                    orderById: user.id
                }
            }
        });

        // Delete the user's existing cart
        await prisma.cart.deleteMany({
            where: {
                orderById: user.id
            }
        });

        // Prepare products data for the new cart
        let products = cart.map((item) => ({
            productId: item.id,  // Corrected to 'productId' as per your schema
            count: item.count,
            price: item.price
        }));

        // Calculate cart total
        let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0);

        // Create the new cart and associated products
        const newCart = await prisma.cart.create({
            data: {
                cartTotal: cartTotal,
                orderById: user.id,
                products: {
                    create: products
                }
            }
        });

        console.log(newCart);
        res.send('Add Cart Success');

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getUserCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: {
                orderById: Number(req.user.id)
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        })
        // console.log(cart)
        res.send({
            product: cart.products,
            cartTotal: cart.cartTotal
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.emptyCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: {
                orderById: Number(req.user.id)
            }
        })
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        await prisma.productOnCart.deleteMany({
            where: {
                cartId: cart.id
            }
        })

        const result = await prisma.cart.deleteMany({
            where: {
                orderById: Number(req.user.id)
            }
        })

        console.log(result)
        res.json({
            message: 'Empty Cart Success',
            deleteCount: result.count
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.saveAddress = async (req, res) => {
    try {
        const { address } = req.body
        console.log(address)

        const user = await prisma.user.update({
            where: {
                id: Number(req.user.id)
            },
            data: {
                address: address
            }
        })
        res.json({
            ok: true,
            message: 'Update Address Success'
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.saveOrder = async (req, res) => {
    try {
        // Step 1: Get the user cart
        const userCart = await prisma.cart.findFirst({
            where: {
                orderById: Number(req.user.id)
            },
            include: {
                products: true
            }
        });

        // Step 2: Check if the cart exists and is not empty
        if (!userCart || userCart.products.length === 0) {
            return res.status(404).json({ message: "Cart is empty" });
        }

        // Step 3: check quantity
        for (const item of userCart.products) {
            // console.log(item)
            const product = await prisma.product.findUnique({
                where: {
                    id: item.productId
                },
                select: {
                    quantity: true,
                    title: true
                }
            })
            // console.log("item:", item)
            // console.log("product:", product)
            if (!product || item.count > product.quantity) {
                return res.status(404).json({ message: `${product?.title || 'Product'} is out of stock` });
            }
        }

        //step 4: create new order
        const order = await prisma.order.create({
            data: {
                products: {
                    create: userCart.products.map((item) => ({
                        productId: item.productId,
                        count: item.count,
                        price: item.price
                    }))
                },
                orderedBy: {
                    connect: {
                        id: req.user.id
                    }
                },
                cartTotal: userCart.cartTotal
            }
        })

        //step 5: update product 
        const update = userCart.products.map((item) => ({
            where: {
                id: item.productId
            },
            data: {
                quantity: {
                    decrement: item.count
                },
                sold: {
                    increment: item.count
                }
            }
        }))

        console.log(update)

        await Promise.all(
            update.map((updated) => prisma.product.update(updated))
        )

        await prisma.cart.deleteMany({
            where: { orderById: Number(req.user.id) }
        })
        res.json({ message: 'Order Success' })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};


exports.getOrder = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                orderedBy: {
                    id: Number(req.user.id)
                }
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        })
        if (orders.length === 0) {
            return res.status(404).json({ message: "No Order" })
        }
        console.log(orders)
        res.json({ message: "Get Order Success", orders })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}