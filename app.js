const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express();

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/stream', (req,res) => {
  const path = 'D:/HF_External Drive/HF_CLIENTS/BRAD STINE/02_PREMIERE/02_SOURCE/SKETCHES/Unapologetical - DVD Master.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/,"").split("-")
    const start = parseInt(parts[0],10)
    // if true/false & do A : B
    const end = parts[1] ? parseInt(parts[1],10) : fileSize-1
    const chunkSize = (end-start) + 1
    const file = fs.createReadStream(path, {start,end} )
    const head = {
      'Content-Range' : `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges' : 'bytes',
      'Content-Length' : chunkSize,
      'Content-Type' : 'video/mp4'
    } 
    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length' : fileSize,
      'Content-Type' : 'video/mp4'
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.listen(3000, () => {
  console.log('app is listening on 3000')
})