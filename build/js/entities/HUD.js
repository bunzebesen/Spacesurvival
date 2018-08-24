

/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};


game.HUD.Container = me.Container.extend({

    init: function() {
        // call the constructor
        this._super(me.Container, 'init');

        // persistent across level change
        this.isPersistent = true;

        // Use screen coordinates
        this.floating = true;

        // make sure our object is always draw first
        this.z = Infinity;

        // give a name
        this.name = "HUD";

        // add our childs object at position
        this.addChild(new game.HUD.FoundItem(0, 0));   
        this.addChild(new game.HUD.TextItem(0, 0));       
        this.addChild(new game.HUD.HealthItem(me.game.viewport.width - ((2.9 / 3) * me.game.viewport.width), 50));   
        this.addChild(new game.HUD.FuelItem(me.game.viewport.width - 100, 350));  
        this.addChild(new game.HUD.InfoItem(0, 0));
    }
});

/**
 * a basic HUD item to display score
 */
game.HUD.FoundItem = me.Renderable.extend( {
    /**
     * constructor
     */
    init: function(x, y) {

        // call the super constructor
        // (size does not matter here)
        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        this.name = "FoundItem";

        // create a font
        var fontMobile = new me.Font('monospace', 20, 'white');

        var font = new me.Font('monospace', 50, 'white');

//        this.found = 0;

        if (me.device.isMobile) {
            this.widthItem = me.game.viewport.width - ((2.8 / 3) * me.game.viewport.width);
            this.height = me.game.viewport.height - 50;
            this.font = fontMobile;
        } else {
            this.widthItem = me.game.viewport.width - ((2.8 / 3) * me.game.viewport.width);
            this.height = me.game.viewport.height - 100;
            this.font = font;
        }
    },

    draw : function (renderer) {
        var context = renderer.getContext()
        this.font.draw (context, "FOUND SPACESHIP PARTS: " + game.data.foundItems + " / 8", this.widthItem, this.height);
    },

    reset: function() {
        game.data.foundItems = 0;
        game.data.score = 0;
    }

});

game.HUD.TextItem = me.Renderable.extend( {
    init: function(x, y) {
        this._super(me.Renderable, 'init', [x, y, 500, 1000]);

        this.name = "TextItem";
        this.text = "";

        var fontMobile = new me.Font('monospace', 20, 'white');

        var font = new me.Font('monospace', 50, 'white');

        if (me.device.isMobile) {
            this.widthItem = me.game.viewport.width - ((1.8 / 3) * me.game.viewport.width);
            this.height = 50;
            this.font = fontMobile;
        } else {
            this.widthItem = me.game.viewport.width * (1.2 / 3);
            this.height = 100;
            this.font = font;
        }
    },

    draw: function (renderer) {
        var context = renderer.getContext();
        this.font.draw (context, this.text, this.widthItem, this.height);
    },

    setText: function (text) {
        this.text = text;
    },

    getText: function(){
        return this.text;
    },

    setX: function (posx) {
        this.pos.x = posx;
    }
});

game.HUD.HealthItem = me.Renderable.extend( {
    init: function (x, y) {
        this._super(me.Renderable, 'init', [x, y, 50, 100]);
        this.name = "HealthItem";
    },

    draw: function (renderer) {
        renderer.setColor('red');
        for (var i = 0; i <= game.data.health - 1; i++) {
            renderer.fillRect(this.pos.x + (i * 30),
                              this.pos.y,
                              20,
                              20);
        }
    },

    reset: function() {
        game.data.health = 8;
    }
}); 

game.HUD.FuelItem = me.Renderable.extend( {
    init: function (x, y) {
        this._super(me.Renderable, 'init', [x, y, 50, 100]);
        this.name = "FuelItem";
    },

    update : function (dt) {
        // fuel function    
        if(me.input.isKeyPressed('up') || me.input.isKeyPressed('left') || me.input.isKeyPressed('right')){
            game.data.fuel -= 0.1 * me.timer.tick;
        }

        // just empty not in different direction
        if (game.data.fuel <= 0) {
            game.data.fuel = 0;
        }

   /*     if (game.data.fuel > 300) {
            this.heightBlack -= 50;
        }  */
    },

    draw: function (renderer) {
        renderer.setColor('black');
        renderer.fillRect(this.pos.x,
                          this.pos.y,
                          30,
                          -300);
        
        renderer.setColor('red');
        renderer.fillRect(this.pos.x,
                          this.pos.y,
                          30,
                          -game.data.fuel);  
    },

    reset: function() {
        game.data.fuel = 300;
    }
});  

game.HUD.InfoItem = me.Renderable.extend( {
    init: function(x, y) {
        this._super(me.Renderable, 'init', [x, y, 500, 1000]);

        this.name = "InfoItem";

        var fontMobile = new me.Font('monospace', 20, 'white');

        var font = new me.Font('monospace', 50, 'white');

        this.widthItem = 0;

        this.text1 = "YOU ARE ON YOUR MISSION TO EXPLORE SPACE.";
        this.text2 = "YOUR SPACESHIP CRASHED AND YOU LANDED ON THE MARS.";
        this.text3 = "OF COURSE YOU WANT TO RETURN TO YOUR MISSION" ;
        this.text4 = "SO TRY TO FIND ALL OF YOUR SPACESHIP PARTS (8).";
        this.text5 = "AND FIND THE ROBOT PROBES.";
        this.text6 = "PAY ATTENTION TO YOUR FUEL INFORMATION.";
        this.text7 = "IF YOU ARE OUT OF FUEL YOU LOSE.";
        this.text8 = "YOU ARE NOT THE FIRST PERSON ON THE MARS";
        this.text9 = "SO CARE ABOUT 'THINGS' WHICH WERE LEFT-BEHIND.";
        this.text10 = "IF YOU HAVE FOUND ALL PARTS GO TO THE END OF THE LEVEL";
        this.text11 = "TO REBUILD YOUR SPACESHIP.";
        this.text12 = "MOVE TO BEGIN";

        if (me.device.isMobile) {
            this.widthItem = me.game.viewport.width - ((2.5 / 3) * me.game.viewport.width);
            this.height1 = 100;
            this.height2 = 125;
            this.height3 = 150;
            this.height4 = 175;
            this.height5 = 200;
            this.height6 = 225;
            this.height7 = 250;
            this.height8 = 275;
            this.height9 = 300;
            this.height10 = 325;
            this.height11 = 350;
            this.height12 = 450;
            this.font = fontMobile;
        } else {
            this.widthItem = me.game.viewport.width - ((2.7 / 3) * me.game.viewport.width);
            this.height1 = 100;
            this.height2 = 150;
            this.height3 = 200;
            this.height4 = 250;
            this.height5 = 300;
            this.height6 = 350;
            this.height7 = 400;
            this.height8 = 450;
            this.height9 = 500;
            this.height10 = 550;
            this.height11 = 600;
            this.height12 = 850;
            this.font = font;
        }
    },

    draw: function (renderer) {
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
        this.font.draw(context, this.text12, me.game.viewport.width / 2, this.height12);
    },
});





game.UI = game.UI || {};

game.UI.Container = me.Container.extend({

    init: function() {
        // call the constructor
        this._super(me.Container, 'init');

        // persistent across level change
        this.isPersistent = true;

        // Use screen coordinates
        this.floating = true;

        // make sure our object is always draw first
        this.z = Infinity;

        // give a name
        this.name = "UI";
    }
});

game.UI.Button = me.Renderable.extend({
    init : function (x, y, width, height, key) {
        this._super(me.Renderable, 'init', [x, y, width, height, key]);
        this.isPersistent = true;
        this.floating = false;
        this.name = "InfoUI";

        this.key = key;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.pressed = false;
        this.id = 0;

        me.input.registerPointerEvent("pointerup",   this, this.pointerUp.bind(this),   true);
        me.input.registerPointerEvent("pointerdown", this, this.pointerDown.bind(this), true);                 
    },

    pointerUp: function (e) {
        var released = (this.id === e.pointerId);

        if (this.pressed && released) {
            this.pressed = false;
            this.id = 0;
            me.input.triggerKeyEvent(this.key, false);
        }
    },

    pointerDown: function (e) {
        var pressed = this.containsPoint(e.gameX, e.gameY);

        if (pressed && !this.pressed) {
            this.pressed = true;
            this.id = e.pointerId;
            me.input.triggerKeyEvent(this.key, true);
        } else if ((this.id === e.pointerId) && !pressed && this.pressed) {
            this.pressed = false;
            this.id = 0;
            me.input.triggerKeyEvent(this.key, false);
        }
    },

    destroy : function () {
        me.input.releasePointerEvent("pointerdown", this);
        me.input.releasePointerEvent("pointerup",   this);
    },
});

game.UI.TextInput = me.Renderable.extend({
    init : function (x, y, type, length) {
        this.$input = $('<input type="' + type + '" required>').css({
            "left" : x,
            "top" : y
        });

        switch (type) {
        case "text":
            this.$input
                .attr("maxlength", length)
                .attr("pattern", "[a-zA-Z0-9_\-]+");
            break;
        case "number":
            this.$input.attr("max", length);
            break;
        }

        $(me.video.getWrapper()).append(this.$input);
    },

    destroy : function () {
        this.$input.remove();
    }
});