var x = window.innerWidth;
var y = window.innerHeight;
var step = x > y ? y * 0.05 : x * 0.05;
var player;

function startGame(){
	gameScreen.start();
	player = new item(step, step, x * 0.5, y * 0.5, "#555555");
}

var gameScreen = {
	canvas : document.createElement("canvas"),
	start  : function(){
		this.canvas.width = x;
		this.canvas.height = y;
		this.canvas.onpointerdown = dealPointerClicks;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(ticker, 17);
	},
	clear : function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
var item = function(width, height, x, y, color){
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.color = color;
  this.update = function(){
  	ctx = gameScreen.context;
  	ctx.fillStyle = this.color;
  	ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

function ticker(){
	gameScreen.clear();
	player.update();
}

function dealPointerClicks(event){
	this.data = event.data;
	this.isdown = true;
	this.pointX = this.data.getLocalPosition(this.parent).x;
	this.pointY = this.data.getLocalPosition(this.parent).y;
	console.log(pointX, pointY);
}

startGame();
