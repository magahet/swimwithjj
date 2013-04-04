function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSwimLevel() {
    options = [
        'uncomfortable putting his or her face in the water',
        'comfortable putting his or her face in the water',
        'can swim the width of a pool',
        'advanced swimmer, can swim length of a pool'
    ];

    return options[randInd(0, 3)];
}


var casper = require('casper').create();


casper.start('http://localhost/dev/swimwithjj/', function(){
});

casper.then(function() {
    // select 2 children to signup
    this.click('button#numChildren-1');
});

casper.then(function() {
    this.fill('form#signup-form', {
        'location-select': randInt(1, 100) > 50 ? 'laCrescenta' : 'culverCity',
        'name': 'parent-' + randInt(10, 99),
        'phone': '555-555-' + randInt(1000, 9999),
        'email': randInt() + '@gmail.com',
        'child_name-0': 'child-'  + randInt(10, 99),
        'birthday-0': '201' + randInt(0, 2) + '-0' + randInt(1, 9) + '-' + randInt(10, 28),
        'swim_level-0': randomSwimLevel(),
   }, false);
});

casper.then(function() {
    this.echo(this.getHTML('form#signup-form'));
});


casper.run();
