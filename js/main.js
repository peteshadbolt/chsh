var gc, ctx;
var images = {};

var alice, bob, aliceCoin, bobCoin, rules;
var needframe=true;

function boot(){
    gc=document.getElementById("canvas");
    winlose = document.getElementById("winlose");
    ctx = gc.getContext("2d");
    loadImages();
}


function loadImages()
{
    images.alice=new Image();
    images.alice.src = "img/alice.png";
    images.bob=new Image();
    images.bob.src = "img/bob.png";

    images.heads=new Image();
    images.heads.src = "img/heads.png";
    images.tails=new Image();
    images.tails.src = "img/tails.png";

    images.say={};
    images.say.circle=new Image();
    images.say.circle.src = "img/say_circle.png";
    images.say.triangle=new Image();
    images.say.triangle.src = "img/say_triangle.png";
}

function redraw(){
    console.log("render");
    ctx.clearRect(0,0,gc.width,gc.height);
    alice.draw(ctx);
    bob.draw(ctx);
    if (rules){rules.draw(ctx)};
    aliceCoin.draw(ctx);
    bobCoin.draw(ctx);
}

function update(){
    aliceCoin.move();
    bobCoin.move();
    if (!needframe){return;}
    requestAnimationFrame(redraw);
    needframe=false;
}

function Person(image, x, y, direction) {
    var self = this;
    this.image = image;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.saying = undefined;
    this.afterSay = function(){};

    this.draw = function(ctx){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction, 1);
        ctx.drawImage(this.image, 0, 0);
        if (this.saying!=undefined){
            var img = images.say[this.saying];
            ctx.drawImage(img, this.image.width, 0);
        }
        ctx.restore();
    }

    this.say = function(say_what){
        self.saying=say_what;
        needframe=true;
    }
}

function Coin(x, floor) {
    this.floor=floor;
    if (floor==undefined){this.floor = 60};
    this.x = x;
    this.y = this.floor;
    this.t = 0;
    this.v = 0;
    this.moving = false;
    this.onLand = function(outcome){};
    this.outcome = "heads";

    this.move = function(){
        if (!this.moving){return;}
        this.t += 0.4;
        this.y += this.v;
        this.v += 0.8;
        if (this.y >= this.floor){
            this.y = this.floor; 
            this.v = 0;
            this.moving=false;
            this.outcome = Math.random()>0.5 ? "heads" : "tails";
            this.onLand(this.outcome);
        }
        needframe=true;
    }

    this.flip = function(){
        this.v = -9;
        this.moving=true;
        this.outcome=undefined;
    }

    this.draw = function(ctx){
        var w = images.heads.width;
        var h = images.heads.height;
        if (this.moving==true){
            ctx.save();
            ctx.translate(this.x + w/2, this.y + h/2);
            ctx.scale(1, Math.cos(this.t));
            ctx.translate(-w/2, -h/2);
            var img = Math.cos(this.t)<0 ? images.heads : images.tails;
            ctx.drawImage(img, 0, 0);
            ctx.restore();
        } else {
            ctx.drawImage(images[this.outcome], this.x, this.y);
        }
    }

}

function Rules(){
    this.draw = function(ctx){
        ctx.save();
        ctx.translate(gc.width/2, gc.height/2-10);
        ctx.lineCap="round";
        ctx.lineJoin="round";

        ctx.textBaseline = 'middle'; 
        ctx.textAlign = 'center'; 
        ctx.font=15+'px sans';

        var w = 90; var h = 50;
        var gety = {"heads":-h, "tails":h}
        var edge = function(a, b){
            if (a == "tails" && b=="tails"){ ctx.setLineDash([8]) };

            ctx.strokeStyle = "gray";
            ctx.fillStyle = "gray"; 
            ctx.lineWidth=2;
            if (aliceCoin.outcome==a && bobCoin.outcome==b){
                ctx.strokeStyle = "red";
                ctx.fillStyle = "red"; 
                ctx.lineWidth=3;
            }

            ctx.beginPath();
            ctx.moveTo(-w, gety[a]); ctx.lineTo(w, gety[b]);
            ctx.stroke();

            ctx.save();
            ctx.translate(0, (gety[a]+gety[b])/2);
            ctx.rotate(Math.atan2((gety[b]-gety[a])/2., w));
            direction = (gety[a]-gety[b])/2;
            var text = (a=="tails" && b=="tails") ? "disagree" : "agree";
            ctx.fillText(text, direction, 15);
            ctx.restore();
        }

        edge("heads", "heads");
        edge("heads", "tails");
        edge("tails", "heads");
        edge("tails", "tails");

        ctx.fillStyle = aliceCoin.outcome=="heads" ? "red" : "gray"; 
        ctx.fillText("H", -w-20, -h);
        ctx.fillStyle = bobCoin.outcome=="heads" ? "red" : "gray"; 
        ctx.fillText("H", +w+20, -h);
        ctx.fillStyle = aliceCoin.outcome=="tails" ? "red" : "gray"; 
        ctx.fillText("T", -w-20, h);
        ctx.fillStyle = bobCoin.outcome=="tails" ? "red" : "gray"; 
        ctx.fillText("T", +w+20, h);

        ctx.restore();

    }
}
