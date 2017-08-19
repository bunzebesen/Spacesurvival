/************************************************************************************/
/*                                                                                  */
/*        a player entity                                                           */
/*                                                                                  */
/************************************************************************************/
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        // player can exit the viewport (jumping, falling into a hole, etc.)
        this.alwaysUpdate = true;

        this.textItem = null;
        this.oxygen = null;
        this.info = null;

        this.alreadyHurt = false;
        this.alreadyDead = false;

        // walking & jumping speed
        this.body.setVelocity(10, 5);
        this.body.setFriction(0.5,0);
        this.body.gravity = 1;

        //this.dying = false;

        this.mutipleJump = 1;
        this.leanVel = 0.015;

        // set the display around our position
        me.game.viewport.follow(this, me.game.viewport.AXIS.BOTH);

        me.game.viewport.setDeadzone(0, 0);

        // enable keyboard
        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.SPACE, "jump", true);
        me.input.bindKey(me.input.KEY.UP,    "up");
        me.input.bindKey(me.input.KEY.DOWN,  "down");

        me.input.bindKey(me.input.KEY.A,     "left");
        me.input.bindKey(me.input.KEY.D,     "right");
        me.input.bindKey(me.input.KEY.W,     "jump", true);
        me.input.bindKey(me.input.KEY.S,     "down");

        var shape = this.body.getShape();
        shape.scale(0.5, 1);
        shape.pos.x = 46;

        this.renderable.addAnimation ("idle",  [0]);
        this.renderable.addAnimation ("speed-up",  [1]);
        this.renderable.addAnimation ("speed-side",  [2]);
        this.renderable.addAnimation ("speed-both",  [3]);
        this.renderable.setCurrentAnimation("idle");

        this.body.collisionType = me.collision.types.PLAYER_OBJECT;

        this.groundHeight = 400;
        this.maxHeightOfLevel =  me.game.currentLevel.height - this.groundHeight;

        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 1.0);
    },

    /* -----

        update the player pos

    ------            */
    update : function (dt) {
        var self = this;

        if (this.textItem === null) {
            this.textItem = me.game.world.getChildByName("TextItem")[0];
        }
        if (this.oxygen === null) {
            this.oxygen = me.game.world.getChildByName("OxygenScreenItem")[0];
        }
        if (this.info === null) {
            this.info = me.game.world.getChildByName("InfoItem")[0];
        }

        this.renderable.setCurrentAnimation("idle");

        if (me.input.isKeyPressed('up')) {
            this.body.vel.y -= this.body.accel.y * me.timer.tick;
            this.renderable.setCurrentAnimation("speed-up");
        }

        if (me.input.isKeyPressed('left')) {
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
            this.renderable.setCurrentAnimation("speed-side");
            this.renderable.flipX(true);
            var shape = this.body.getShape();
            shape.pos.x = 0;
            if (this.renderable.angle <= 0.3) {
                this.renderable.angle += this.leanVel;
            }
        } else if (me.input.isKeyPressed('right')) {
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            this.renderable.setCurrentAnimation("speed-side");
            this.renderable.flipX(false);
            var shape = this.body.getShape();
            shape.pos.x = 46;

            if (this.renderable.angle <= 0.3) {
                this.renderable.angle += this.leanVel;
            }
        } else if (this.renderable.angle >= 0) {
            this.renderable.angle -= this.leanVel;
        }

        if (me.input.isKeyPressed('up') && (me.input.isKeyPressed('left') || me.input.isKeyPressed('right'))) {
            this.renderable.setCurrentAnimation("speed-both");
        }

        if (me.input.isKeyPressed('jump')) {
            this.body.jumping = true;

            if (this.multipleJump <= 2) {
                // easy 'math' for double jump
                this.body.vel.y -= (this.body.maxVel.y * this.multipleJump++) * me.timer.tick;
            }
        }
        else if (!this.body.falling && !this.body.jumping) {
            // reset the multipleJump flag if on the ground
            this.multipleJump = 1;
        }
        else if (this.body.falling && this.multipleJump < 2) {
            // reset the multipleJump flag if falling
            this.multipleJump = 2;
        }

       this.body.gravity = (this.pos.y/(this.maxHeightOfLevel));

        if (this.body.gravity <= 0.02) {
            this.body.gravity = -0.3;
        } else if (this.body.gravity <= 0.3 && this.body.gravity >= 0) {
            this.textItem.setText("YOU ARE ABOUT TO LOSE GRAVITY");
            setTimeout(function() {
                self.textItem.setText("");
            }, 1);
        }

        if (this.body.gravity <= 0 && !this.alreadyDead) {
            this.textItem.setText("YOU FLEW INTO SPACE");
            this.death();
        }

        if (game.data.health <= 0 && !this.alreadyDead) {
            this.textItem.setText("YOU DIED");
            this.death();
        }

        if (this.oxygen.heightBlue <= 0 && !this.alreadyDead) {
            this.textItem.setText("OUT OF OXYGEN");
            this.death();
        }

        if (this.info) {
            this.removeInfo();        
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // check if we fell into a hole
        if (!this.inViewport && (this.pos.y > me.video.renderer.getHeight())) {
            // if yes reset the game
            this.death();
        }

        // handle collisions against other shapes
        me.collision.check(this);

        // check if we moved (an "idle" animation would definitely be cleaner)
        if (this.body.vel.x!=0 || this.body.vel.y!=0 || (this.renderable && this.renderable.isFlickering())) {
            this._super(me.Entity, 'update', [dt]);
            return true;
        }

        return false;
    },

    /**
     * colision handler
     */
    onCollision : function (response, other) {
        var self = this;
        switch (other.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                // Simulate a platform object
                if (other.type === "platform") {
                    if (this.body.falling &&
                        !me.input.isKeyPressed('down') &&
                        // Shortest overlap would move the player upward
                        (response.overlapV.y > 0) &&
                        // The velocity is reasonably fast enough to have penetrated to the overlap depth
                        (~~this.body.vel.y >= ~~response.overlapV.y)
                    ) {
                        // Disable collision on the x axis
                        response.overlapV.x = 0;
                        // Repond to the platform (it is solid)
                        return true;
                    }
                    // Do not respond to the platform (pass through)
                    return false;
                }
                break;

            case me.collision.types.ENEMY_OBJECT:
                if (other.isMovingEnemy ) {
                    this.hurt();  
                    return true;                  
                }  else {
                    return false;
                }
            case me.collision.types.NPC_OBJECT:
                if (!other.isMovingEnemy ) {
                    // spike or any other fixed danger
                    this.hurt();  
                    return true;                  
                }  else {
                    return false;
                }
            case me.collision.types.PORJECTILE_OBJECT:
                this.hurt();  
                return true;
            case me.collision.types.ACTION_OBJECT:
                if ((response.overlapV.y>0)) {
                    this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                }

            default:
                // Do not respond to other objects (e.g. coins)
                return false;
        }
        // Make the object solid
        return true;
    },

    death: function () {
        var self = this;
        this.alreadyDead = true;
        me.input.unbindKey(me.input.KEY.LEFT,  "left");
        me.input.unbindKey(me.input.KEY.RIGHT, "right");
        me.input.unbindKey(me.input.KEY.SPACE, "jump", true);
        me.input.unbindKey(me.input.KEY.UP,    "up");
        me.input.unbindKey(me.input.KEY.DOWN,  "down");

        me.input.unbindKey(me.input.KEY.A,     "left");
        me.input.unbindKey(me.input.KEY.D,     "right");
        me.input.unbindKey(me.input.KEY.W,     "jump", true);
        me.input.unbindKey(me.input.KEY.S,     "down");
        setTimeout(function(){      
            me.game.world.removeChild(self);  
            self.textItem.setText("");                           
            game.data.score = 0;
            game.data.health = 8;
            self.oxygen.counter = 0;
            self.oxygen.heightBlue = game.data.oxygen;
            me.game.world.getChildByName("FoundItem")[0].resetScore();          
            me.levelDirector.reloadLevel();
        }, 3000);
        return true;

    },

    removeInfo : function () {
        if (me.input.isKeyPressed('left') || me.input.isKeyPressed('right') || me.input.isKeyPressed('up') || me.input.isKeyPressed('jump')) {
            me.game.world.removeChild(this.info);
        }
    },

    /**
     * ouch
     */
    hurt : function () {
        if (!this.alreadyDead && !this.alreadyHurt) {
            var self = this;
            this.alreadyHurt = true;
            this.textItem.setText("OUCH");
            game.data.health -= 1;
            setTimeout(function() {
                self.textItem.setText("")
                self.alreadyHurt = false;
            }, 2000)
            this.renderable.flicker(750);        }
    }
});


game.EnvironmentalEnemy = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.collisionType = me.collision.types.NPC_OBJECT;
    }
});

game.PlatformEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.collisionType = me.collision.types.WORLD_SHAPE;
        this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
    }
});

/**
 * a collectable entity
 */
game.SpaceshipPartsEntity = me.CollectableEntity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {
        //settings.spritewidth = settings.width;
        //settings.spriteheight = settings.height;

        // call the super constructor
        this._super(me.CollectableEntity, 'init', [x, y , settings]);

        if (settings.image === "starfighter_light") {
            this.body.addShape(new me.Rect(this.x, this.y, settings.width, settings.height));
        }

    },

    /**
     * collision handling
     */
    onCollision : function (response) {

        // do something when collide
        // give some score
        game.data.score += 100;
        me.game.world.getChildByName("FoundItem")[0].addScore(1);

        //avoid further collision and delete it
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);

        me.game.world.removeChild(this);

        return false;
    }
});

/**
 * An robot enemy entity
 * follow a horizontal path defined by the box size in Tiled
 */ 
game.friendlyRoboterEntity = me.CollectableEntity.extend({
    init: function (x, y, settings) {
        settings.image = "robot_sprite";
        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;

        // adjust the setting size to the sprite one
        settings.spritewidth = settings.width =  144;
        settings.spriteheight = settings.height =  80;

        // call the super constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        this.player = null;
        this.textItem = null;

        this.alive = true;

        this.renderable.addAnimation("walk", [1, 3])

        this.renderable.setCurrentAnimation("walk");

        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.endX   = x + width - settings.spritewidth;
        this.pos.x  = x + width - settings.spritewidth;
        this.armPosX = this.pos.x - (width / 2);

        // update the entity bounds since we manually change the entity position
        this.updateBounds();

        // apply gravity setting if specified
        this.body.gravity = 0.5;

        this.walkLeft = false;

        // walking & jumping speed
        this.body.setVelocity(2, 0);

        // set a "enemyObject" type
        this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT | me.collision.types.NPC_OBJECT);

        // don't update the entities when out of the viewport
        this.alwaysUpdate = false;

        // a specific flag to recognize these enemies
        this.isMovingEnemy = true;

        this.alreadyAnalyzed = false;
        this.analysing = false;

        if (me.device.isMobile) {
            this.speechBubbleOffsetX = 15;
            this.speechBubbleOffsetY = -20;
        } else {
            this.speechBubbleOffsetX = -10;
            this.speechBubbleOffsetY = -40;
        }

        this.speechBubble = me.pool.pull("robotSpeechBubble", this.pos.x + this.speechBubbleOffsetX,
        this.pos.y + this.speechBubbleOffsetY);
        me.game.world.addChild(this.speechBubble, this.z);
    },
    
     // manage the enemy movement
     
    update : function (dt) {
        if (this.player === null) {
            this.player = me.game.world.getChildByName("mainPlayer")[0];
        }
        if (this.textItem === null) {
            this.textItem = me.game.world.getChildByName("TextItem")[0];
        }

        this.speechBubble.pos.x = this.pos.x + this.speechBubbleOffsetX;

        if (this.alive)    {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.body.vel.x = this.body.accel.x * me.timer.tick;
                this.walkLeft = false;
                this.renderable.flipX(true);
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.body.vel.x = -this.body.accel.x * me.timer.tick;
                this.walkLeft = true;
                this.renderable.flipX(false);
            }
            if (((this.pos.x === 1976 && !this.walkLeft) || (this.pos.x === 1842 && this.walkLeft) || (this.pos.x === 1888 && !this.walkLeft) || (this.pos.x === 1972 && this.walkLeft) || (this.pos.x === 2042 && this.walkLeft) || (this.pos.x === 1810 && !this.walkLeft)) && !this.alreadyAnalyzed) {
                this.analyze();
            } else if (!this.analysing) {
                this.speechBubble.setText("SEARCHING");
                this.alreadyAnalyzed = false;
            }
        }

        if (this.player.alreadyDead) {
            clearTimeout(this.timer);
        }

        // check & update movement
        this.body.update(dt);

        this.xvalue = this.pos.x;
        this.yvalue = this.pos.y;

        me.collision.check(this);

        // return true if we moved of if flickering
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x != 0 || this.body.vel.y != 0);
    },

    analyze: function() {
        var self = this;
        this.alreadyAnalyzed = true;
        this.analysing = true;
        this.body.vel.x = 0;
        this.speechBubble.setText("ANALYZING");
        this.timer = setTimeout(function() {
            self.direction = (self.walkLeft) ? -1 : 1;
            self.body.vel.x = self.direction * self.body.accel.x * me.timer.tick;
            self.speechBubble.setText("");
            self.analysing = false;
        }, 2000);
    },

    getCurrentPosX: function() {
        return this.pos.x;
    },

    
     // collision handle
     
    onCollision : function (response, other) {
        var self = this;
        if (this.alive) {
            if (response.b.body.collisionType == me.collision.types.WORLD_SHAPE || response.b.body.collisionType == me.collision.types.NPC_OBJECT) {
                return true;
            } else if (response.a.body.collisionType == me.collision.types.PLAYER_OBJECT) {
                game.data.score += 100;
                this.textItem.setText("YOU GOT THE ROBOT");
                setTimeout(function() { 
                    self.textItem.setText("SEE WHAT HE HAS FOUND");

                    var settings = {};
                    settings.width = settings.spritewidth = 36;
                    settings.height = settings.spriteheight = 18;
                    settings.image = "starfighter_light";
                    settings.z = 10;  

                    self.light = me.pool.pull("SpaceshipPartsEntity", self.pos.x, self.pos.y, settings);

                    me.game.world.addChild(self.light, self.z);
                    setTimeout(function() {
                        self.textItem.setText("");
                    }, 1500)
                }, 1500)
            }

            clearTimeout(this.timer);

            this.alive = false;
            me.game.world.removeChild(this);
            me.game.world.removeChild(this.speechBubble);

            //avoid further collision and delete it
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);

            return false;
        }
    }
}); 

game.robotSpeechBubble = me.Renderable.extend({
    init: function (x, y, width, height) {
        var settings = {};
        settings.width = settings.spritewidth = 500;
        settings.height = settings.spriteheight = 1000;
        settings.z = this.z = -100;

        this._super(me.Renderable, 'init', [x, y, 500, 1000]);

        this.name = "robotSpeechBubble";

        var fontMobile = new me.Font('monospace', 20, 'white');

        var font = new me.Font('monospace', 30, 'white');

        this.widthItem = 0;

        if (me.device.isMobile) {
            this.font = fontMobile;
        } else {
            this.font = font;
        }
    },

    draw: function (renderer) {
        var context = renderer.getContext();
        this.font.draw (context, this.text, this.pos.x, this.pos.y);
    },

    setText: function (text) {
        this.text = text;
    }
});

game.enemyRoboterEntity = me.Entity.extend({
    init: function (x, y, settings) {
        settings.image = "enemy_robot_sprite";
        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;

        // adjust the setting size to the sprite one
        settings.spritewidth = settings.width = 144;
        settings.spriteheight = settings.height = 108;

        // call the super constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        this.touched = 0;

        this.player = null;
        this.textItem = null;

        this.renderable.addAnimation("walk", [1, 3])

        this.renderable.setCurrentAnimation("walk");

        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.endX   = x + width - settings.spritewidth
        this.pos.x  = x + width - settings.spritewidth;

        // update the entity bounds since we manually change the entity position
        this.updateBounds();

        // apply gravity setting if specified
        this.body.gravity = 0.5;

        this.walkLeft = false;

        // walking & jumping speed
        this.body.setVelocity(3, 0);

        // set a "enemyObject" type
        this.body.collisionType = me.collision.types.ACTION_OBJECT;
        this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT | me.collision.types.WORLD_SHAPE);

        // don't update the entities when out of the viewport
        this.alwaysUpdate = true;

        // a specific flag to recognize these enemies
        this.isMovingEnemy = true;

        this.alreadyCounted = false;
    },

    getPosX: function () {
        return this.pos.x;
    },
    
  //    manage the enemy movement
    
    update : function (dt) {
        var self = this;
        if (this.textItem === null) {
            this.textItem = me.game.world.getChildByName("TextItem")[0];
        }
        if (this.player === null) {
            this.player = me.game.world.getChildByName("mainPlayer")[0];
        }
        if (this.alive)    {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.body.vel.x = this.body.accel.x * me.timer.tick;
                this.walkLeft = false;
                this.renderable.flipX(true);
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.body.vel.x = -this.body.accel.x * me.timer.tick;
                this.walkLeft = true;
                this.renderable.flipX(false);
            }

            // check & update movement
            this.body.update(dt);
        }

        var collision = me.collision.check(this);
        this.alreadyCounted = collision;

        // return true if we moved of if flickering
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x != 0 || this.body.vel.y != 0);
    },

    
     // collision handle
     
    onCollision : function (response, other) {
        var self = this;
        if (this.touched >= 5) {
            this.textItem.setText("YOU KILLED THE ROBOT");
            var settings = {};
            settings.width = settings.spritewidth = 36;
            settings.height = settings.spriteheight = 18;
            settings.image = "starfighter_light";
            settings.z = 10;  

            self.light = me.pool.pull("SpaceshipPartsEntity", self.pos.x, self.pos.y, settings);

            me.game.world.addChild(self.light, self.z);
            me.game.world.removeChild(this);
            game.data.score += 100;
            setTimeout(function(){
                self.textItem.setText("");
            }, 2000);
        }

        if ((response.overlapV.y > 0) && !this.alreadyCounted && response.a.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            this.textItem.setText("YOU HURT THE ROBOT");
            this.touched += 1;
            setTimeout(function() {
                self.textItem.setText("");
            }, 2000);
            return true;
        } else {
            return false;
        }
    }
}); 

game.LaserEntity = me.Entity.extend({
    init: function (x, y, settings) {
        settings.image = "enemy_robot_laser_sprite";

        var width = settings.width;
        var height = settings.height;

        // adjust the setting size to the sprite one
        settings.spritewidth = settings.width = 64;
        settings.spriteheight = settings.height = 24;

        // call the super constructor
        this._super(me.Entity, 'init', [x, y , settings]);        

        this.robot = null;

        this.renderable.addAnimation("idle", [0]);
        this.renderable.addAnimation("loading" [1, 2, 3, 4]);

        this.renderable.setCurrentAnimation("idle");

        this.updateBounds();

        this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;

        this.pos.x = me.game.world.getChildByName("enemyRoboterEntity")[0].getPosX();

        this.alwaysUpdate = true;
    },

    update: function (dt) {
        if (this.robot === null) {
            this.robot = me.game.world.getChildByName("enemyRoboterEntity")[0];
        }
        this.pos.x = this.robot.getPosX();
        this.pos.y = 1800;

        this.body.update(dt);
    },

    onCollision: function (response, other) {
        return true;
    }
});
  
/**
 * An Rocket enemy entity
 * follow a horizontal path defined by the box size in Tiled
 */ 
game.RocketEntity = me.Entity.extend({
    
    //  constructor
     
    init: function (x, y, settings) {
        // super constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.player = null;

        this.body.setVelocity(8, 6);

        this.body.gravity = 0;

        var shape = this.body.getShape();
        shape.scale(0.8, 0.3);
        shape.pos.y = 50;

        var width = settings.width;
        var height = settings.height;

        settings.spritewidth = settings.width = 64;
        settings.spriteheight = settings.height = 144;

        //this.alive = false;

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT)

        // still animation
        this.renderable.addAnimation ("idle", [0]);

        // fly animatin
        this.renderable.addAnimation ("fly", [5]);

        // set default one
        this.renderable.setCurrentAnimation("idle");

        this.alwaysUpdate = true;

        this.started = false;

        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 1.0);
    },

    update: function (dt) {
        if (this.player === null) {
            this.player = me.game.world.getChildByName("mainPlayer")[0];
        }

        this.renderable.setCurrentAnimation("fly");

        if ((this.distanceTo(this.player) <= 1100 && this.player.pos.y <= 1600) && this.pos.x >=4100 && this.pos.x <= 4200 && this.pos.y >= 1590 && !this.started) {
            this.body.vel.y = -this.body.accel.y * me.timer.tick;
            if (this.pos.y <= 1600) {
                this.started = true;
            }

        } else if (this.started) {
            if (this.pos.x <= this.player.pos.x) {
                this.body.vel.x = this.body.accel.x * me.timer.tick;
            } else if (this.pos.x >= this.player.pos.x) {
                this.body.vel.x = -this.body.accel.x * me.timer.tick;
            }

            if (this.pos.y <= this.player.pos.y) {
                this.body.vel.y = this.body.accel.y * me.timer.tick;

            } else if (this.pos.y >= this.player.pos.y) {
                this.body.vel.y = -this.body.accel.y * me.timer.tick;

            }
            // make it walk
            this.angle = this.angleTo(this.player);
            this.renderable.angle = (Math.PI / 2) + this.angle;
        } else {
            return true;
        }

        if ((this.angle >= 2.8 && this.angle <= 3.3) || (this.angle <= 0.04 && this.angle >= -0.04)) {
            this.body.setVelocity(8, 2.5);
        }

        if (this.pos.y < 1600) {
            this.started = true;
        }

        if (this.angle >= -1.46 && this.angle <= -1.6) {
            this.body.setVelocity(4, 5);
        }

        // update the body movement
        this.body.update(dt);
 
        // handle collisions against other shapes
        me.collision.check(this);
 
        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },  

    onCollision: function (response, other) {
        switch (response.b.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                me.game.world.removeChild(this);
                game.data.score += 100;
                // Repond to the platform (it is solid)
                return true;
            break;
 
            case me.collision.types.PLAYER_OBJECT:
                game.data.health -= 2;
                me.game.viewport.fadeOut("#FFFFFF", 100);
                me.game.world.removeChild(this);   
                return true;
            break;
 
            default:
            // Do not respond to other objects (e.g. coins)
            return false;
        }

        // Make all other objects solid
        return true;
    }
});  

game.SpaceshipEntity = me.Entity.extend({
    init: function (x, y, settings) {
        settings.image = "starfighter_01";

        this._super(me.Entity, 'init', [x, y, settings]);

        this.score = null;
        this.text = null;
        this.player = null;
        this.oxygen = null;

        var width = settings.width;
        var height = settings.height;

        settings.spritewidth = settings.width = 64;
        settings.spriteheight = settings.height = 144;

        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE);

        this.won = false;

        this.y = settings.y;
        this.pos.y = 100000;

        this.body.gravity = 0;

        this.alwaysUpdate = true;
    },

    update: function (dt) {
        var self = this;
        if (this.score === null) {
            this.score = me.game.world.getChildByName("FoundItem")[0];
        }
        if (this.text === null) {
            this.text = me.game.world.getChildByName("TextItem")[0];
        }
        if (this.player === null) {
            this.player = me.game.world.getChildByName("mainPlayer")[0];
        }

        if (this.oxygen === null) {
            this.oxygen = me.game.world.getChildByName("OxygenScreenItem")[0];
        }

        if (this.score.found >= 1 && this.player.pos.x >= 6500 && this.player.pos.y >= 1800 && !this.won) {
            this.won = true;
            this.pos.y = this.y;
            this.text.setText("YOU DID IT");
            setTimeout(function () {
                game.data.score += (game.data.health * 100) + (Math.round(self.oxygen.heightBlue));
                me.state.change(me.state.SCORE);
            }, 3000);
        }

        this.body.update(dt);

        me.collision.check(this);
    },

    onCollision: function() {
        return true;
    }
});

game.HideEntity = me.Entity.extend({
    init : function (x, y, settings) {

        this._super(me.Entity, 'init', [x, y, settings]);
        
        this.name = "HideEntity";
        this.z = settings.z;
        this.color = settings.color;

        this.colliding = false;

        this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);

        this.alwaysUpdate = true;

        this.alpha = 1;
    },

    draw : function(renderer) {
        renderer.setGlobalAlpha(this.alpha); 
        this._super(me.Entity, 'draw', [renderer]);

        renderer.setColor(this.color);
        renderer.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    },

    update: function (dt) {
        this.collisionCheck = me.collision.check(this);
    }, 

    fadeIn: function () {
        var tween = new me.Tween(this).to({alpha: 1}, 1000);
        tween.start(); 
    },

    fadeOut: function () {
        var tween = new me.Tween(this).to({alpha: 0.3}, 1000);
        tween.start(); 
    },
});  

game.PolyEntity = me.Entity.extend({
    init : function (x, y, settings) {

        this._super(me.Entity, 'init', [x, y, settings]);

        this.hideEntity = null;

        // create polygon object
        this.poly = new me.Polygon(x, y, settings.points);
        // set polygon as collision shape
        this.body.addShape(this.poly);
        // only collide with player
        this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);

        // settings
        this.alpha = 1;
        this.color = settings.color || '#fff';
        this.name = "PolyEntity";
        this.z = settings.z = Infinity;
        this.colliding = false;

        this.backBufferContext2D = me.CanvasRenderer.getContext();
    },

    update: function(dt) {
        if (this.hideEntity === null) {
            this.hideEntity = me.game.world.getChildByName("HideEntity")[0];
        }

        this.collisionCheck = me.collision.check(this);        

        if (this.collisionCheck && !this.colliding || this.hideEntity.collisionCheck) {
            this.fadeOut();
            this.hideEntity.fadeOut();
            this.colliding = true;
        } else if (!this.collisionCheck && this.colliding || this.hideEntity.collisionCheck) {
            this.fadeIn();
            this.hideEntity.fadeIn();
            this.colliding = false;
        }
    },

    draw: function (renderer) {
        // draw polygon and fill with color
        this.fillPolygon(this.poly, this.color);
    },

    fadeIn: function () {
        var tween = new me.Tween(this).to({alpha: 1}, 1000);
        tween.start();
    },

    fadeOut: function () {
        var tween = new me.Tween(this).to({alpha: 0.3}, 1000);
        tween.start();
    },

    fillPolygon: function (poly, color) {
        this.backBufferContext2D.globalAlpha = this.alpha;
        this.backBufferContext2D.translate(poly.pos.x, poly.pos.y);
        this.backBufferContext2D.beginPath();
        this.backBufferContext2D.moveTo(poly.points[0].x, poly.points[0].y);
        var point;
        for (var i = 1; i < poly.points.length; i++) {
            point = poly.points[i];
            this.backBufferContext2D.lineTo(point.x, point.y);
        }
        this.backBufferContext2D.lineTo(poly.points[0].x, poly.points[0].y);
        this.backBufferContext2D.closePath();
        this.backBufferContext2D.translate(-poly.pos.x, -poly.pos.y);
        this.backBufferContext2D.fillStyle = color;
        this.backBufferContext2D.fill();
    }
});

game.OxygenItem = me.Entity.extend({
    init: function (x, y, settings) {

        // call the super constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        settings.spritewidth = settings.width;
        settings.spriteheight = settings.height;

        this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
    },

    onCollision : function (response) {
        // do something when collide
        // give some score
       
        game.data.oxygen += 50;

        //avoid further collision and delete it
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);

        me.game.world.removeChild(this);

        return false;
    }
});

//////////////////////////////////////////////////////////////////////////////////////

/**
 * An Fly enemy entity
 * follow a horizontal path defined by the box size in Tiled
 *//*
game.FlyEnemyEntity = game.CollectableEntity.extend({
    /**
     * constructor
     
    init: function (x, y, settings) {
        // super constructor
        this._super(game.PathEnemyEntity, 'init', [x, y, settings]);

        // set a renderable
        this.renderable = game.texture.createAnimationFromName([
            "fly_normal.png", "fly_fly.png", "fly_dead.png"
        ]);

        // custom animation speed ?
        if (settings.animationspeed) {
            this.renderable.animationspeed = settings.animationspeed;
        }

        // walking animatin
        this.renderable.addAnimation ("walk", ["fly_normal.png", "fly_fly.png"]);
        // dead animatin
        this.renderable.addAnimation ("dead", ["fly_dead.png"]);

        // set default one
        this.renderable.setCurrentAnimation("walk");

        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 1.0);
    }
});*/