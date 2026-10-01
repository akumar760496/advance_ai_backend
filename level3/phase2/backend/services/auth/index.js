import express from "express"
import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT || 5000

const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    return res.status(200).json({
        message: `hello from auth service`
    })
})


app.listen(port, () => {
    //connectDB()
    console.log(`server started on port :  ${port}`)
})
