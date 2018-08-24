module.exports = function(grunt) {

  //js paths
  const scriptsPath = './';
  const tmpScripts = './tmp/scripts/';
  const babelifiedScripts = './tmp/babelified/';
  const replaceScripts = './tmp/replace/';
  //css paths
  const stylesPath = './';
  const tmpStyles = './tmp/styles/'
  const stylesAutoPrefixer = './tmp/preFixerStyles/';
  const stylesMinified = './tmp/minifiedStyles/';

  grunt.initConfig({
    move: {
      moveSourceJStoTemp: {
        files: [
          {
            expand: true,         // Enable dynamic expansion.
            cwd: scriptsPath,     // Src matches are relative to this path.
            src: ['**/*.js'],     // Actual pattern(s) to match.
            dest: tmpScripts      // Destination path prefix.
          },
        ]
      },
      moveModifiedJStoSrc: {
        files: [
          {
            expand: true,
            cwd: replaceScripts,
            src: ['**/*.js'],
            dest: scriptsPath
          },
        ]
      },
      moveSourceCSStoTemp: {
        files: [
          {
            expand: true,
            cwd: stylesPath,
            src: ['**/*.css'],
            dest: tmpStyles
          },
        ]
      },
      moveModifiedCSStoSrc: {
        files: [
          {
            expand: true,
            cwd: stylesMinified,
            src: ['**/*.css'],
            dest: stylesPath
          },
        ]
      }
    },
    browserify: {
      production: {
        files: [
          {
            expand: true,
            cwd: tmpScripts,
            src: ['**/*.js'],
            dest: babelifiedScripts
          },
        ],
        options: {
            browserifyOptions: { debug: false },
            transform: [["babelify", { "presets": ["es2015"] }]],
            plugin: [
              ["minifyify", { map: false }]
            ]
        }
      }
    },
    replace: {
      production: {
        options: {
          patterns: [
            {
              match: /},{}]},{},\[\d\]\);/gm,
              replacement: ''
            },
            {
              match: /.*(?=(\n))/,
              replacement: ''
            },
          ]
        },
        files: [
          {
            expand: true,
            cwd: babelifiedScripts,
            src: ['**/*.js'],
            dest: replaceScripts,
          },
        ],
      }
    },
    autoprefixer: {
      production: {
        options: {
            browsers: ['last 2 versions', 'ie 8', 'ie 9']
        },
        files: [
          {
            expand: true,
            cwd: tmpStyles,
            src: ['**/*.css'],
            dest: stylesAutoPrefixer
          }
        ],
      }
    },
    postcss: {
      production: {
        options: {
          processors: [
            require('precss')(),
            require('cssnano')()
          ]
        },
        files: [
          {
            expand: true,
            cwd: stylesAutoPrefixer,
            src: ['**/*.css'],
            dest: stylesMinified
          }
        ],
      }
    }
  });

  // Load plugin for css autoprefixer
  grunt.loadNpmTasks('grunt-autoprefixer');

  // Load plugin for css postprefix
  grunt.loadNpmTasks('grunt-postcss');

  // Load plugin for ES6
  grunt.loadNpmTasks('grunt-browserify');

  // Load plugin to replace text
  grunt.loadNpmTasks('grunt-replace');

  // Load plugin to move Files
  grunt.loadNpmTasks('grunt-move');

  // Default task(s).
  grunt.registerTask('default', [
    'move:moveSourceJStoTemp',
    'move:moveSourceCSStoTemp',
    'browserify',
    'replace',
    'autoprefixer',
    'postcss',
    'move:moveModifiedJStoSrc',
    'move:moveModifiedCSStoSrc'
  ]);
};