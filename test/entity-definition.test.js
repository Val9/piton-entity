var
	EntityDefinition = require('../../piton-entity'),
	assert = require('assert'),
	validation = require('piton-validity').validation;

function createTestEntityDefinition() {
	var entityDefinition = EntityDefinition.createEntityDefinition({
		name: {
			tag: ['update'],
			name: 'Full Name'
		},
		age: {
			type: 'number',
			defaultValue: 0
		},
		active: {
			type: 'boolean',
			defaultValue: true
		},
		phoneNumber: {
			tag: ['update']
		}
	});
	return entityDefinition;
}

function createArrayEntityDefinition() {
	var entityDefinition = EntityDefinition.createEntityDefinition({
		images: {
			type: 'array'
		}
	});
	return entityDefinition;
}

// Casting
var assertions = {
	number: [
		382, 382,
		245, '245',
		831.3, 831.3,
		831.3, '831.3',
		null, null,
		null, ''],
	boolean: [
		true, true,
		true, 1,
		true, 't',
		true, 'true',
		true, 'on',
		true, 'yes',
		false, false,
		false, 'false',
		false, 0,
		false, 'off',
		false, 'no',
		null, null,
		null, ''
	]};

describe('entity-definition', function() {

	describe('#makeBlank()', function() {

		it('returns correct empty object with no parameters', function() {
			var entityDefinition = createTestEntityDefinition();
			entityDefinition.makeBlank().should.eql({
				name: null,
				age: null,
				active: null,
				phoneNumber: null
			});
		});

		it('creates empty objects for objects type', function() {
			var entityDefinition = EntityDefinition.createEntityDefinition({
				contacts: {
					type: 'object'
				}
			});
			entityDefinition.makeBlank().should.eql({ contacts: {} });
		});

		it('creates empty arrays for array type', function() {
			var entityDefinition = EntityDefinition.createEntityDefinition({
				images: {
					type: 'array'
				}
			});
			entityDefinition.makeBlank().should.eql({ images: [] });
		});
	});

	describe('#makeDefault()', function() {

		it('without a customer schema creates a empty object', function() {
			var entityDefinition = EntityDefinition.createEntityDefinition();
			entityDefinition.makeDefault().should.eql({});
		});

		it('returns correct object', function() {
			var entityDefinition = createTestEntityDefinition();
			entityDefinition.makeDefault().should.eql({
				name: null,
				age: 0,
				active: true,
				phoneNumber: null
			});
		});

		it('extends given object correctly', function() {
			var entityDefinition = createTestEntityDefinition();
			entityDefinition.makeDefault({ name: 'Paul' }).should.eql({
				name: 'Paul',
				age: 0,
				active: true,
				phoneNumber: null
			});
		});

		it('strips out properties not in the schema', function() {

			var entityDefinition = createTestEntityDefinition();
			entityDefinition.makeDefault({ name: 'Paul', extra: 'This should not be here'}).should.eql({
				name: 'Paul',
				age: 0,
				active: true,
				phoneNumber: null
			});

		});
	});

	describe('#stripUnknownProperties()', function() {
		it('strips out extra properties', function() {
			var entityDefinition = createTestEntityDefinition();
			entityDefinition.stripUnknownProperties({ name: 'Paul', extra: 'This should not be here' }).should.eql({
				name: 'Paul'
			});
		});

		it('strips out properties without the given tag', function() {
			var entityDefinition = createTestEntityDefinition();
			entityDefinition.stripUnknownProperties({ name: 'Paul', age: 21 }, 'update').should.eql({
				name: 'Paul'
			});
		});

		it('strips out properties without the given tag and returns empty object if tag is not found', function() {
			var entityDefinition = createTestEntityDefinition();
			entityDefinition.stripUnknownProperties({ name: 'Paul', age: 21 }, 'BADTAG').should.eql({});
		});
	});

	describe('#cast()', function() {
		it('converts types correctly', function() {
			var entityDefinition = createTestEntityDefinition();

			Object.keys(assertions).forEach(function(type) {
				// Even = expected, odd = supplied
				for(var i = 0; i < assertions[type].length; i += 2) {
					var cast;
					assert.deepEqual(assertions[type][i], cast = entityDefinition.cast(type, assertions[type][i + 1]),
						'Failed to cast \'' + type + '\' (test ' + i + ') from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast + '\'');
				}
			});
		});

		it('converts arrays correctly', function() {
			var entityDefinition = createArrayEntityDefinition();

			[[], null, ''].forEach(function(value) {
				assert.ok(Array.isArray(entityDefinition.cast('array', value)));
			});

			[[1], ['a']].forEach(function(value) {
				assert.ok(Array.isArray(entityDefinition.cast('array', value)));
				entityDefinition.cast('array', value).should.have.length(1);
			});
		});

		it('converts object correctly', function() {
			var entityDefinition = createArrayEntityDefinition();

			[null, ''].forEach(function(value) {
				Object.keys(entityDefinition.cast('array', value)).should.have.length(0);
			});

			[{a:'b'}].forEach(function(value) {
				Object.keys(entityDefinition.cast('array', value)).should.have.length(1);
			});
		});

		it('throws exception on unknown type ', function() {
			var entityDefinition = createTestEntityDefinition();
			assert.throws(function() {
				entityDefinition.cast(undefined);
			});
		});
	});

	describe('#castProperties()', function() {
		it('converts number types of properties correctly', function() {
			var entityDefinition = createTestEntityDefinition();
			var type = 'number',
			cast;
			for(var i = 0; i < assertions[type].length; i += 2) {
				assert.deepEqual({
					age: assertions[type][i]
				},cast = entityDefinition.castProperties({ age: assertions[type][i + 1] }), 'Failed to cast \'' + type + '\' from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast.age + '\'' + JSON.stringify(cast));
			}
		});

		it('converts boolean types of properties correctly', function() {
			var entityDefinition = createTestEntityDefinition();
			var type = 'boolean',
			cast;

			// Even = expected, odd = supplied
			for(var i = 0; i < assertions[type].length; i += 2) {
				assert.deepEqual({
					active: assertions[type][i]
				},cast = entityDefinition.castProperties({ active: assertions[type][i + 1] }), 'Failed to cast \'' + type + '\' from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast.active + '\'' + JSON.stringify(cast));
			}
		});

		it('does not effect untyped properties', function() {
			var entityDefinition = createTestEntityDefinition();
			assert.deepEqual({
				phoneNumber: '555-0923'
			}, entityDefinition.castProperties({ phoneNumber: '555-0923' }));
		});
	});

	describe('#validate()', function() {
		it('does not error on schemas without validation', function() {
			var entityDefinition = createTestEntityDefinition();
			entityDefinition.validate(entityDefinition.makeDefault({ name: 'Paul' }), 'all', function(errors) {
				assert.deepEqual(errors, {});
			});
		});

		it('returns error for missing property', function() {
			var entityDefinition = createTestEntityDefinition();

			entityDefinition.schema.name.validators = {
				all: [validation.required]
			};

			entityDefinition.validate(entityDefinition.makeDefault({ name: '' }), 'all', function(errors) {
				assert.deepEqual(errors, {"name":"Full Name is required"});
			});
		});

		it('uses the [all] set by default', function() {
			var entityDefinition = createTestEntityDefinition();

			entityDefinition.schema.name.validators = {
				all: [validation.required]
			};

			entityDefinition.validate(entityDefinition.makeDefault({ name: '' }), 'all', function(errors) {
				assert.deepEqual(errors, {name: "Full Name is required"});
			});
		});

		it('returns error for missing property but not for valid property', function() {
			var entityDefinition = createTestEntityDefinition();

			entityDefinition.schema.name.validators = {
				all: [validation.required]
			};

			entityDefinition.schema.age.validators = {
				all: [validation.required]
			};

			entityDefinition.validate(entityDefinition.makeDefault({ name: '', age: 33 }), 'all', function(errors) {
				assert.deepEqual(errors, { name: "Full Name is required" });
			});
		});

		it('uses all validators', function() {
			var entityDefinition = createTestEntityDefinition();

			entityDefinition.schema.name.validators = {
				all: [validation.required, validation.length(2, 4)]
			};

			entityDefinition.validate(entityDefinition.makeDefault({ name: 'A' }), 'all', function(errors) {
				assert.deepEqual(errors, {name: "Full Name must be between 2 and 4 in length"});
			});
		});
	});

	describe('#propertyName()', function() {

		it('returns name when available', function() {
			var entityDefinition = createTestEntityDefinition();
			assert.deepEqual(entityDefinition.propertyName('name'), 'Full Name');
		});

		it('returns converted name', function() {
			var entityDefinition = createTestEntityDefinition();
			assert.deepEqual(entityDefinition.propertyName('age'), 'Age');
		});

		it('throws RangeError on unspecified property', function() {
			var entityDefinition = createTestEntityDefinition();
			assert.throws(function() {
				entityDefinition.propertyName('Wobble');
			}, /RangeError/);
		});

	});

});