/**
 * the player
 */
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        // player can exit the viewport (jumping, falling into a hole, etc.)
        this.alwaysUpdate = true;

        // hud elements
        this.textItem = null;
        this.fuelItem = null;
        this.info = null;
        this.foundItem = null;
        this.healthItem = null;
        this.spaceship = null;
        
        // variables for player states
        this.alreadyHurt = false;
        this.alreadyDead = false;
        this.hitHide = false;

        // walking & jumping speed
        this.body.setVelocity(10, 5);
        this.body.setFriction(0.5,0);
        this.body.gravity = 1;

        //this.dying = false;

    //    this.mutipleJump = 1;

        // angle difference of player by leaning
        this.leanVel = 0.015;

        // set the display around our position
        me.game.viewport.follow(this, me.game.viewport.AXIS.BOTH);

        me.game.viewport.setDeadzone(0, 0);

        // enable keyboard
        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
   //     me.input.bindKey(me.input.KEY.SPACE, "jump", true);
        me.input.bindKey(me.input.KEY.UP,    "up");
 //       me.input.bindKey(me.input.KEY.DOWN,  "down");

        me.input.bindKey(me.input.KEY.A,     "left");
        me.input.bindKey(me.input.KEY.D,     "right");
        me.input.bindKey(me.input.KEY.W,     "up");
 //       me.input.bindKey(me.input.KEY.S,     "down");

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

    update : function (dt) {
        var self = this;

        if (this.textItem === null) {
            this.textItem = me.game.world.getChildByName("TextItem")[0];
        }
        if (this.fuelItem === null) {
            this.fuelItem = me.game.world.getChildByName("FuelItem")[0];
        }
        if (this.info === null) {
            this.info = me.game.world.getChildByName("InfoItem")[0];
        }
        if (this.foundItem === null) {
            this.foundItem = me.game.world.getChildByName("FoundItem")[0];
        }
        if (this.healthItem === null) {
            this.healthItem = me.game.world.getChildByName("HealthItem")[0];
        }
        if (this.spaceship === null) {
            this.spaceship = me.game.world.getChildByName("SpaceshipEntity")[0];
        }

        // back to idle if no key is pushed
        this.renderable.setCurrentAnimation("idle");

        // fly up
        if (me.input.isKeyPressed('up')) {
            this.body.vel.y -= this.body.accel.y * me.timer.tick;
            this.renderable.setCurrentAnimation("speed-up");
        }

        // fly left
        if (me.input.isKeyPressed('left')) {
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
            this.renderable.setCurrentAnimation("speed-side");
            this.renderable.flipX(true);
            var shape = this.body.getShape();
            shape.pos.x = 0;
            if (this.renderable.angle <= 0.3) {
                this.renderable.angle += this.leanVel;
            }
        }   // fly right 
        else if (me.input.isKeyPressed('right')) {
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            this.renderable.setCurrentAnimation("speed-side");
            this.renderable.flipX(false);
            var shape = this.body.getShape();
            shape.pos.x = 46;

            if (this.renderable.angle <= 0.3) {
                this.renderable.angle += this.leanVel;
            }
        }   // stay up
         else if (this.renderable.angle >= 0) {
            this.renderable.angle -= this.leanVel;
        }

        // animation for up and left/right
        if (me.input.isKeyPressed('up') && (me.input.isKeyPressed('left') || me.input.isKeyPressed('right'))) {
            this.renderable.setCurrentAnimation("speed-both");
        }

/*        if (me.input.isKeyPressed('jump')) {
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
        }  */

        // gravity function for the player
        this.body.gravity = (this.pos.y/(this.maxHeightOfLevel));

        // near to be too high
        if (this.body.gravity <= 0.02) {
            this.body.gravity = -0.3;
        } else if (this.body.gravity <= 0.3 && this.body.gravity > 0) {
            this.textItem.setText("YOU ARE ABOUT TO LOSE GRAVITY");
            setTimeout(function() {
                self.textItem.setText("");
            }, 1);
        }

        // too high
        if (this.body.gravity <= 0 && !this.alreadyDead) {
            this.textItem.setText("YOU FLEW INTO SPACE");
            this.death();
        }

        // out og hp
        if (game.data.health <= 0 && !this.alreadyDead) {
            this.textItem.setText("YOU DIED");
            this.death();
        }

        // out of fuel
        if (game.data.fuel <= 0 && !this.alreadyDead) {
            this.textItem.setText("OUT OF FUEL");
            this.death();
        }

        // remove info text
        if (this.info) {
            this.removeInfo();        
        }

        // victory
        if (game.data.foundItems >= 7 && this.pos.x >= 7000 && this.pos.y >= 1800 && !game.data.victory) {
            this.victory();
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

/*        // check if we fell into a hole
        if (!this.inViewport && (this.pos.y > me.video.renderer.getHeight())) {
            // if yes reset the game
            this.death();
        }  */

        // handle collisions against other shapes
        me.collision.check(this);

   //     console.log(this.hitHide);

        // check if we moved (an "idle" animation would definitely be cleaner)
        if (this.body.vel.x!=0 || this.body.vel.y!=0 || (this.renderable && this.renderable.isFlickering())) {
            this._super(me.Entity, 'update', [dt]);
            return true;
        }

        return false;
    },

    onCollision : function (response, other) {
        var self = this;
        switch (other.body.collisionType) {
            // collision with world
            case me.collision.types.WORLD_SHAPE:
                // Simulate a platform object
             //   if (other.type === "platform") {
            //        if (this.body.falling && !me.input.isKeyPressed('down') &&
                        // Shortest overlap would move the player upward
            //            (response.overlapV.y > 0) &&
                        // The velocity is reasonably fast enough to have penetrated to the overlap depth
            //            (~~this.body.vel.y >= ~~response.overlapV.y)
           //         ) {
                        // Disable collision on the x axis
           //             response.overlapV.x = 0;
                        // Repond to the platform (it is solid)
                        return true;
           //         }
                    // Do not respond to the platform (pass through)
           //         return false;
          //      }
                break;   

            case me.collision.types.ENEMY_OBJECT:
            //    if (other.isMovingEnemy ) {
                    this.hurt();  
                    return true;  
                    break;                
            //    }  else {
            //        return false;
            //    }
  /*          case me.collision.types.NPC_OBJECT:
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
                } */

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
        this.removeControl();

        setTimeout(function(){      
            me.game.world.removeChild(self);  
            self.textItem.setText("");                 
            self.foundItem.reset();          
            self.healthItem.reset();
            self.fuelItem.reset();        
            me.levelDirector.reloadLevel();
        }, 3000);
        return true;

    },

    removeControl: function(){
        me.input.unbindKey(me.input.KEY.LEFT,  "left");
        me.input.unbindKey(me.input.KEY.RIGHT, "right");
   //     me.input.unbindKey(me.input.KEY.SPACE, "jump", true);
        me.input.unbindKey(me.input.KEY.UP,    "up");
   //     me.input.unbindKey(me.input.KEY.DOWN,  "down");

        me.input.unbindKey(me.input.KEY.A,     "left");
        me.input.unbindKey(me.input.KEY.D,     "right");
        me.input.unbindKey(me.input.KEY.W,     "up");
  //      me.input.unbindKey(me.input.KEY.S,     "down");
    },

    removeInfo: function () {
        if (me.input.isKeyPressed('left') || me.input.isKeyPressed('right') || me.input.isKeyPressed('up') || me.input.isKeyPressed('jump')) {
            me.game.world.removeChild(this.info);
        }
    },

    hurt: function () {
        if (!this.alreadyDead && !this.alreadyHurt) {
            var self = this;
            this.alreadyHurt = true;
            this.textItem.setText("OUCH");
            game.data.health -= 1;
            setTimeout(function() {
                self.textItem.setText("")
                self.alreadyHurt = false;
            }, 2000)
            this.renderable.flicker(750);        
        }
    },

    victory: function() {
        var self = this;
        this.removeControl();

        game.data.victory = true;
        this.spaceship.placeOnMap();
        this.textItem.setText("YOU DID IT");
        setTimeout(function () {
            game.data.score += (game.data.health * 100) + (Math.round(game.data.fuel));
            me.state.change(me.state.SCORE);
        }, 3000);
        
    }
});

/**
 * spikes and lava
 */
game.EnvironmentalEnemy = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
    }
});

/**
 * entry of rocket
 */
game.PlatformEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.collisionType = me.collision.types.WORLD_SHAPE;
        this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
    }
});

/**
 * spaceship parts
 */
game.SpaceshipPartsEntity = me.CollectableEntity.extend({
    init: function (x, y, settings) {
        // call the super constructor
        this._super(me.CollectableEntity, 'init', [x, y , settings]);

        if (settings.image === "starfighter_light") {
            this.body.addShape(new me.Rect(this.x, this.y, settings.width, settings.height));
        } 

        if(settings.image === "starfighter_wing"){
            var shape = this.body.getShape();
            shape.scale(1, 0.35);
            shape.pos.y = settings.height / 1.5;

            this.body.addShape(new me.Rect(250, this.y, settings.width / 2, settings.height));
        }

    },

    onCollision : function (response) {
        // give some score
        game.data.score += 100;

        // found one
        game.data.foundItems += 1;

        //avoid further collision and delete it
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);

        me.game.world.removeChild(this);

        return true;
    }
});

/**
 * analysing robot
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
        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT);

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
        me.game.world.addChild(this.speechBubble, 8);
    },
     
    update : function (dt) {
        if (this.player === null) {
            this.player = me.game.world.getChildByName("mainPlayer")[0];
        }
        if (this.textItem === null) {
            this.textItem = me.game.world.getChildByName("TextItem")[0];
        }

        this.speechBubble.pos.x = this.pos.x + this.speechBubbleOffsetX;

        // walk left and right and analyse
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
     
    onCollision : function (response, other) {
        var self = this;

        if (this.alive) {
            if (response.b.body.collisionType == me.collision.types.WORLD_SHAPE) {
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

                    self.light = me.pool.pull("SpaceshipPartsEntity", self.pos.x, self.pos.y + 80 - 14, settings);

                    me.game.world.addChild(self.light, self.z);
                    setTimeout(function() {
                        self.textItem.setText("");
                    }, 1500)
                }, 1000)
            }

            clearTimeout(this.timer);

            this.alive = false;
            me.game.world.removeChild(this);
            me.game.world.removeChild(this.speechBubble);

            //avoid further collision and delete it
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);

            return true;
        }
    }
}); 

/**
 * speechbubble of analysing robot
 */
game.robotSpeechBubble = me.Renderable.extend({
    init: function (x, y, width, height) {
        var settings = {};
        settings.width = settings.spritewidth = 500;
        settings.height = settings.spriteheight = 1000;
        settings.z = this.z = 1;

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

/**
 * agressive robot
 */
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

/**
 * agressive robot's laser
 */
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
 * rocket
 */ 
/*game.Rest = me.Entity.extend({
    init: function (x, y, settings) {
        // super constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.player = null;

        this.body.setVelocity(2, 2);

        this.body.gravity = 0;

        this.startPlayerPosition = settings.startPlayerPosition;
        this.startRocketPosition = settings.startRocketPosition;
        this.startAngle = settings.startAngle;

        this.addAngle = 0;

        this.shape = this.body.getShape();
        if(this.startAngle == "0"){
            this.shape.scale(0.5, 0.73);
            this.shape.pos.x = 15;
        } if(this.startAngle == "-pi/2"){
            this.renderable.angle = -Math.PI/2;
            this.pos.y = settings.y + 40;
            this.shape.scale(0.73,0.5);
            this.shape.pos.y = -25;
            this.shape.pos.x = -40;
            this.addAngle = 1;
        }

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);//me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT);

        // still animation
        this.renderable.addAnimation ("idle", [0]);

        // fly animatin
        this.renderable.addAnimation ("fly", [5]);

        // set default one
        this.renderable.setCurrentAnimation("idle");

        this.started = false;
        this.start1 = false;
        this.start2 = false;
        this.playerX = 0;
        this.playerY = 0;

        this.alwaysUpdate = false;

        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 1.0);
    },

    update: function (dt) {
        if (this.player === null) {
            this.player = me.game.world.getChildByName("mainPlayer")[0];
        }

        this.renderable.setCurrentAnimation("fly");

        // player is close enough
        if ((this.distanceTo(this.player) <= 800 && this.player.pos.y <= this.startPlayerPosition) && !this.started && !this.start1 && !this.start2) {
            if(this.startAngle == "0"){
                this.body.vel.y = -this.body.accel.y * me.timer.tick;
            } if(this.startAngle == "-pi/2"){
                this.body.vel.x = -this.body.accel.x * me.timer.tick;
            }
            this.start1 = true;
        }
        // rocket has started
        if(this.startAngle == "0"){
           if (this.pos.y <= this.startRocketPosition && !this.start2) {
                this.started = true;
                this.start2 = true;
            }
        } if(this.startAngle == "-pi/2"){
            if (this.pos.x <= this.startRocketPosition && !this.start2) {
                this.started = true;
                this.start2 = true;
            }
        }

        // fly towards player
        if(this.started){
            this.started = false;
            // safe player position
            this.playerY = this.player.pos.y;
            this.playerX = this.player.pos.x;
            // angle to player position
            this.angle = this.angleToPoint(new me.Vector2d(this.playerX, this.playerY));
            // set angle to entity over time
        //    var tween = new me.Tween(this.renderable).to({angle: this.angle + (Math.PI / 2)}, 500);
        //    tween.start(); 
            this.renderable.angle = this.angle + (Math.PI / 2);
            // set angle to shape 
            // (° against clock)
            // [0]°
            if(this.angle >= 0 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1 && this.angle <= 0 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1){
                this.shape.pos.x = 105 - this.addAngle * 100;
                this.shape.pos.y = 55 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 2) - this.addAngle * Math.PI/2);
            }
            // (0-30)° 
            if(this.angle < 0 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1 && this.angle > -1 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1){
                this.shape.pos.x = 93 - this.addAngle * 100;
                this.shape.pos.y = 30 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (3 / 8) - this.addAngle * Math.PI/2);
            } // [30-60)°
            if(this.angle <= -1 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1 && this.angle > -2 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1){
                this.shape.pos.x = 21 - this.addAngle * 100;
                this.shape.pos.y = 107 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 4) - this.addAngle * Math.PI/2);
            } // [60-90)°
            if(this.angle <= -2 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1 && this.angle > -3 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1){
                this.shape.pos.x = 46 - this.addAngle * 100;
                this.shape.pos.y = 0 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (1 / 8) - this.addAngle * Math.PI/2);
            } // [90]°
            if(this.angle <= -3 * ((Math.PI/2 - 0.2) / 3) - 2 * 0.1 && this.angle >= -3 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1){
                // nothing
            } // (90-120)° 
            if(this.angle < -3 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1 && this.angle > -4 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1){
                this.shape.pos.x = -8 - this.addAngle * 100;
                this.shape.pos.y = 11 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (1 / 8) - this.addAngle * Math.PI/2);
            } // [120-150)°
            if(this.angle <= -4 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1 && this.angle > -5 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1){
                this.shape.pos.x = 70 - this.addAngle * 100;
                this.shape.pos.y = 85 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (3 / 4) - this.addAngle * Math.PI/2);
            } // [150-180)°
            if(this.angle <= -5 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1 && this.angle > -6 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1){
                this.shape.pos.x = -40 - this.addAngle * 100;
                this.shape.pos.y = 60 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 8) - this.addAngle * Math.PI/2);
            } // [180]°
            if(this.angle <= -6 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1 && this.angle >= -Math.PI ||
               this.angle >= 6 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1 && this.angle <= Math.PI){
                this.shape.pos.x = 65 - this.addAngle * 100;
                this.shape.pos.y = 55 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (1 / 2) - this.addAngle * Math.PI/2);
            } 
            // (° in clock)
            // (0-30)°
            if(this.angle > 0 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1 && this.angle < 1 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1){
                this.shape.pos.x = 105 - this.addAngle * 100;
                this.shape.pos.y = 85 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (5 / 8) - this.addAngle * Math.PI/2);
            } // [30-60)°
            if(this.angle >= 1 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1 && this.angle < 2 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1){
                this.shape.pos.x = -7 - this.addAngle * 100;
                this.shape.pos.y = 133 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 4) - this.addAngle * Math.PI/2);
            } // [60-90)°
            if(this.angle >= 2 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1 && this.angle < 3 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1){
                this.shape.pos.x = 75 - this.addAngle * 100;
                this.shape.pos.y = 113 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (7 / 8) - this.addAngle * Math.PI/2);
            } // [90]°
            if(this.angle >= 3 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1 && this.angle <= 3 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1){
                this.shape.pos.y = 40 - this.addAngle * 80;
            } // (90-120)°
            if(this.angle > 3 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1 && this.angle < 4 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1){
                this.shape.pos.x = 20 - this.addAngle * 100;
                this.shape.pos.y = 145 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (7 / 8) - this.addAngle * Math.PI/2);
            } // [120-150)°
            if(this.angle >= 4 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1 && this.angle < 5 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1){
                this.shape.pos.x = -5 - this.addAngle * 100;
                this.shape.pos.y = 135 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 4) - this.addAngle * Math.PI/2);
            } // [150-180)°
            if(this.angle >= 5 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1 && this.angle < 6 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1){
                this.shape.pos.x = -27 - this.addAngle * 100;
                this.shape.pos.y = 115 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (5 / 8) - this.addAngle * Math.PI/2);
            }


            // movement direction
            if(this.playerX <= this.pos.x){
      //          this.body.vel.x = -this.body.accel.x * me.timer.tick;
            } else if(this.playerX > this.pos.x){
       //         this.body.vel.x = +this.body.accel.x * me.timer.tick;
            }
            if(this.playerY > this.pos.y){
        //        this.body.vel.y = this.body.accel.y * me.timer.tick;
            }
            // movement angle

        }

     //       console.log(this.player.pos.y);

       // console.log(this.angle / Math.PI);
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
        }

        if ((this.angle >= 2.8 && this.angle <= 3.3) || (this.angle <= 0.04 && this.angle >= -0.04)) {
            this.body.setVelocity(8, 2.5);
        }  

        if (this.pos.y < 1000) {
      //      this.started = true;
        }

        if (this.angle >= -1.46 && this.angle <= -1.6) {
    //        this.body.setVelocity(4, 5);
        }

        // update the body movement
        this.body.update(dt);
 
        // handle collisions against other shapes
        me.collision.check(this);
 
        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },  

    onCollision: function (response) {
        me.game.world.removeChild(this);

        // Make all other objects solid
        return false;
    }
});  */

/**
 * complete spaceship
 */
game.SpaceshipEntity = me.Entity.extend({
    init: function (x, y, settings) {
        settings.image = "starfighter_01";

        this._super(me.Entity, 'init', [x, y, settings]);

        var width = settings.width;
        var height = settings.height;

        settings.spritewidth = settings.width = 64;
        settings.spriteheight = settings.height = 144;

        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE);

        // place it out of the map
        this.pos.y = 100000;

        // store result y position
        this.y = settings.y;

        this.body.gravity = 0;
    },

    update: function (dt) {
        this.body.update(dt);

      //  me.collision.check(this);
    },

    onCollision: function() {
        return true;
    },

    placeOnMap: function(){
        this.pos.y = this.y;
    }
});

/**
 * caves
 */
game.HideEntity = me.Entity.extend({
    init : function (x, y, settings) {

        this._super(me.Entity, 'init', [x, y, settings]);
        
        this.name = "HideEntity";
        this.z = settings.z = 100;
        this.color = settings.color;

        this.body.collisionType = me.collision.types.ACTION_OBJECT;
        this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);

        this.alpha = 1;

        this.collided = false;
        this.colliding = false;
    },

    draw : function(renderer) {
        renderer.setGlobalAlpha(this.alpha); 
        this._super(me.Entity, 'draw', [renderer]);

        renderer.setColor(this.color);
        renderer.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    },

    update: function (dt) {
        if(!me.collision.check(this) && !this.collided){
            this.collided = false;
        }

        if(me.collision.check(this) && !this.collided){
            this.collided = true;
            this.fadeOut();
        }

        if(!me.collision.check(this) && this.collided){
            this.collided = false;
            this.fadeIn();
        }
    }, 

    onCollision: function(response, other){
        return false;
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

/**
 * vieleck
 */
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

/**
 * fuel container
 */
game.FuelItem = me.Entity.extend({
    init: function (x, y, settings) {
        // call the super constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        settings.spritewidth = settings.width;
        settings.spriteheight = settings.height;

        this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
    },

    onCollision : function (response) {
        // refill fuel
        game.data.fuel += 100;

        // maximal fuel 300
        if(game.data.fuel > 300){
            game.data.fuel = 300;
        }

        //avoid further collision and delete it
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);

        me.game.world.removeChild(this);

        return true;
    }
});

/**
 * rocket
 */
game.RocketEntity = me.Entity.extend({
    init: function (x, y, settings) {
        // super constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.player = null;
        this.body.setVelocity(2, 2);

        this.body.gravity = 0;

        this.alwaysUpdate = true;

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;

        this.startPos = settings.startPos;
        this.startAngle = settings.startAngle;

        // init shape and renderable
        this.addAngle = 0;
        this.shape = this.body.getShape();
        if(this.startAngle == "0"){
            this.shape.scale(0.5, 0.73);
            this.shape.pos.x = 15;
        } if(this.startAngle == "-pi/2"){
            this.renderable.angle = -Math.PI/2;
            this.pos.y = settings.y + 40;
            this.shape.scale(0.73,0.5);
            this.shape.pos.y = -25;
            this.shape.pos.x = -40;
            this.addAngle = 1;
        }

        // still animation
        this.renderable.addAnimation ("idle", [0]);

        // fly animatin
        this.renderable.addAnimation ("fly", [5]);

        // set default one
        this.renderable.setCurrentAnimation("idle");

        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 1.0);

        // m = y2 - y1 / x2 - x1
        this.m = 0;
        this.ydif = 0;
        this.xdif = 0;

        // f: y = mx + b
        this.b = 0;

        // tween time
        this.t = settings.t;

        // distance to player
        this.s = 0;

        // velocitiy
        this.v = 0;

        // x aim
        this.x = 0;

        // activator
        this.started = false;
        this.start = false;
        this.flyAway = false;
        this.applyAngle = false;
        this.alive = true;

        // save player pos
        this.playerX = 0;
        this.playerY = 0;
    },

    update: function (dt) {

        if (this.player === null) {
            this.player = me.game.world.getChildByName("mainPlayer")[0];
        }






        /* ROCKET MOVEMENT */

        // start rocket
        if(this.distanceTo(this.player) < 750 && !this.start && !this.started){
            this.renderable.setCurrentAnimation("fly");

            if(this.startAngle == "0" && this.player.pos.y <= this.startPos){
                this.tween0 = new me.Tween(this.pos).to({y: this.startPos}, 300);
                this.tween0.start(); 
            } else if(this.startAngle == "-pi/2" && this.pos.x >= this.player.pos.x){
                this.tween1 = new me.Tween(this.pos).to({x: this.startPos}, 250);
                this.tween1.start(); 
            }
        }

        // rocket started
        if(this.startAngle == "0" && this.pos.y == this.startPos){
            this.start = true;
        } if(this.startAngle == "-pi/2" && this.pos.x == this.startPos){
            this.start = true;
        }

        // fly to player pos and calculate linear function and velocity
        if(this.start && !this.started){
            this.started = true;
            this.applyAngle = true;

            this.playerX = this.player.pos.x;
            this.playerY = this.player.pos.y;
            this.ydif = this.player.pos.y - this.pos.y;
            this.xdif = this.player.pos.x - this.pos.x;
            this.m = this.ydif / this.xdif;
            
            this.b = this.pos.y - (this.m * this.pos.x);
            this.s = Math.sqrt(Math.pow(this.ydif, 2) + Math.pow(this.xdif, 2));
            this.v = this.s / this.t; 

            var tween2 = new me.Tween(this.pos).to({x: this.player.pos.x, y: this.player.pos.y}, this.t);
            tween2.start(); 
        }

        // arrived at player pos
        if(this.start && this.started && this.pos.x == this.playerX && this.pos.y == this.playerY){
            this.flyAway = true;
        }

        // fly to x = -10 or x = 8010 and y = f(-10) or f(8010) (out of level)
        if(this.flyAway){
            this.flyAway = false;

            if(this.xdif <= 0){
                this.x = -10;
            } else{
                this.x = 8010;
            }

            this.yKoord = (this.m * this.x) + this.b; 
            this.newS = Math.sqrt(Math.pow(this.yKoord - this.pos.y, 2) + Math.pow(this.x - this.pos.x, 2));
            this.newT = this.newS / this.v;

            var tween3 = new me.Tween(this.pos).to({x: this.x, y: this.yKoord}, this.newT);
            tween3.start(); 
        }








        /* ROCKET ANGLE */

        if(this.applyAngle){
            this.applyAngle = false;

            // angle to player position
            this.angle = this.angleToPoint(new me.Vector2d(this.playerX, this.playerY));
            this.renderable.angle = this.angle + (Math.PI / 2);

            // set angle to shape 
            // (° against clock)
            // [0]°
            if(this.angle >= 0 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1 && this.angle <= 0 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1){
                this.shape.pos.x = 105 - this.addAngle * 100;
                this.shape.pos.y = 55 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 2) - this.addAngle * Math.PI/2);
            }
            // (0-30)° 
            if(this.angle < 0 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1 && this.angle > -1 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1){
                this.shape.pos.x = 93 - this.addAngle * 100;
                this.shape.pos.y = 30 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (3 / 8) - this.addAngle * Math.PI/2);
            } // [30-60)°
            if(this.angle <= -1 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1 && this.angle > -2 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1){
                this.shape.pos.x = 21 - this.addAngle * 100;
                this.shape.pos.y = 107 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 4) - this.addAngle * Math.PI/2);
            } // [60-90)°
            if(this.angle <= -2 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1 && this.angle > -3 * ((Math.PI/2 - 0.2) / 3) - 1 * 0.1){
                this.shape.pos.x = 46 - this.addAngle * 100;
                this.shape.pos.y = 0 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (1 / 8) - this.addAngle * Math.PI/2);
            } // [90]°
            if(this.angle <= -3 * ((Math.PI/2 - 0.2) / 3) - 2 * 0.1 && this.angle >= -3 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1){
                // nothing
            } // (90-120)° 
            if(this.angle < -3 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1 && this.angle > -4 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1){
                this.shape.pos.x = -8 - this.addAngle * 100;
                this.shape.pos.y = 11 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (1 / 8) - this.addAngle * Math.PI/2);
            } // [120-150)°
            if(this.angle <= -4 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1 && this.angle > -5 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1){
                this.shape.pos.x = 70 - this.addAngle * 100;
                this.shape.pos.y = 85 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (3 / 4) - this.addAngle * Math.PI/2);
            } // [150-180)°
            if(this.angle <= -5 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1 && this.angle > -6 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1){
                this.shape.pos.x = -40 - this.addAngle * 100;
                this.shape.pos.y = 60 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 8) - this.addAngle * Math.PI/2);
            } // [180]°
            if(this.angle <= -6 * ((Math.PI/2 - 0.2) / 3) - 3 * 0.1 && this.angle >= -Math.PI ||
               this.angle >= 6 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1 && this.angle <= Math.PI){
                this.shape.pos.x = 65 - this.addAngle * 100;
                this.shape.pos.y = 55 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (1 / 2) - this.addAngle * Math.PI/2);
            } 
            // (° in clock)
            // (0-30)°
            if(this.angle > 0 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1 && this.angle < 1 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1){
                this.shape.pos.x = 105 - this.addAngle * 100;
                this.shape.pos.y = 85 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (5 / 8) - this.addAngle * Math.PI/2);
            } // [30-60)°
            if(this.angle >= 1 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1 && this.angle < 2 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1){
                this.shape.pos.x = -7 - this.addAngle * 100;
                this.shape.pos.y = 133 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 4) - this.addAngle * Math.PI/2);
            } // [60-90)°
            if(this.angle >= 2 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1 && this.angle < 3 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1){
                this.shape.pos.x = 75 - this.addAngle * 100;
                this.shape.pos.y = 113 - this.addAngle * 80;
                this.shape.rotate(Math.PI * (7 / 8) - this.addAngle * Math.PI/2);
            } // [90]°
            if(this.angle >= 3 * ((Math.PI/2 - 0.2) / 3) + 1 * 0.1 && this.angle <= 3 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1){
                this.shape.pos.y = 40 - this.addAngle * 80;
            } // (90-120)°
            if(this.angle > 3 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1 && this.angle < 4 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1){
                this.shape.pos.x = 20 - this.addAngle * 100;
                this.shape.pos.y = 145 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (7 / 8) - this.addAngle * Math.PI/2);
            } // [120-150)°
            if(this.angle >= 4 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1 && this.angle < 5 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1){
                this.shape.pos.x = -5 - this.addAngle * 100;
                this.shape.pos.y = 135 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (3 / 4) - this.addAngle * Math.PI/2);
            } // [150-180)°
            if(this.angle >= 5 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1 && this.angle < 6 * ((Math.PI/2 - 0.2) / 3) + 3 * 0.1){
                this.shape.pos.x = -27 - this.addAngle * 100;
                this.shape.pos.y = 115 - this.addAngle * 80;
                this.shape.rotate(-Math.PI * (5 / 8) - this.addAngle * Math.PI/2);
            }
        }






        // kill the rocket if out of the level
        if(this.alive && (this.pos.x < -5 || this.pos.x > 8005 || this.pos.y < -5)){
            this.alive = false;

            //avoid further collision and delete it
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);

            me.game.world.removeChild(this);
        }

        // update the body movement
        this.body.update(dt);
 
        // handle collisions against other shapes
        me.collision.check(this);
    },

    onCollision: function(response, other){

        //avoid further collision and delete it
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        this.alive = false;
        me.game.world.removeChild(this);

        return false;
    }
});  