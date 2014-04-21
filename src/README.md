To get started

1. bower install
2. npm install

Use: Generate Static html

1. grunt
2. open app/app.html

Develop: Serve html & watch for changes

1. grunt serve
2. goto http://localhost:8282
3. Modify js/js-src/*.js

Notes
-----

The following files are not being brought in by bower

    mnemonic.js
    qrcode.js
    electrum.js

The following kludge is being made to bitcoinjs-lib

    bitcoinjs-lib master does not expose getSECCurveByName
    so
    grunt does a copy of extjs/bitcoinlib-entry/index.js to bower-components/bitcoinjs-lib/src/index.js
    then
    browserify creates vendorjs/bitcoinjs-lub.js
    then
    uglify minifies all of it into app/app.min.js
