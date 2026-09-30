import { redis } from "../index.js"
const rateLimiter = async (req, res, next) => {
    const ip_address = req.ip

    const key = `rate_limit:${ip_address}`

    const request = await redis.incr(key)

    if (request == 1) {
        await redis.expire(key, 60)
    }

    if (request > 5) {
        return res.status(429).json({
            message: "Too many requests"
        })
    }

    next()

}

export default rateLimiter