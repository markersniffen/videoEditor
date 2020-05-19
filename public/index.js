//import { loadImage } from "canvas";

let data;
let activeItem;
let activeTab;
let itemList = document.getElementById("itemList")
let tabList = document.getElementById("tabList")

function setActiveTab(event, x) {
  itemList.innerHTML = "";
  for (i=0; i < tabList.children.length; i++) {
    tabList.children[i].setAttribute('class', 'tab')
  }
  tabList.children[x].setAttribute('class', 'tab activeTab')
  activeTab = x;
  console.log(x, data.names[activeTab])
  loadItems(data.names[activeTab])
}

function setActive(event, x) {

  for (i=0; i < itemList.children.length; i++) {
    itemList.children[i].setAttribute('class', 'item')
  }
  itemList.children[x].setAttribute('class', 'item activeItem')
  activeItem = x;
  let video = document.getElementById("video")
  let filtered = data.files.filter(file => file.name == data.names[activeTab])
  console.log(filtered)
  video.setAttribute('src', `http://localhost:3000/stream?id=${filtered[activeItem].fullPath}`)
}

// add tabs
function addTab(name, link) {
  let num = 0;
  if (tabList.children === undefined || tabList.children == 0) {
    num = 0;
  } else {
    num = tabList.children.length;
  }
  let newItem = document.createElement('div')
  newItem.setAttribute('onclick', `setActiveTab(event, ${num})`)
  newItem.setAttribute('class', 'tab')

  let title = document.createElement('div')
  title.setAttribute('class', 'itemText')
  title.innerHTML = name;
  // let txt = document.createElement('div')
  // txt.setAttribute('class', 'itemContent')
  // txt.innerHTML = name

  tabList.appendChild(newItem)
  newItem.appendChild(title)
  //newItem.appendChild(txt)
}

// creates the UI elements
function addItem(_fileName, _fullPath) {
  let num = 0;
  if (itemList.children === undefined || itemList.children == 0) {
    num = 0;
  } else {
    num = itemList.children.length;
  }

  let newItem = document.createElement('div')
  newItem.setAttribute('onclick', `setActive(event, ${num})`)
  if (_fileName.slice(_fileName.length - 3) != "mp4") {
    newItem.setAttribute('class', 'item nonVideo')
  } else {
    newItem.setAttribute('class', 'item')
  }

  let title = document.createElement('div')
  title.setAttribute('class', 'itemText')
  title.innerHTML = _fileName;
  let txt = document.createElement('div')
  txt.setAttribute('class', 'itemContent')
  txt.innerHTML = _fullPath

  itemList.appendChild(newItem)
  newItem.appendChild(title)
  newItem.appendChild(txt)
}

function loadItems(name) {
  console.log(name)
  data.files.filter(file => file.name == name)
    .forEach((file)=>{
      addItem(file.fileName, file.fullPath)
    })
}
  

const socket = io()

socket.on('connect', () => { 
  console.log("I just connected to something!")
 })

socket.on('cData', (d) => {
  // adds the UI elements
  data = d;
  d.names.forEach((name) => {
    addTab(name, "temp")
  })
  document.getElementsByClassName("tab")[0].setAttribute('class', 'tab activeTab')
  loadItems(d.names[0]);
})

socket.on('noVideoToLoad', ()=> {
  console.log('no video could be loaded from the server!!!!!')
})

// // load custom controls
// window.onload = function() {
//   console.log('loaded')

//   // Video
//   var video = document.getElementById("video");

//   // Buttons
//   var playButton = document.getElementById("play-pause");

//   // Event listener for the play/pause button
// playButton.addEventListener("click", function() {
//   if (video.paused == true) {
//     // Play the video
//     video.play();
//     playButton.innerHTML = "Pause";
//   } else {
//     video.pause();
//     playButton.innerHTML = "Play";
//   }
// });

// // canvas processing
// let processor = {
//   timerCallback: function(seeking) {
//     if (!seeking && this.video.paused || this.video.ended) {
//       return;
//     }
//     this.computeFrame();
//     let self = this;
//     setTimeout(function () {
//         self.timerCallback();
//       }, 0);
//   },

//   // set up variables on load
//   doLoad: function() {
//     this.video = document.getElementById("video");
//     this.c1 = document.getElementById("c1");
//     this.ctx1 = this.c1.getContext("2d");
//     this.c2 = document.getElementById("c2");
//     this.ctx2 = this.c2.getContext("2d");
//     let self = this;
//     this.video.addEventListener("play", function() {
//         self.width = self.video.videoWidth / 2;
//         self.height = self.video.videoHeight / 2;
//         self.timerCallback(false);
//       }, false);
//   },

//   computeFrame: function() {
//     this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
//     let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
//         let l = frame.data.length / 4;

//     for (let i = 0; i < l; i++) {
//       let r = frame.data[i * 4 + 0];
//       let g = frame.data[i * 4 + 1];
//       let b = frame.data[i * 4 + 2];
//       if (g > 100 && r > 100 && b < 43)
//         frame.data[i * 4 + 3] = 0;
//     }
//     this.ctx2.putImageData(frame, 0, 0);
//     return;
//   }
// };

// video.onseeking = function() {
//   processor.timerCallback(true)
//   console.log("seeking...")
// };

// document.addEventListener("DOMContentLoaded", () => {
//   processor.doLoad();
// });
