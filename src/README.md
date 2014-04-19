To get started

1. bower install
2. npm install
3. grunt
4. open app/app.html

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
