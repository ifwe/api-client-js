var path = require('path');

module.exports = function(grunt) {
    var TEST_RUNNER = path.join(process.cwd(), 'test', 'test_runner');
    var UNIT_TESTS = 'test/unit/**/*_test.js';
    var INTEGRATION_TESTS = 'test/integration/**/*_test.js';

    // NPM tasks, alphabetical
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({
        // Clean
        clean: {
            docs: ['docs'],
            coverage: ['test/coverage.html']
        },

        // Concat
        concat: {
            angular: {
                src: ['lib/index.js', 'lib/http_adapter/angular.js', 'lib/wrappers/angular.js'],
                dest: 'api-angular.js',
                options: {
                    footer: 'TaggedApi.angularWrapper(angular, TaggedApi);'
                }
            }
        },

        // Documentation
        docco: {
            main: {
                src: ['lib/**/*.js'],
                options: {
                    output: 'docs/'
                }
            }
        },

        // Server-side mocha tests
        mochaTest: {
            // Runs all tests
            unit: {
                options: {
                    require: TEST_RUNNER,
                    reporter: 'spec',
                    ui: 'bdd',
                    timeout: 200,
                    recursive: true,
                    clearRequireCache: true
                },
                src: [UNIT_TESTS]
            },

            integration: {
                options: {
                    require: TEST_RUNNER,
                    reporter: 'spec',
                    ui: 'bdd',
                    timeout: 10000,     // Allow up to 10s for integration tests to fail
                    slow: 100,          // Mark tests as slow if they take longer than 0.1s
                    recursive: true,
                    clearRequireCache: true
                },
                src: [INTEGRATION_TESTS]
            },

            // Instruments code for reporting test coverage
            instrument: {
                options: {
                    require: TEST_RUNNER,
                    reporter: 'spec',
                    ui: 'bdd',
                    timeout: 200,
                    recursive: true
                },
                src: [UNIT_TESTS]
            },

            // Reports test coverage
            coverage: {
                options: {
                    require: TEST_RUNNER,
                    reporter: 'html-cov',
                    ui: 'bdd',
                    timeout: 200,
                    recursive: true,
                    quiet: true,
                    captureFile: 'test/coverage.html'
                },
                src: [UNIT_TESTS]
            }
        },

        uglify: {
            angular: {
                files: {
                    'api-angular-min.js': ['api-angular.js']
                }
            }
        },

        // Watches filesystem for changes to run tasks automatically
        watch: {
            unit: {
                options: {
                    spawn: false
                },
                files: [
                    'lib/**/*.js',
                    'test/**/*.js'
                ],
                tasks: ['mochaTest:unit']
            }
        }
    });

    // Runs all tests
    grunt.registerTask('test', 'Runts all unit and integration tests', ['mochaTest:unit', 'mochaTest:integration']);

    // Runs all unit tests
    grunt.registerTask('unit', 'Runts all unit tests', ['mochaTest:unit']);

    // Runs all integration tests
    grunt.registerTask('integration', 'Runs all integration tests', ['mochaTest:integration']);

    // Generates test coverage report
    grunt.registerTask('coverage', 'Generates unit test code coverage', ['clean:coverage', 'mochaTest:instrument', 'mochaTest:coverage']);

    // Generates documentation
    grunt.registerTask('docs', 'Generates documentation', ['clean:docs', 'docco:main']);

    // Dev mode
    grunt.registerTask('dev', 'Enables watchers for developing', ['watch:unit']);

    // Build concatenated/minified version for browsers
    grunt.registerTask('build', 'Builds concatenated/minified versions for browsers', ['concat', 'uglify']);
};
