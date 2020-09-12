var x = window.innerWidth;
var y = window.innerHeight;
var step = x > y ? y * 0.05 : x * 0.05;
var player;
var bricks = [];
var line;
var lineOn = false;
var container = {"x" : 0, "y" : 0, "width" : x, "height" : y};
var back, replay;
var score = 0;
var scoreText;
var screen = 1;
var screenText;
var itemID = 0;
function slideScreen() {
	if(line){
		line.beginY += y/3;
		line.endY += y/3;
	}
	player.y += y/3;
	bricks = bricks.filter(function(brick){
		if (brick.y > y*0.67) {
			return false;
		} else {
			brick.y += y/3;
			return true;
		}
	});
	for (var i = 0; i < 2; i++) {
		bricks.push(new itemRect(1.5 * step, 1.5 * step, 
			randomInt(1.5 * step, x - 1.5 * step), 
			randomInt(step, y/3 - step), "#000000", "brick"));
	}
}

function startGame(){
	gameScreen.start();
	player = new itemRect(1.5 * step, 1.5 * step, x * 0.5, y * 0.5, "#555555");
	player.scoreInterval = setInterval(function(){score--;}, 10000); 
	for(var i = 0; i < 5; i++){
		bricks[i] = new itemRect(1.5 * step, 1.5 * step, 
											randomInt(1.5 * step, x - 1.5 * step),
		randomInt(step, y - step), "#000000", "brick");
	}
	screenText = new itemRect(step, "Courier New", x - 6.2 * step, step, "#555555", "text");
	scoreText = new itemRect(step, "Courier New", step / 5, step, "#555555", "text");
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
	},
	
	stop : function(status = 0){
		clearInterval(this.interval);
		clearInterval(player.scoreInterval);
		player = null;
		line = null;
		lineOn = false;
		bricks = [];
		screen = 1;
		score = 0;
		var st = status > 0 ? "404 NOT FOUND" : "GAME OVER";
		this.clear();
		this.context.font = 2 * step +"px Courier New";
		this.context.strokeStyle = "#FF0000";
		this.context.textAlign = "center";
		this.context.strokeText(st, container.width / 2, 
			container.height / 2);
		
		this.context.strokeStyle = "#FF0000";
		this.context.lineWidth = step / 4;
		
		replay = new Path2D();
		replay.arc(container.width / 2 - 3 * step, 
			container.height / 2 + 3 * step, step, Math.PI / 3, Math.PI * 2, false);
		replay.moveTo(container.width / 2 - 2 * step,
			container.height / 2 + 3 * step);
		replay.lineTo(container.width / 2 - 2 * step,
			container.height / 2 + 2 * step);
		replay.moveTo(container.width / 2 - 2 * step - step / 8,
			container.height / 2 + 3 * step - step / 8);
		replay.lineTo(container.width / 2 - 3 * step + step / 8,
			container.height / 2 + 3 * step - step / 8);
		this.context.stroke(replay);
		
		back = new Path2D();
		back.moveTo(container.width / 2 + 4 * step,
		 container.height / 2 + 2 * step);
		back.lineTo(container.width / 2 + 4 * step,
		 container.height / 2 + 4 * step);
		back.lineTo(container.width / 2 + 2 * step,
		 container.height / 2 + 3 * step);
		back.lineTo(container.width / 2 + 4.1 * step,
		 container.height / 2 + 1.9 * step);
		this.context.stroke(back);
		
		this.canvas.onpointerdown = dealGameOverPointerDown;
		this.canvas.onpointermove = null;
		this.canvas.onpointerup  = null;
		this.canvas.pointerupoutside = null;
	},
}
var itemRect = function(width, height, x, y, color, type = "player"){
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.id = itemID++;
  this.angle = 0;
  this.color = color;
  this.gravitySpeed = 1;
  this.rotator = randomInt(0, 10) % 2 == 0 ? -1 : 1;
  this.bonusStatus = randomInt(0,5) % 3 == 0 ? 1 : 0;
  this.update = function(){
  	ctx = gameScreen.context;
  	if(type == "text"){
  		ctx.font = this.width +"px " + this.height;
  		ctx.fillStyle = this.color;
  		ctx.fillText(this.text, this.x, this.y)
  	}else{
  	  ctx.save();
  		ctx.translate(this.x, this.y);
  		ctx.rotate(this.angle);
  		if(type == "player")
  			ctx.fillStyle = this.color;
  		else{
  			ctx.fillStyle = this.rotator < 0 ? "#00FF00" : "#0000FF";
  			ctx.fillStyle = this.bonusStatus == 1 ? "#FF0000" : ctx.fillStyle;
  			}
  		ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
  		ctx.restore();
  	}
	};
	this.move = function(){
		this.checkBricks();
		if(!lineOn){
			this.checkBounds();
			this.y += this.gravitySpeed;
		}else{
			if(this.checkBounds()){
				lineOn = false;
			}
		}
	};
	this.checkBounds = function(){
		var ret = false;
		if(this.x - this.width / 2 < container.x){
			this.x += this.width / 2;
			ret = true;
		}
		if(this.x + this.width / 2 > container.width){
			this.x -= this.width / 2;
			ret = true;
		}
		return ret;
	};
	this.checkBricks = function(){
		bricks.forEach(function(brick){
			if(calDist(this, brick) < this.width){
				lineOn= false;
				if(this.y <= brick.y && 
					Math.abs(this.x - brick.x) < 3 * this.width / 4){
					if(brick.bonusStatus == 1){
						var rnd = randomInt(0,10);
						if(rnd % 7 == 0){
							this.y -= y;
						}else{
							gameScreen.context.clearRect(brick.width / -2, brick.height / -2, brick.width, brick.height);
							bricks = bricks.filter(function(b){
								if(b.id == brick.id) return false;
								else return true;
							}.bind(brick));
						}
					}else{
						this.y = brick.y - this.width;
						this.gravitySpeed = 0;
					}
				}else{
					var ang = Math.atan2(brick.y - this.y, brick.x - this.x);
					this.x = this.x + (2 * Math.cos(Math.PI + ang));
					this.y = this.y + (2 * Math.sin(Math.PI + ang));
				}
			}
		}.bind(this));
	};
}

var itemLine = function(beginX, beginY, endX, endY, color, rotatorBrick){
	this.beginX = beginX;
	this.beginY = beginY;
	this.nX = beginX;
	this.nY = beginY;
	this.endX = endX;
	this.endY = endY;
	this.angle = Math.atan2(beginY - endY, beginX - endX);
	this.startAngle = this.angle;
	this.color = color;
	this.distance = calDist({"x" :beginX, "y" :beginY}, 
										{"x" : endX, "y" : endY});
	this.moveFactor = rotatorBrick.rotator;
	this.update = function(){
		this.angle += this.moveFactor * Math.PI / 180;
		ctx = gameScreen.context;
		ctx.beginPath();
		this.nX = this.endX + this.distance * Math.cos(this.angle);
		this.nY = this.endY + this.distance * Math.sin(this.angle)
		ctx.moveTo(this.nX, this.nY);
		ctx.lineTo(this.endX, this.endY);
		player.x = this.nX + (player.width * 0.5) * Math.cos(this.angle);
		player.y = this.nY + (player.height * 0.5) * Math.sin(this.angle);
		ctx.closePath();
		ctx.stroke();
		if(rotatorBrick.bonusStatus == 1 && Math.abs(this.startAngle-this.angle) > Math.PI / 3){
			lineOn = false;
			gameScreen.context.clearRect(rotatorBrick.width / -2, rotatorBrick.height / -2, rotatorBrick.width, rotatorBrick.height);
			bricks = bricks.filter(function(b){
				if(b.id == rotatorBrick.id) return false;
				else return true;
			}.bind(rotatorBrick));			
		}
	}
	
	this.colCheck = function() {
		var x = Math.min(this.nX,this.endX);
		var y = Math.min(this.nY,this.endY);
		var w = Math.abs(this.endX - this.nX);
		var h = Math.abs(this.endY - this.nY);
		
		var bX;
		var bY;
		bricks.forEach(function(brick){
			bX = brick.x - brick.width/2;
			bY = brick.y - brick.height/2;
			if (this.endX > bX + brick.width
					|| this.endX < bX
					|| this.endY > bY + brick.height
					|| this.endY < bY) {
				if (x < bX + brick.width
						&& x + w > bX
						&& y < bY + brick.height
						&& y + h > bY) {
					var angle = Math.atan2(this.endY-this.nY,this.endX-this.nX);
					var type = Math.atan2(this.endY-bY,this.endX-bX) > angle;
					if ( ( (Math.atan2(this.endY-(bY+brick.height),this.endX-(bX+brick.width)) > angle) != type )
							|| ( (Math.atan2(this.endY-bY,this.endX-(bX+brick.width)) > angle) != type )
							|| ( (Math.atan2(this.endY-(bY+brick.height),this.endX-bX) > angle) != type ) ) {
						lineOn = false;
					}
				}
			}
		},this);
	}
}

function ticker(){
	if (player.y < y/3) {
		slideScreen();
		screen++;
		score += 100;
	}
	if(player.y + player.height / 2 > container.height){
		gameScreen.stop();
	}else if(screen >= 404){
		gameScreen.stop(1);
	}else{
		gameScreen.clear();
		player.update();
		player.move();
		screenText.text = "SCREEN " + formatScreen();
		screenText.update();
		scoreText.text  = "SCORE> " + score; 
		scoreText.update();
		bricks.forEach(function(brick){
			brick.update();
		});
		if(lineOn){
			line.update();
			line.colCheck();
		}
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
	}else{
		if(!player.gravitySpeed){
			player.y -=  2 * step;
			player.gravitySpeed = 1;
		}else if(lineOn){
			lineOn = false;
		}
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
				player.gravitySpeed = 1;
				line = new itemLine(this.beginX, this.beginY, this.endX, this.endY, "#000000", brick);
			}
		}.bind(this));
	}
	this.stat = null;
}

function dealGameOverPointerDown(event){
	this.isDown = true;
	var pointX = event.pageX;
	var pointY = event.pageY;	
	if(gameScreen.context.isPointInStroke(replay, pointX, pointY)){
		gameScreen.clear();
		back = null;
		replay = null;
		startGame();
	}else if(gameScreen.context.isPointInStroke(back, pointX, pointY)){
		window.location.assign("../index.html");
	}
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

function calDist(obj,obj1){
	return Math.pow(Math.pow(Math.abs(obj.x-obj1.x), 2) + 
		Math.pow(Math.abs(obj.y-obj1.y), 2), 0.5);
}
function formatScreen(){
	var ret;
	if(screen >= 100) ret = screen.toString();
	else if(screen < 100 && screen >= 10){
		ret = "0"; 
		ret += screen.toString();
	}else{
		ret = "00";
		ret += screen.toString();
	}
	return ret;
}

startGame();
