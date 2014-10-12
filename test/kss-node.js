var exec = require('child_process').exec,
	path = require('path'),
	assert = require('assert');

suite('Command Line Interface', function() {
	suite('No arguments', function() {
		test('Should display help', function(done) {
			exec('bin/kss-node', function(err, stdout, stderr) {
				assert.ok(/Usage:/g.test(stderr));
				assert.ok(/Options:/g.test(stderr));
				done();
			});
		});
	});

	suite('Option: --source', function() {
		test('Should read source directory from option', function(done) {
			exec('bin/kss-node --source test/fixtures-styles/with-include --destination test/output', function(err, stdout, stderr) {
				assert.ok(/\* Source: .+test\/fixtures\-styles\/with\-include/g.test(stdout));
				done();
			});
		});
	});

	suite('Option: --destination', function() {
		test('Should read destination directory from option', function(done) {
			exec('bin/kss-node test/fixtures-styles/with-include --destination test/output', function(err, stdout, stderr) {
				assert.ok(/\* Destination: .+test\/output/g.test(stdout));
				done();
			});
		});
	});

	suite('Option: --load-path', function() {
		test('Fails without load-path, when using --sass', function(done) {
			exec('bin/kss-node test/fixtures-styles/with-include test/output --sass test/fixtures-styles/with-include/style.scss', function(err, stdout, stderr) {
				assert.ok(/Error during generation/g.test(stdout));
				assert.ok(/error: file to import not found or unreadable: "buttons"/g.test(stdout));
				done();
			});
		});
		test('Succeeds with load-path, when using --sass', function(done) {
			exec('bin/kss-node test/fixtures-styles/with-include test/output -L test/fixtures-styles/includes --sass test/fixtures-styles/with-include/style.scss', function(err, stdout, stderr) {
				assert.ok(/Generation completed successfully/g.test(stdout));
				done();
			});
		});
	});

	suite('Option: --config', function() {
		test('Should load configuration from json file', function(done) {
			exec('bin/kss-node --config test/cli-option-config.json', function(err, stdout, stderr) {
				assert.ok(/Generation completed successfully/g.test(stdout));
				done();
			});
		});
	});

	suite('Handlebars helper', function() {
		// @TODO: Doing a "cat" of the output file seems inelegant.
		test('Should load additional Handlerbars helpers with --helpers option', function(done) {
			exec('rm -r test/output; bin/kss-node test/fixtures-styles/with-include test/output --template test/fixtures-styles/template --helpers test/fixtures-styles/template/helpers; cat test/output/index.html', function(err, stdout, stderr) {
				assert.ok(/The file containing the Handlebars helper was loaded\./g.test(stdout));
				assert.ok(/Handlerbars helper loaded into template!/g.test(stdout));
				done();
			});
		});
		test('Should load Handlerbars helper: {{section [arg]}}', function(done) {
			exec('cat test/output/section-3.html', function(err, stdout, stderr) {
				assert.ok(/Handlebars Section Helper Test 3/g.test(stdout));
				assert.ok(/Section 3 has been successfully loaded\./g.test(stdout));
				done();
			});
		});
		test('Should load Handlerbars helper: {{eachSection [arg]}}', function(done) {
			exec('cat test/output/section-2.html', function(err, stdout, stderr) {
				assert.ok(/Handlebars eachSection Helper Test 2.1.3/g.test(stdout));
				assert.ok(/Handlebars eachSection Helper Test 2.1.4/g.test(stdout));
				done();
			});
		});
		test('Should load Handlerbars helper: {{eachRoot}}', function(done) {
			exec('cat test/output/index.html', function(err, stdout, stderr) {
				assert.ok(/Handlebars eachRoot Helper Test 2/g.test(stdout));
				assert.ok(/Handlebars eachRoot Helper Test 3/g.test(stdout));
				assert.notEqual(/Handlebars eachRoot Helper Test 2.1.3/g.test(stdout));
				done();
			});
		});
		test('Should load Handlerbars helper: {{ifDepth [arg]}}', function(done) {
			exec('cat test/output/section-2.html', function(err, stdout, stderr) {
				assert.ok(/Handlebars ifDepth Helper Test 2.1</g.test(stdout));
				assert.notEqual(/Handlebars ifDepth Helper Test 2.1.3</g.test(stdout));
				done();
			});
		});
		test('Should load Handlerbars helper: {{unlessDepth [arg]}}', function(done) {
			exec('cat test/output/section-2.html', function(err, stdout, stderr) {
				assert.ok(/Handlebars unlessDepth Helper Test 2.1.3</g.test(stdout));
				assert.notEqual(/Handlebars unlessDepth Helper Test 2.1</g.test(stdout));
				done();
			});
		});
		test('Should load Handlerbars helper: {{eachModifier}}', function(done) {
			exec('cat test/output/section-2.html', function(err, stdout, stderr) {
				assert.ok(/Handlebars eachModifier Helper: :hover/g.test(stdout));
				assert.ok(/Handlebars eachModifier Helper: \.stars\-given</g.test(stdout));
				assert.ok(/Handlebars eachModifier Helper: \.stars\-given:hover/g.test(stdout));
				assert.ok(/Handlebars eachModifier Helper: \.disabled/g.test(stdout));
				done();
			});
		});
		test('Should load Handlerbars helper: {{modifierMarkup}}', function(done) {
			exec('cat test/output/section-2.html', function(err, stdout, stderr) {
				assert.ok(/Handlebars modifierMarkup Helper: pseudo\-class\-hover/g.test(stdout));
				assert.ok(/Handlebars modifierMarkup Helper: stars\-given</g.test(stdout));
				assert.ok(/Handlebars modifierMarkup Helper: stars\-given pseudo\-class\-hover/g.test(stdout));
				assert.ok(/Handlebars modifierMarkup Helper: disabled/g.test(stdout));
				done();
			});
		});
	});
});
