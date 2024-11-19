const prisma = require('../config/prisma');

exports.create = async (req, res) => {
    try {
        const { title, price, description, quantity, categoryId, images } = req.body
        const product = await prisma.product.create({
            data: {
                title: title,
                price: parseFloat(price),
                description: description,
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })

        res.send('create Product success')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.list = async (req, res) => {
    try {
        const { count } = req.params
        const products = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: {
                createdAt: 'desc'
            },
            //indlude คล้ายๆการ ่join table
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.read = async (req, res) => {
    try {
        const { id } = req.params
        const products = await prisma.product.findFirst({
            where: {
                id: Number(id)
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.update = async (req, res) => {
    try {

        const { title, price, description, quantity, categoryId, images } = req.body


        //clern old image
        await prisma.image.deleteMany({
            where: {
                productId: Number(req.params.id)
            }
        })

        const product = await prisma.product.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                title: title,
                price: parseFloat(price),
                description: description,
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })

        res.send(product)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.remove = async (req, res) => {
    try {
        const { id } = req.params
        //หนังชีวิต


        const product = await prisma.product.delete({
            where: {
                id: Number(id)
            }
        })
        res.send('Remove Product success')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}

exports.listby = async (req, res) => {
    try {
        const { sort, order, limit } = req.body
        console.log(sort, order, limit)
        const products = await prisma.product.findMany({
            take: limit,
            orderBy: {
                [sort]: order
            },
            include: {
                category: true,
                images: true
            }
        })

        res.send(products)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}


const handleQuery = async (req, res, query) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                title: {
                    contains: query
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Search Error" })
    }
}

const handleCategory = async (req, res, categoryId) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId: {
                    in: categoryId.map((id) => Number(id))
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Search Error" })
    }
}

const handlePrice = async (req, res, priceRange) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                price: {
                    gte: priceRange[0],
                    lte: priceRange[1]
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Search Error" })
    }
}

exports.searchFilters = async (req, res) => {
    try {
        const { query, category, price } = req.body
        if (query) {
            console.log('query', query)
            await handleQuery(req, res, query)
        }
        if (category) {
            console.log('category', category)
            await handleCategory(req, res, category)

        }
        if (price) {
            console.log('price', price)
            await handlePrice(req, res, price)
        }

        // res.send('Hello Search Product In controller')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server Error" })
    }
}






