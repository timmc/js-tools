# js-tools

Javascript utilities.

So far, just the excellent QueryString lib by Jan Wolter, with a few
modifications by Tim McCormack. Documentation is at top of file and as
JSDoc on functions.

## QueryString.js

Read and write querystrings while preserving pair order, multiply-occurring
keys, missing vs. empty vals, and original encoding. The QueryString object
is immutable and presents a builder API to make reasoning about your code
as easy as possible.

```js
// On page with querystring ??a=b&foo=bar&blank=&foo=baz&missing&&&
>>> var qs = new QueryString(); // == new QueryString(location.search)
>>> qs.values('foo')
["bar", "baz"]
>>> qs.pairs()
[["?a", "b"], ["foo", "bar"], ["blank", ""], ["foo", "baz"], ["missing", null]]

// Build and serialize
>>> var base = QueryString.blank.plus("format", "html").plus("=a=", "℠");
>>> base.toString()
"?format=html&%3Da%3D=%E2%84%A0"

// Immutable
>>> var altered = base.minus('=a=');
>>> altered.toString()
"?format=html"
>>> base.value('=a=')
"℠"
```
