import express from 'express'

const app = express();

const PORT = 4000
app.listen(()=>{
    console.log(`Server running on port: ${PORT} successfully`)
});