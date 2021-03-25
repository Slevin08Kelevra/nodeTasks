const yaml = require('js-yaml');
const fs = require('fs')

var props
try {
    props = yaml.load(fs.readFileSync('properties.yaml', 'utf8'));
} catch (e) {
    console.log(e);
    process.exit(1)
}

module.exports = props