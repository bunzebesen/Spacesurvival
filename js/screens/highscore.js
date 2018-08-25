game.HighscoreScreen = me.ScreenObject.extend({
    /**    
     *  action to perform on state change
     */
    onResetEvent: function() {    

        this.UI = new game.UI.Container();    
        me.game.world.addChild(this.UI);

        if (me.device.isMobile) {
            this.UI.addChild(new game.UI.Button(0, 0, me.game.viewport.width, me.game.viewport.height, me.input.KEY.ESC));                                     
        }

        if (me.device.isMobile) {
            me.game.world.addChild(new me.Sprite(0, 0, me.loader.getImage('black_background_960_540')));
        } else {
            me.game.world.addChild(new me.Sprite(0, 0, me.loader.getImage('black_background_1920_1080')));
        }

        me.game.world.addChild(new(me.Renderable.extend({
         
            init: function() {
                this._super(me.Renderable, 'init', [0, 0, me.game.viewport.width, me.game.viewport.height]);
            
                var fontMobile = new me.Font('monospace', 22, 'white');

                var font = new me.Font('monospace', 45, 'white');

                this.text1 = "HIGHSCORES";   
                this.text2 = "PRESS ESCAPE TO LEAVE";   
                this.text3 = "TAP TO LEAVE";   

                if (me.device.isMobile) {
                    this.font = fontMobile;
                } else {
                    this.font = font;
                } 
            },

            draw: function(renderer) {
                var self = this;
                var context = renderer.getContext();
                this.font.draw(context, this.text1, me.game.viewport.width * (1.2 / 3), me.game.viewport.height * 0.1);

                if (me.device.isMobile) {
                    this.font.draw(context, this.text3, me.game.viewport.width * (1.1 / 3), me.game.viewport.height * (2.7 / 3));
                } else {
                    this.font.draw(context, this.text2, me.game.viewport.width * (1 / 3), me.game.viewport.height * (2.7 / 3));    
                }

                this.counter = 0;

                while(game.highscore.points[this.counter] != null){
                    this.font.draw(context, game.highscore.points[this.counter], me.game.viewport.width * (1.2 / 3), me.game.viewport.height * 0.2 + this.counter * me.game.viewport.height * 0.05);
                    this.counter ++;
                }
            } 
        })));

        me.input.bindKey(me.input.KEY.ESC, "escape", true);
        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
            if (action === "escape") {
                me.state.change(me.state.SCORE);
            }
        });  
    },
    
    /**    
     *  action to perform on state change
     */
    onDestroyEvent: function() {    
        me.input.unbindKey(me.input.KEY.ESC);
        me.event.unsubscribe(this.handler);
        if (me.device.isMobile) {
            me.game.world.removeChild(this.UI);
        }
    }
});