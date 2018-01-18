group-by-subsequence
====================

Usage
-----

Split lists of strings into objects keyed by common prefix (of complete words)

	var group = require('group-by-subsequence');

	group(list, options);

Options
-------
- **stopwords** an array of words that should not be used as prefixes (generally resulting in longer prefixes)
- **replacements** an object of keys which should be replaced with the corresponding value when observed
- **wordBoundary** the character which separates words in the string list
- **objectReturn** a truthy value which allows post-processing to occur on the object and if a function allows manipulation of the final key values

Testing
-------
Eventually it'll be:

	mocha

Enjoy,

 -Abbey Hawk Sparrow
