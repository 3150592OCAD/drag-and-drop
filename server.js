const express = require('express')
const app = express()
const path = require('path')

app.get('/',(req,res)=>{
	res.sendFile(__dirname+'/index.html')
})
app.use(express.static(__dirname))

app.listen(3032,()=>{
	console.log('listening on port 3032')
})
