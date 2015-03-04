var laser, crystal;
var alice_photon, bob_photon;
var alice, bob;
var alice_coin, bob_coin;
var alice_detector, bob_detector;
var alice_beamline, bob_beamline;
var midpoint, person_y;
var locked=false;

var timescale = 1;

function addImg(id, path, x, y, container){
    if (container==undefined){container=$("#content");}
    container.append("<img id='"+id+"' src='"+path+"'/>");
    var reference = $("#"+id);
    reference.load(function(){
        var x2 = x - reference.width()/2;
        var y2 = y - reference.height()/2;
        reference.css({"left":x2+"px", "top":y2+"px"});
    });
    return reference;
}

function fliph(img, direction){
    img.css({"transform": "scaleX("+direction+")"});
}

function Laser(x, y){
    var self=this;
    self.laser = addImg("laser", "img/laser.png", x, y);
    self.laserbeam = addImg("laserbeam", "img/laserbeam.png", x+75, y);
    self.laserbeam.hide();

    self.fire = function(){
        self.laserbeam.fadeIn(100*timescale);
        self.laserbeam.fadeOut(100*timescale, crystal.generate);
    }
}

function Crystal(x, y){
    var self=this;
    self.crystal = addImg("crystal", "img/crystal.png", x, y);

    self.generate = function(){
        alice_photon.fire();
        bob_photon.fire();
    }
}

function Photon(id, x, y, direction){
    var self=this;
    self.image = addImg(id, "img/photon.png", x, y);
    self.image.hide();
    self.direction = direction;

    self.fire=function(){
        self.image.show();
        var shift = person_y 
        var ymove = self.direction==1 ? "+="+person_y : "-="+person_y;
        var xmove = "+=50"
        self.image.animate({ top: ymove, left: xmove}, 300*timescale, "linear", self.shift);
    } 

    self.shift=function(){
        if (self.onShift!=undefined){self.onShift();}
        self.image.animate({ left: "+=200"}, 2000*timescale, "linear", self.finished);
    }

    self.finished=function(){
        self.image.remove();
        self.image = addImg(id, "img/photon.png", x, y);
        self.image.hide();
        if (self.onFinish){self.onFinish();}
    }
}

function WavePlate(id, x, y, angles){
    var self=this;
    self.image = addImg(id, "img/waveplate.png", x, y);
    self.angle = 0;
    self.angles = angles
    //self.image.hide();

    self.setAngle=function(whichAngle){
        self.target_angle = self.angles[whichAngle]*2;
        self.moveInterval = setInterval(self.move, 15);
    }

    self.reset=function(){
        //self.image.fadeOut(100);
    }

    self.move = function(){
        //self.image.fadeIn(100);
        self.angle += (self.target_angle-self.angle)*0.4;
        self.image.css({"transform": "rotate("+self.angle+"deg)"}); 
        if (Math.abs(self.angle-self.target_angle)<0.1){
            clearInterval(self.moveInterval);
            if (self.onMoved){self.onMoved();}
        }
    }
}

function Detector(name, x, y){
    var self = this;
    $("#content").append("<div id='"+name+"'></div>");
    self.container = $("#"+name);
    self.blackbox = addImg(name+"_blackbox", "img/blackbox.png", 0, 0, self.container);
    self.flags = {"circle":addImg(name+"_circle", "img/flagguilty.png", 10, -30, self.container),
                "triangle":addImg(name+"_triangle", "img/flaginnocent.png", 10, -30, self.container)};
    self.container.css({"position":"absolute", "left":x+"px", "top":y+"px"});
    self.flags.circle.hide();
    self.flags.triangle.hide();

    self.flagUp=function(whichflag){
        self.flag = whichflag;
        self.flags[whichflag].fadeIn(200*timescale);
        if (self.afterFlag){setTimeout(self.afterFlag, 500*timescale);}
    }

    self.reset = function(){
        self.flags.circle.fadeOut(200*timescale);
        self.flags.triangle.fadeOut(200*timescale);
    }
}

function Person(name, img, x, y, direction){
    var self=this;
    self.image = addImg(name, img, x, y);
    fliph(self.image, direction);

    var which_guilty = direction > 0 ? "img/say_guilty.png" : "img/say_guilty2.png";
    self.sayings = {"circle":addImg(name+"_say1", which_guilty, x+70*direction, y-10),
                    "triangle":addImg(name+"_say2", "img/say_innocent.png", x+70*direction, y-10)};
    fliph(self.sayings.circle, direction);
    fliph(self.sayings.triangle, direction);
    self.sayings.circle.hide();
    self.sayings.triangle.hide();

    self.reset = function(){
        self.sayings.circle.hide().clearQueue();
        self.sayings.triangle.hide().clearQueue();
    }

    self.say = function(saywhat, timeout){
        if (timeout==undefined){timeout=true;}
        self.sayings[saywhat].fadeIn(200*timescale).delay(2000*timescale);
        if (timeout){self.sayings[saywhat].fadeOut(200*timescale);}
        if(self.afterSay){self.afterSay();}
    }
}

function Coin(name, x, y){
    var self = this;
    self.starty = y;
    self.y = y;
    self.v = 0;
    self.rotation = 0;

    $("#content").append("<div id='"+name+"'></div>");
    self.container = $("#"+name);
    self.heads = addImg(name+"_heads", "img/heads.png", 0, 0, self.container);
    self.tails = addImg(name+"_tails", "img/tails.png", 0, 0, self.container);
    self.tails.hide();
    self.container.css({"position":"absolute", "left":x+"px", "top":y+"px"});

    self.flip = function(){
        self.moveInterval = setInterval(self.move, 15);
        self.y = self.starty;
        self.v = -9;
        self.outcome = undefined;
    }

    self.move = function(){
        self.y+=self.v;
        self.v += 0.9;
        self.rotation += 0.4;

        if (self.y>self.starty){
            self.y=self.starty;
            self.rotation=0;
            self.outcome = Math.random()>0.5 ? "heads" : "tails";
            self.heads.toggle(self.outcome=="heads");
            self.tails.toggle(self.outcome=="tails");
            if (self.onLand){self.onLand(self.outcome);}
            clearInterval(self.moveInterval);
        }

        var sy = Math.cos(self.rotation);
        self.container.css({"top":self.y+"px"});
        self.container.css({"transform": "scaleY("+sy+")"});
    }
}

function Rules(x, y, width, height, text){
    var self=this;
    self.text = text==undefined ? true : false;

    $("#content").append("<canvas width="+width+" height="+height+" id=canvas ></canvas>");
    self.canvas = $("#canvas");
    self.width=width;
    self.height=height;
    x2 = x - self.width/2;
    y2 = y - self.height/2;
    self.canvas.css({"position":"absolute", "left":x2+"px", "top":y2+"px"});
    self.ctx = self.canvas[0].getContext("2d");

    self.prepare = function(){
        var ctx=self.ctx;
        ctx.lineCap="round";
        ctx.lineJoin="round";
        ctx.textBaseline = 'middle'; 
        ctx.textAlign = 'center'; 
        ctx.font=15+'px sans';
    }

    self.edge = function(a, b){
        var ctx=self.ctx;
        if (a == "tails" && b=="tails"){ ctx.setLineDash([8]) };

        ctx.strokeStyle = "gray";
        ctx.fillStyle = "gray"; 
        ctx.lineWidth=2;
        if (alice_coin.outcome==a && bob_coin.outcome==b){
            ctx.strokeStyle = "red";
            ctx.fillStyle = "red"; 
            ctx.lineWidth=3;
        }

        ctx.beginPath();
        var w = .8*self.width/2; var h = .7*self.height/2;
        var gety = {"heads":-h, "tails":h}
        ctx.moveTo(-w, gety[a]); ctx.lineTo(w, gety[b]);
        ctx.stroke();

        ctx.save();
        ctx.translate(0, (gety[a]+gety[b])/2);
        ctx.rotate(Math.atan2((gety[b]-gety[a])/2., w));
        direction = (gety[a]-gety[b])/2;
        var text = (a=="tails" && b=="tails") ? "disagree" : "agree";
        if (self.text){ctx.fillText(text, direction, 15);}
        ctx.restore();
    }

    self.draw = function(){
        var ctx = self.ctx;
        ctx.save();
        ctx.clearRect(0, 0, self.width, self.height);
        ctx.translate(self.width/2, self.height/2-10);
        self.prepare();

        var w = .8*self.width/2; var h = .7*self.height/2;
        var gety = {"heads":-h, "tails":h}
        self.edge("heads", "heads");
        self.edge("heads", "tails");
        self.edge("tails", "heads");
        self.edge("tails", "tails");

        if (self.text){
        ctx.fillStyle = alice_coin.outcome=="heads" ? "red" : "gray"; 
        ctx.fillText("H", -w-20, -h);
        ctx.fillStyle = bob_coin.outcome=="heads" ? "red" : "gray"; 
        ctx.fillText("H", +w+20, -h);
        ctx.fillStyle = alice_coin.outcome=="tails" ? "red" : "gray"; 
        ctx.fillText("T", -w-20, h);
        ctx.fillStyle = bob_coin.outcome=="tails" ? "red" : "gray"; 
        ctx.fillText("T", +w+20, h);
        }
        ctx.restore();
    }

    self.draw();
}
