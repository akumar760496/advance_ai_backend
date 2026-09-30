import express from "express"
import dotenv from 'dotenv'
import connectDB from "./lib/db.js"
import User from "./model/user.model.js"
import Redis from "ioredis"
import rateLimiter from "./middleware/ratelimit.js"
dotenv.config()

const port = process.env.PORT || 5000

const app = express()

export const redis = new Redis(process.env.REDIS_URL)


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "hello from redis"
    })
})


app.post("/create", async (req, res) => {
    const { name, email, password } = req.body

    const user = await User.create({
        name, email, password
    })
    return res.json(user)
})

app.get("/get", rateLimiter, async (req, res) => {
    const user = await User.find({})
    return res.json(user)
})

app.get("/get-with-redis", async (req, res) => {
    // check data inside redis
    const redis_data = await redis.get("user:all")
    if (redis_data) {
        const parsedData = JSON.parse(redis_data)
        console.log(parsedData)
        return res.json(parsedData)
    }

    //if not fetch data from db
    const user = await User.find({})
    await redis.set("user:all", JSON.stringify(user))
    return res.json(user)
})

app.post("/send-otp", async (req, res) => {
    const { email } = req.body

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await redis.set(`otp:${email}`, otp, "EX", 30)

    return res.json({ otp })

})

app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body
    const cahedOtp = await redis.get(`otp:${email}`)

    if (!cahedOtp) {
        return res.status(400).json({
            "message": "otp not found or expired"
        })
    }
    if (cahedOtp != otp) {
        return res.status(400).json({
            "message": "incorrect otp"
        })
    }

    return res.json({
        "message": " otp verofied"
    })

})


app.listen(port, () => {
    connectDB()
    console.log(`server started on port :  ${port}`)
})




