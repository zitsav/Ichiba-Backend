const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload')
const productRoutes = require("./Routers/productRoutes")
const userRoutes = require("./Routers/userRoutes");
const authRoutes = require('./Routers/authRoutes');

const app = express();

app.use(express.static('./public'))
app.use(express.json());
app.use(fileUpload({useTempFiles: true}))

app.use(cors({origin: "http://localhost:5174", credentials: "true"}));

app.use(express.json())

const PORT = process.env.PORT || 3000;

app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/products", productRoutes)

app.listen(PORT,()=>{
    console.log(`App listinng on port ${PORT}`)
})
