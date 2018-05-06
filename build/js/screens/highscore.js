game.HighscoreScreen = me.ScreenObject.extend({
    /**    
     *  action to perform on state change
     */
    onResetEvent: function() {    
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

                this.counter = 0;

                while(game.highscore.names[this.counter] != null){
                    this.font.draw(context, game.highscore.names[this.counter], me.game.viewport.width * (1.2 / 3), me.game.viewport.height * 0.2 + this.counter * me.game.viewport.height * 0.05);
                    this.font.draw(context, game.highscore.points[this.counter], me.game.viewport.width * (2 / 3), me.game.viewport.height * 0.2 + this.counter * me.game.viewport.height * 0.05);
                    this.counter ++;
                }
            } 
        })));   
    },
    
    /**    
     *  action to perform on state change
     */
    onDestroyEvent: function() {    

    }
});