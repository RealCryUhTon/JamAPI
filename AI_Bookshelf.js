//VARIABLES

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


//APP METHODS

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
  /*if(proxyUrl){
    return proxyUrl;
  }else{
    return url;
  }*/
 // above is for trying to pull JSON from url using a proxy

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

//AI generated - display bookshelf and books
function init(){ // init on valid data
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
  // create and initialize the canvas
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("canvas");
  init();
}

function draw() {
  // clear the background
  background("#e8dfcf");
  noStroke();
  fill("#283c3b");
  textAlign(LEFT, CENTER);
  textSize(22);
  // draw the bookshelf title
  text(jTitle ? `${jTitle} bookshelf` : "Generative bookshelf", 24, 34);
  
  // draw the bookshelf title
  if (!dataValid) {
    fill("#52615b");
    textSize(16);
    text("Loading game entries...", 24, 72);
    return;
  }
  // draw the bookshelf
  const shelfY = 255;
  noStroke();
  fill("#76543b");
  rectMode(CENTER);
  rect(width / 2, shelfY + 7, width - 32, 14, 3);
  fill("#9a704b");
  rect(width / 2, shelfY, width - 32, 5, 2);

  // draw the books on the shelf
  const firstBook = currentPage * booksPerPage;
  const visibleBooks = books.slice(firstBook, firstBook + booksPerPage);
  for (const gameBook of visibleBooks) {
    gameBook.display();
  }
  drawPageNavigation();

  // draw game details if a game is selected
  if (selectedGame) {
    drawGameDetails();
  }
}

// get the total number of pages based on the number of books and books per page
function getPageCount() {
  return Math.ceil(books.length / booksPerPage);
}

// draw the page navigation buttons
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

// handle mouse press events
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
  // handle key press events
function keyPressed() {
  if (keyCode === ESCAPE) {
    selectedGame = null;
    selectedCover = null;
  }
}


  // open the game details panel for the selected game
function openGameDetails(entry) {
  selectedGame = entry;
  selectedCover = null;

  // attempt to load the cover image for the selected game
  const coverUrl = entry.game && entry.game.cover;
  if (coverUrl) {
    loadImage(coverUrl, imageAsset => {
      if (selectedGame === entry) {
        selectedCover = imageAsset;
      }
    });
  }
}

  // get the list of contributors for a game
function getGameContributors(game) {
  const contributors = game.contributors || game.users || game.user;
  const people = Array.isArray(contributors) ? contributors : contributors ? [contributors] : [];
  const names = people
    .map(person => typeof person === "string" ? person : person.name)
    .filter(Boolean);

  return names.length ? names.join(", ") : "Unknown contributor";
}

  // wrap text for game details panel
function wrapDetailsText(value, maxWidth, fontSize) {
  push();
  textSize(fontSize);
  const lines = [];
  let currentLine = "";

  // split the text into words and wrap them into lines based on the max width
  for (const word of String(value).split(/\s+/)) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (currentLine && textWidth(candidate) > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  lines.push(currentLine || " ");
  pop();
  return lines;
}
  // calculate the layout for the game details panel
function getGameDetailsLayout() {
  const panelWidth = min(width - 32, 680);
  const gameTitle = selectedGame.game && selectedGame.game.title ? selectedGame.game.title : "Untitled Game";
  const description = selectedGame.game && selectedGame.game.short_text
    ? selectedGame.game.short_text
    : "No description :(";
  const contributors = getGameContributors(selectedGame.game || {});
  const compact = panelWidth < 520;
  const titleLines = wrapDetailsText(gameTitle, panelWidth - 72, 21);
  const contentTop = 24 + titleLines.length * 27 + 16;
  const coverWidth = compact ? panelWidth - 48 : 180;
  const coverHeight = compact ? 110 : 144;
  const textWidth = compact ? panelWidth - 48 : panelWidth - coverWidth - 72;
  const contributorLines = wrapDetailsText(`Contributors: ${contributors}`, textWidth, 16);
  const descriptionLines = wrapDetailsText(description, textWidth, 16);
  const contributorsY = compact ? contentTop + coverHeight + 16 : contentTop;
  const descriptionY = contributorsY + contributorLines.length * 22 + 10;
  const contentBottom = compact
    ? descriptionY + descriptionLines.length * 22
    : max(contentTop + coverHeight, descriptionY + descriptionLines.length * 22);
  const panelHeight = min(height - 32, contentBottom + 24);
  const panelLeft = (width - panelWidth) / 2;
  const panelTop = (height - panelHeight) / 2;

  return {
    panelWidth,
    panelHeight,
    panelLeft,
    panelTop,
    compact,
    titleLines,
    coverX: panelLeft + 24,
    coverY: panelTop + contentTop,
    coverWidth,
    coverHeight,
    textX: compact ? panelLeft + 24 : panelLeft + 24 + coverWidth + 24,
    textWidth,
    contributorsY: panelTop + contributorsY,
    descriptionY: panelTop + descriptionY,
    contributorLines,
    descriptionLines
  };
}

  // draw the game details panel if a game is selected
function drawGameDetails() {
  const layout = getGameDetailsLayout();
  const { panelWidth, panelHeight, panelLeft, panelTop } = layout;

  // draw the semi-transparent overlay background
  noStroke();
  fill(20, 150);
  rectMode(CORNER);
  rect(0, 0, width, height);

  // draw the semi-transparent background overlay
  fill("#f5efe2");
  rect(panelLeft, panelTop, panelWidth, panelHeight, 8);

  // draw the panel background
  fill("#283c3b");
  textAlign(LEFT, TOP);
  textSize(21);
  text(layout.titleLines.join("\n"), panelLeft + 24, panelTop + 24);

  // draw the cover art or placeholder for the selected game
  if (selectedCover) {
    imageMode(CORNER);
    image(selectedCover, layout.coverX, layout.coverY, layout.coverWidth, layout.coverHeight);
  } else {
    fill("#d9d0bf");
    rect(layout.coverX, layout.coverY, layout.coverWidth, layout.coverHeight, 4);
    fill("#52615b");
    textAlign(CENTER, CENTER);
    textSize(14);
    text("No cover art", layout.coverX, layout.coverY, layout.coverWidth, layout.coverHeight);
  }
  // draw the contributors and description text
  fill("#394846");
  textAlign(LEFT, TOP);
  textSize(16);
  text(layout.contributorLines.join("\n"), layout.textX, layout.contributorsY);
  text(layout.descriptionLines.join("\n"), layout.textX, layout.descriptionY);

  // draw the close button for the game details panel
  fill("#283c3b");
  textAlign(CENTER, CENTER);
  textSize(22);
  text("×", panelLeft + panelWidth - 28, panelTop + 28);
}

  // preload the game data from the API
function preload() {
  loadJSON(getAPIURL(), handleData);
}

  // handle window resize events
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  init();
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
    noStroke();
    fill(this.coverColor);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h, 3);

    stroke(255, 90);
    strokeWeight(1);
    line(this.x - this.w / 2 + 4, this.y - this.h / 2 + 5, this.x - this.w / 2 + 4, this.y + this.h / 2 - 5);

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