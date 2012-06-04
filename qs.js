// This is based on public domain code written in 2011 by Jan Wolter and
// distributed at <http://unixpapa.com/js/querystring.html>. Modifications
// in 2012 by Tim McCormack -- still under public domain.
//
// Query String Parser
//
//    qs= new QueryString()
//    qs= new QueryString(string)
//
//        Create a query string object based on the given query string. If
//        no string is given, we use the one from the current page by default.
//
//    qs.value(key)
//
//        Return a value for the named key.  If the key was not defined,
//        it will return undefined. If the key was multiply defined it will
//        return the last value set. If it was defined without a value, it
//        will return an empty string.
//
//   qs.values(key)
//
//        Return an array of values for the named key. If the key was not
//        defined, an empty array will be returned. If the key was multiply
//        defined, the values will be given in the order they appeared on
//        in the query string.
//
//   qs.keys()
//
//        Return an array of unique keys in the query string.  The order will
//        not necessarily be the same as in the original query, and repeated
//        keys will only be listed once.
//
//    QueryString.decode(string)
//
//        This static method is an error tolerant version of the builtin
//        function decodeURIComponent(), modified to also change pluses into
//        spaces, so that it is suitable for query string decoding. You
//        shouldn't usually need to call this yourself as the value(),
//        values(), and keys() methods already decode everything they return.
//
//    New additions: qs.without(key, value) and qs.toString(). See function
//    documentation.
//
// Note: W3C recommends that ; be accepted as an alternative to & for
// separating query string fields. To support that, simply insert a semicolon
// immediately after each ampersand in the regular expression in the first
// function below.

//== Constructor ==//

/**
 * Construct a QueryString object from current location or provided string.
 */
function QueryString(qs) {
    // in case 'new' was omitted
    if (!(this instanceof QueryString)) { return new QueryString(qs); }

    this.dict = {};
    this.alist = [];

    // If no query string  was passed in use the one from the current page
    if (typeof qs === 'undefined') qs = location.search;

    // Delete leading question mark, if there is one
    if (qs.charAt(0) == '?') qs = qs.substring(1);

    // Parse it
    var re = /([^=&]+)(=([^&]*))?/g;
    while (match = re.exec(qs)) {
        var key = decodeURIComponent(match[1].replace(/\+/g,' '));
        var value = match[3] ? QueryString.decode(match[3]) : '';
        if (this.dict[key]) {
            this.dict[key].push(value);
        } else {
            this.dict[key] = [value];
        }
        this.alist.push([key, value])
    }
}

//== Static helpers ==//

QueryString.mapDict = function mapDict(d, fkv) {
    var ret = {};
    for(var k in d) {
        if (!d.hasOwnProperty(k)) { continue; }
        var replace = fkv(k, d[k]);
        if (replace !== undefined) {
            ret[k] = replace;
        }
    }
    return ret;
};

QueryString.filter = function filter(a, fe) {
    var ret = [];
    for (var i=0; i < a.length; i++) {
        if (fe(a[i])) {
            ret.push(a[i]);
        }
    }
    return ret;
};

QueryString.decode = function decode(s) {
    s= s.replace(/\+/g,' ');
    s= s.replace(/%([EF][0-9A-F])%([89AB][0-9A-F])%([89AB][0-9A-F])/g,
        function(code,hex1,hex2,hex3) {
            var n1= parseInt(hex1,16)-0xE0;
            var n2= parseInt(hex2,16)-0x80;
            if (n1 == 0 && n2 < 32) return code;
            var n3= parseInt(hex3,16)-0x80;
            var n= (n1<<12) + (n2<<6) + n3;
            if (n > 0xFFFF) return code;
            return String.fromCharCode(n);
        });
    s= s.replace(/%([CD][0-9A-F])%([89AB][0-9A-F])/g,
        function(code,hex1,hex2) {
            var n1= parseInt(hex1,16)-0xC0;
            if (n1 < 2) return code;
            var n2= parseInt(hex2,16)-0x80;
            return String.fromCharCode((n1<<6)+n2);
        });
    s= s.replace(/%([0-7][0-9A-F])/g,
        function(code,hex) {
            return String.fromCharCode(parseInt(hex,16));
        });
    return s;
};

QueryString.encode = function encode(s) {
    return encodeURIComponent(s).replace(/%20/g, '+');
};

//== Instance methods ==//

QueryString.prototype.value = function value(key) {
    var a= this.dict[key];
    return a ? a[a.length-1] : undefined;
};

QueryString.prototype.values = function values(key) {
    var a= this.dict[key];
    return a ? a : [];
};

QueryString.prototype.keys = function keys() {
    var a= [];
    for (var key in this.dict) {
        if (!this.dict.hasOwnProperty(key)) continue;
        a.push(key);
    }
    return a;
};

/**
 * Create a new QueryString object without any copies of the k=v pair.
 */
QueryString.prototype.without = function without(k, v) {
    var ret = new QueryString();
    ret.dict = QueryString.mapDict(this.dict, function(ok, ovs) {
        var ret = QueryString.filter(ovs, function(el) { return el !== v; });
        return ret.length === 0 ? undefined : ret;
    });
    ret.alist = QueryString.filter(this.alist, function(kv) {
        return !(kv[0] === k && kv[1] === v);
    });
    return ret;
};

/**
 * Convert QueryString object back into a URL query-string starting with a '?'.
 */
QueryString.prototype.toString = function toString() {
    var al = this.alist;
    if (al.length === 0) { return ""; }
    var enc = QueryString.encode;
    var ret = "";
    for (var i=0; i<al.length; i++) {
        var kv = al[i];
        ret += "&" + enc(kv[0]) + '=' + enc(kv[1])
    }
    return '?' + ret.substring(1);
};
