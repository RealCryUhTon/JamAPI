//pull jam list and display info on click via sidebar
//Allow jam entry ID override to dynamically view other jam entries using app
//fallback eror page on invalid data; allow override on fallback page

//BUG; can click game buttons through searchbar overlay


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
let scrollOffset = 0;
let sidebarWidth = 300;

let searchHeight = 150;
let searchWidth = sidebarWidth;

let topPadding = searchHeight + 50;

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

function init(){ // init on valid data
  if(dataValid){

    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.id("canvas");

    for(let i = 0; i < apiResult.length; i++){
      let gameObject = apiResult[i];
      let gameName = gameObject.game.title || "Untitled Game";

      let newB = new Button(20, i * 110 + 20, 210, 90, gameName, callGame, gameObject);
      bA.push(newB)
    }

  }else{
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.id("canvas");
  }
}


function preload(){
    if(apiActive){
    loadJSON(getAPIURL(), handleData);
  }
}

function mouseWheel(event) {

  if (mouseX < sidebarWidth) {
    scrollOffset -= event.delta;
    
    // Constraint: Prevent scrolling too far up
    scrollOffset = min(scrollOffset, 0);
    
    // Constraint: Prevent scrolling past the last item
    let totalContentHeight = bA.length * 110 + topPadding;
    if (totalContentHeight > height) {
      scrollOffset = max(scrollOffset, height - totalContentHeight);
    }
  }
}

function callGame(){
  return;
}

function mousePressed() {
  for (let b of bA) {
    b.checkClick();
  }
}


//APP VISUALS

//draw searchbar top-left on top of sidebar
function drawSearch(){
  //only draws on valid data; checked in drawSidebar();

  //Draw overlay
  push();
  fill(40);
  rect(0, 0, searchWidth, searchHeight, 0, 0, 20);
  pop();

  //Draw Text
  push();
  fill(255);
  textSize(32);
  textAlign(LEFT, TOP);
  text();
  pop();

  //Draw searchbar
  push();
  pop();

  //Draw filter buttons?
  push();
  pop();

  //Draw override jam ID button?
  push();
  pop();

  return;
}


//--> AI Assisted / edited to display sidebar visual only if data is valid; intended to happen on tick
function drawSidebar(){
  if(dataValid){
        // --- 1. DRAW SIDEBAR BUTTONS ---
    // Push matrix so we can translate coordinates locally for scrolling
    push();
    translate(0, scrollOffset + topPadding); 
    for (let btn of bA) {
      btn.x = sidebarWidth / 2;
      btn.w = sidebarWidth - 40;
      btn.display();
    }
    pop();

    //call searchbar draw
    drawSearch();
    
    // --- 2. DRAW SIDEBAR OVERLAY BACKGROUND ---
    // This covers up buttons that scroll past the top/bottom boundaries
    /*push();
    fill(200); 
    noStroke();
    rect(sidebarWidth, 0, width - sidebarWidth, height);
    pop();*/
  

    // --- 3. DRAW THE MAIN LIBRARY CONTENT PANEL ---
    push();
    fill(20); 
    noStroke();
    rect(sidebarWidth, 0, width - sidebarWidth, height);
    pop();
    
    // Display details of the active game
    if (selectedGame) {
      fill(255);
      textSize(32);
      textAlign(LEFT, TOP);
      text(selectedGame.game.title, sidebarWidth + 40, 40);
      
      // Add additional properties here from your nested object
      textSize(16);
      text(`Game ID: ${selectedGame.id}`, sidebarWidth + 40, 90);

      textSize(16);
      text(`${selectedGame.game.short_text || "No description :( "}`, sidebarWidth + 40, 120);
    } else {
      fill(150);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("SELECT A GAME JAM FROM THE LIBRARY", sidebarWidth + (width - sidebarWidth)/2, height/2);
    }
  }
}


//invalid data fallback display; intended for tick
function drawFallback(){
  if(!dataValid){
    textAlign(CENTER);
    textSize(48);
    text("Error: 400", width / 2, height / 2.5);

    textAlign(CENTER);
    textSize(18);
    text("The requested data is invalid or could not be loaded.\n\nPlease try again!", width / 2, height / 2);
    }
}



//GENERIC
class Button {
  constructor(x, y, w, h, label, onClickAction, rawData) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.onClickAction = onClickAction;
    this.raw = rawData;

    this.baseColor = color(240);
    this.hoverColor = color(200);
    this.textColor = color(0);
  }

  display() {
    let isHovered = this.isMouseOver();
    
    fill(isHovered ? this.hoverColor : this.baseColor);
    
    stroke(0);
    strokeWeight(1);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h, 5);

    noStroke();
    fill(this.textColor);
    textAlign(CENTER, CENTER);
    textSize(16);
    text(this.label, this.x, this.y);
  }

  isMouseOver() {
    let sY = this.y + scrollOffset + topPadding;
    return (
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > sY - this.h / 2 &&
      mouseY < sY + this.h / 2
    );
  }

  checkClick() {
    if (this.isMouseOver() && this.onClickAction) {
      this.onClickAction();

      selectedGame = this.raw
    }
  }
}





//DEFAULT P5.JS METHODS

function setup() {
  init();
  
}

function draw() {
  background(230);

  drawSidebar();
  drawFallback();
}