To get started

1. bower install
2. npm install

Use: Generate Static html

1. grunt
2. open app/app.html

Develop: Serve html & watch for changes

1. grunt serve
2. goto http://localhost:8282
3. Modify js/*.js or jade/*.jade and grunt will recreate .min.js and
   .html accordingly

Notes
-----

The following files are not being brought in by bower

    mnemonic.js
    qrcode.js
    electrum.js
    bitcoinjs-min.js
