'use strict';
var util = require('util');
var path = require('path');
var fs = require('fs');
var yeoman = require('yeoman-generator');


var ExpressGenerator = module.exports = function ExpressGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    var that = this;
    this.installDependencies({
      skipInstall: options['skip-install'],
      skipMessage: true,
      callback: function() {
        that.bowerWiring(true);
      }
    });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(ExpressGenerator, yeoman.generators.Base);

ExpressGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [
    {
      name: 'appName',
      message: 'What would you like to call your express app?'
    },
    {
      name: 'npmDescription',
      message: 'What is the description for this app?',
      default: 'An Express Web App.'
    },
    {
      name: 'authorName',
      message: 'Who is this app going to be written by?',
      default: 'Digitally Seamless'
    },
    {
      name: 'authorEmail',
      message: 'What is the contact email for the author of this app?',
      default: 'node-support@digitallyseamless.com'
    },
    {
      type: 'confirm',
      name: 'npmPrivate',
      message: 'Should this app be listed as a Private npm package?',
      default: true
    },
    {
      type: 'confirm',
      name: 'boilerplate',
      message: 'Would you like to start with a boilerplate HTML5?',
      default: true
    },
    {
      type: 'confirm',
      name: 'jquery',
      message: 'Would you like to use jQuery with your express app?',
      default: true
    },
    {
      type: 'confirm',
      name: 'bootstrap',
      message: 'Would you like to use bootstrap with your express app?',
      default: true
    },{
      type: 'confirm',
      name: 'fontAwesome',
      message: 'Would you like to use font awesome with your express app?',
      default: true
    },
    {
      type: 'confirm',
      name: 'modernizr',
      message: 'Would you like to use modernizr with your express app?',
      default: true
    },
    {
      type: 'confirm',
      name: 'mainJS',
      message: 'Would you like to have a main.js script included in your express app?',
      default: true
    },
    {
      name: 'port',
      message: 'What port would you like to serve from? (default: 3000)',
      default: 3000
    }
  ];

  this.prompt(prompts, function (props) {
    this.appName = props.appName,
    this.npmDescription = props.npmDescription,
    this.authorName = props.authorName,
    this.authorEmail = props.authorEmail,
    this.npmPrivate = props.npmPrivate,
    this.boilerplate = props.boilerplate,
    this.jquery = props.jquery,
    this.bootstrap = props.bootstrap,
    this.fontAwesome = props.fontAwesome,
    this.modernizr = props.modernizr,
    this.mainJS = props.mainJS,
    this.port = props.port;

    cb();
  }.bind(this));
};

ExpressGenerator.prototype.mainApp = function mainApp() {
  this.mkdir('public');
  this.mkdir('routes');
  this.mkdir('views');

  this.bowerDepends = {};
  this.bowerDepCnt = 0;

  if (this.jquery) {
    this.bowerDepends['jquery'] = "~1.10.2";
  }
  if (this.bootstrap) {
    this.bowerDepends['bootstrap'] = ">=3.0.0";
  }
  if (this.fontAwesome) {
    this.bowerDepends['font-awesome'] = ">=3.2.1";
  }
  if (this.modernizr) {
    this.bowerDepends['modernizr'] = ">=2.6.2";
  }

  this.template('_app.js', 'app.js');
  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
};

ExpressGenerator.prototype.publicDir = function publicDir() {
  this.mkdir('public/images');
  this.mkdir('public/javascripts');
  this.mkdir('public/stylesheets');
  this.mkdir('public/fonts');
};

ExpressGenerator.prototype.publicJavascripts = function publicJavascripts() {
  if (this.mainJS) {
    this.copy('_mainJS.js', 'public/javascripts/main.js');
  }
};

ExpressGenerator.prototype.publicStylesheets = function publicStylesheets() {
  this.template('_main.less', 'public/stylesheets/main.less');
  this.template('_style.less', 'public/stylesheets/style.less');
};

ExpressGenerator.prototype.routes = function routes() {
  this.template('_routes.js', 'routes/index.js');
};

ExpressGenerator.prototype.views = function views() {
  this.template('_viewsIndex.jade', 'views/index.jade');

  if (this.boilerplate) {
    this.template('_viewsBoilerplateLayout.jade', 'views/layout.jade');
  }
  else {
    this.template('_viewsPlainLayout.jade', 'views/layout.jade');
  }
};

ExpressGenerator.prototype.siteData = function siteData() {
  this.mkdir('data');
  this.template('_siteData.json', 'data/siteData.json');
};

ExpressGenerator.prototype.git = function git() {
  this.copy('_gitignore', '.gitignore');
};

ExpressGenerator.prototype.bowerWiring = function bowerWiring(finished) {
  // This is the End-Of-Generator Wiring Function  

  if (finished === true) {
    var that = this;
    // Set sourceRoot to be relative to CWD/PWD.
    var cwd = process.cwd();
    var copy = function (src, dest) {
      fs.createReadStream(cwd + '/' + src).pipe(fs.createWriteStream(cwd + '/' + dest));
    };
    var copySync = function (src, dest) {
      var tmp = fs.readFileSync(src, 'utf8');
      fs.writeFileSync(dest,tmp,'utf8',{flag: 'r'});
      return true
    };
    // If jQuery is enabled Copy it from bower_components.
    if (this.jquery) {
      console.log('\nSetting up jQuery Files');
      var jqueryFiles = this.expand('*.js', {
        "cwd": cwd + "/bower_components/jquery/"
      });
      this.mkdir('public/javascripts/jquery');
      jqueryFiles.forEach(function (file) {
        copy('bower_components/jquery/' + file, 'public/javascripts/jquery/' + file);
      });
    }

    // If Bootstrap is enabled Copy it from bower_components.
    if (this.bootstrap) {
      console.log('\nSetting up Bootstrap Files');
      var bootstrapJs = this.expand('*.js', {
        "cwd": cwd + "/bower_components/bootstrap/js/"
      });
      var bootstrapLess = this.expand('*.less', {
        "cwd": cwd + "/bower_components/bootstrap/less/"
      });
      this.mkdir('public/javascripts/bootstrap');
      bootstrapJs.forEach(function (file) {
        copy('bower_components/bootstrap/js/' + file, 'public/javascripts/bootstrap/' + file);
      });
      bootstrapLess.forEach(function (file) {
        copy('bower_components/bootstrap/less/' + file, 'public/stylesheets/' + file);
      });
    }

    // If Modernizr is enabled Copy it from bower_components.
    if (this.modernizr) {
      console.log('\nSetting up Modernizr Files');
      var modernizrJs = this.expand('*.js', {
        "cwd": cwd + "/bower_components/modernizr/"
      });
      this.mkdir('public/javascripts/modernizr');
      modernizrJs.forEach(function (file) {
        copy('bower_components/modernizr/' + file, 'public/javascripts/modernizr/' + file);
      });
    }

    // If Font Awesome is enabled Copy it from bower_components.
    if (this.fontAwesome) {
      console.log('\nSetting up Font Awesome Files');
      var fontAwesomeLess = this.expand('*.less', {
        "cwd": cwd + "/bower_components/font-awesome/less/"
      });
      var fontAwesomeFonts = this.expand('*.*',{
        "cwd": cwd + "/bower_components/font-awesome/font/"
      });
      this.mkdir('public/stylesheets/font-awesome');
      fontAwesomeFonts.forEach(function (file) {
        copy('bower_components/font-awesome/font/' + file, 'public/fonts/' + file);
      });
      fontAwesomeLess.forEach(function (file) {
        var d = copySync('bower_components/font-awesome/less/' + file, 'public/stylesheets/font-awesome/' + file);
      });
      var fontReg=/@FontAwesomePath: *([""'])((?:(?=(\\?))\2.)*?)\1/g;
      var fontVars = fs.readFileSync('public/stylesheets/font-awesome/variables.less', 'utf-8');
      var path = fontReg.exec(fontVars)[2];
      fontVars = fontVars.replace(path, '../../fonts');
      fs.writeFileSync('public/stylesheets/font-awesome/variables.less', fontVars,'utf8', {flag: 'r'});
    }

    console.log('\nDone. Enjoy!\n');
  }
};

