#!/usr/bin/env node

var stdin = process.openStdin();

var data = "";

stdin.on('data', function(chunk) {
    data += chunk;
});

stdin.on('end', function() {
    console.log("The data you provided was:\n\n" + data + "\n\n The report would be output here.");
});