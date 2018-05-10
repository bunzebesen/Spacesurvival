/**
 * main
 */
var game = {

    /**
     * object where to store game global data
     */
    data : {
        score : 0,
        health : 8,
        fuel : 300,
        foundItems : 0,
        victory : false,
    },

    highscore : {
        names : ['Timo', 'Hans'],
        points : [1200, 666],
    },

    /**
     *
     * Initialize the application
     */
    onload: function() {

        if (me.device.isMobile) {
            game.width = 960;
            game.height = 540;
            game.ratio = 0.5;
        } else {
            game.width = 1920;
            game.height = 1080;
            game.ratio = 1;
        }


        // init the video
        if (!me.video.init('screen', me.video.CANVAS, game.width, game.height, true, 'auto')) {
            alert("Sorry but your browser does not support html 5 canvas. Please try with another one!");
            return;
        }

        // Set some default debug flags
        me.debug.renderHitBox = true;

        // add "#debug" to the URL to enable the debug Panel
        if (document.location.hash === "#debug") {
            window.onReady(function () {
                me.plugin.register.defer(this, me.debug.Panel, "debug", me.input.KEY.V);
            });
        }

        // initialize the "sound engine"
        me.audio.init("mp3,ogg");

        // set all ressources to be loaded
        me.loader.onload = this.loaded.bind(this);

        // set all ressources to be loaded
        me.loader.preload(game.resources);

        // load everything & display a loading screen
        me.state.change(me.state.LOADING);
    },


    /**
     * callback when everything is loaded
     */
    loaded: function ()    {

        // set the "Play/Ingame" Screen Object
        me.state.set(me.state.PLAY, new game.PlayScreen());
        me.state.set(me.state.MENU, new game.MenuScreen());
        me.state.set(me.state.SCORE, new game.ScoreScreen());
        me.state.set(me.state.HIGHSCORE, new game.HighscoreScreen());

        // set the fade transition effect
        me.state.transition("fade","#FFFFFF", 250);

        // register our objects entity in the object pool
        me.pool.register("mainPlayer", game.PlayerEntity);
        me.pool.register("EnvironmentalEnemy", game.EnvironmentalEnemy);
        me.pool.register("PlatformEntity", game.PlatformEntity);
        me.pool.register("SpaceshipPartsEntity", game.SpaceshipPartsEntity);
        me.pool.register("friendlyRoboterEntity", game.friendlyRoboterEntity);
        me.pool.register("robotSpeechBubble", game.robotSpeechBubble);


        me.pool.register("RocketEntity", game.RocketEntity);
        me.pool.register("SpaceshipEntity", game.SpaceshipEntity);
        me.pool.register("HideEntity", game.HideEntity);
        me.pool.register("FuelItem", game.FuelItem);

  //      me.pool.register("Dummy", game.Dummy)
        
  //      me.pool.register("LightItem", game.LightItem);
        me.pool.register("enemyRoboterEntity", game.enemyRoboterEntity); 
        me.pool.register("LaserEntity", game.LaserEntity);       
        me.pool.register("BulletEntity", game.BulletEntity); 
        
        
 //       me.pool.register("PolyEntity", game.PolyEntity);
          

        // load the texture atlas file
        // this will be used by object entities later
    //    game.texture = new me.TextureAtlas(me.loader.getJSON("texture"), me.loader.getImage("texture"));

        // add some keyboard shortcuts
        me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {

            // change global volume setting
            if (keyCode === me.input.KEY.PLUS) {
                // increase volume
                me.audio.setVolume(me.audio.getVolume()+0.1);
            } else if (keyCode === me.input.KEY.MINUS) {
                // decrease volume
                me.audio.setVolume(me.audio.getVolume()-0.1);
            }

            // toggle fullscreen on/off
            if (keyCode === me.input.KEY.F) {
                if (!me.device.isFullscreen) {
                    me.device.requestFullscreen();
                } else {
                    me.device.exitFullscreen();
                }
            }
        });

        // switch to Menu state
        me.state.change(me.state.MENU);
    }
};
