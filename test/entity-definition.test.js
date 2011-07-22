var
	EntityDefinition = require('../../piton-entity').EntityDefinition,
	assert = require('assert'),
	validity = require('piton-validity'),
	validation = validity.validation,
	PropertyValidator = validity.PropertyValidator;

function createTestEntityDefinition() {
	var entityDefinition = new EntityDefinition();
		entityDefinition.schema = {
			name: {
			},
			age: {
				type: 'integer'
			},
			active: {
				type: 'boolean',
				defaultValue: true
			},
			phoneNumber: {
			}
		};
	return entityDefinition;
}

// Casting
var assertions = {
	integer: [
		382, 382,
		245, '245',
		93, 93.5,
		831, '831.2',
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
		null, '']
};


module.exports = {
	'makeBlank returns correct obejct': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: null,
			age: null,
			active: null,
			phoneNumber: null
		}, entityDefinition.makeBlank());
	}
	, 'makeBlank without a customer schema creates a empty object': function() {
		var entityDefinition = new EntityDefinition();
		assert.eql({}, entityDefinition.makeBlank());
	}
	, 'makeDefault without a customer schema creates a empty object': function() {
		var entityDefinition = new EntityDefinition();
		assert.eql({}, entityDefinition.makeDefault());
	}
	, 'makeDefault returns correct object': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: null,
			age: null,
			active: true,
			phoneNumber: null
		}, entityDefinition.makeDefault());
	}
	, 'makeDefault extends passed object correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul',
			age: null,
			active: true,
			phoneNumber: null
		}, entityDefinition.makeDefault({ name: 'Paul' }));
	}
	, 'makeDefault extends strips out extra properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul',
			age: null,
			active: true,
			phoneNumber: null
		}, entityDefinition.makeDefault({ name: 'Paul', extra: 'This should not be here'}));
	}
	, 'stripUnknownProperties strips out extra properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul'
		}, entityDefinition.stripUnknownProperties({ name: 'Paul', extra: 'This should not be here' }));
	}
	, 'cast converts types correctly': function() {
		var entityDefinition = createTestEntityDefinition();

		Object.keys(assertions).forEach(function(type) {
			// Even = expected, odd = supplied
			for(var i = 0; i < assertions[type].length; i += 2) {
				var cast;
				assert.strictEqual(assertions[type][i], cast = entityDefinition.cast(type, assertions[type][i + 1]),
					'Failed to cast \'' + type + '\' from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast + '\'');
			}
		});
	},
	'cast throws exception on unknown type ': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.throws(function() {
			entityDefinition.cast(undefined);
		});
	}
	, 'castProperties converts integer types of properties correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		var type = 'integer',
		cast;
		for(var i = 0; i < assertions[type].length; i += 2) {
			assert.eql({
				age: assertions[type][i]
			},cast = entityDefinition.castProperties({ age: assertions[type][i + 1] }), 	'Failed to cast \'' + type + '\' from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast.name + '\'');
		}
	}
	, 'castProperties converts boolean types of properties correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		var type = 'boolean';
		// Even = expected, odd = supplied
		for(var i = 0; i < assertions[type].length; i += 2) {
			assert.eql({
				active: assertions[type][i]
			},cast = entityDefinition.castProperties({ active: assertions[type][i + 1] }), 	'Failed to cast \'' + type + '\' from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast.active + '\'');
		}
	}
	, 'castProperties does not effect untyped properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			phoneNumber: '555-0923'
		}, entityDefinition.castProperties({ phoneNumber: '555-0923' }));
	}
	, 'validate does not error on schemas without validation': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql(entityDefinition.validate(entityDefinition.makeDefault({ name: 'Paul' })), {});
	}
	, 'validate returns error for missing property': function() {
		var entityDefinition = createTestEntityDefinition();

		entityDefinition.schema.name.validators = {
			all: [validation.required]
		};

		assert.ok(entityDefinition.validate(entityDefinition.makeDefault({ name: '' }), 'all').name);
	}
	, 'validate uses the [all] set by default': function() {
		var entityDefinition = createTestEntityDefinition();

		entityDefinition.schema.name.validators = {
			all: [validation.required]
		};

		assert.ok(entityDefinition.validate(entityDefinition.makeDefault({ name: '' })).name);
	}
};
