game.HighscoreScreen = me.ScreenObject.extend({
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
        game.data.foundItems = 0;
        game.data.victory = false;

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