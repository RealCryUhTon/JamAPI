let jamID = "416879"; //default jam ID; Bezi Game Jam
//let url = "https://itch.io/jam/" + jamID + "/entries.json";
//let proxyUrl = "https://allorigins.win" + encodeURIComponent(url);

let url = "jamEntryJSON/entries.json";
//CANNOT LOAD JSON BY URL  DUE TO "CORS" QUERY PROTECTION

let dataValid = false;

let apiResult;
let apiActive = true;

let jTitle;
let gTitle;
let gText;
let gAuthor;
let gPlat;
let gCover = ""; //get cover link

let selectedGame = null;
let selectedCover = null;
let books = [];
let booksPerPage = 1;
let currentPage = 0;

let bA = [];

function getAPIActive(){
  return apiActive;
}

function setAPIActive(newStatus){
  apiActive = newStatus;
  return apiActive;
}

function setAPIURL(newURL){
    url = newURL;
    return url;
}

function getAPIURL(){
  return url;
}

function handleData(data){
  //check if data valid
  if(data.jam_games){
    apiResult = data.jam_games;
    dataValid = true;

    //map through jam_games, parsing through "url" and extract the jam name dynamically (jam name = Bezi Mega Jam; it != game name).
    jParse = data.jam_games.map(game =>{
      const parts = game.url.split('/');

      return parts[2] ?  parts[2].replace(/-\d+$/, '') : null;
    });

    jTitle = jParse[0];

    console.log("JSON LOADED");

    //debug
    console.log(jTitle);
  }else{
    console.error("JSON FAILED TO LOAD 'jam_games' ");
  }
}

function init(){
  if(!dataValid){
    return;
  }
  const palette = ["#b84a3a", "#315c68", "#d39b35", "#4d7050", "#654b72", "#d06d45", "#426c9b"];
  const availableWidth = max(60, width - 112);
  booksPerPage = max(1, floor(availableWidth / 60));
  const slotWidth = availableWidth / booksPerPage;

  books = apiResult.map((entry, index) => {
    const title = entry.game && entry.game.title ? entry.game.title : "Untitled Game";
    const titleHash = title.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
    const column = index % booksPerPage;
    const bookWidth = min(52, max(32, slotWidth - 8));
    const bookHeight = 140 + (titleHash % 7) * 6;
    const x = 56 + column * slotWidth + slotWidth / 2;
    const shelfY = 255;

    return new book(x, shelfY - bookHeight / 2, bookWidth, bookHeight, title, palette[(titleHash + index) % palette.length], entry);
  });

  currentPage = min(currentPage, max(0, getPageCount() - 1));
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("canvas");
  init();
}

function draw() {
  background(220);
  fill(0);
  textSize(24);
  textAlign(CENTER, TOP);
  text(jTitle ? `${jTitle} library` : "Generative bookshelf", width / 2, 34);
 
  if (!dataValid) {
    fill("#52615b");
    textSize(16);
    text("Loading game entries...", 24, 72);
    return;
  }
  
   //shelf
    noStroke();
    fill("#76543b");
    rectMode(CENTER);
    rect(width / 2, 250 + 7, width - 32, 14, 3);
    fill("#9a704b");
    rect(width / 2, 250, width - 32, 5, 2);

    //computer stand
    fill("#333333");
    rectMode(CENTER);
    rect(width / 2, 600, 300, 20, 5);
    rect(width / 2, 575, 50, 70, 5);

    //computer
    fill("#000000");
    rectMode(CENTER);
    rect(width / 2, 425, 400, 250, 5);
 
    //desk
    fill("#76543b");
    rectMode(CENTER);
    rect(width / 2, 610 + 7, width - 32, 20, 3);
    fill("#9a704b");
    rect(width / 2, 610, width - 32, 5, 2);

    //display books on the current page
   const firstBook = currentPage * booksPerPage;
   const visibleBooks = books.slice(firstBook, firstBook + booksPerPage);
    for (const gameBook of visibleBooks) {
      gameBook.display();
  }

  if (selectedGame) {
    drawGameDetails();
  }
  drawPageNavigation();
}

function getPageCount() {
  return Math.ceil(books.length / booksPerPage);
}

function drawPageNavigation() {
  // define the position and size of the navigation buttons
  const buttonY = 180;
  const buttonRadius = 18;
  const pageCount = getPageCount();
  const previousEnabled = currentPage > 0;
  const nextEnabled = currentPage < pageCount - 1;
  // draw the previous and next page buttons
  for (const button of [
    { x: 24, direction: -1, enabled: previousEnabled },
    { x: width - 24, direction: 1, enabled: nextEnabled }
  ]) {
    // draw each navigation button
    noStroke();
    fill(button.enabled ? "#f5efe2" : "#d9d0bf");
    circle(button.x, buttonY, buttonRadius * 2);
    // draw the arrow inside the navigation button
    stroke(button.enabled ? "#283c3b" : "#8b9188");
    strokeWeight(3);
    const arrowX = button.x + button.direction * 3;
    line(arrowX, buttonY - 7, button.x - button.direction * 4, buttonY);
    line(button.x - button.direction * 4, buttonY, arrowX, buttonY + 7);
  }
  // draw the current page number and total page count
  noStroke();
  fill("#52615b");
  textAlign(CENTER, CENTER);
  textSize(14);
  text(`${pageCount ? currentPage + 1 : 0} / ${pageCount}`, width / 2, 292);
}

function preload() {
  loadJSON(getAPIURL(), handleData);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  init();
}

function mousePressed() {
  // check if a game is currently selected
  if (selectedGame) {
    const layout = getGameDetailsLayout();
    const closeX = layout.panelLeft + layout.panelWidth - 28;
    const closeY = layout.panelTop + 28;

    // check if the close button or outside the panel was clicked
    if (dist(mouseX, mouseY, closeX, closeY) < 20 ||
      mouseX < layout.panelLeft || mouseX > layout.panelLeft + layout.panelWidth ||
      mouseY < layout.panelTop || mouseY > layout.panelTop + layout.panelHeight) {
      selectedGame = null;
      selectedCover = null;
    }
    return;
  }
  // check if any book was clicked
  const buttonY = 180;
  if (dist(mouseX, mouseY, 24, buttonY) <= 18 && currentPage > 0) {
    currentPage--;
    return;
  }
  if (dist(mouseX, mouseY, width - 24, buttonY) <= 18 && currentPage < getPageCount() - 1) {
    currentPage++;
    return;
  }

  const firstBook = currentPage * booksPerPage;
  const visibleBooks = books.slice(firstBook, firstBook + booksPerPage);
  for (const gameBook of visibleBooks) {
    if (gameBook.contains(mouseX, mouseY)) {
      openGameDetails(gameBook.entry);
      return;
    }
  }
}

class book {
constructor(x, y, w, h, label, coverColor, entry) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.coverColor = coverColor;
    this.entry = entry;
  }

  contains(x, y) {
    return x >= this.x - this.w / 2 && x <= this.x + this.w / 2 &&
      y >= this.y - this.h / 2 && y <= this.y + this.h / 2;
  }

  display() {
    // draw the book cover
    noStroke();
    fill(this.coverColor);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h, 3);

    // draw the spine line of the book
    stroke(255, 90);
    strokeWeight(1);
    line(this.x - this.w / 2 + 4, this.y - this.h / 2 + 5, this.x - this.w / 2 + 4, this.y + this.h / 2 - 5);

    // draw the label on the spine of the book
    noStroke();
    fill(255);
    push();
    translate(this.x, this.y);
    rotate(-HALF_PI);
    textAlign(CENTER, CENTER);
    textSize(13);
    text(this.label, 0, 0, this.h - 12);
    pop();
  }
}