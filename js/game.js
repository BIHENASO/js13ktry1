var x = window.innerWidth;
var y = window.innerHeight;
var step = x > y ? y * 0.05 : x * 0.05;
var player;
var bricks = [];
var line;
var lineOn = false;

function startGame(){
	gameScreen.start();
	player = new itemRect(step, step, x * 0.5, y * 0.5, "#555555");
	for(var i = 0; i < 20; i++){
		bricks[i] = new itemRect(step, step, randomInt(step, x -step),
		randomInt(step, y - step), "#000000");
	}
}

var gameScreen = {
	canvas : document.createElement("canvas"),
	start  : function(){
		this.canvas.width = x;
		this.canvas.height = y;
		this.canvas.onpointerdown = dealPointerDown;
		this.canvas.onpointermove = dealPointerMove;
		this.canvas.onpointerup  = dealPointerUp;
		this.canvas.pointerupoutside = dealPointerUp;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(ticker, 17);
	},
	clear : function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
var itemRect = function(width, height, x, y, color){
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.angle = 0;
  this.color = color;
  this.update = function(){
  	ctx = gameScreen.context;
  	ctx.save();
  	ctx.translate(this.x, this.y);
  	ctx.rotate(this.angle);
  	ctx.fillStyle = this.color;
  	ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
  	ctx.restore();
	}
}

var itemLine = function(beginX, beginY, endX, endY, color){
	this.beginX = beginX;
	this.beginY = beginY;
	this.endX = endX;
	this.endY = endY;
	this.angle = Math.atan2(beginY - endY, beginX - endX);
	this.startAngle = this.angle;
	this.color = color;
	this.distance = Math.pow(Math.pow(Math.abs(beginX-endX), 2) + 
		Math.pow(Math.abs(beginY-endY), 2), 0.5);
	this.update = function(){
		this.angle += Math.PI / 180;
		ctx = gameScreen.context;
		ctx.beginPath();
		var nX = this.endX + this.distance * Math.cos(this.angle);
		var nY = this.endY + this.distance * Math.sin(this.angle)
		ctx.moveTo(nX, nY);
		ctx.lineTo(this.endX, this.endY);
		player.x = nX + (player.width * 0.5) * Math.cos(this.angle);
		player.y = nY + (player.height * 0.5) * Math.sin(this.angle);
		ctx.closePath();
		ctx.stroke();
		if(Math.abs(this.angle - this.startAngle) >= 2 * Math.PI / 3){
			lineOn = false;
		}
	}
}

function ticker(){
	gameScreen.clear();
	player.update();
	bricks.forEach(function(brick){
		brick.update();
	});
	if(lineOn){
		line.update();
	}
}

function dealPointerDown(event){
	this.isDown = true;
	var pointX = event.pageX;
	var pointY = event.pageY;
	if(isIn(player, pointX, pointY)){
		this.beginX = pointX;
		this.beginY = pointY;
		this.stat = "line event";
		console.log("BEGIN", this.beginX, this.beginY);
	}
}
function dealPointerMove(event){
	if(this.isDown){
		if(this.stat === "line event"){
			this.endX = event.pageX;
			this.endY = event.pageY;
		}
	}
}

function dealPointerUp(event){
	this.isDown = false;
	if(this.stat === "line event"){
		bricks.forEach(function(brick){
			if(isIn(brick, this.endX, this.endY)){
				lineOn = true;
				line = new itemLine(this.beginX, this.beginY, this.endX, this.endY);
			}
		}.bind(this));
		console.log("END", this.endX, this.endY);
	}
	this.stat = null;
}

function isIn(obj, pointX, pointY){
	var ret = false;
	if(obj.x - obj.width / 2 <= pointX && obj.x + obj.width / 2 >= pointX){
		if(obj.y - obj.width / 2 <= pointY && obj.y + obj.height / 2 >= pointY){
			ret = true;
		}
	}
	return ret;
}

function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

startGame();
