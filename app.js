'use strict';

$(function () {

  var winHeight = $(window).height();
  var winWidth = $(window).width();
  var halfWinHeight = winHeight/2;
  var halfWinWidth = winWidth/2;

  new p5(mainCanvas);

  var Settings = function() {
  };
  var setts = new Settings();

  var counter = 0;
  var planets = [];
  var rocket;
  var currentPlanet = null;
  var G = 0.05; // Gravity Constant
  var play = false;

  function mainCanvas( p ) {

    p.setup = function setup() {
      p.createCanvas(winWidth, winHeight);
      p.push();
      p.translate(halfWinWidth, halfWinHeight);

      rocket = new Rocket(p);
      rocket.setSize(60, 30);
      rocket.setLocation(-400, 0);
      rocket.velocity.set(10, 0);

      var initPlanet = new Planet(p);
      initPlanet.setLocation(200, 100);
      initPlanet.setSize(200);
      planets.push(initPlanet)

      window.myP = p;

    };

    p.draw = function() {
      p.background('#30384e');

      for (var i = 0; i < planets.length; i++) {
        planets[i].display();
      }

      if (play) {
        rocket.update(planets);
      }
      rocket.display();

      if (p.mouseIsPressed && currentPlanet !== null ) {
        currentPlanet.increaseSize(2);
      }

      // Ojectif
      var objectifLocation = new Vector(300, -300);
      p.push();
        p.translate(objectifLocation.x, objectifLocation.y);
        p.fill(44, 100, 157, 100);
        p.stroke(255);
        p.strokeWeight(3);
        p.ellipse(0, 0, 50, 50);
      p.pop();
      // Win ?
      var diff = Vector.sub(objectifLocation, rocket.location);
      if (diff.mag() < 40) {
        console.log('win');
        play = false;
      }
    }

    p.mousePressed = function() {
      var planet = new Planet(p);
      planet.setLocation(p.mouseX - halfWinWidth, p.mouseY - halfWinHeight);
      planets.push(planet);
      currentPlanet = planet;
    }

    p.mouseReleased = function () {
      currentPlanet = null;
    }

    p.keyPressed = function () {
      if (p.keyCode === 32) { // Space
        //rocket.startFire();
        play = true;
      }
    }

    p.keyReleased = function () {
        rocket.stopFire();
    }
  };


  /**
  * Classes
  **/
  var Planet, Rocket, WorldObject,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;
  var Vector = p5.Vector;

  WorldObject = (function() {
    function WorldObject(p) {
      this.p = p;
      this.location = new Vector(0, 0);
      this.velocity = new Vector(0, 0);
      this.acceleration = new Vector(0, 0);
      this.size = new Vector(10, 10);
      this.orientation = 0;

      this.maxAcceleration = 0.5;
    }

    WorldObject.prototype.update = function() {
      if (this.acceleration.mag() / this.maxAcceleration > 1) {
        this.acceleration.mult(1 / (this.acceleration.mag() / this.maxAcceleration) );
      }
      this.velocity.add(this.acceleration);
      this.location.add(this.velocity);
    };

    WorldObject.prototype.setSize = function (x, y) {
      if (x instanceof Vector) {
        this.size = x;
      } else {
        this.size = new Vector(x, y);
      }
    };

    WorldObject.prototype.move = function (x, y) {
      if (x instanceof Vector) {
        this.location.add(x.x, x.y);
      } else {
        this.location.add(x, y);
      }
    };

    WorldObject.prototype.setLocation = function (x, y) {
      if (x instanceof Vector) {
        this.location = x;
      } else {
        this.location = new Vector(x, y);
      }
    };

    WorldObject.prototype.startDisplay = function () {
      this.p.push();
      this.p.translate(this.location.x, this.location.y);
    };

    WorldObject.prototype.endDisplay = function () {
      this.p.pop();
    };

    WorldObject.prototype.display = function () {
      this.startDisplay();
        var s = this.size;
        this.p.noStroke();
        this.p.fill(255);
        this.p.rect(-s.x/2, -s.y/2, s.x, s.y);
      this.endDisplay();
    };

    return WorldObject;

  })();

  Planet = (function(superClass) {
    extend(Planet, superClass);

    function Planet() {
      Planet.__super__.constructor.apply(this, arguments);
      var p = this.p;
      var types = ['crater', 'star'];
      var typesProba = [100, 0];
      this.planetType = inArrayWithCoefs(types, typesProba);

      if (this.planetType === 'crater') {
          // Size
          this.setSize(50);
          // Random Hue
          var hue = Math.random();
          this.color = hslToRgb(hue, 0.4, 0.6);
          this.craters = [];
          var nbrOfCraters = p.floor(p.random(5, 15));
          var that = this;
          function craterConflict(x, y, size) {
            for (var i = 0; i < that.craters.length; i++) {
              var crater = that.craters[i];
              var dx = crater.x - x;
              var dy = crater.y - y;
              var distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < crater.size + size) {
                  return true;
              }
            }
            return false;
          }
          for (var i = 0; i < nbrOfCraters; i++) {
            var maxLoop = 100;
            do {
              maxLoop--;
              var size = Math.random() * 0.3;
              var dist = Math.random() * 0.5;
              var angle = Math.random() * p.TWO_PI;
              var x = p.cos(angle) * dist;
              var y = p.sin(angle) * dist;
            } while ( maxLoop > 0 && craterConflict(x, y, size) );
            this.craters.push({
              size: size,
              x: x,
              y: y
            });
          }
      } else
      if (this.planetType == 'star') {
        this.setSize(200);
        this.color = [230, 230, 30];
      }

    }

    Planet.prototype.display = function () {
      this.startDisplay();
        var p = this.p;
        var s = this.size.x; // x == y
        p.noStroke();
        // Hallo
        p.fill(p.color(255, 255, 255, (255*0.02) ));
        p.ellipse(0, 0, s*2, s*2);
        p.ellipse(0, 0, s*1.5, s*1.5);
        //p.fill(p.color(255, 255, 255, (255*0.3) ));
        //p.ellipse(0, 0, s+3, s+3);

        // Planet
        p.fill(this.color);
        p.ellipse(0, 0, s, s);
        if (this.planetType === 'crater') {
            p.push();
            // Clip
            p.ellipse(0, 0, s, s);
            p.drawingContext.clip();
              // craters
              for (var i = 0; i < this.craters.length; i++) {
                var crater = this.craters[i];
                p.fill( p.color(0, 0, 0, (255 * 0.1) ) );
                p.ellipse(s*crater.x, s*crater.y, s*crater.size, s*crater.size);
              }
              // Shadow
              p.fill( p.color(0, 0, 0, (255 * 0.1) ) );
              p.rotate(p.PI/6);
              var shadowSize = (s/2) * 0.6;
              var shadowStrong = s/2.5;
              p.beginShape();
                p.vertex(0, -s/2);
                p.bezierVertex(0, -s/2, shadowSize, -shadowStrong, shadowSize, 0);
                p.bezierVertex(shadowSize, shadowStrong, 0, s/2, 0, s/2);
                p.vertex(s/2, s/2)
                p.vertex(s/2, -s/2)
              p.endShape();
            p.pop();
        } else
        if (this.planetType === 'star') {
            p.push();
            // Clip
            p.ellipse(0, 0, s, s);
            p.drawingContext.clip();
              // Shadow
              p.fill( p.color(255, 255, 255, (255 * 0.3) ) );
              p.rotate(p.PI/6 + p.PI);
              var shadowSize = (s/2) * 0.6;
              var shadowStrong = s/2.5;
              p.beginShape();
                p.vertex(0, -s/2);
                p.bezierVertex(0, -s/2, shadowSize, -shadowStrong, shadowSize, 0);
                p.bezierVertex(shadowSize, shadowStrong, 0, s/2, 0, s/2);
                p.vertex(s/2, s/2)
                p.vertex(s/2, -s/2)
              p.endShape();
            p.pop();
        }

      this.endDisplay();
    };

    Planet.prototype.setSize = function (size) {
      return Planet.__super__.setSize.call(this, size, size);
    };

    Planet.prototype.increaseSize = function (value) {
      return this.setSize(this.size.x + value);
    };

    return Planet;

  })(WorldObject);


  Rocket = (function(superClass) {
    extend(Rocket, superClass);

    function Rocket(p) {
      Rocket.__super__.constructor.apply(this, [p]);
      this.fire = false;
    }

    Rocket.prototype.display = function () {
      var p = this.p;
      var s = this.size;
      this.startDisplay();
        p.push();
          p.rotate(this.orientation);
          p.noStroke();
          p.fill(255);
          p.beginShape();
            p.vertex(s.x/2, 0);
            p.vertex(-s.x/4, -s.y/2);
            p.vertex(-s.x/2, -s.y/2);
            p.vertex(-s.x/2, s.y/2);
            p.vertex(-s.x/4, s.y/2);
          p.endShape();
        p.pop();
      this.endDisplay();
    };

    Rocket.prototype.startFire = function () {
      this.fire = true;
    };

    Rocket.prototype.stopFire = function () {
      this.fire = false;
    };

    Rocket.prototype.update = function (planets) {
      this.acceleration.set(0, 0);
      for (var i = 0; i < planets.length; i++) {
        var planet = planets[i];
        var force = Vector.sub(planet.location, this.location);
        var distance = force.mag();
        var planetMass = this.p.PI * Math.pow(planet.size.x/2, 2);
        var rocketMass = 50;
        var m = (G * planetMass * rocketMass) / (distance * distance);
        force.normalize();
        force.mult(m);
        this.acceleration.add(force);
      }

      this.orientation = this.velocity.heading();
      if (this.fire) {
        var fireDirection = Vector.fromAngle(this.orientation);
        //fireDirection.rotate(this.p.PI);
        fireDirection.mult(10);
        this.acceleration.add(fireDirection);
      }

      return Rocket.__super__.update.call(this);
    };

    return Rocket;

  })(WorldObject);

  /**
  * Tools
  **/
  /**
  * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
  * Converts an HSL color value to RGB. Conversion formula
  * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
  * Assumes h, s, and l are contained in the set [0, 1] and
  * returns r, g, and b in the set [0, 255].
  *
  * @param   Number  h       The hue
  * @param   Number  s       The saturation
  * @param   Number  l       The lightness
  * @return  Array           The RGB representation
  **/
  function hslToRgb(h, s, l){
      var r, g, b;

      if(s == 0){
          r = g = b = l; // achromatic
      }else{
          function hue2rgb(p, q, t){
              if(t < 0) t += 1;
              if(t > 1) t -= 1;
              if(t < 1/6) return p + (q - p) * 6 * t;
              if(t < 1/2) return q;
              if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      r = Math.round(r * 255);
      g = Math.round(g * 255);
      b = Math.round(b * 255);

      return [r, g, b];
  }

  function inArrayWithCoefs(list, coefs) {
    var total = 0;
    for (var i = 0; i < coefs.length; i++) { total += coefs[i]; };
    var value = Math.floor(Math.random() * total);
    var current = 0;
    for (var i = 0; i < list.length; i++) {
      if (value >= current && value < current + coefs[i]) {
        return list[i];
      }
      current += coefs[i];
    }
  }

});
