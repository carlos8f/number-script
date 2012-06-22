// This is all so dreadfully ugly,
// it should be all be rewritten in numberscript at some point.

var bigint = require('bigint');
var vm = require('vm');

exports = module.exports = run;
exports.run = run;
function run (n, base, ctx, cb) {
    if (typeof base === 'object') {
        ctx = base;
        cb = ctx;
    }
    if (typeof base === 'function') {
        cb = base;
        ctx = {};
        base = 10;
    }
    if (typeof ctx === 'function') {
        cb = ctx;
        ctx = {};
    }
    
    compile(n, function (err, src) {
        if (err) return cb(err)
        try {
            var res = vm.runInNewContext(src, ctx);
        }
        catch (err) { return cb(err) };
        cb(null, res);
    }, base);
}

exports.compile = compile;
function compile (n, base, cb) {
    if (typeof base === 'function') {
        cb = base;
        base = 10;
    }
    
    var js;
    if (Buffer.isBuffer(n)) {
        var xs = [];
        for (var i = 0; i < n.length; i++) {
            if (/\S/.test(String.fromCharCode(n[i]))) {
                xs.push(n[i]);
            }
        }
        var buf = new Buffer(xs);
        js = String(bigint.fromBuffer(buf).toBuffer());
    }
    else if (typeof n === 'string') {
        js = String(bigint(n.replace(/\s+/g, ''), base).toBuffer());
    }
    else if (n && typeof n === 'object' && n.toBuffer) {
        js = String(n.toBuffer());
    }
    try {
        Function(js)
    }
    catch (e) {
        if (cb) cb('Invalid number.')
        return;
    }
    cb(null, js);
}

exports.decompile = decompile;
function decompile (src, base, cb) {
    if (typeof base === 'function') {
        cb = base;
        base = 10;
    }
    var buf = Buffer.isBuffer(src) ? buf : new Buffer(src);
    cb(null, bigint.fromBuffer(buf).toString(base));
}
