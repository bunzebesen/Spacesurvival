game.PlayScreen = me.ScreenObject.extend({
    /**    
     *  action to perform on state change
     */
    onResetEvent: function() {    
        // load a level
        me.levelDirector.loadLevel("level1");
        
        // reset the score
        game.data.score = 0;
        game.data.health = 8;
        game.data.fuel = 300;

        // add our HUD to the game world
        this.HUD = new game.HUD.Container();    
        me.game.world.addChild(this.HUD);

        // add our UI to the game world
        this.UI = new game.UI.Container();    
        me.game.world.addChild(this.UI);

        // Mobile UI
        if (me.device.isMobile) {
            this.UI.addChild(new game.UI.Button(0,                                  0, me.game.viewport.width / 3, me.game.viewport.height,     me.input.KEY.LEFT));
            this.UI.addChild(new game.UI.Button(me.game.viewport.width / 3,         0, me.game.viewport.width / 3, me.game.viewport.height, me.input.KEY.UP));
            this.UI.addChild(new game.UI.Button(me.game.viewport.width * (2 / 3),   0, me.game.viewport.width / 3, me.game.viewport.height,     me.input.KEY.RIGHT));
        }  
    },
    
    /**    
     *  action to perform on state change
     */
    onDestroyEvent: function() {    
    
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);

        if (me.device.isMobile) {
            me.game.world.removeChild(this.UI);
        }
    }
});

game.InfoScreen = me.ScreenObject.extend({
    onResetEvent: function() {

        // add our UI to the game world
        this.UI = new game.UI.Container();    
        me.game.world.addChild(this.UI);

        if (me.device.isMobile) {
            this.UI.addChild(new game.UI.Button(0, 0, me.game.viewport.width, me.game.viewport.height, me.input.KEY.ENTER));            
        }

        if (me.device.isMobile) {
            me.game.world.addChild(new me.Sprite(0, 0, me.loader.getImage('background_solar_system_960_540')));
        } else {
            me.game.world.addChild(new me.Sprite(0, 0, me.loader.getImage('background_solar_system_1920_1080')));
        }
        me.game.world.addChild(new(me.Renderable.extend({
         
            init: function() {
                this._super(me.Renderable, 'init', [0, 0, me.game.viewport.width, me.game.viewport.height]);
            
                var fontMobile = new me.Font('monospace', 22, 'white');

                var font = new me.Font('monospace', 45, 'white');

                this.widthItem = 0;

                this.text1 = "YOU HAVE THE MISSION TO EXPLORE SPACE.";
                this.text2 = "YOU STARTED FROM THE EARTH.";
                this.text3 = "YOUR JOB IS IT TO GATHER ALL ROBOT PROBES" ;
                this.text4 = "FROM ALL PLANETS IN OUR SOLAR SYSTEM.";
                this.text5 = "BUT CARE - MAYBE SOME OF THE ROBOT PROBES";
                this.text6 = "HAVE MALFUNCTIONS AND ATTACK YOU.";
                this.text7 = "IF YOU GATHERED ALL ROBOT SPRITES";
                this.text8 = "YOU CAN FLY HOME TO YOUR FAMILY.";
                this.text9 = "SO TRY TO SURVIVE ALL THINGS THAT MAY HAPPEN TO YOU";
                this.text10 = "AND U CAN SEE YOUR CHILDREN AGAIN.";
                this.text11 = "GOOD LUCK";
                this.text12 = "PRESS ENTER TO START THE GAME";
                this.text13 ="TAP THE SCREEN TO START THE GAME";

                if (me.device.isMobile) {
                    this.widthItem = me.game.viewport.width - ((2.8 / 3) * me.game.viewport.width);
                    this.height1 = 200;
                    this.height2 = 225;
                    this.height3 = 250;
                    this.height4 = 275;
                    this.height5 = 300;
                    this.height6 = 325;
                    this.height7 = 350;
                    this.height8 = 375;
                    this.height9 = 400;
                    this.height10 = 425;
                    this.height11 = 450;
                    this.height12 = 500;
                    this.font = fontMobile;
                } else {
                    this.widthItem = me.game.viewport.width - ((2.9 / 3) * me.game.viewport.width);
                    this.height1 = 350;
                    this.height2 = 400;
                    this.height3 = 450;
                    this.height4 = 500;
                    this.height5 = 550;
                    this.height6 = 600;
                    this.height7 = 650;
                    this.height8 = 700;
                    this.height9 = 750;
                    this.height10 = 800;
                    this.height11 = 850;
                    this.height12 = 950;
                    this.font = font;
                }
            },

            update: function(dt) {
                return true;
            },

            draw: function(renderer) {
                var self = this;
                var context = renderer.getContext();
                this.font.draw(context, this.text1, this.widthItem, this.height1);
                this.font.draw(context, this.text2, this.widthItem, this.height2);
                this.font.draw(context, this.text3, this.widthItem, this.height3);
                this.font.draw(context, this.text4, this.widthItem, this.height4);
                this.font.draw(context, this.text5, this.widthItem, this.height5);
                this.font.draw(context, this.text6, this.widthItem, this.height6);
                this.font.draw(context, this.text7, this.widthItem, this.height7);
                this.font.draw(context, this.text8, this.widthItem, this.height8);
                this.font.draw(context, this.text9, this.widthItem, this.height9);
                this.font.draw(context, this.text10, this.widthItem, this.height10);
                this.font.draw(context, this.text11, this.widthItem, this.height11);

                if (me.device.isMobile) {
                    this.font.draw(context, this.text13, me.game.viewport.width * (1 / 3), this.height12);
                } else {
                    this.font.draw(context, this.text12, me.game.viewport.width * (1 / 3), this.height12);                    
                }
            }
        })));

    me.input.bindKey(me.input.KEY.ENTER, "enter", true);
    this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
        if (action === "enter") {
            // play something on enter
            me.state.change(me.state.PLAY);
        }
    });   
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.event.unsubscribe(this.handler);

        if (me.device.isMobile) {
            me.game.world.removeChild(this.UI);
        } 
    }
});

game.ScoreScreen = me.ScreenObject.extend({
    onResetEvent: function() {

        this.UI = new game.UI.Container();    
        me.game.world.addChild(this.UI);

        if (me.device.isMobile) {
            this.UI.addChild(new game.UI.Button(0,                          0, me.game.viewport.width / 2, me.game.viewport.height, me.input.KEY.ESC));            
            this.UI.addChild(new game.UI.Button(me.game.viewport.width / 2, 0, me.game.viewport.width / 2, me.game.viewport.height, me.input.KEY.ENTER));               
        }


        if (me.device.isMobile) {
            me.game.world.addChild(new me.Sprite(0, 0, me.loader.getImage('background_solar_system_960_540')));
        } else {
            me.game.world.addChild(new me.Sprite(0, 0, me.loader.getImage('background_solar_system_1920_1080')));
        }
        
        me.game.world.addChild(new(me.Renderable.extend({
         
            init: function() {
                this._super(me.Renderable, 'init', [0, 0, me.game.viewport.width, me.game.viewport.height]);
            
                var fontMobile = new me.Font('monospace', 22, 'white');

                var font = new me.Font('monospace', 45, 'white');

                this.widthItem = 0;

                this.text1 = "YOUR SCORE: " + game.data.score;
                this.text2 = "PRESS ESCAPE TO EXIT";
                this.text3 = "PRESS ENTER TO PLAY AGAIN";
                this.text4 = "TAP HERE TO EXIT";
                this.text5 = "TAP HERE TO PLAY AGAIN";

                if (me.device.isMobile) {
                    this.widthItem = me.game.viewport.width - ((2.8 / 3) * me.game.viewport.width);
                    this.height1 = 200;
                    this.height2 = 225;
                    this.height3 = 250;
                    this.height4 = 275;
                    this.height5 = 300;
                    this.font = fontMobile;
                } else {
                    this.widthItem = me.game.viewport.width - ((2.9 / 3) * me.game.viewport.width);
                    this.height1 = 350;
                    this.height2 = 400;
                    this.height3 = 450;
                    this.height4 = 500;
                    this.height5 = 550;
                    this.font = font;
                }
            },

            update: function(dt) {
                return true;
            },

            draw: function(renderer) {
                var self = this;
                var context = renderer.getContext();
                this.font.draw(context, this.text1, me.game.viewport.width * (1.2 / 3), me.game.viewport.height / 2);

                if (me.device.isMobile) {
                    this.font.draw(context, this.text4, me.game.viewport.width * (0.2 / 3), me.game.viewport.height * (2.7 / 3));
                    this.font.draw(context, this.text5, me.game.viewport.width * (2 / 3), me.game.viewport.height * (2.7 / 3));
                } else {
                    this.font.draw(context, this.text2, me.game.viewport.width * (0.2 / 3), me.game.viewport.height * (2.7 / 3));
                    this.font.draw(context, this.text3, me.game.viewport.width * (1.9 / 3), me.game.viewport.height * (2.7 / 3));               
                }
            }
        })));

        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.ESC, "escape", true);
        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
            if (action === "enter") {
                // play something on enter
                me.state.change(me.state.PLAY);
            } else if (action === "escape") {
                me.state.change(me.state.INFO);
            }
        });   
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.ESC);
        me.event.unsubscribe(this.handler);
        if (me.device.isMobile) {
            me.game.world.removeChild(this.UI);
        }
    }
});