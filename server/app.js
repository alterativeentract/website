require("dotenv").config();
require('express-async-errors')
const express = require('express')
const app = express()
const fileUpload = require('express-fileupload')
const PORT = process.env.PORT || 3000
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// upload file with cloudinary use V2
const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})


//database
const connectDB = require('./db/connect')
// routes
const authRouter = require('./routes/authRoutes')
const usersRouter = require('./routes/usersRoutes')
const productsRouter = require('./routes/productsRoutes')
const OrderRouter = require('./routes/orderRoutes')

//middleware
const notFoundMiddleware = require('./middleware/not-found')
const errorHandler = require('./middleware/error-handler')

app.set('trust proxy', 1)
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }))
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

app.use(express.static('./public'))

app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(fileUpload({ useTempFiles: true }))

app.get('/', (req, res) => {
  res.send('ApproAlternative api v1!!')
})
app.get('/api/v1', (req, res) => {
  res.send('ApproAlternative api')
})
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/orders', OrderRouter)

app.use(notFoundMiddleware);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, console.log(`Server is listening on port ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};
start();
