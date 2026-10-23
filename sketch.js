//pull jam list and display info on click via sidebar
//Allow jam entry ID override to dynamically view other jam entries using app
//fallback eror page on invalid data; allow override on fallback page

//BUG; can click game buttons through searchbar overlay


//DOM ELEMENTS
const search = document.querySelector('input[type="search"]');
const searchB = document.getElementById('searchID');


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
let gDate;
let gPlat;
let gCool;
let gImg;
let gCover = ""; // --> this would ideally be a dynamic variable, set by the jam API.
let gLink;
let directB;

let selectedGame = null;
let scrollOffset = 0;
let sidebarWidth = 300;

let searchHeight = 150;
let searchWidth = sidebarWidth;
let sVal = '';

let topPadding = searchHeight + 50;

let bA = [];
let allB = [];


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
      
    //parse through jam names and extract clean title text
      return parts[2] ?  parts[2].replace(/[-\d]/g, (match)=> match == '-' ? ' ' : '').trim()
      .replace(/\b\w/g, char => char.toUpperCase()) : null;
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

      let newB = new Button(20, i * 110 + 20, 210, 90, gameName, callGame, gameObject, true);
      bA.push(newB)
      allB.push(newB);
    }

    //set gCover initally to help with Do Once logic for updateGCover()
    gCover = "";


    if(search){
      search.addEventListener('input', function (){
        updateSearch(this.value);
      });

    }

  }else{
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.id("canvas");
  }
}

function callGame(){
  return;
}

function tryClearSearch(val){
   if (val === "") {
    sVal = '';
  }
}

//--> AI Generated; tied the search fucntionality into the defined values of the script
function updateSearch(val){
  sVal = val.trim().toLowerCase();

  bA = allB.filter(function (button) {
    return button.label.toLowerCase().includes(sVal);
  });

  // Reposition the filtered buttons
  for (let i = 0; i < bA.length; i++) {
    bA[i].y = i * 110 + 20;
  }

  // Reset scrolling after a new search
  scrollOffset = 0;
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
  textSize(22);
  textAlign(LEFT, TOP);
  text(jTitle + ' Library', searchWidth * .05, searchHeight * .35);
  pop();

  //Draw filter buttons?
  push();
  pop();

  //Draw override jam ID button?
  push();
  pop();

  return;
}

function drawLibrary(){
  let cPaddingY = 40;
  let cPaddingX = sidebarWidth + 40;  
    push();
    fill(40); 
    noStroke();
    rect(sidebarWidth, 0, width - sidebarWidth, height);
    pop();
    
    // Display details of the active game
    if (selectedGame) {
      fill(255);
      textSize(48);
      textAlign(LEFT, TOP);
      text(selectedGame.game.title, cPaddingX, cPaddingY);
      gTitle = selectedGame.game.title;

      textSize(36);
      text(`Rating: ${selectedGame.rating_count || "Unrated"}`, cPaddingX, cPaddingY * 3);


      textSize(20);
      text(`Made By: ${selectedGame.game.user.name || "Unknown Author"}`, cPaddingX, cPaddingY * 4.6);
      gAuthor = selectedGame.game.user.name;

      textSize(20);
      text(`Submitted On: ${selectedGame.created_at || "Unknown Submission Date"}`, cPaddingX * 1.8, cPaddingY * 4.6);
      gDate = selectedGame.created_at;

      textSize(20);
      text(`Platform: ${selectedGame.game.platforms || "Unknown Available Platform"}`, cPaddingX * 3, cPaddingY * 4.6);
      gPlat = selectedGame.game.platforms;

      textSize(20);
      text(`Coolness: ${selectedGame.coolness || "Not Cool at All"}`, cPaddingX * 4.25, cPaddingY * 4.6);
      gCool = selectedGame.coolness;

      textSize(20);
      text(`${selectedGame.game.short_text || "No description :( "}`, cPaddingX, cPaddingY * 6, 600, 800);
      gText = selectedGame.game.short_text

      updateGCover();
      updateGLink();



    } else {
      fill(150);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("SELECT A GAME JAM FROM THE LIBRARY", sidebarWidth + (width - sidebarWidth)/2, height/2);
    }
}

function updateGCover(){
  if(gCover != selectedGame.game.cover){
    gCover = selectedGame.game.cover;

    // this is where we would have set the game cover via API
    gImg = loadImage("https://static.itch.io/images/app-icon.png"); 
  }else{
    console.log("IMAGE BEING DISPLAYED");
    drawGCover(gImg);
  }
}

function drawGCover(gImg){
  if(gImg){
    image(gImg, sidebarWidth * 3, height/2, 300, 300);
  }else{
    gImg = null;
    image(gImg, 0, 0);
  }
}

function updateGLink(){
  if(gLink != selectedGame.game.url){
    gLink = selectedGame.game.url;
  }else{
    drawGLink();
  }
}

function drawGLink(){
  if(gLink){
    directB = new Button(sidebarWidth * 3.5, height / 2.3, 210, 90, "Play Now", openGame, selectedGame);
    directB.display();
  }
}

function openGame(){
  window.open(gLink, "_blank");
}


//--> AI Assisted / edited to display sidebar visual only if data is valid; intended to happen on tick
function drawSidebar(){
  if(dataValid){
    push();
    translate(0, scrollOffset + topPadding); 
    for (let btn of bA) {
      btn.x = sidebarWidth / 2;
      btn.w = sidebarWidth - 40;
      btn.display();
    }
    pop();
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
  constructor(x, y, w, h, label, onClickAction, rawData, scrollable = false) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.onClickAction = onClickAction;
    this.raw = rawData;
    this.scrollable = scrollable;

    this.baseColor = color(240);
    this.hoverColor = color(200);
    this.textColor = color(0);
  }

  display() {
    push();
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
    pop();
  }

  isMouseOver() {
    let sY = this.y;

    if(this.scrollable){
      sY += scrollOffset + topPadding;
    }
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

function mousePressed() {
  for (let b of bA) {
    b.checkClick();
  }

  if(directB){
    directB.checkClick();
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





//RUNTIME METHODS

function preload(){
    if(apiActive){
    loadJSON(getAPIURL(), handleData);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);

}

function setup() {
  init();
  
}

function draw() {
  background(230);

  if(dataValid){
    drawSidebar();
    drawSearch();
    drawLibrary();
  }else{
    drawFallback();
    searchB.remove();//--> ideally if this API was dyanmic, this would only hide the DOM element, and reshow it when a valid jam ID was given
  }
}