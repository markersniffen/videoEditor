
let location = 'E:/v2.mp4'
let current;
let id = 0;

const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const express = require('express')
const http = require('http')
const app = express();
const server = http.createServer(app)
const io = require('socket.io')(server)
server.listen(3000)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname + '/public'))
})

app.get('/stream', (req,res) => {
  setStream(req, res)
})

// SOCKET.IO //

mySocket = io.on("connect", (client) => {
  console.log("somone connected via IO!")
  prepComedians(client)
})

// PARSE FILE STUFF SERVER SIDE //
// create JSON FILE //

function prepComedians(client) { //client) {
  console.log('prepComedians just run....')

  const raw = fs.readFileSync('comedians.json')
  let data = JSON.parse(raw)
  let files = []
  data.names.forEach((c)=> {
    findQ(path.join(data.root, c), c, data.q, files)
  })
  console.log(files)

  client.emit('cData', { "files" : files, "names" : data.names })

}

function findQ(dir, name, q, packet) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f)
    let isDirectory = fs.statSync(dirPath).isDirectory()
    if (isDirectory) {
      if (f == q) {
        fs.readdirSync(dirPath).forEach((d)=> {
          fs.readdirSync(path.join(dirPath, d)).forEach((ff)=>{
            console.log(path.join(dirPath, ff))
            packet.push(
              {
                "fileName" : ff,
                "fullPath" : path.join(dirPath, d, ff),
                "name" : name
              }
            )
          })
        })
      }
    findQ(dirPath, name, q, packet)
    } 
  })
}


//////
// LOAD CURRENT COMEDIAN STUFF
////

function setStream(req, res) {
  let n = false
  console.log('REQ BODY ', req.query.id)
  if (!req.query.id) {
    console.log('no video path in request')
    mySocket.emit('noVideoToLoad')
    return
    } else {
    const path = req.query.id //'D:/HF_External Drive/HF_CLIENTS/BRAD STINE/02_PREMIERE/02_SOURCE/SKETCHES/Unapologetical - DVD Master.mp4'
    fs.access(path, (err) => {
      if (err) {
        console.log(err)
        mySocket.emit('noVideoToLoad')
        return
      }
    
      const stat = fs.statSync(path)
      const fileSize = stat.size
      const range = req.headers.range
      if (range) {
        console.log('range is true... ' + range)
        const parts = range.replace(/bytes=/,"").split("-")
        let start = parseInt(parts[0],10)
      
        // if true/false & do A : B
        const end = parts[1] ? parseInt(parts[1],10) : fileSize-1
        if (start > end) {
          start = 0;
          n = true;
        }
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
        console.log('>>>> ' + start, end, range)
        console.log(head)
      } else {
        console.log('range is NOT true... ' + range)
        const head = {
          'Content-Length' : fileSize,
          'Content-Type' : 'video/mp4'
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
      }
    })
  }
}
