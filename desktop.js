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
  
  cover1 = loadImage("Books/BookBase1.png");
  cover2 = loadImage("Books/BookBase2.png");
  cover3 = loadImage("Books/BookBase3.png");
  cover4 = loadImage("Books/BookBase4.png");
  cover5 = loadImage("Books/BookBase5.png");
  accent1 = loadImage("Books/Accent1.png");
  accent2 = loadImage("Books/Accent2.png");
  accent3 = loadImage("Books/Accent3.png");
  accent4 = loadImage("Books/Accent4.png");
  accent5 = loadImage("Books/Accent5.png");

  const coverColors = [cover1, cover2, cover3, cover4, cover5];
  const accents = [accent1, accent2, accent3, accent4, accent5];
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

    return new book(x, shelfY - bookHeight / 2, bookWidth, bookHeight, title, coverColors[(titleHash + index) % coverColors.length], accents[(titleHash + index) % accents.length], entry);
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

    //computer screen
    const screen = getComputerScreenLayout();
    noStroke();
    fill("#d9e8dc");
    rectMode(CORNER);
    rect(screen.panelLeft, screen.panelTop, screen.panelWidth, screen.panelHeight, 3);
    if (!selectedGame) {
      fill("#52615b");
      textAlign(CENTER, CENTER);
      textSize(14);
      text("Select a game to view details", width / 2, screen.panelTop + screen.panelHeight / 2);
    }

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

function getComputerScreenLayout() {
  return {
    panelWidth: 368,
    panelHeight: 218,
    panelLeft: width / 2 - 184,
    panelTop: 316
  };
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

    // check if the close button or outside the panel was clicked
    if (dist(mouseX, mouseY, layout.closeX, layout.closeY) < 12 ||
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

function keyPressed() {
  if (keyCode === ESCAPE) {
    selectedGame = null;
    selectedCover = null;
  }
}

function openGameDetails(entry) {
  selectedGame = entry;
  selectedCover = null;

   const coverUrl = entry.game && entry.game.cover;
  if (coverUrl) {
    loadImage(coverUrl, imageAsset => {
      if (selectedGame === entry) {
        selectedCover = imageAsset;
      }
    });
  }
}

// Utility function to get the contributors of a game
function getGameContributors(game) {
  const contributors = game.contributors || game.users || game.user;
  const people = Array.isArray(contributors) ? contributors : contributors ? [contributors] : [];
  const names = people
    .map(person => typeof person === "string" ? person : person.name)
    .filter(Boolean);

  return names.length ? names.join(", ") : "Unknown contributor";
}

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

function getGameDetailsLayout() {
  const { panelWidth, panelHeight, panelLeft, panelTop } = getComputerScreenLayout();
  const gameTitle = selectedGame.game && selectedGame.game.title ? selectedGame.game.title : "Untitled Game";
  const description = selectedGame.game && selectedGame.game.short_text
    ? selectedGame.game.short_text
    : "No description :(";
  const contributors = getGameContributors(selectedGame.game || {});
  const titleFontSize = 16;
  const titleWidth = panelWidth - 48;
  const titleLines = limitDetailsLines(
    wrapDetailsText(gameTitle, titleWidth, titleFontSize),
    2,
    titleWidth,
    titleFontSize
  );
  const contentTop = 10 + titleLines.length * 19 + 6;
  const coverWidth = 88;
  const coverHeight = 88;
  const textWidth = panelWidth - coverWidth - 34;
  const contributorFontSize = 12;
  const contributorLineHeight = 15;
  const contributorLines = limitDetailsLines(
    wrapDetailsText(`Contributors: ${contributors}`, textWidth, contributorFontSize),
    2,
    textWidth,
    contributorFontSize
  );
  const contributorsY = panelTop + contentTop;
  const descriptionY = contributorsY + contributorLines.length * contributorLineHeight + 5;
  const descriptionLineHeight = 15;
  const descriptionMaxLines = max(1, floor((panelTop + panelHeight - 10 - descriptionY) / descriptionLineHeight));
  const descriptionLines = limitDetailsLines(
    wrapDetailsText(description, textWidth, contributorFontSize),
    descriptionMaxLines,
    textWidth,
    contributorFontSize
  );

  return {
    panelWidth,
    panelHeight,
    panelLeft,
    panelTop,
    titleLines,
    coverX: panelLeft + 12,
    coverY: panelTop + contentTop,
    coverWidth,
    coverHeight,
    titleX: panelLeft + 12,
    titleY: panelTop + 8,
    titleFontSize,
    textX: panelLeft + 12 + coverWidth + 10,
    textWidth,
    contributorsY,
    descriptionY,
    contributorFontSize,
    descriptionFontSize: contributorFontSize,
    closeX: panelLeft + panelWidth - 14,
    closeY: panelTop + 14,
    contributorLines,
    descriptionLines
  };
}

function limitDetailsLines(lines, maxLines, maxWidth, fontSize) {
  if (lines.length <= maxLines) {
    return lines;
  }

  const visibleLines = lines.slice(0, maxLines);
  let lastLine = visibleLines[maxLines - 1];
  push();
  textSize(fontSize);
  while (lastLine && textWidth(`${lastLine}...`) > maxWidth) {
    lastLine = lastLine.slice(0, -1).trimEnd();
  }
  pop();
  visibleLines[maxLines - 1] = `${lastLine}...`;
  return visibleLines;
}

function drawGameDetails() {
  const layout = getGameDetailsLayout();
  const { panelWidth, panelHeight, panelLeft, panelTop } = layout;

  noStroke();
  fill("#d9e8dc");
  rectMode(CORNER);
  rect(panelLeft, panelTop, panelWidth, panelHeight, 3);

  // draw the game title on the computer screen
  fill("#283c3b");
  textAlign(LEFT, TOP);
  textSize(layout.titleFontSize);
  text(layout.titleLines.join("\n"), layout.titleX, layout.titleY);

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
  // draw the contributors and description beside the cover
  fill("#394846");
  textAlign(LEFT, TOP);
  textSize(layout.contributorFontSize);
  text(layout.contributorLines.join("\n"), layout.textX, layout.contributorsY);
  textSize(layout.descriptionFontSize);
  text(layout.descriptionLines.join("\n"), layout.textX, layout.descriptionY);

  // draw the close button on the screen
  fill("#283c3b");
  textAlign(CENTER, CENTER);
  textSize(18);
  text("×", layout.closeX, layout.closeY);
}


class book {
constructor(x, y, w, h, label, coverColor,accent, entry) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.coverColor = coverColor;
    this.accent = accent;
    this.entry = entry;
  }

  contains(x, y) {
    return x >= this.x - this.w / 2 && x <= this.x + this.w / 2 &&
      y >= this.y - this.h / 2 && y <= this.y + this.h / 2;
  }

  display() {
    // draw the book cover
    noStroke();
    imageMode(CENTER);
    image(this.coverColor, this.x, this.y, this.w, this.h);

    // draw the spine line of the book
    stroke(255, 90);
    strokeWeight(1);
    line(this.x - this.w / 2 + 4, this.y - this.h / 2 + 5, this.x - this.w / 2 + 4, this.y + this.h / 2 - 5);

    // draw the lower accent on the book cover
    imageMode(CENTER);
    image(this.accent, this.x, this.y, this.w, this.h);

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