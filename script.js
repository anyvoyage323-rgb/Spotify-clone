
let currentsong = new Audio()
let stop = document.querySelector(".stop")
let songs = []
let n = -1

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00"

  let a = Math.floor(seconds / 60)
  let b = Math.floor(seconds % 60)

  return String(a).padStart(2, "0") + ":" + String(b).padStart(2, "0")
}

let seek = document.querySelector(".seekbar")
let cir = document.querySelector(".circle")

currentsong.addEventListener("loadedmetadata", () => {
  document.querySelector(".songtime").textContent =
    "00:00 / " + formatTime(currentsong.duration)
})

currentsong.addEventListener("timeupdate", () => {
  document.querySelector(".songtime").textContent =
    formatTime(currentsong.currentTime) + " / " + formatTime(currentsong.duration)

  if (Number.isFinite(currentsong.duration) && currentsong.duration > 0) {
    cir.style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
  }
})

async function name() {
  let a = await fetch("http://127.0.0.1:5500/songs/")
  let res = await a.text()
  let div = document.createElement("div")
  div.innerHTML = res

  let links = div.getElementsByTagName("a")
  let arr = []

  for (let i = 0; i < links.length; i++) {
    if (links[i].href.toLowerCase().split("?")[0].endsWith(".mp3")) {
      arr.push(links[i].href.split("/songs/").pop())
    }
  }

  return arr
}

async function playSong(i) {
  if (i < 0 || i >= songs.length) return

  n = i
currentsong.src = "songs/" + encodeURIComponent(songs[n]);
  document.querySelector(".songname").textContent =
    decodeURIComponent(songs[n]).replace(/\.mp3$/i, "")

  try {
    await currentsong.play()
  } catch (e) {
    console.log(e)
  }
}

async function main() {
  songs = await name()

  let ul = document.querySelector(".songs ul")
  ul.innerHTML = ""

  for (let i = 0; i < songs.length; i++) {
    let li = document.createElement("li")
    li.textContent = decodeURIComponent(songs[i]).replace(/\.mp3$/i, "")
    li.style.cursor = "pointer"

    li.onclick = function () {
      playSong(i)
    }

    ul.appendChild(li)
  }
}

stop.onclick = async function () {
  if (!currentsong.src) {
    if (songs.length > 0) playSong(n == -1 ? 0 : n)
  } else if (currentsong.paused) {
    try {
      await currentsong.play()
    } catch (e) {
      console.log(e)
    }
  } else {
    currentsong.pause()
  }
}

currentsong.onplay = function () {
  stop.src = "img/pause.svg"
}

currentsong.onpause = function () {
  stop.src = "img/play.svg"
}

document.querySelector(".next").onclick = function () {
  if (songs.length == 0) return
  playSong((n + 1) % songs.length)
}

document.querySelector(".prev").onclick = function () {
  if (songs.length == 0) return
  playSong((n - 1 + songs.length) % songs.length)
}

currentsong.onended = function () {
  if (songs.length > 0) playSong((n + 1) % songs.length)
}

seek.onclick = function (e) {
  if (!Number.isFinite(currentsong.duration) || currentsong.duration <= 0) return

  let box = seek.getBoundingClientRect()
  let x = (e.clientX - box.left) / box.width

  x = Math.max(0, Math.min(1, x))
  currentsong.currentTime = x * currentsong.duration
}

document.querySelector(".ham").onclick = function () {
  let l = document.querySelector(".left")
  l.style.display = "flex"
  l.style.position = "fixed"
  l.style.zIndex = "10"
  l.style.left = "0"
  l.style.top = "0"
  l.style.width = "100%"
  l.style.height = "100vh"
  l.style.backgroundColor = "black"

  document.querySelector(".right").style.display = "none"
}

document.querySelector(".close").onclick = function () {
  document.querySelector(".left").style.display = "none"
  document.querySelector(".right").style.display = "block"
  document.querySelector(".right").style.width = "100%"
}

main().catch(e => console.log(e))
