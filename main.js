var gc, ctx;
var images = {};

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

function Person(image, x, y, direction) {
    var self = this;
    this.image = image;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.saying = undefined;

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
        setTimeout(function(){self.saying=undefined;}, 1500);
    }
}

function Coin(x, floor) {
    this.floor = 60;
    this.x = x;
    this.y = this.floor;
    this.t = 0;
    this.v = 0;
    this.moving = false;
    this.onLand = function(outcome){console.log(outcome);};
    this.outcome = "heads";

    this.move = function(){
        if (!this.moving){return;}
        this.t += 0.3;
        this.y += this.v;
        this.v += 0.4;
        if (this.y >= this.floor){
            this.y = this.floor; 
            this.v = 0;
            this.moving=false;
            this.outcome = Math.random()>0.5 ? "heads" : "tails";
            this.onLand(this.outcome);
        }
    }

    this.flip = function(){
        this.v = -6.5;
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
