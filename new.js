var laser, crystal;
var alice_photon, bob_photon;
var alice, bob;
var alice_coin, bob_coin;
var alice_detector, bob_detector;
var alice_beamline, bob_beamline;
var midpoint, person_y;
var locked=false;

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
        self.laserbeam.fadeIn(100);
        self.laserbeam.fadeOut(100, crystal.generate);
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
        self.image.animate({ top: ymove, left: xmove}, 300, "linear", self.shift);
    } 

    self.shift=function(){
        if (self.onShift!=undefined){self.onShift();}
        self.image.animate({ left: "+=200"}, 2000, "linear", self.finished);
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
    self.image.hide();

    self.setAngle=function(whichAngle){
        self.target_angle = self.angles[whichAngle];
        self.moveInterval = setInterval(self.move, 15);
    }

    self.reset=function(){
        self.image.fadeOut(100);
    }

    self.move = function(){
        self.image.fadeIn(100);
        self.angle += (self.target_angle-self.angle)*0.3;
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
    self.flags = [addImg(name+"_circle", "img/flagcircle.png", 10, -30, self.container),
                addImg(name+"_triangle", "img/flagtriangle.png", 10, -30, self.container)];
    self.container.css({"position":"absolute", "left":x+"px", "top":y+"px"});
    self.flags[0].hide();
    self.flags[1].hide();

    self.flagUp=function(whichflag){
        self.flags[0].fadeIn(200);
        if (self.afterFlag){setTimeout(self.afterFlag, 500);}
    }

    self.reset = function(){
        self.flags[0].fadeOut(200);
        self.flags[1].fadeOut(200);
    }
}

function Person(name, img, x, y, direction){
    var self=this;
    self.image = addImg(name, img, x, y);
    fliph(self.image, direction);

    self.sayings = [addImg(name+"_say1", "img/say_circle.png", x+70*direction, y-10),
                    addImg(name+"_say2", "img/say_triangle.png", x+70*direction, y-10)];
    fliph(self.sayings[0], direction);
    fliph(self.sayings[1], direction);
    self.sayings[0].hide();
    self.sayings[1].hide();

    self.say = function(saywhat){
        self.sayings[saywhat].fadeIn(200).delay(2000).fadeOut();
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
