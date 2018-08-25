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

                this.text1 = "YOUR SCORE: " + game.data.score;
                this.text2 = "PRESS ESCAPE TO EXIT";
                this.text3 = "PRESS ENTER TO PLAY AGAIN";
                this.text4 = "TAP HERE TO EXIT";
                this.text5 = "TAP HERE TO PLAY AGAIN";
                this.text6 = "PRESS SPACE TO ENTER HIGHSCORE";
                this.text7 = "TAP HERE TO ENTER HIGHSCORE";

                if (me.device.isMobile) {
                    this.font = fontMobile;
                } else {
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
                    this.font.draw(context, this.text7, me.game.viewport.width * (0.8 / 3), me.game.viewport.height * (2.4 / 3));
                } else {
                    this.font.draw(context, this.text2, me.game.viewport.width * (0.2 / 3), me.game.viewport.height * (2.7 / 3));
                    this.font.draw(context, this.text3, me.game.viewport.width * (1.9 / 3), me.game.viewport.height * (2.7 / 3));         
                    this.font.draw(context, this.text6, me.game.viewport.width * (0.8 / 3), me.game.viewport.height * (2.4 / 3));      
                }
            }
        })));

        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.ESC, "escape", true);
        me.input.bindKey(me.input.KEY.SPACE, "space", true);
        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
            if (action === "enter") {
                // play something on enter
                me.state.change(me.state.PLAY);
            } else if (action === "escape") {
                me.state.change(me.state.MENU);
            } else if(action === "space"){
                me.state.change(me.state.HIGHSCORE);
            }
        });   
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.ESC);
        me.input.unbindKey(me.input.KEY.SPACE);
        me.event.unsubscribe(this.handler);
        if (me.device.isMobile) {
            me.game.world.removeChild(this.UI);
        }
    }
});