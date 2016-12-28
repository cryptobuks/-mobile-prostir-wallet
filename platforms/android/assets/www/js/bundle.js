"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);throw new Error("Cannot find module '" + o + "'");
            }var f = n[o] = { exports: {} };t[o][0].call(f.exports, function (e) {
                var n = t[o][1][e];return s(n ? n : e);
            }, f, f.exports, e, t, n, r);
        }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
        s(r[o]);
    }return s;
})({ 1: [function (require, module, exports) {}, {}], 2: [function (require, module, exports) {
        /*
         * Date Format 1.2.3
         * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
         * MIT license
         *
         * Includes enhancements by Scott Trenda <scott.trenda.net>
         * and Kris Kowal <cixar.com/~kris.kowal/>
         *
         * Accepts a date, a mask, or a date and a mask.
         * Returns a formatted version of the given date.
         * The date defaults to the current date/time.
         * The mask defaults to dateFormat.masks.default.
         */

        (function (global) {
            'use strict';

            var dateFormat = function () {
                var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
                var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
                var timezoneClip = /[^-+\dA-Z]/g;

                // Regexes and supporting functions are cached through closure
                return function (date, mask, utc, gmt) {

                    // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
                    if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
                        mask = date;
                        date = undefined;
                    }

                    date = date || new Date();

                    if (!(date instanceof Date)) {
                        date = new Date(date);
                    }

                    if (isNaN(date)) {
                        throw TypeError('Invalid date');
                    }

                    mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);

                    // Allow setting the utc/gmt argument via the mask
                    var maskSlice = mask.slice(0, 4);
                    if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
                        mask = mask.slice(4);
                        utc = true;
                        if (maskSlice === 'GMT:') {
                            gmt = true;
                        }
                    }

                    var _ = utc ? 'getUTC' : 'get';
                    var d = date[_ + 'Date']();
                    var D = date[_ + 'Day']();
                    var m = date[_ + 'Month']();
                    var y = date[_ + 'FullYear']();
                    var H = date[_ + 'Hours']();
                    var M = date[_ + 'Minutes']();
                    var s = date[_ + 'Seconds']();
                    var L = date[_ + 'Milliseconds']();
                    var o = utc ? 0 : date.getTimezoneOffset();
                    var W = getWeek(date);
                    var N = getDayOfWeek(date);
                    var flags = {
                        d: d,
                        dd: pad(d),
                        ddd: dateFormat.i18n.dayNames[D],
                        dddd: dateFormat.i18n.dayNames[D + 7],
                        m: m + 1,
                        mm: pad(m + 1),
                        mmm: dateFormat.i18n.monthNames[m],
                        mmmm: dateFormat.i18n.monthNames[m + 12],
                        yy: String(y).slice(2),
                        yyyy: y,
                        h: H % 12 || 12,
                        hh: pad(H % 12 || 12),
                        H: H,
                        HH: pad(H),
                        M: M,
                        MM: pad(M),
                        s: s,
                        ss: pad(s),
                        l: pad(L, 3),
                        L: pad(Math.round(L / 10)),
                        t: H < 12 ? 'a' : 'p',
                        tt: H < 12 ? 'am' : 'pm',
                        T: H < 12 ? 'A' : 'P',
                        TT: H < 12 ? 'AM' : 'PM',
                        Z: gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
                        o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                        S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
                        W: W,
                        N: N
                    };

                    return mask.replace(token, function (match) {
                        if (match in flags) {
                            return flags[match];
                        }
                        return match.slice(1, match.length - 1);
                    });
                };
            }();

            dateFormat.masks = {
                'default': 'ddd mmm dd yyyy HH:MM:ss',
                'shortDate': 'm/d/yy',
                'mediumDate': 'mmm d, yyyy',
                'longDate': 'mmmm d, yyyy',
                'fullDate': 'dddd, mmmm d, yyyy',
                'shortTime': 'h:MM TT',
                'mediumTime': 'h:MM:ss TT',
                'longTime': 'h:MM:ss TT Z',
                'isoDate': 'yyyy-mm-dd',
                'isoTime': 'HH:MM:ss',
                'isoDateTime': 'yyyy-mm-dd\'T\'HH:MM:sso',
                'isoUtcDateTime': 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
                'expiresHeaderFormat': 'ddd, dd mmm yyyy HH:MM:ss Z'
            };

            // Internationalization strings
            dateFormat.i18n = {
                dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            };

            function pad(val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = '0' + val;
                }
                return val;
            }

            /**
             * Get the ISO 8601 week number
             * Based on comments from
             * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
             *
             * @param  {Object} `date`
             * @return {Number}
             */
            function getWeek(date) {
                // Remove time components of date
                var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                // Change date to Thursday same week
                targetThursday.setDate(targetThursday.getDate() - (targetThursday.getDay() + 6) % 7 + 3);

                // Take January 4th as it is always in week 1 (see ISO 8601)
                var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

                // Change date to Thursday same week
                firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3);

                // Check if daylight-saving-time-switch occured and correct for it
                var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
                targetThursday.setHours(targetThursday.getHours() - ds);

                // Number of weeks between target Thursday and first Thursday
                var weekDiff = (targetThursday - firstThursday) / (86400000 * 7);
                return 1 + Math.floor(weekDiff);
            }

            /**
             * Get ISO-8601 numeric representation of the day of the week
             * 1 (for Monday) through 7 (for Sunday)
             * 
             * @param  {Object} `date`
             * @return {Number}
             */
            function getDayOfWeek(date) {
                var dow = date.getDay();
                if (dow === 0) {
                    dow = 7;
                }
                return dow;
            }

            /**
             * kind-of shortcut
             * @param  {*} val
             * @return {String}
             */
            function kindOf(val) {
                if (val === null) {
                    return 'null';
                }

                if (val === undefined) {
                    return 'undefined';
                }

                if ((typeof val === "undefined" ? "undefined" : _typeof(val)) !== 'object') {
                    return typeof val === "undefined" ? "undefined" : _typeof(val);
                }

                if (Array.isArray(val)) {
                    return 'array';
                }

                return {}.toString.call(val).slice(8, -1).toLowerCase();
            };

            if (typeof define === 'function' && define.amd) {
                define(function () {
                    return dateFormat;
                });
            } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
                module.exports = dateFormat;
            } else {
                global.dateFormat = dateFormat;
            }
        })(this);
    }, {}], 3: [function (require, module, exports) {
        // # Localize
        // is a GNU gettext-inspired (but not conformant) localization library for
        // Node.js

        var path = require('path');
        var fs = require('fs');

        function Localize(translations, dateFormats, defaultLocale) {

            // Make sure the defaultLocale is something sane, and set the locale to
            // its value. Also configure ``Localize`` to throw an error if missing
            // a translation.
            defaultLocale = typeof defaultLocale === "string" ? defaultLocale : "en";
            var locale = defaultLocale;
            var missingTranslationThrow = true;

            // ## The *mergeObjs* function
            // is a simple helper function to create a new object based on input objects.
            function mergeObjs() {
                var outObj = {};
                for (var i in arguments) {
                    if (arguments[i] instanceof Object) {
                        /* jshint forin: false */
                        for (var j in arguments[i]) {
                            // Does not check for collisions, newer object
                            // definitions clobber old definitions
                            outObj[j] = arguments[i][j];
                        }
                    }
                }
                return outObj;
            }

            // ## The *setLocale* function
            // simply sets the locale to whatever is specified at the moment, as long as it
            // is a string.
            this.setLocale = function (newLocale) {
                if (typeof newLocale === "string") {
                    locale = newLocale;
                } else {
                    throw new Error("Locale must be a string");
                }
            };

            // ## The *strings* object
            // contains a series of key-val pairs to be used for translating very large strings
            // that aren't desirable to have duplicated in several locations
            this.strings = {};

            // ## The *getTranslations* function
            // is a recursive function that checks the specified directory, and all child
            // directories, for ``translations.json`` files, combines them into one JSON
            // object, and returns them.
            function getTranslations(currDir, translations, strings) {
                if (fs.existsSync(currDir)) {
                    // Load translations.json file in current directory, if any
                    if (fs.existsSync(path.join(currDir, "translations.json"))) {
                        translations = mergeObjs(translations, JSON.parse(fs.readFileSync(path.join(path.resolve(currDir), "translations.json"))));
                    }
                    var pathChildren;
                    // Load large text translations in translations subdirectory, if it exists
                    var translationPath = path.join(currDir, "translations");
                    if (fs.existsSync(translationPath) && fs.statSync(translationPath).isDirectory()) {
                        // Get all children in the translations directory
                        pathChildren = fs.readdirSync(translationPath);
                        // Filter out all non-default translations (the ones without a lang type)
                        pathChildren.filter(function (child) {
                            return !/^.*\..*\..*/.test(child);
                            // And map these default translations into an object containing the variable name to use,
                            // the default text, and an array of translations for this text
                        }).map(function (child) {
                            return {
                                name: child.replace(/\..*$/, ""),
                                defaultText: fs.readFileSync(path.join(translationPath, child), 'utf8'),
                                // To make the array of translations for this default translation, filter out
                                // all files that do not start with the primary translation filename (minus extension), with a special
                                // case to filter out the primary translation, as well
                                translations: pathChildren.filter(function (secondChild) {
                                    return new RegExp("^" + child.replace(/\..*$/, "")).test(secondChild) && child !== secondChild;
                                    // Then map this array of files into an object containing the language specified
                                    // and the translation text for this language
                                }).map(function (secondChild) {
                                    return {
                                        lang: secondChild.replace(/\.[^\.]*$/, "").replace(/^[^\.]*\./, ""),
                                        text: fs.readFileSync(path.join(translationPath, secondChild), 'utf8')
                                    };
                                })
                            };
                            // For each of these long-form translation objects, add the default text to the strings object using the
                            // desired variable name, and create a translation object for all defined languages for this text.
                        }).forEach(function (translation) {
                            strings[translation.name] = translation.defaultText;
                            translations[translation.defaultText] = {};
                            translation.translations.forEach(function (lang) {
                                translations[translation.defaultText][lang.lang] = lang.text;
                            });
                        });
                    }
                    // Recurse down each directory and get the translations for that directory
                    pathChildren = fs.readdirSync(currDir);
                    /* jshint forin: false */
                    for (var child in pathChildren) {
                        var childPath = path.resolve(path.join(currDir, pathChildren[child]));
                        if (fs.statSync(childPath).isDirectory()) {
                            var tempArray = getTranslations(childPath, translations, strings);
                            translations = tempArray[0];
                            strings = tempArray[1];
                        }
                    }
                } else {
                    throw new Error("Translation Path Invalid");
                }
                return [translations, strings];
            }

            // ## The *validateTranslations* function
            // determines whether or not the provided JSON object is in a valid
            // format for ``localize``.
            function validateTranslations(newTranslations) {
                if ((typeof newTranslations === "undefined" ? "undefined" : _typeof(newTranslations)) !== "object") {
                    return false;
                }
                /* jshint forin: false */
                for (var translation in newTranslations) {
                    if (typeof translation !== "string") {
                        return false;
                    }
                    if (_typeof(newTranslations[translation]) !== "object") {
                        return false;
                    }
                    for (var lang in newTranslations[translation]) {
                        if (typeof lang !== "string") {
                            return false;
                        }
                        if (typeof newTranslations[translation][lang] !== "string") {
                            return false;
                        }
                    }
                }
                return true;
            }

            // ## The *loadTranslations* function
            // takes a string or object, and attempts to append the specified translation
            // to its store of translations, either by loading all translations from the
            // specified directory (string), or appending the object directly.
            this.loadTranslations = function (newTranslations) {
                if (typeof newTranslations === "string") {
                    var tempArray = getTranslations(newTranslations, {}, this.strings);
                    newTranslations = tempArray[0];
                    this.strings = tempArray[1];
                }
                if (validateTranslations(newTranslations)) {
                    translations = mergeObjs(translations, newTranslations);
                } else {
                    throw new Error("Must provide a valid set of translations.");
                }
            };

            // Now that we have the infrastructure in place, let's verify that the
            // provided translations are valid.
            this.loadTranslations(translations);

            // ## The *clearTranslations* function
            // simply resets the translations variable to a clean slate.
            this.clearTranslations = function () {
                translations = {};
            };

            // ## The *getTranslations* function
            // simply returns the entire translations object, or returns that portion
            // of translations matched by the elements of a provided array of text to
            // translate
            this.getTranslations = function (textArr) {
                if (textArr instanceof Array) {
                    var outObj = {};
                    textArr.forEach(function (text) {
                        outObj[text] = translations[text];
                    });
                    return outObj;
                } else {
                    return translations;
                }
            };

            // ## The *throwOnMissingTranslation* function
            // lets the user decide if a missing translation should cause an Error
            // to be thrown. Turning it off for development and on for testing is
            // recommended. The function coerces whatever it receives into a bool.
            this.throwOnMissingTranslation = function (shouldThrow) {
                missingTranslationThrow = !!shouldThrow;
            };

            // ## The *buildString* function
            // is a string-building function inspired by both ``sprintf`` and
            // [jQuery Templates](http://api.jquery.com/category/plugins/templates/)
            // and a small helping of RegExp. The first argument to buildString is
            // the source string, which has special ``$[x]`` blocks, where ``x`` is
            // a number from 1 to Infinity, matching the nth argument provided.
            // Because of ``.toString()``, string formatting _a la_ ``sprintf`` is
            // avoided, and the numeric identification allows the same parameter to
            // be used multiple times, and the parameter order need not match the
            // string referencing order (important for translations)
            function buildString() {
                var outString = arguments[0];
                for (var i = 1; i < arguments.length; i++) {
                    outString = outString.replace(new RegExp("\\$\\[" + i + "\\]", "g"), arguments[i]);
                }
                return outString;
            }

            // ## The *translate* function
            // is a thin automatic substitution wrapper around ``buildString``. In
            // fact, it short-circuits to ``buildString`` when ``locale`` equals
            // ``defaultLocale``. Otherwise, it looks up the required translated
            // string and executes ``buildString`` on that, instead
            this.translate = function () {
                if (locale === defaultLocale) {
                    return buildString.apply(this, arguments);
                }
                var newText = translations[arguments[0]] && translations[arguments[0]][locale] ? translations[arguments[0]][locale] : null;
                if (missingTranslationThrow && typeof newText !== "string") {
                    throw new Error("Could not find translation for '" + arguments[0] + "' in the " + locale + " locale");
                } else if (typeof newText !== "string") {
                    newText = arguments[0];
                }
                var newArr = Array.prototype.splice.call(arguments, 1, arguments.length - 1);
                newArr.unshift(newText);
                return buildString.apply(this, newArr);
            };

            // ## The *validateDateFormats* function
            // determines whether or not the provided dateFormat object conforms to
            // the necessary structure
            function validateDateFormats(dateFormats) {
                if ((typeof dateFormats === "undefined" ? "undefined" : _typeof(dateFormats)) !== "object") {
                    return false;
                }
                /* jshint forin: false */
                for (var lang in dateFormats) {
                    if (typeof lang !== "string") {
                        return false;
                    }
                    if (_typeof(dateFormats[lang]) !== "object") {
                        return false;
                    }
                    if (!(dateFormats[lang].dayNames instanceof Array)) {
                        return false;
                    }
                    if (!(dateFormats[lang].monthNames instanceof Array)) {
                        return false;
                    }
                    if (_typeof(dateFormats[lang].masks) !== "object") {
                        return false;
                    }
                    if (typeof dateFormats[lang].masks["default"] !== "string") {
                        return false;
                    }
                    if (dateFormats[lang].dayNames.length !== 14) {
                        return false;
                    }
                    if (dateFormats[lang].monthNames.length !== 24) {
                        return false;
                    }
                    for (var i = 0; i < 24; i++) {
                        if (i < 14 && typeof dateFormats[lang].dayNames[i] !== "string") {
                            return false;
                        }
                        if (typeof dateFormats[lang].monthNames[i] !== "string") {
                            return false;
                        }
                    }
                }
                return true;
            }

            // ## The *loadDateFormats* function
            // appends the provided ``dateFormats`` object, if valid, to the current
            // ``dateFormats`` object. Otherwise, it throws an error.
            this.loadDateFormats = function (newDateFormats) {
                if (validateDateFormats(newDateFormats)) {
                    dateFormats = mergeObjs(dateFormats, newDateFormats);
                } else {
                    throw new Error("Invalid Date Format provided");
                }
            };

            // ## The *clearDateFormats* function
            // resets the ``dateFormats`` object to English dates.
            this.clearDateFormats = function () {
                dateFormats = {
                    "en": {
                        dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                        masks: {
                            "default": "ddd mmm dd yyyy HH:MM:ss",
                            shortDate: "m/d/yy",
                            mediumDate: "mmm d, yyyy",
                            longDate: "mmmm d, yyyy",
                            fullDate: "dddd, mmmm d, yyyy",
                            shortTime: "h:MM TT",
                            mediumTime: "h:MM:ss TT",
                            longTime: "h:MM:ss TT Z",
                            isoDate: "yyyy-mm-dd",
                            isoTime: "HH:MM:ss",
                            isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
                            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
                        }
                    }
                };
            };

            // ## The *getDateFormats* function
            // returns the currently-defined ``dateFormats`` object
            this.getDateFormats = function () {
                return dateFormats;
            };

            // Now that we have the infrastructure in place, let's validate the
            // optional ``dateFormats`` object if provided, or initialize it.
            if (validateDateFormats(dateFormats)) {
                this.loadDateFormats(dateFormats);
            } else {
                this.clearDateFormats();
            }

            // The *localDate* function
            // provides easy-to-use date localization support. Based heavily on
            // [node-dateFormat](https://github.com/felixge/node-dateformat) by
            // Steven Levithan <stevenlevithan.com>
            // Scott Trenda <scott.trenda.net>
            // Kris Kowal <cixar.com/~kris.kowal/>
            // Felix Geisendörfer <debuggable.com>
            // MIT Licensed, as with this library. The resultant API is one where
            // a date string or object is the first argument, a mask string (being
            // either a key in the ``masks`` object or an arbitrary mask is the
            // second argument, and a third is a bool flag on whether local or UTC
            // time should be used.
            this.localDate = function () {
                var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                    timezoneClip = /[^-+\dA-Z]/g,
                    pad = function pad(val, len) {
                    val = String(val);
                    len = len || 2;
                    while (val.length < len) {
                        val = "0" + val;
                    }return val;
                };

                // Regexes and supporting functions are cached through closure
                return function (date, mask, utc) {
                    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
                    if (arguments.length === 1 && Object.prototype.toString.call(date) === "[object String]" && !/\d/.test(date)) {
                        mask = date;
                        date = undefined;
                    }

                    date = date || new Date();

                    if (!(date instanceof Date)) {
                        date = new Date(date);
                    }

                    if (isNaN(date)) {
                        throw new TypeError("Invalid date");
                    }

                    mask = String(dateFormats[locale].masks[mask] || mask || dateFormats[locale].masks["default"]);

                    // Allow setting the utc argument via the mask
                    if (mask.slice(0, 4) === "UTC:") {
                        mask = mask.slice(4);
                        utc = true;
                    }

                    var _ = utc ? "getUTC" : "get",
                        d = date[_ + "Date"](),
                        D = date[_ + "Day"](),
                        m = date[_ + "Month"](),
                        y = date[_ + "FullYear"](),
                        H = date[_ + "Hours"](),
                        M = date[_ + "Minutes"](),
                        s = date[_ + "Seconds"](),
                        L = date[_ + "Milliseconds"](),
                        o = utc ? 0 : date.getTimezoneOffset(),
                        flags = {
                        d: d,
                        dd: pad(d),
                        ddd: dateFormats[locale].dayNames[D],
                        dddd: dateFormats[locale].dayNames[D + 7],
                        m: m + 1,
                        mm: pad(m + 1),
                        mmm: dateFormats[locale].monthNames[m],
                        mmmm: dateFormats[locale].monthNames[m + 12],
                        yy: String(y).slice(2),
                        yyyy: y,
                        h: H % 12 || 12,
                        hh: pad(H % 12 || 12),
                        H: H,
                        HH: pad(H),
                        M: M,
                        MM: pad(M),
                        s: s,
                        ss: pad(s),
                        l: pad(L, 3),
                        L: pad(L > 99 ? Math.round(L / 10) : L),
                        t: H < 12 ? "a" : "p",
                        tt: H < 12 ? "am" : "pm",
                        T: H < 12 ? "A" : "P",
                        TT: H < 12 ? "AM" : "PM",
                        Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                        o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                        S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
                    };

                    return mask.replace(token, function ($0) {
                        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                    });
                };
            }();

            return this;
        }

        Localize.source = Localize.toString();
        module.exports = Localize;
    }, { "fs": 1, "path": 4 }], 4: [function (require, module, exports) {
        (function (process) {
            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.

            // resolves . and .. elements in a path array with directory names there
            // must be no slashes, empty elements, or device names (c:\) in the array
            // (so also no leading and trailing slashes - it does not distinguish
            // relative and absolute paths)
            function normalizeArray(parts, allowAboveRoot) {
                // if the path tries to go above the root, `up` ends up > 0
                var up = 0;
                for (var i = parts.length - 1; i >= 0; i--) {
                    var last = parts[i];
                    if (last === '.') {
                        parts.splice(i, 1);
                    } else if (last === '..') {
                        parts.splice(i, 1);
                        up++;
                    } else if (up) {
                        parts.splice(i, 1);
                        up--;
                    }
                }

                // if the path is allowed to go above the root, restore leading ..s
                if (allowAboveRoot) {
                    for (; up--; up) {
                        parts.unshift('..');
                    }
                }

                return parts;
            }

            // Split a filename into [root, dir, basename, ext], unix version
            // 'root' is just a slash, or nothing.
            var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            var splitPath = function splitPath(filename) {
                return splitPathRe.exec(filename).slice(1);
            };

            // path.resolve([from ...], to)
            // posix version
            exports.resolve = function () {
                var resolvedPath = '',
                    resolvedAbsolute = false;

                for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                    var path = i >= 0 ? arguments[i] : process.cwd();

                    // Skip empty and invalid entries
                    if (typeof path !== 'string') {
                        throw new TypeError('Arguments to path.resolve must be strings');
                    } else if (!path) {
                        continue;
                    }

                    resolvedPath = path + '/' + resolvedPath;
                    resolvedAbsolute = path.charAt(0) === '/';
                }

                // At this point the path should be resolved to a full absolute path, but
                // handle relative paths to be safe (might happen when process.cwd() fails)

                // Normalize the path
                resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
                    return !!p;
                }), !resolvedAbsolute).join('/');

                return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
            };

            // path.normalize(path)
            // posix version
            exports.normalize = function (path) {
                var isAbsolute = exports.isAbsolute(path),
                    trailingSlash = substr(path, -1) === '/';

                // Normalize the path
                path = normalizeArray(filter(path.split('/'), function (p) {
                    return !!p;
                }), !isAbsolute).join('/');

                if (!path && !isAbsolute) {
                    path = '.';
                }
                if (path && trailingSlash) {
                    path += '/';
                }

                return (isAbsolute ? '/' : '') + path;
            };

            // posix version
            exports.isAbsolute = function (path) {
                return path.charAt(0) === '/';
            };

            // posix version
            exports.join = function () {
                var paths = Array.prototype.slice.call(arguments, 0);
                return exports.normalize(filter(paths, function (p, index) {
                    if (typeof p !== 'string') {
                        throw new TypeError('Arguments to path.join must be strings');
                    }
                    return p;
                }).join('/'));
            };

            // path.relative(from, to)
            // posix version
            exports.relative = function (from, to) {
                from = exports.resolve(from).substr(1);
                to = exports.resolve(to).substr(1);

                function trim(arr) {
                    var start = 0;
                    for (; start < arr.length; start++) {
                        if (arr[start] !== '') break;
                    }

                    var end = arr.length - 1;
                    for (; end >= 0; end--) {
                        if (arr[end] !== '') break;
                    }

                    if (start > end) return [];
                    return arr.slice(start, end - start + 1);
                }

                var fromParts = trim(from.split('/'));
                var toParts = trim(to.split('/'));

                var length = Math.min(fromParts.length, toParts.length);
                var samePartsLength = length;
                for (var i = 0; i < length; i++) {
                    if (fromParts[i] !== toParts[i]) {
                        samePartsLength = i;
                        break;
                    }
                }

                var outputParts = [];
                for (var i = samePartsLength; i < fromParts.length; i++) {
                    outputParts.push('..');
                }

                outputParts = outputParts.concat(toParts.slice(samePartsLength));

                return outputParts.join('/');
            };

            exports.sep = '/';
            exports.delimiter = ':';

            exports.dirname = function (path) {
                var result = splitPath(path),
                    root = result[0],
                    dir = result[1];

                if (!root && !dir) {
                    // No dirname whatsoever
                    return '.';
                }

                if (dir) {
                    // It has a dirname, strip trailing slash
                    dir = dir.substr(0, dir.length - 1);
                }

                return root + dir;
            };

            exports.basename = function (path, ext) {
                var f = splitPath(path)[2];
                // TODO: make this comparison case-insensitive on windows?
                if (ext && f.substr(-1 * ext.length) === ext) {
                    f = f.substr(0, f.length - ext.length);
                }
                return f;
            };

            exports.extname = function (path) {
                return splitPath(path)[3];
            };

            function filter(xs, f) {
                if (xs.filter) return xs.filter(f);
                var res = [];
                for (var i = 0; i < xs.length; i++) {
                    if (f(xs[i], i, xs)) res.push(xs[i]);
                }
                return res;
            }

            // String.prototype.substr - negative index don't work in IE8
            var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
                return str.substr(start, len);
            } : function (str, start, len) {
                if (start < 0) start = str.length + start;
                return str.substr(start, len);
            };
        }).call(this, require("pBGvAp"));
    }, { "pBGvAp": 5 }], 5: [function (require, module, exports) {
        // shim for using process in browser

        var process = module.exports = {};

        process.nextTick = function () {
            var canSetImmediate = typeof window !== 'undefined' && window.setImmediate;
            var canPost = typeof window !== 'undefined' && window.postMessage && window.addEventListener;

            if (canSetImmediate) {
                return function (f) {
                    return window.setImmediate(f);
                };
            }

            if (canPost) {
                var queue = [];
                window.addEventListener('message', function (ev) {
                    var source = ev.source;
                    if ((source === window || source === null) && ev.data === 'process-tick') {
                        ev.stopPropagation();
                        if (queue.length > 0) {
                            var fn = queue.shift();
                            fn();
                        }
                    }
                }, true);

                return function nextTick(fn) {
                    queue.push(fn);
                    window.postMessage('process-tick', '*');
                };
            }

            return function nextTick(fn) {
                setTimeout(fn, 0);
            };
        }();

        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;

        process.binding = function (name) {
            throw new Error('process.binding is not supported');
        };

        // TODO(shtylman)
        process.cwd = function () {
            return '/';
        };
        process.chdir = function (dir) {
            throw new Error('process.chdir is not supported');
        };
    }, {}], 6: [function (require, module, exports) {
        //---------------------------------------------------------------------
        //
        // QR Code Generator for JavaScript
        //
        // Copyright (c) 2009 Kazuhiko Arase
        //
        // URL: http://www.d-project.com/
        //
        // Licensed under the MIT license:
        //	http://www.opensource.org/licenses/mit-license.php
        //
        // The word 'QR Code' is registered trademark of
        // DENSO WAVE INCORPORATED
        //	http://www.denso-wave.com/qrcode/faqpatent-e.html
        //
        //---------------------------------------------------------------------

        exports.qrcode = function () {

            //---------------------------------------------------------------------
            // qrcode
            //---------------------------------------------------------------------

            /**
             * qrcode
             * @param typeNumber 1 to 10
             * @param errorCorrectLevel 'L','M','Q','H'
             */
            var qrcode = function qrcode(typeNumber, errorCorrectLevel) {

                var PAD0 = 0xEC;
                var PAD1 = 0x11;

                var _typeNumber = typeNumber;
                var _errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
                var _modules = null;
                var _moduleCount = 0;
                var _dataCache = null;
                var _dataList = new Array();

                var _this = {};

                var makeImpl = function makeImpl(test, maskPattern) {

                    _moduleCount = _typeNumber * 4 + 17;
                    _modules = function (moduleCount) {
                        var modules = new Array(moduleCount);
                        for (var row = 0; row < moduleCount; row += 1) {
                            modules[row] = new Array(moduleCount);
                            for (var col = 0; col < moduleCount; col += 1) {
                                modules[row][col] = null;
                            }
                        }
                        return modules;
                    }(_moduleCount);

                    setupPositionProbePattern(0, 0);
                    setupPositionProbePattern(_moduleCount - 7, 0);
                    setupPositionProbePattern(0, _moduleCount - 7);
                    setupPositionAdjustPattern();
                    setupTimingPattern();
                    setupTypeInfo(test, maskPattern);

                    if (_typeNumber >= 7) {
                        setupTypeNumber(test);
                    }

                    if (_dataCache == null) {
                        _dataCache = createData(_typeNumber, _errorCorrectLevel, _dataList);
                    }

                    mapData(_dataCache, maskPattern);
                };

                var setupPositionProbePattern = function setupPositionProbePattern(row, col) {

                    for (var r = -1; r <= 7; r += 1) {

                        if (row + r <= -1 || _moduleCount <= row + r) continue;

                        for (var c = -1; c <= 7; c += 1) {

                            if (col + c <= -1 || _moduleCount <= col + c) continue;

                            if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
                                _modules[row + r][col + c] = true;
                            } else {
                                _modules[row + r][col + c] = false;
                            }
                        }
                    }
                };

                var getBestMaskPattern = function getBestMaskPattern() {

                    var minLostPoint = 0;
                    var pattern = 0;

                    for (var i = 0; i < 8; i += 1) {

                        makeImpl(true, i);

                        var lostPoint = QRUtil.getLostPoint(_this);

                        if (i == 0 || minLostPoint > lostPoint) {
                            minLostPoint = lostPoint;
                            pattern = i;
                        }
                    }

                    return pattern;
                };

                var setupTimingPattern = function setupTimingPattern() {

                    for (var r = 8; r < _moduleCount - 8; r += 1) {
                        if (_modules[r][6] != null) {
                            continue;
                        }
                        _modules[r][6] = r % 2 == 0;
                    }

                    for (var c = 8; c < _moduleCount - 8; c += 1) {
                        if (_modules[6][c] != null) {
                            continue;
                        }
                        _modules[6][c] = c % 2 == 0;
                    }
                };

                var setupPositionAdjustPattern = function setupPositionAdjustPattern() {

                    var pos = QRUtil.getPatternPosition(_typeNumber);

                    for (var i = 0; i < pos.length; i += 1) {

                        for (var j = 0; j < pos.length; j += 1) {

                            var row = pos[i];
                            var col = pos[j];

                            if (_modules[row][col] != null) {
                                continue;
                            }

                            for (var r = -2; r <= 2; r += 1) {

                                for (var c = -2; c <= 2; c += 1) {

                                    if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
                                        _modules[row + r][col + c] = true;
                                    } else {
                                        _modules[row + r][col + c] = false;
                                    }
                                }
                            }
                        }
                    }
                };

                var setupTypeNumber = function setupTypeNumber(test) {

                    var bits = QRUtil.getBCHTypeNumber(_typeNumber);

                    for (var i = 0; i < 18; i += 1) {
                        var mod = !test && (bits >> i & 1) == 1;
                        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
                    }

                    for (var i = 0; i < 18; i += 1) {
                        var mod = !test && (bits >> i & 1) == 1;
                        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
                    }
                };

                var setupTypeInfo = function setupTypeInfo(test, maskPattern) {

                    var data = _errorCorrectLevel << 3 | maskPattern;
                    var bits = QRUtil.getBCHTypeInfo(data);

                    // vertical
                    for (var i = 0; i < 15; i += 1) {

                        var mod = !test && (bits >> i & 1) == 1;

                        if (i < 6) {
                            _modules[i][8] = mod;
                        } else if (i < 8) {
                            _modules[i + 1][8] = mod;
                        } else {
                            _modules[_moduleCount - 15 + i][8] = mod;
                        }
                    }

                    // horizontal
                    for (var i = 0; i < 15; i += 1) {

                        var mod = !test && (bits >> i & 1) == 1;

                        if (i < 8) {
                            _modules[8][_moduleCount - i - 1] = mod;
                        } else if (i < 9) {
                            _modules[8][15 - i - 1 + 1] = mod;
                        } else {
                            _modules[8][15 - i - 1] = mod;
                        }
                    }

                    // fixed module
                    _modules[_moduleCount - 8][8] = !test;
                };

                var mapData = function mapData(data, maskPattern) {

                    var inc = -1;
                    var row = _moduleCount - 1;
                    var bitIndex = 7;
                    var byteIndex = 0;
                    var maskFunc = QRUtil.getMaskFunction(maskPattern);

                    for (var col = _moduleCount - 1; col > 0; col -= 2) {

                        if (col == 6) col -= 1;

                        while (true) {

                            for (var c = 0; c < 2; c += 1) {

                                if (_modules[row][col - c] == null) {

                                    var dark = false;

                                    if (byteIndex < data.length) {
                                        dark = (data[byteIndex] >>> bitIndex & 1) == 1;
                                    }

                                    var mask = maskFunc(row, col - c);

                                    if (mask) {
                                        dark = !dark;
                                    }

                                    _modules[row][col - c] = dark;
                                    bitIndex -= 1;

                                    if (bitIndex == -1) {
                                        byteIndex += 1;
                                        bitIndex = 7;
                                    }
                                }
                            }

                            row += inc;

                            if (row < 0 || _moduleCount <= row) {
                                row -= inc;
                                inc = -inc;
                                break;
                            }
                        }
                    }
                };

                var createBytes = function createBytes(buffer, rsBlocks) {

                    var offset = 0;

                    var maxDcCount = 0;
                    var maxEcCount = 0;

                    var dcdata = new Array(rsBlocks.length);
                    var ecdata = new Array(rsBlocks.length);

                    for (var r = 0; r < rsBlocks.length; r += 1) {

                        var dcCount = rsBlocks[r].dataCount;
                        var ecCount = rsBlocks[r].totalCount - dcCount;

                        maxDcCount = Math.max(maxDcCount, dcCount);
                        maxEcCount = Math.max(maxEcCount, ecCount);

                        dcdata[r] = new Array(dcCount);

                        for (var i = 0; i < dcdata[r].length; i += 1) {
                            dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
                        }
                        offset += dcCount;

                        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
                        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

                        var modPoly = rawPoly.mod(rsPoly);
                        ecdata[r] = new Array(rsPoly.getLength() - 1);
                        for (var i = 0; i < ecdata[r].length; i += 1) {
                            var modIndex = i + modPoly.getLength() - ecdata[r].length;
                            ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
                        }
                    }

                    var totalCodeCount = 0;
                    for (var i = 0; i < rsBlocks.length; i += 1) {
                        totalCodeCount += rsBlocks[i].totalCount;
                    }

                    var data = new Array(totalCodeCount);
                    var index = 0;

                    for (var i = 0; i < maxDcCount; i += 1) {
                        for (var r = 0; r < rsBlocks.length; r += 1) {
                            if (i < dcdata[r].length) {
                                data[index] = dcdata[r][i];
                                index += 1;
                            }
                        }
                    }

                    for (var i = 0; i < maxEcCount; i += 1) {
                        for (var r = 0; r < rsBlocks.length; r += 1) {
                            if (i < ecdata[r].length) {
                                data[index] = ecdata[r][i];
                                index += 1;
                            }
                        }
                    }

                    return data;
                };

                var createData = function createData(typeNumber, errorCorrectLevel, dataList) {

                    var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

                    var buffer = qrBitBuffer();

                    for (var i = 0; i < dataList.length; i += 1) {
                        var data = dataList[i];
                        buffer.put(data.getMode(), 4);
                        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber));
                        data.write(buffer);
                    }

                    // calc num max data.
                    var totalDataCount = 0;
                    for (var i = 0; i < rsBlocks.length; i += 1) {
                        totalDataCount += rsBlocks[i].dataCount;
                    }

                    if (buffer.getLengthInBits() > totalDataCount * 8) {
                        throw new Error('code length overflow. (' + buffer.getLengthInBits() + '>' + totalDataCount * 8 + ')');
                    }

                    // end code
                    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
                        buffer.put(0, 4);
                    }

                    // padding
                    while (buffer.getLengthInBits() % 8 != 0) {
                        buffer.putBit(false);
                    }

                    // padding
                    while (true) {

                        if (buffer.getLengthInBits() >= totalDataCount * 8) {
                            break;
                        }
                        buffer.put(PAD0, 8);

                        if (buffer.getLengthInBits() >= totalDataCount * 8) {
                            break;
                        }
                        buffer.put(PAD1, 8);
                    }

                    return createBytes(buffer, rsBlocks);
                };

                _this.addData = function (data) {
                    var newData = qr8BitByte(data);
                    _dataList.push(newData);
                    _dataCache = null;
                };

                _this.isDark = function (row, col) {
                    if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
                        throw new Error(row + ',' + col);
                    }
                    return _modules[row][col];
                };

                _this.getModuleCount = function () {
                    return _moduleCount;
                };

                _this.make = function () {
                    makeImpl(false, getBestMaskPattern());
                };

                _this.createTableTag = function (cellSize, margin) {

                    cellSize = cellSize || 2;
                    margin = typeof margin == 'undefined' ? cellSize * 4 : margin;

                    var qrHtml = '';

                    qrHtml += '<table style="';
                    qrHtml += ' border-width: 0px; border-style: none;';
                    qrHtml += ' border-collapse: collapse;';
                    qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
                    qrHtml += '">';
                    qrHtml += '<tbody>';

                    for (var r = 0; r < _this.getModuleCount(); r += 1) {

                        qrHtml += '<tr>';

                        for (var c = 0; c < _this.getModuleCount(); c += 1) {
                            qrHtml += '<td style="';
                            qrHtml += ' border-width: 0px; border-style: none;';
                            qrHtml += ' border-collapse: collapse;';
                            qrHtml += ' padding: 0px; margin: 0px;';
                            qrHtml += ' width: ' + cellSize + 'px;';
                            qrHtml += ' height: ' + cellSize + 'px;';
                            qrHtml += ' background-color: ';
                            qrHtml += _this.isDark(r, c) ? '#000000' : '#ffffff';
                            qrHtml += ';';
                            qrHtml += '"/>';
                        }

                        qrHtml += '</tr>';
                    }

                    qrHtml += '</tbody>';
                    qrHtml += '</table>';

                    return qrHtml;
                };

                _this.createImgTag = function (cellSize, margin) {

                    cellSize = cellSize || 2;
                    margin = typeof margin == 'undefined' ? cellSize * 4 : margin;

                    var size = _this.getModuleCount() * cellSize + margin * 2;
                    var min = margin;
                    var max = size - margin;

                    return createImgTag(size, size, function (x, y) {
                        if (min <= x && x < max && min <= y && y < max) {
                            var c = Math.floor((x - min) / cellSize);
                            var r = Math.floor((y - min) / cellSize);
                            return _this.isDark(r, c) ? 0 : 1;
                        } else {
                            return 1;
                        }
                    });
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // qrcode.stringToBytes
            //---------------------------------------------------------------------

            qrcode.stringToBytes = function (s) {
                var bytes = new Array();
                for (var i = 0; i < s.length; i += 1) {
                    var c = s.charCodeAt(i);
                    bytes.push(c & 0xff);
                }
                return bytes;
            };

            //---------------------------------------------------------------------
            // qrcode.createStringToBytes
            //---------------------------------------------------------------------

            /**
             * @param unicodeData base64 string of byte array.
             * [16bit Unicode],[16bit Bytes], ...
             * @param numChars
             */
            qrcode.createStringToBytes = function (unicodeData, numChars) {

                // create conversion map.

                var unicodeMap = function () {

                    var bin = base64DecodeInputStream(unicodeData);
                    var read = function read() {
                        var b = bin.read();
                        if (b == -1) throw new Error();
                        return b;
                    };

                    var count = 0;
                    var unicodeMap = {};
                    while (true) {
                        var b0 = bin.read();
                        if (b0 == -1) break;
                        var b1 = read();
                        var b2 = read();
                        var b3 = read();
                        var k = String.fromCharCode(b0 << 8 | b1);
                        var v = b2 << 8 | b3;
                        unicodeMap[k] = v;
                        count += 1;
                    }
                    if (count != numChars) {
                        throw new Error(count + ' != ' + numChars);
                    }

                    return unicodeMap;
                }();

                var unknownChar = '?'.charCodeAt(0);

                return function (s) {
                    var bytes = new Array();
                    for (var i = 0; i < s.length; i += 1) {
                        var c = s.charCodeAt(i);
                        if (c < 128) {
                            bytes.push(c);
                        } else {
                            var b = unicodeMap[s.charAt(i)];
                            if (typeof b == 'number') {
                                if ((b & 0xff) == b) {
                                    // 1byte
                                    bytes.push(b);
                                } else {
                                    // 2bytes
                                    bytes.push(b >>> 8);
                                    bytes.push(b & 0xff);
                                }
                            } else {
                                bytes.push(unknownChar);
                            }
                        }
                    }
                    return bytes;
                };
            };

            //---------------------------------------------------------------------
            // QRMode
            //---------------------------------------------------------------------

            var QRMode = {
                MODE_NUMBER: 1 << 0,
                MODE_ALPHA_NUM: 1 << 1,
                MODE_8BIT_BYTE: 1 << 2,
                MODE_KANJI: 1 << 3
            };

            //---------------------------------------------------------------------
            // QRErrorCorrectLevel
            //---------------------------------------------------------------------

            var QRErrorCorrectLevel = {
                L: 1,
                M: 0,
                Q: 3,
                H: 2
            };

            //---------------------------------------------------------------------
            // QRMaskPattern
            //---------------------------------------------------------------------

            var QRMaskPattern = {
                PATTERN000: 0,
                PATTERN001: 1,
                PATTERN010: 2,
                PATTERN011: 3,
                PATTERN100: 4,
                PATTERN101: 5,
                PATTERN110: 6,
                PATTERN111: 7
            };

            //---------------------------------------------------------------------
            // QRUtil
            //---------------------------------------------------------------------

            var QRUtil = function () {

                var PATTERN_POSITION_TABLE = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]];
                var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
                var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
                var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;

                var _this = {};

                var getBCHDigit = function getBCHDigit(data) {
                    var digit = 0;
                    while (data != 0) {
                        digit += 1;
                        data >>>= 1;
                    }
                    return digit;
                };

                _this.getBCHTypeInfo = function (data) {
                    var d = data << 10;
                    while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
                        d ^= G15 << getBCHDigit(d) - getBCHDigit(G15);
                    }
                    return (data << 10 | d) ^ G15_MASK;
                };

                _this.getBCHTypeNumber = function (data) {
                    var d = data << 12;
                    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
                        d ^= G18 << getBCHDigit(d) - getBCHDigit(G18);
                    }
                    return data << 12 | d;
                };

                _this.getPatternPosition = function (typeNumber) {
                    return PATTERN_POSITION_TABLE[typeNumber - 1];
                };

                _this.getMaskFunction = function (maskPattern) {

                    switch (maskPattern) {

                        case QRMaskPattern.PATTERN000:
                            return function (i, j) {
                                return (i + j) % 2 == 0;
                            };
                        case QRMaskPattern.PATTERN001:
                            return function (i, j) {
                                return i % 2 == 0;
                            };
                        case QRMaskPattern.PATTERN010:
                            return function (i, j) {
                                return j % 3 == 0;
                            };
                        case QRMaskPattern.PATTERN011:
                            return function (i, j) {
                                return (i + j) % 3 == 0;
                            };
                        case QRMaskPattern.PATTERN100:
                            return function (i, j) {
                                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
                            };
                        case QRMaskPattern.PATTERN101:
                            return function (i, j) {
                                return i * j % 2 + i * j % 3 == 0;
                            };
                        case QRMaskPattern.PATTERN110:
                            return function (i, j) {
                                return (i * j % 2 + i * j % 3) % 2 == 0;
                            };
                        case QRMaskPattern.PATTERN111:
                            return function (i, j) {
                                return (i * j % 3 + (i + j) % 2) % 2 == 0;
                            };

                        default:
                            throw new Error('bad maskPattern:' + maskPattern);
                    }
                };

                _this.getErrorCorrectPolynomial = function (errorCorrectLength) {
                    var a = qrPolynomial([1], 0);
                    for (var i = 0; i < errorCorrectLength; i += 1) {
                        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
                    }
                    return a;
                };

                _this.getLengthInBits = function (mode, type) {

                    if (1 <= type && type < 10) {

                        // 1 - 9

                        switch (mode) {
                            case QRMode.MODE_NUMBER:
                                return 10;
                            case QRMode.MODE_ALPHA_NUM:
                                return 9;
                            case QRMode.MODE_8BIT_BYTE:
                                return 8;
                            case QRMode.MODE_KANJI:
                                return 8;
                            default:
                                throw new Error('mode:' + mode);
                        }
                    } else if (type < 27) {

                        // 10 - 26

                        switch (mode) {
                            case QRMode.MODE_NUMBER:
                                return 12;
                            case QRMode.MODE_ALPHA_NUM:
                                return 11;
                            case QRMode.MODE_8BIT_BYTE:
                                return 16;
                            case QRMode.MODE_KANJI:
                                return 10;
                            default:
                                throw new Error('mode:' + mode);
                        }
                    } else if (type < 41) {

                        // 27 - 40

                        switch (mode) {
                            case QRMode.MODE_NUMBER:
                                return 14;
                            case QRMode.MODE_ALPHA_NUM:
                                return 13;
                            case QRMode.MODE_8BIT_BYTE:
                                return 16;
                            case QRMode.MODE_KANJI:
                                return 12;
                            default:
                                throw new Error('mode:' + mode);
                        }
                    } else {
                        throw new Error('type:' + type);
                    }
                };

                _this.getLostPoint = function (qrcode) {

                    var moduleCount = qrcode.getModuleCount();

                    var lostPoint = 0;

                    // LEVEL1

                    for (var row = 0; row < moduleCount; row += 1) {
                        for (var col = 0; col < moduleCount; col += 1) {

                            var sameCount = 0;
                            var dark = qrcode.isDark(row, col);

                            for (var r = -1; r <= 1; r += 1) {

                                if (row + r < 0 || moduleCount <= row + r) {
                                    continue;
                                }

                                for (var c = -1; c <= 1; c += 1) {

                                    if (col + c < 0 || moduleCount <= col + c) {
                                        continue;
                                    }

                                    if (r == 0 && c == 0) {
                                        continue;
                                    }

                                    if (dark == qrcode.isDark(row + r, col + c)) {
                                        sameCount += 1;
                                    }
                                }
                            }

                            if (sameCount > 5) {
                                lostPoint += 3 + sameCount - 5;
                            }
                        }
                    };

                    // LEVEL2

                    for (var row = 0; row < moduleCount - 1; row += 1) {
                        for (var col = 0; col < moduleCount - 1; col += 1) {
                            var count = 0;
                            if (qrcode.isDark(row, col)) count += 1;
                            if (qrcode.isDark(row + 1, col)) count += 1;
                            if (qrcode.isDark(row, col + 1)) count += 1;
                            if (qrcode.isDark(row + 1, col + 1)) count += 1;
                            if (count == 0 || count == 4) {
                                lostPoint += 3;
                            }
                        }
                    }

                    // LEVEL3

                    for (var row = 0; row < moduleCount; row += 1) {
                        for (var col = 0; col < moduleCount - 6; col += 1) {
                            if (qrcode.isDark(row, col) && !qrcode.isDark(row, col + 1) && qrcode.isDark(row, col + 2) && qrcode.isDark(row, col + 3) && qrcode.isDark(row, col + 4) && !qrcode.isDark(row, col + 5) && qrcode.isDark(row, col + 6)) {
                                lostPoint += 40;
                            }
                        }
                    }

                    for (var col = 0; col < moduleCount; col += 1) {
                        for (var row = 0; row < moduleCount - 6; row += 1) {
                            if (qrcode.isDark(row, col) && !qrcode.isDark(row + 1, col) && qrcode.isDark(row + 2, col) && qrcode.isDark(row + 3, col) && qrcode.isDark(row + 4, col) && !qrcode.isDark(row + 5, col) && qrcode.isDark(row + 6, col)) {
                                lostPoint += 40;
                            }
                        }
                    }

                    // LEVEL4

                    var darkCount = 0;

                    for (var col = 0; col < moduleCount; col += 1) {
                        for (var row = 0; row < moduleCount; row += 1) {
                            if (qrcode.isDark(row, col)) {
                                darkCount += 1;
                            }
                        }
                    }

                    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
                    lostPoint += ratio * 10;

                    return lostPoint;
                };

                return _this;
            }();

            //---------------------------------------------------------------------
            // QRMath
            //---------------------------------------------------------------------

            var QRMath = function () {

                var EXP_TABLE = new Array(256);
                var LOG_TABLE = new Array(256);

                // initialize tables
                for (var i = 0; i < 8; i += 1) {
                    EXP_TABLE[i] = 1 << i;
                }
                for (var i = 8; i < 256; i += 1) {
                    EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
                }
                for (var i = 0; i < 255; i += 1) {
                    LOG_TABLE[EXP_TABLE[i]] = i;
                }

                var _this = {};

                _this.glog = function (n) {

                    if (n < 1) {
                        throw new Error('glog(' + n + ')');
                    }

                    return LOG_TABLE[n];
                };

                _this.gexp = function (n) {

                    while (n < 0) {
                        n += 255;
                    }

                    while (n >= 256) {
                        n -= 255;
                    }

                    return EXP_TABLE[n];
                };

                return _this;
            }();

            //---------------------------------------------------------------------
            // qrPolynomial
            //---------------------------------------------------------------------

            function qrPolynomial(num, shift) {

                if (typeof num.length == 'undefined') {
                    throw new Error(num.length + '/' + shift);
                }

                var _num = function () {
                    var offset = 0;
                    while (offset < num.length && num[offset] == 0) {
                        offset += 1;
                    }
                    var _num = new Array(num.length - offset + shift);
                    for (var i = 0; i < num.length - offset; i += 1) {
                        _num[i] = num[i + offset];
                    }
                    return _num;
                }();

                var _this = {};

                _this.get = function (index) {
                    return _num[index];
                };

                _this.getLength = function () {
                    return _num.length;
                };

                _this.multiply = function (e) {

                    var num = new Array(_this.getLength() + e.getLength() - 1);

                    for (var i = 0; i < _this.getLength(); i += 1) {
                        for (var j = 0; j < e.getLength(); j += 1) {
                            num[i + j] ^= QRMath.gexp(QRMath.glog(_this.get(i)) + QRMath.glog(e.get(j)));
                        }
                    }

                    return qrPolynomial(num, 0);
                };

                _this.mod = function (e) {

                    if (_this.getLength() - e.getLength() < 0) {
                        return _this;
                    }

                    var ratio = QRMath.glog(_this.get(0)) - QRMath.glog(e.get(0));

                    var num = new Array(_this.getLength());
                    for (var i = 0; i < _this.getLength(); i += 1) {
                        num[i] = _this.get(i);
                    }

                    for (var i = 0; i < e.getLength(); i += 1) {
                        num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
                    }

                    // recursive call
                    return qrPolynomial(num, 0).mod(e);
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // QRRSBlock
            //---------------------------------------------------------------------

            var QRRSBlock = function () {

                var RS_BLOCK_TABLE = [

                // L
                // M
                // Q
                // H

                // 1
                [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],

                // 2
                [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],

                // 3
                [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],

                // 4
                [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],

                // 5
                [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],

                // 6
                [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],

                // 7
                [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],

                // 8
                [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],

                // 9
                [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],

                // 10
                [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16]];

                var qrRSBlock = function qrRSBlock(totalCount, dataCount) {
                    var _this = {};
                    _this.totalCount = totalCount;
                    _this.dataCount = dataCount;
                    return _this;
                };

                var _this = {};

                var getRsBlockTable = function getRsBlockTable(typeNumber, errorCorrectLevel) {

                    switch (errorCorrectLevel) {
                        case QRErrorCorrectLevel.L:
                            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
                        case QRErrorCorrectLevel.M:
                            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
                        case QRErrorCorrectLevel.Q:
                            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
                        case QRErrorCorrectLevel.H:
                            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
                        default:
                            return undefined;
                    }
                };

                _this.getRSBlocks = function (typeNumber, errorCorrectLevel) {

                    var rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);

                    if (typeof rsBlock == 'undefined') {
                        throw new Error('bad rs block @ typeNumber:' + typeNumber + '/errorCorrectLevel:' + errorCorrectLevel);
                    }

                    var length = rsBlock.length / 3;

                    var list = new Array();

                    for (var i = 0; i < length; i += 1) {

                        var count = rsBlock[i * 3 + 0];
                        var totalCount = rsBlock[i * 3 + 1];
                        var dataCount = rsBlock[i * 3 + 2];

                        for (var j = 0; j < count; j += 1) {
                            list.push(qrRSBlock(totalCount, dataCount));
                        }
                    }

                    return list;
                };

                return _this;
            }();

            //---------------------------------------------------------------------
            // qrBitBuffer
            //---------------------------------------------------------------------

            var qrBitBuffer = function qrBitBuffer() {

                var _buffer = new Array();
                var _length = 0;

                var _this = {};

                _this.getBuffer = function () {
                    return _buffer;
                };

                _this.get = function (index) {
                    var bufIndex = Math.floor(index / 8);
                    return (_buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
                };

                _this.put = function (num, length) {
                    for (var i = 0; i < length; i += 1) {
                        _this.putBit((num >>> length - i - 1 & 1) == 1);
                    }
                };

                _this.getLengthInBits = function () {
                    return _length;
                };

                _this.putBit = function (bit) {

                    var bufIndex = Math.floor(_length / 8);
                    if (_buffer.length <= bufIndex) {
                        _buffer.push(0);
                    }

                    if (bit) {
                        _buffer[bufIndex] |= 0x80 >>> _length % 8;
                    }

                    _length += 1;
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // qr8BitByte
            //---------------------------------------------------------------------

            var qr8BitByte = function qr8BitByte(data) {

                var _mode = QRMode.MODE_8BIT_BYTE;
                var _data = data;
                var _bytes = qrcode.stringToBytes(data);

                var _this = {};

                _this.getMode = function () {
                    return _mode;
                };

                _this.getLength = function (buffer) {
                    return _bytes.length;
                };

                _this.write = function (buffer) {
                    for (var i = 0; i < _bytes.length; i += 1) {
                        buffer.put(_bytes[i], 8);
                    }
                };

                return _this;
            };

            //=====================================================================
            // GIF Support etc.
            //

            //---------------------------------------------------------------------
            // byteArrayOutputStream
            //---------------------------------------------------------------------

            var byteArrayOutputStream = function byteArrayOutputStream() {

                var _bytes = new Array();

                var _this = {};

                _this.writeByte = function (b) {
                    _bytes.push(b & 0xff);
                };

                _this.writeShort = function (i) {
                    _this.writeByte(i);
                    _this.writeByte(i >>> 8);
                };

                _this.writeBytes = function (b, off, len) {
                    off = off || 0;
                    len = len || b.length;
                    for (var i = 0; i < len; i += 1) {
                        _this.writeByte(b[i + off]);
                    }
                };

                _this.writeString = function (s) {
                    for (var i = 0; i < s.length; i += 1) {
                        _this.writeByte(s.charCodeAt(i));
                    }
                };

                _this.toByteArray = function () {
                    return _bytes;
                };

                _this.toString = function () {
                    var s = '';
                    s += '[';
                    for (var i = 0; i < _bytes.length; i += 1) {
                        if (i > 0) {
                            s += ',';
                        }
                        s += _bytes[i];
                    }
                    s += ']';
                    return s;
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // base64EncodeOutputStream
            //---------------------------------------------------------------------

            var base64EncodeOutputStream = function base64EncodeOutputStream() {

                var _buffer = 0;
                var _buflen = 0;
                var _length = 0;
                var _base64 = '';

                var _this = {};

                var writeEncoded = function writeEncoded(b) {
                    _base64 += String.fromCharCode(encode(b & 0x3f));
                };

                var encode = function encode(n) {
                    if (n < 0) {
                        // error.
                    } else if (n < 26) {
                        return 0x41 + n;
                    } else if (n < 52) {
                        return 0x61 + (n - 26);
                    } else if (n < 62) {
                        return 0x30 + (n - 52);
                    } else if (n == 62) {
                        return 0x2b;
                    } else if (n == 63) {
                        return 0x2f;
                    }
                    throw new Error('n:' + n);
                };

                _this.writeByte = function (n) {

                    _buffer = _buffer << 8 | n & 0xff;
                    _buflen += 8;
                    _length += 1;

                    while (_buflen >= 6) {
                        writeEncoded(_buffer >>> _buflen - 6);
                        _buflen -= 6;
                    }
                };

                _this.flush = function () {

                    if (_buflen > 0) {
                        writeEncoded(_buffer << 6 - _buflen);
                        _buffer = 0;
                        _buflen = 0;
                    }

                    if (_length % 3 != 0) {
                        // padding
                        var padlen = 3 - _length % 3;
                        for (var i = 0; i < padlen; i += 1) {
                            _base64 += '=';
                        }
                    }
                };

                _this.toString = function () {
                    return _base64;
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // base64DecodeInputStream
            //---------------------------------------------------------------------

            var base64DecodeInputStream = function base64DecodeInputStream(str) {

                var _str = str;
                var _pos = 0;
                var _buffer = 0;
                var _buflen = 0;

                var _this = {};

                _this.read = function () {

                    while (_buflen < 8) {

                        if (_pos >= _str.length) {
                            if (_buflen == 0) {
                                return -1;
                            }
                            throw new Error('unexpected end of file./' + _buflen);
                        }

                        var c = _str.charAt(_pos);
                        _pos += 1;

                        if (c == '=') {
                            _buflen = 0;
                            return -1;
                        } else if (c.match(/^\s$/)) {
                            // ignore if whitespace.
                            continue;
                        }

                        _buffer = _buffer << 6 | decode(c.charCodeAt(0));
                        _buflen += 6;
                    }

                    var n = _buffer >>> _buflen - 8 & 0xff;
                    _buflen -= 8;
                    return n;
                };

                var decode = function decode(c) {
                    if (0x41 <= c && c <= 0x5a) {
                        return c - 0x41;
                    } else if (0x61 <= c && c <= 0x7a) {
                        return c - 0x61 + 26;
                    } else if (0x30 <= c && c <= 0x39) {
                        return c - 0x30 + 52;
                    } else if (c == 0x2b) {
                        return 62;
                    } else if (c == 0x2f) {
                        return 63;
                    } else {
                        throw new Error('c:' + c);
                    }
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // gifImage (B/W)
            //---------------------------------------------------------------------

            var gifImage = function gifImage(width, height) {

                var _width = width;
                var _height = height;
                var _data = new Array(width * height);

                var _this = {};

                _this.setPixel = function (x, y, pixel) {
                    _data[y * _width + x] = pixel;
                };

                _this.write = function (out) {

                    //---------------------------------
                    // GIF Signature

                    out.writeString('GIF87a');

                    //---------------------------------
                    // Screen Descriptor

                    out.writeShort(_width);
                    out.writeShort(_height);

                    out.writeByte(0x80); // 2bit
                    out.writeByte(0);
                    out.writeByte(0);

                    //---------------------------------
                    // Global Color Map

                    // black
                    out.writeByte(0x00);
                    out.writeByte(0x00);
                    out.writeByte(0x00);

                    // white
                    out.writeByte(0xff);
                    out.writeByte(0xff);
                    out.writeByte(0xff);

                    //---------------------------------
                    // Image Descriptor

                    out.writeString(',');
                    out.writeShort(0);
                    out.writeShort(0);
                    out.writeShort(_width);
                    out.writeShort(_height);
                    out.writeByte(0);

                    //---------------------------------
                    // Local Color Map

                    //---------------------------------
                    // Raster Data

                    var lzwMinCodeSize = 2;
                    var raster = getLZWRaster(lzwMinCodeSize);

                    out.writeByte(lzwMinCodeSize);

                    var offset = 0;

                    while (raster.length - offset > 255) {
                        out.writeByte(255);
                        out.writeBytes(raster, offset, 255);
                        offset += 255;
                    }

                    out.writeByte(raster.length - offset);
                    out.writeBytes(raster, offset, raster.length - offset);
                    out.writeByte(0x00);

                    //---------------------------------
                    // GIF Terminator
                    out.writeString(';');
                };

                var bitOutputStream = function bitOutputStream(out) {

                    var _out = out;
                    var _bitLength = 0;
                    var _bitBuffer = 0;

                    var _this = {};

                    _this.write = function (data, length) {

                        if (data >>> length != 0) {
                            throw new Error('length over');
                        }

                        while (_bitLength + length >= 8) {
                            _out.writeByte(0xff & (data << _bitLength | _bitBuffer));
                            length -= 8 - _bitLength;
                            data >>>= 8 - _bitLength;
                            _bitBuffer = 0;
                            _bitLength = 0;
                        }

                        _bitBuffer = data << _bitLength | _bitBuffer;
                        _bitLength = _bitLength + length;
                    };

                    _this.flush = function () {
                        if (_bitLength > 0) {
                            _out.writeByte(_bitBuffer);
                        }
                    };

                    return _this;
                };

                var getLZWRaster = function getLZWRaster(lzwMinCodeSize) {

                    var clearCode = 1 << lzwMinCodeSize;
                    var endCode = (1 << lzwMinCodeSize) + 1;
                    var bitLength = lzwMinCodeSize + 1;

                    // Setup LZWTable
                    var table = lzwTable();

                    for (var i = 0; i < clearCode; i += 1) {
                        table.add(String.fromCharCode(i));
                    }
                    table.add(String.fromCharCode(clearCode));
                    table.add(String.fromCharCode(endCode));

                    var byteOut = byteArrayOutputStream();
                    var bitOut = bitOutputStream(byteOut);

                    // clear code
                    bitOut.write(clearCode, bitLength);

                    var dataIndex = 0;

                    var s = String.fromCharCode(_data[dataIndex]);
                    dataIndex += 1;

                    while (dataIndex < _data.length) {

                        var c = String.fromCharCode(_data[dataIndex]);
                        dataIndex += 1;

                        if (table.contains(s + c)) {

                            s = s + c;
                        } else {

                            bitOut.write(table.indexOf(s), bitLength);

                            if (table.size() < 0xfff) {

                                if (table.size() == 1 << bitLength) {
                                    bitLength += 1;
                                }

                                table.add(s + c);
                            }

                            s = c;
                        }
                    }

                    bitOut.write(table.indexOf(s), bitLength);

                    // end code
                    bitOut.write(endCode, bitLength);

                    bitOut.flush();

                    return byteOut.toByteArray();
                };

                var lzwTable = function lzwTable() {

                    var _map = {};
                    var _size = 0;

                    var _this = {};

                    _this.add = function (key) {
                        if (_this.contains(key)) {
                            throw new Error('dup key:' + key);
                        }
                        _map[key] = _size;
                        _size += 1;
                    };

                    _this.size = function () {
                        return _size;
                    };

                    _this.indexOf = function (key) {
                        return _map[key];
                    };

                    _this.contains = function (key) {
                        return typeof _map[key] != 'undefined';
                    };

                    return _this;
                };

                return _this;
            };

            var createImgTag = function createImgTag(width, height, getPixel, alt) {

                var gif = gifImage(width, height);
                for (var y = 0; y < height; y += 1) {
                    for (var x = 0; x < width; x += 1) {
                        gif.setPixel(x, y, getPixel(x, y));
                    }
                }

                var b = byteArrayOutputStream();
                gif.write(b);

                var base64 = base64EncodeOutputStream();
                var bytes = b.toByteArray();
                for (var i = 0; i < bytes.length; i += 1) {
                    base64.writeByte(bytes[i]);
                }
                base64.flush();

                var img = '';
                img += '<img';
                img += " src=\"";
                img += 'data:image/gif;base64,';
                img += base64;
                img += '"';
                img += " width=\"";
                img += width;
                img += '"';
                img += " height=\"";
                img += height;
                img += '"';
                if (alt) {
                    img += " alt=\"";
                    img += alt;
                    img += '"';
                }
                img += '/>';

                return img;
            };

            //---------------------------------------------------------------------
            // returns qrcode function.

            return qrcode;
        }();
    }, {}], 7: [function (require, module, exports) {
        module.exports = {
            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "footer", attrs: { class: "footer text-right" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: ["2016 © Attic Lab."] }] }] }] };
            }
        };
    }, {}], 8: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');

        /*****/
        var Scanner = require('../components/Scanner.js');

        module.exports = {

            controller: function controller() {
                var ctrl = this;

                this.visible = m.prop(false);

                this.toggleVisible = function () {
                    this.visible(!this.visible());

                    if (this.visible()) {
                        $('#mobile-spec-menu').css('max-height', $(window).height() - $('.topbar-main').height());
                    }
                };
            },

            view: function view(ctrl) {
                return { tag: "header", attrs: { id: "topnav" }, children: [{ tag: "div", attrs: { class: "topbar-main" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "a", attrs: { href: "/", config: m.route, class: "logo" }, children: [Conf.localeStr == 'uk' || Conf.localeStr == 'ru' ? { tag: "img", attrs: { src: "./assets/img/white_yellow_ua.svg", alt: "" } } : { tag: "img", attrs: { src: "./assets/img/white_yellow_en.svg", alt: "", style: "margin-top: 11px !important" } }] }, { tag: "div", attrs: { class: "menu-extras" }, children: [{ tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: Auth.logout }, children: [{ tag: "i", attrs: { class: "fa fa-power-off m-r-5" } }, Conf.tr("Logout")] }] }] }, { tag: "div", attrs: { class: "menu-item" }, children: [{ tag: "a", attrs: { onclick: ctrl.toggleVisible.bind(ctrl),
                                            class: ctrl.visible() ? 'open navbar-toggle' : 'navbar-toggle' }, children: [{ tag: "div", attrs: { class: "lines" }, children: [{ tag: "span", attrs: {} }, { tag: "span", attrs: {} }, { tag: "span", attrs: {} }] }] }] }] }] }] }, { tag: "div", attrs: { class: "navbar-custom" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { id: "navigation", style: ctrl.visible() ? 'display:block;' : '' }, children: [{ tag: "ul", attrs: { class: "navigation-menu", id: "mobile-spec-menu" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/", config: m.route }, children: [{ tag: "i", attrs: { class: "md md-dashboard" } }, Conf.tr("Dashboard")] }] }, { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/payments", config: m.route }, children: [{ tag: "i", attrs: { class: "md md-list" } }, Conf.tr("Payments")] }] }, { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/transfer", config: m.route }, children: [{ tag: "i", attrs: {
                                                    class: "fa fa-money" } }, Conf.tr("Transfer money")] }] }, { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/invoice", config: m.route }, children: [{ tag: "i", attrs: {
                                                    class: "md md-payment" } }, Conf.tr("Create invoice")] }] }, { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/settings", config: m.route }, children: [{ tag: "i", attrs: { class: "md md-settings" } }, Conf.tr("Settings")] }] }, { tag: "li", attrs: { class: "has-submenu" }, children: [m.component(Scanner)] }, { tag: "li", attrs: { class: "visible-xs" }, children: [{ tag: "a", attrs: { href: "#", onclick: Auth.logout }, children: [{ tag: "i", attrs: { class: "fa fa-power-off m-r-5" } }, Conf.tr("Logout")] }] }] }] }] }] }] };
            }
        };
    }, { "../components/Scanner.js": 10, "../config/Config.js": 11, "../models/Auth.js": 15 }], 9: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');
        var DateFormat = require('dateformat');

        module.exports = {
            controller: function controller() {},

            view: function view(ctrl, data) {
                return !data || !data.payments.length ? { tag: "p", attrs: { class: "text-primary" }, children: [Conf.tr("No payments yet")] } : { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "visible-xs" }, children: [data.payments.map(function (payment, index) {
                            var trans_link = payment._links.transaction.href;
                            var trans_id = trans_link.substr(trans_link.lastIndexOf('/') + 1);
                            var accountId = payment.to == Auth.keypair().accountId() ? payment.from : payment.to;
                            //The reason for send an amount and asset code instead of payment id is that there is
                            //no method in SDK to get payment by id.
                            var trans_url = '/transaction/' + trans_id + '/' + accountId + '/' + payment.amount + '/' + payment.asset_code;
                            return { tag: "div", attrs: { class: "payment" }, children: [{ tag: "a", attrs: { class: "account_overflow", href: trans_url, config: m.route,
                                        title: accountId }, children: [accountId] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-7" }, children: [{ tag: "p", attrs: { class: "text-muted" }, children: [DateFormat(payment.closed_at, 'dd.mm.yyyy HH:MM:ss')] }] }, { tag: "div", attrs: { class: "col-xs-5 text-right" }, children: [payment.to == Auth.keypair().accountId() ? { tag: "span", attrs: { class: "label label-success" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-in fa-fw",
                                                    "aria-hidden": "true" } }, " ", parseFloat(payment.amount).toFixed(2), " ", Conf.asset] } : { tag: "span", attrs: { class: "label label-danger" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-out fa-fw",
                                                    "aria-hidden": "true" } }, " ", parseFloat(payment.amount).toFixed(2), " ", Conf.asset] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] };
                        })] }, { tag: "div", attrs: { class: "hidden-xs" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Account id")] }, { tag: "th", attrs: {}, children: [Conf.tr("Date")] }, { tag: "th", attrs: {}, children: [Conf.tr("Amount")] }, { tag: "th", attrs: {}, children: [Conf.tr("Type")] }] }] }, { tag: "tbody", attrs: {}, children: [data.payments.map(function (payment) {
                                    var trans_link = payment._links.transaction.href;
                                    var trans_id = trans_link.substr(trans_link.lastIndexOf('/') + 1);
                                    var accountId = payment.to == Auth.keypair().accountId() ? payment.from : payment.to;
                                    //The reason for send an amount and asset code instead of payment id is that there is
                                    //no method in SDK to get payment by id.
                                    var trans_url = '/transaction/' + trans_id + '/' + accountId + '/' + payment.amount + '/' + payment.asset_code;
                                    return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: { class: "account-td" }, children: [{ tag: "a", attrs: { class: "account_overflow", href: trans_url, config: m.route }, children: [accountId] }] }, { tag: "td", attrs: {}, children: [DateFormat(payment.closed_at, 'dd.mm.yyyy HH:MM:ss')] }, { tag: "td", attrs: {}, children: [parseFloat(payment.amount).toFixed(2), " ", Conf.asset] }, { tag: "td", attrs: {}, children: [payment.to == Auth.keypair().accountId() ? { tag: "span", attrs: { class: "label label-success" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-in fa-fw", "aria-hidden": "true" } }, " ", Conf.tr("Debit")] } : { tag: "span", attrs: { class: "label label-danger" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-out fa-fw", "aria-hidden": "true" } }, " ", Conf.tr("Credit")] }] }] };
                                })] }] }] }] };
            }
        };
    }, { "../config/Config.js": 11, "../models/Auth.js": 15, "dateformat": 2 }], 10: [function (require, module, exports) {
        /*****/
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');

        var QR_TYPE_SEND_MONEY = 1;
        var QR_TYPE_DEBIT_CARD = 2;

        var Scanner = module.exports = {

            controller: function controller() {
                var ctrl = this;

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.scanCode = function () {
                    return Auth.checkConnection().then(cordova.plugins.barcodeScanner.scan(function (result) {
                        if (result.text.substr(0, 4) == 'http') {
                            var xhr = new XMLHttpRequest();
                            xhr.open('GET', 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyDqY4a5m2DS-pV9LwENP_kofNb0FaXORrg&shortUrl=' + result.text);
                            xhr.onload = function () {
                                var params = JSON.parse(xhr.responseText);
                                var p = params['longUrl'].split('?')[1].split('&');
                                var result = {};
                                p.forEach(function (pair) {
                                    pair = pair.split('=');
                                    result[pair[0]] = pair[1] || '';
                                });
                                var getString = '?seed=' + result['seed'];
                                return m.route('/cards' + getString);
                            };
                            xhr.send();
                        } else {
                            var params = JSON.parse(result.text);

                            switch (parseInt(params.t)) {
                                case QR_TYPE_SEND_MONEY:
                                    {
                                        var getString = '?account=' + params.account;
                                        getString += '&amount=' + params.amount;
                                        getString += '&asset=' + params.asset;
                                        getString += '&type=' + params.t;
                                        getString += '&memo=' + params.m;
                                        return m.route('/transfer' + getString);
                                    }
                                    break;
                                case QR_TYPE_DEBIT_CARD:
                                    {
                                        var getString = '?seed=' + params.seed;
                                        return m.route('/cards' + getString);
                                    }
                                    break;
                                default:
                                    {
                                        m.flashError(Conf.tr('Unknown function number'));
                                        return;
                                    }
                                    break;
                            }
                        }
                    }, function (error) {
                        m.flashError(Conf.tr('Scanning failed: ' + error));
                        return;
                    }, {
                        "preferFrontCamera": false, // iOS and Android
                        "showFlipCameraButton": true, // iOS and Android
                        "prompt": Conf.tr("Place a barcode inside the scan area"), // supported on Android only
                        "formats": "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                        "orientation": "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
                    })).catch(function (err) {
                        m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                        return;
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "a", attrs: { href: "#", onclick: ctrl.scanCode.bind(ctrl) }, children: [{ tag: "i", attrs: { class: "md md-border-outer" } }, Conf.tr("Scan code")] };
            }
        };
    }, { "../config/Config.js": 11, "../models/Auth.js": 15 }], 11: [function (require, module, exports) {
        var Localize = require('localize');
        var Locales = require('../locales/translations.js');

        var conf = {
            master_key: 'GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA',
            horizon_host: 'http://blockchain.euah.pw',
            assets_url: 'assets',
            keyserver_host: 'http://keys.euah.pw',
            keyserver_v_url: '/v2/wallets',
            api_host: 'http://api.euah.pw',
            asset: 'EUAH'
        };

        conf.phone = {
            view_mask: "+99 (999) 999-99-99",
            db_mask: "999999999999",
            length: 10,
            prefix: "+38"
        };

        StellarSdk.Network.use(new StellarSdk.Network('euah.network'));
        conf.horizon = new StellarSdk.Server(conf.horizon_host);

        conf.locales = Locales;

        conf.payments = {
            onpage: 10
        };

        conf.loc = new Localize(conf.locales);
        conf.loc.throwOnMissingTranslation(false);
        /*****/conf.localeStr = typeof navigator.language != 'undefined' ? navigator.language.substring(0, 2) : "uk";
        /*****/conf.loc.setLocale(conf.localeStr);
        conf.tr = conf.loc.translate; //short alias for translation

        conf.networkStatus = null;

        var Config = module.exports = conf;
    }, { "../locales/translations.js": 14, "localize": 3 }], 12: [function (require, module, exports) {
        var errors = {
            assets_get_fail: 'Failed to get anonymous assets from horizon',
            assets_empty: 'List of assets is empty',
            assets_get_timeout: 'Request to horizon exceeded timeout time'
        };

        var Errors = module.exports = errors;
    }, {}], 13: [function (require, module, exports) {
        var Conf = require('./config/Config.js');

        // Loading spinner
        m.onLoadingStart = function (stage) {
            /*if (typeof stage != 'undefined') {
                document.getElementById('data-stage').innerHTML = stage;
            }*/
            m.onIdleEnd();
            document.getElementById('spinner').style.display = 'block';
        };
        m.onLoadingEnd = function () {
            document.getElementById('spinner').style.display = 'none';
        };
        m.onIdleStart = function (stage) {
            /*if (typeof stage != 'undefined') {
                document.getElementById('idle-stage').innerHTML = stage;
            }*/
            m.onLoadingEnd();
            document.getElementById('spinner').style.display = 'block';
        };
        m.onIdleEnd = function () {
            document.getElementById('spinner').style.display = 'none';
        };

        // Wrapper for notification which stops animation
        m.flashError = function (msg) {
            m.onLoadingEnd();
            m.onIdleEnd();
            $.Notification.notify('error', 'top left', Conf.tr("Error"), msg);
        };
        m.flashApiError = function (err) {
            if (err && typeof err.message != 'undefined' && err.message == 'Invalid signature') {
                window.location.href = '/';
                return;
            }
            m.onLoadingEnd();
            m.onIdleEnd();
            var msg = err.message ? Conf.tr(err.message) + (err.description ? ': ' + Conf.tr(err.description) : '') : Conf.tr('Unknown error. Contact support');
            $.Notification.notify('error', 'top left', Conf.tr("Error"), msg);
        };
        m.flashSuccess = function (msg) {
            m.onLoadingEnd();
            m.onIdleEnd();
            $.Notification.notify('success', 'top left', Conf.tr("Success"), msg);
        };

        var app = {
            // Application Constructor
            initialize: function initialize() {
                this.bindEvents();
            },
            // Bind Event Listeners
            //
            // Bind any events that are required on startup. Common events are:
            // `load`, `deviceready`, `offline`, and `online`.
            bindEvents: function bindEvents() {
                document.addEventListener('deviceready', this.onDeviceReady, false);
            },

            // deviceready Event Handler
            //
            // The scope of `this` is the event. In order to call the `receivedEvent`
            // function, we must explicity call `app.receivedEvent(...);`
            onDeviceReady: function onDeviceReady() {
                // Routing
                m.route.mode = 'hash';
                m.route(document.getElementById('app'), "/", {
                    "/": require('./pages/Login.js'),
                    "/home": require('./pages/Home.js'),
                    "/logout": require('./pages/Logout.js'),
                    "/invoice": require('./pages/Invoice.js'),
                    "/sign": require('./pages/Sign.js'),
                    "/transfer": require('./pages/Transfer.js'),
                    "/settings": require('./pages/Settings.js'),
                    "/transaction/:trans_id/:target_acc/:amount/:asset": require('./pages/Transaction.js'),
                    "/cards": require('./pages/Cards.js'),
                    "/payments": require('./pages/Payments.js')
                });

                app.receivedEvent('spinner');
            },

            // Update DOM on a Received Event
            receivedEvent: function receivedEvent(id) {
                var parentElement = document.getElementById(id);
                parentElement.setAttribute('style', 'display:none;');

                document.addEventListener("offline", function () {
                    if (Conf.networkStatus !== false) {
                        m.flashError(Conf.tr('No internet connection'));
                        Conf.networkStatus = false;
                    }
                }, false);

                document.addEventListener("online", function () {
                    if (Conf.networkStatus === false) {
                        m.flashSuccess(Conf.tr("Internet connection established"));
                        Conf.networkStatus = true;
                    }
                }, false);

                if (device != 'undefined' && //it is if network plugin can't work
                device.platform != 'undefined' && device.platform != 'browser') {
                    Conf.networkStatus = true;
                }
            }
        };

        app.initialize();
    }, { "./config/Config.js": 11, "./pages/Cards.js": 16, "./pages/Home.js": 17, "./pages/Invoice.js": 18, "./pages/Login.js": 19, "./pages/Logout.js": 20, "./pages/Payments.js": 21, "./pages/Settings.js": 22, "./pages/Sign.js": 23, "./pages/Transaction.js": 24, "./pages/Transfer.js": 25 }], 14: [function (require, module, exports) {
        var _module$exports;

        module.exports = (_module$exports = {
            "Dashboard": {
                'en': "Dashboard",
                'ru': "Обзор",
                'uk': "Огляд"
            },
            "Transfer money": {
                'en': "Transfer money",
                'ru': "Перевод денег",
                'uk': "Переведення грошей"
            },
            "Create invoice": {
                'en': "Create invoice",
                'ru': "Создать инвойс",
                'uk': "Створити інвойс"
            },
            "Settings": {
                'en': "Settings",
                'ru': "Настройки",
                'uk': "Налаштування"
            },
            "Login": {
                'en': "Login",
                'ru': "Войти",
                'uk': "Увійти"
            },
            "Logout": {
                'en': "Logout",
                'ru': "Выход",
                'uk': "Вихід"
            },
            "Substitution: $[1]": {
                "es": "Sustitución: $[1]",
                "sr": "замена: $[1]"
            },
            "Bad code": {
                'en': "Bad code",
                'ru': "Неверный код",
                'uk': "Невірний код"
            },
            "Check value": {
                'en': "Check value",
                'ru': "Проверьте значение",
                'uk': "Перевірте значення"
            },
            "Welcome": {
                'en': "Welcome",
                'ru': "Добро пожаловать",
                'uk': "Вітаємо"
            },
            "Account info": {
                'en': "Account info",
                'ru': "Информация о счете",
                'uk': "Інформація про рахунок"
            },
            "Type": {
                'en': "Type",
                'ru': "Тип",
                'uk': "Тип"
            },
            "Balance": {
                'en': "Balance",
                'ru': "Баланс",
                'uk': "Баланс"
            },
            "Account transactions": {
                'en': "Account transactions",
                'ru': "Операции по счету",
                'uk': "Операції по рахунку"
            },
            "Overview of recent transactions": {
                'en': "Overview of recent transactions",
                'ru': "Обзор последних операций",
                'uk': "Огляд останніх операцій"
            },
            "Account id": {
                'en': "Account id",
                'ru': "Номер счета",
                'uk': "Номер рахунку"
            },
            "Amount": {
                'en': "Amount",
                'ru': "Сумма",
                'uk': "Сума"
            },
            "Asset": {
                'en': "Asset",
                'ru': "Валюта",
                'uk': "Валюта"
            },
            "Debit": {
                'en': "Debit",
                'ru': "Дебет",
                'uk': "Дебет"
            },
            "Credit": {
                'en': "Credit",
                'ru': "Кредит",
                'uk': "Кредит"
            },
            "Login/password combination is invalid": {
                'en': "Login/password combination is invalid",
                'ru': "Неверный логин или пароль",
                'uk': "Невірний логін або пароль"
            },
            "Connection error": {
                'en': "Connection error",
                'ru': "Ошибка подключения",
                'uk': "Помилка з'єднання"
            },
            "Username": {
                'en': "Username",
                'ru': "Логин",
                'uk': "Логін"
            },
            "Password": {
                'en': "Password",
                'ru': "Пароль",
                'uk': "Пароль"
            },
            "Retype Password": {
                'en': "Retype Password",
                'ru': "Повторите пароль",
                'uk': "Повторіть пароль"
            },
            "Create an account": {
                'en': "Create an account",
                'ru': "Создать аккаунт",
                'uk': "Створити аккаунт"
            },
            "Log in": {
                'en': "Log in",
                'ru': "Войти",
                'uk': "Увійти"
            },
            "Please, fill all required fields": {
                'en': "Please, fill all required fields",
                'ru': "Пожалуйста, заполните все обязательные поля",
                'uk': "Будь ласка, заповніть всі обов'язкові поля"
            },
            "Password should have 6 chars min": {
                'en': "Password should have 6 chars min",
                'ru': "Минимальная длина пароля - 6 символов",
                'uk': "Мінімальна довжина пароля - 6 символів"
            },
            "Passwords should match": {
                'en': "Passwords should match",
                'ru': "Пароли должны совпадать",
                'uk': "Паролі повинні співпадати"
            },
            "Login already used": {
                'en': "Login already used",
                'ru': "Логин уже используется",
                'uk': "Логін вже використовується"
            },
            "Service error. Please contact support": {
                'en': "Service error. Please contact support",
                'ru': "Системная ошибка. Обратитесь в службу поддержки",
                'uk': "Системна помилка. Зверніться в службу підтримки"
            },
            "Registration successful": {
                'en': "Registration successful",
                'ru': "Регистрация прошла успешно",
                'uk': "Реєстрація пройшла успішно"
            },
            "Print this QR-code and keep it in secure place. This is the only possible way to recover your password": {
                'en': "Print this QR-code and keep it in secure place. This is the only possible way to recover your password",
                'ru': "Распечатайте этот QR-код и храните его в надежном месте. Это единственний возможный способ восстановить пароль",
                'uk': "Роздрукуйте цей QR-код і зберігайте його в надійному місці. Це єдиний можливий спосіб відновити пароль"
            },
            "Save code": {
                'en': "Save code",
                'ru': "Сохранить код",
                'uk': "Зберегти код"
            },
            "Sign up new account": {
                'en': "Sign up new account",
                'ru': "Создать новый аккаунт",
                'uk': "Створити новий аккаунт"
            },
            "Characters and numbers allowed": {
                'en': "Characters and numbers allowed",
                'ru': "Символы и цифры разрешены",
                'uk': "Символи та цифри дозволені"
            },
            "6 characters minimum": {
                'en': "6 characters minimum",
                'ru': "Минимум 6 символов",
                'uk': "Мінімум 6 символів"
            }
        }, _defineProperty(_module$exports, "Log in", {
            'en': "Log in",
            'ru': "Войти",
            'uk': "Увійти"
        }), _defineProperty(_module$exports, "Sign up", {
            'en': "Sign up",
            'ru': "Регистрация",
            'uk': "Реєстрація"
        }), _defineProperty(_module$exports, "Error", {
            'en': "Error",
            'ru': "Ошибка",
            'uk': "Помилка"
        }), _defineProperty(_module$exports, "Success", {
            'en': "Success",
            'ru': "Успешно",
            'uk': "Успішно"
        }), _defineProperty(_module$exports, "Invoice", {
            'en': "Invoice",
            'ru': "Счет-фактура",
            'uk': "Рахунок-фактура"
        }), _defineProperty(_module$exports, "Invoice created", {
            'en': "Invoice created",
            'ru': "Счет-фактура создан",
            'uk': "Рахунок-фактура створений"
        }), _defineProperty(_module$exports, "Create a new invoice", {
            'en': "Create a new invoice",
            'ru': "Создать новый счет-фактуру",
            'uk': "Створити новий рахунок-фактуру"
        }), _defineProperty(_module$exports, "Create", {
            'en': "Create",
            'ru': "Создать",
            'uk': "Створити"
        }), _defineProperty(_module$exports, "Invoice code", {
            'en': "Invoice code",
            'ru': "Код счета-фактуры",
            'uk': "Код рахунку-фактури"
        }), _defineProperty(_module$exports, "Copy this invoice code and share it with someone you need to get money from", {
            'en': "Copy this invoice code and share it with someone you need to get money from",
            'ru': "Скопируйте этот код счета-фактуры и поделитесь им с тем, от кого ожидаете средства",
            'uk': "Скопіюйте цей код рахунку-фактури та поділіться ним з тим, від кого очікуєте кошти"
        }), _defineProperty(_module$exports, "Create new", {
            'en': "Create new",
            'ru': "Создать новый",
            'uk': "Створити новий"
        }), _defineProperty(_module$exports, "New password cannot be same as old", {
            'en': "New password cannot be same as old",
            'ru': "Новый пароль не может быть таким же, как старый",
            'uk': "Новий пароль не може бути таким самим, як старий"
        }), _defineProperty(_module$exports, "Password changed", {
            'en': "Password changed",
            'ru': "Пароль изменен",
            'uk': "Пароль змінений"
        }), _defineProperty(_module$exports, "Cannot change password", {
            'en': "Cannot change password",
            'ru': "Не удается изменить пароль",
            'uk': "Не вдається змінити пароль"
        }), _defineProperty(_module$exports, "Invalid email", {
            'en': "Invalid email",
            'ru': "Неверный адрес электронной почты",
            'uk': "Невірна адреса електронної пошти"
        }), _defineProperty(_module$exports, "Invalid phone", {
            'en': "Invalid phone",
            'ru': "Неверный телефон",
            'uk': "Невірний телефон"
        }), _defineProperty(_module$exports, "Profile saved", {
            'en': "Profile saved",
            'ru': "Профиль сохранен",
            'uk': "Профіль збережений"
        }), _defineProperty(_module$exports, "Cannot update profile details", {
            'en': "Cannot update profile details",
            'ru': "Не удалось обновить данные профиля",
            'uk': "Не вдається оновити дані профілю"
        }), _defineProperty(_module$exports, "Change password", {
            'en': "Change password",
            'ru': "Изменить пароль",
            'uk': "Змінити пароль"
        }), _defineProperty(_module$exports, "Old password", {
            'en': "Old password",
            'ru': "Старый пароль",
            'uk': "Старий пароль"
        }), _defineProperty(_module$exports, "New password", {
            'en': "New password",
            'ru': "Новый пароль",
            'uk': "Новий пароль"
        }), _defineProperty(_module$exports, "Repeat new password", {
            'en': "Repeat new password",
            'ru': "Повторите новый пароль",
            'uk': "Повторіть новий пароль"
        }), _defineProperty(_module$exports, "Change", {
            'en': "Change",
            'ru': "Изменить",
            'uk': "Змінити"
        }), _defineProperty(_module$exports, "Change additional data", {
            'en': "Change additional data",
            'ru': "Изменить дополнительные данные",
            'uk': "Змінити додаткові дані"
        }), _defineProperty(_module$exports, "Phone", {
            'en': "Phone",
            'ru': "Телефон",
            'uk': "Телефон"
        }), _defineProperty(_module$exports, "Email", {
            'en': "Email",
            'ru': "Электронная почта",
            'uk': "Електронна пошта"
        }), _defineProperty(_module$exports, "Save", {
            'en': "Save",
            'ru': "Сохранить",
            'uk': "Зберегти"
        }), _defineProperty(_module$exports, "Can't load account by transaction", {
            'en': "Can't load account by transaction",
            'ru': "Не удается загрузить счет по транзакции",
            'uk': "Неможливо завантажити рахунок по транзакції"
        }), _defineProperty(_module$exports, "Transaction loading error", {
            'en': "Transaction loading error",
            'ru': "Ошибка при загрузке транзакции",
            'uk': "Помилка при завантаженні транзакції"
        }), _defineProperty(_module$exports, "Back", {
            'en': "Back",
            'ru': "Назад",
            'uk': "Назад"
        }), _defineProperty(_module$exports, "Transaction", {
            'en': "Transaction",
            'ru': "Транзакция",
            'uk': "Транзакція"
        }), _defineProperty(_module$exports, "Created at", {
            'en': "Created at",
            'ru': "Создан",
            'uk': "Створено"
        }), _defineProperty(_module$exports, "Transaction memo", {
            'en': "Transaction memo",
            'ru': "Описание транзакции",
            'uk': "Опис транзакції"
        }), _defineProperty(_module$exports, "Target account ID", {
            'en': "Target account ID",
            'ru': "Счет получателя",
            'uk': "Рахунок отримувача"
        }), _defineProperty(_module$exports, "Transaction amount", {
            'en': "Transaction amount",
            'ru': "Сумма транзакции",
            'uk': "Сума транзакції"
        }), _defineProperty(_module$exports, "Target account balances", {
            'en': "Target account balances",
            'ru': "Балансы получателя",
            'uk': "Баланси отримувача"
        }), _defineProperty(_module$exports, "Target account type", {
            'en': "Target account type",
            'ru': "Тип счета получателя",
            'uk': "Тип рахунку отримувача"
        }), _defineProperty(_module$exports, "Target account on infohost", {
            'en': "Target account on infohost",
            'ru': "Информация по получателю",
            'uk': "Інформація по отримувачу"
        }), _defineProperty(_module$exports, "Infohost", {
            'en': "Infohost",
            'ru': "Infohost",
            'uk': "Infohost"
        }), _defineProperty(_module$exports, "Repeat this payment", {
            'en': "Repeat this payment",
            'ru': "Повторить платеж",
            'uk': "Повторити платіж"
        }), _defineProperty(_module$exports, "Repeat", {
            'en': "Repeat",
            'ru': "Повторить",
            'uk': "Повторити"
        }), _defineProperty(_module$exports, "Invalid invoice currency", {
            'en': "Invalid invoice currency",
            'ru': "Неверная валюта счета-фактури",
            'uk': "Невірна валюта рахунку-фактури"
        }), _defineProperty(_module$exports, "Invoice requested", {
            'en': "Invoice requested",
            'ru': "Счет-фактура запрошен",
            'uk': "Рахунок-фактура запрошений"
        }), _defineProperty(_module$exports, "User not found! Check phone number", {
            'en': "User not found! Check phone number",
            'ru': "Пользователь не найден. Проверьте номер телефона",
            'uk': "Користувач не знайден. Перевірте номер телефону"
        }), _defineProperty(_module$exports, "Account is invalid", {
            'en': "Account is invalid",
            'ru': "Неверный счет",
            'uk': "Невірний рахунок"
        }), _defineProperty(_module$exports, "Amount is invalid", {
            'en': "Amount is invalid",
            'ru': "Неверная сумма",
            'uk': "Невірна сума"
        }), _defineProperty(_module$exports, "Memo text is too long", {
            'en': "Memo text is too long",
            'ru': "Слишком длинное описание",
            'uk': "Занадто довгий опис"
        }), _defineProperty(_module$exports, "Can't send money to distribution agent!", {
            'en': "Can't send money to distribution agent!",
            'ru': "Невозможно перевести средства агенту по распространению",
            'uk': "Неможливо перевести кошки агенту по розповсюдженню"
        }), _defineProperty(_module$exports, "Transfer successful", {
            'en': "Transfer successful",
            'ru': "Успешно переведено",
            'uk': "Успішно переведено"
        }), _defineProperty(_module$exports, "Cannot make transfer", {
            'en': "Cannot make transfer",
            'ru': "Невозможно перевести",
            'uk': "Неможливо перевести"
        }), _defineProperty(_module$exports, "Can't load account for transaction", {
            'en': "Can't load account for transaction",
            'ru': "Не удается загрузить счет для транзакции",
            'uk': "Неможливо завантажити рахунок для транзакції"
        }), _defineProperty(_module$exports, "Transfer", {
            'en': "Transfer",
            'ru': "Перевод",
            'uk': "Переведення"
        }), _defineProperty(_module$exports, "Transfer type", {
            'en': "Transfer type",
            'ru': "Тип перевода",
            'uk': "Тип переведення"
        }), _defineProperty(_module$exports, "by account ID", {
            'en': "By account ID",
            'ru': "По счету",
            'uk': "По рахунку"
        }), _defineProperty(_module$exports, "by phone", {
            'en': "By phone",
            'ru': "По номеру телефона",
            'uk': "За номером телефону"
        }), _defineProperty(_module$exports, "by email", {
            'en': "By email",
            'ru': "По адресу эл. почты",
            'uk': "За адресою ел. пошти"
        }), _defineProperty(_module$exports, "Account ID should have 56 symbols", {
            'en': "Account ID should have 56 symbols",
            'ru': "Счет должен быть 56 символов",
            'uk': "Рухунок повинен бути 56 символів"
        }), _defineProperty(_module$exports, "Account ID", {
            'en': "Account ID",
            'ru': "Счет",
            'uk': "Рахунок"
        }), _defineProperty(_module$exports, "Phone number", {
            'en': "Phone number",
            'ru': "Номер телефона",
            'uk': "Номер телефону"
        }), _defineProperty(_module$exports, "Memo message", {
            'en': "Memo message",
            'ru': "Текст описание",
            'uk': "Текст опис"
        }), _defineProperty(_module$exports, "Request invoice", {
            'en': "Request invoice",
            'ru': "Запросить счет-фактуру",
            'uk': "Запросити рахунок-фактуру"
        }), _defineProperty(_module$exports, "Request", {
            'en': "Request",
            'ru': "Запросить",
            'uk': "Запросити"
        }), _defineProperty(_module$exports, "Transaction ID", {
            'en': "Transaction ID",
            'ru': "ID транзакции",
            'uk': "ID транзакції"
        }), _defineProperty(_module$exports, "Date", {
            'en': "Date",
            'ru': "Дата",
            'uk': "Дата"
        }), _defineProperty(_module$exports, "Overview of transactions history", {
            'en': "Overview of transactions history",
            'ru': "Обзор истории операций",
            'uk': "Огляд історії операцій"
        }), _defineProperty(_module$exports, "Payments", {
            'en': "Payments",
            'ru': "Операции",
            'uk': "Операції"
        }), _defineProperty(_module$exports, "All transactions", {
            'en': "All transactions",
            'ru': "Все операции",
            'uk': "Всі операції"
        }), _defineProperty(_module$exports, "No payments yet", {
            'en': "No payments yet",
            'ru': "Платежей пока нет",
            'uk': "Платежів поки немає"
        }), _defineProperty(_module$exports, "anonymous_user", {
            'en': "Anonymous user",
            'ru': "Анонимный пользователь",
            'uk': "Анонімний користувач"
        }), _defineProperty(_module$exports, "registered_user", {
            'en': "Registered user",
            'ru': "Зарегестрированный пользователь",
            'uk': "Зареєстрований користувач"
        }), _defineProperty(_module$exports, "merchant", {
            'en': "Merchant",
            'ru': "Мерчант",
            'uk': "Мерчант"
        }), _defineProperty(_module$exports, "distribution_agent", {
            'en': "Distribution agent",
            'ru': "Агент по распостранению",
            'uk': "Агент з розповсюдження"
        }), _defineProperty(_module$exports, "settlement_agent", {
            'en': "settlement_agent",
            'ru': "settlement_agent",
            'uk': "settlement_agent"
        }), _defineProperty(_module$exports, "exchange_agent", {
            'en': "exchange_agent",
            'ru': "exchange_agent",
            'uk': "exchange_agent"
        }), _defineProperty(_module$exports, "Username already exists", {
            'en': "Username already exists",
            'ru': "Логин уже занят",
            'uk': "Логін вже зайнятий"
        }), _defineProperty(_module$exports, "Invalid username", {
            'en': "Invalid username",
            'ru': "Неверный логин",
            'uk': "Невірний логін"
        }), _defineProperty(_module$exports, "Invalid TOTP code", {
            'en': "Invalid TOTP code",
            'ru': "Неверный код TOTP",
            'uk': "Невірний код TOTP"
        }), _defineProperty(_module$exports, "Invalid signature", {
            'en': "Invalid signature",
            'ru': "Неверная подпись",
            'uk': "Невірний підпис"
        }), _defineProperty(_module$exports, "Forbidden", {
            'en': "Forbidden",
            'ru': "Запрещено",
            'uk': "Заборонено"
        }), _defineProperty(_module$exports, "Invalid parameter: phone", {
            'en': "Invalid parameter: phone",
            'ru': "Неверный параметр: телефон",
            'uk': "Неверній параметр: телефон"
        }), _defineProperty(_module$exports, "Invalid parameter: email", {
            'en': "Invalid parameter: email",
            'ru': "Неверный параметр: эл. почта",
            'uk': "Неверній параметр: ел. пошта"
        }), _defineProperty(_module$exports, "User with this phone exists", {
            'en': "User with this phone exists",
            'ru': "Пользователь с таким телефоном уже существует",
            'uk': "Користувач з таким телефоном вже існує"
        }), _defineProperty(_module$exports, "User with this email exists", {
            'en': "User with this email exists",
            'ru': "Пользователь с такой эл. почтой уже существует",
            'uk': "Користувач з такою ел. поштою вже існує"
        }), _defineProperty(_module$exports, "Nothing to update", {
            'en': "Nothing to update",
            'ru': "Данные не претерпели изменений",
            'uk': "Дані не зазнали змін"
        }), _defineProperty(_module$exports, "Empty required parameter", {
            'en': "Empty required parameter",
            'ru': "Некоторые обязательные параметры отсутствуют",
            'uk': "Деякі обов'язкові параметри відсутні"
        }), _defineProperty(_module$exports, "Empty parameter: account id", {
            'en': "Empty parameter: account id",
            'ru': "Пустой параметр: счет",
            'uk': "Порожній параметр: рахунок"
        }), _defineProperty(_module$exports, "Empty parameter: asset", {
            'en': "Empty parameter: asset",
            'ru': "Пустой параметр: валюта",
            'uk': "Порожній параметр: валюта"
        }), _defineProperty(_module$exports, "Empty parameter: invoice id", {
            'en': "Empty parameter: invoice id",
            'ru': "Пустой параметр: номер инфойса",
            'uk': "Порожній параметр: номер інвойсу"
        }), _defineProperty(_module$exports, "Invalid parameter: amount", {
            'en': "Invalid parameter: amount",
            'ru': "Неверный параметр: сумма",
            'uk': "Неверній параметр: сума"
        }), _defineProperty(_module$exports, "Invalid parameter: asset", {
            'en': "Invalid parameter: asset",
            'ru': "Неверный параметр: валюта",
            'uk': "Неверній параметр: валюта"
        }), _defineProperty(_module$exports, "Invalid parameter: account id", {
            'en': "Invalid parameter: account id",
            'ru': "Неверный параметр: счет",
            'uk': "Неверній параметр: рахунок"
        }), _defineProperty(_module$exports, "Invalid parameter: invoice id", {
            'en': "Invalid parameter: invoice id",
            'ru': "Неверный параметр: номер инфойса",
            'uk': "Неверній параметр: номер інвойсу"
        }), _defineProperty(_module$exports, "Database error", {
            'en': "Database error",
            'ru': "Ошибка базы данных",
            'uk': "Помилка бази даних"
        }), _defineProperty(_module$exports, "Can not create invoice id", {
            'en': "Can not create invoice id",
            'ru': "Не удалось создать инвойс",
            'uk': "Не вдалося створити інвойс"
        }), _defineProperty(_module$exports, "Invoice not found", {
            'en': "Invoice not found",
            'ru': "Инвойс не найден",
            'uk': "Інвойс не знайдено"
        }), _defineProperty(_module$exports, "Invoice has expired", {
            'en': "Invoice has expired",
            'ru': "Инвойс просрочен",
            'uk': "Інвойс прострочений"
        }), _defineProperty(_module$exports, "Invoice was already requested", {
            'en': "Invoice was already requested",
            'ru': "Инвойс уже использован",
            'uk': "Інвойс вже використаний"
        }), _defineProperty(_module$exports, "IP-address is blocked", {
            'en': "IP-address is blocked",
            'ru': "IP-адрес заблокирован",
            'uk': "IP-адреса заблокована"
        }), _defineProperty(_module$exports, "IP-address exceeded the minute limit of missed requests", {
            'en': "IP-address exceeded the minute limit of missed requests",
            'ru': "Минутный лимит неверных запросов для ip-адреса превышен",
            'uk': "Хвилинний ліміт невірних запитів для ip-адреси перевищено"
        }), _defineProperty(_module$exports, "IP-address exceeded the daily limit of missed requests", {
            'en': "IP-address exceeded the daily limit of missed requests",
            'ru': "Дневной лимит неверных запросов для ip-адреса превышен",
            'uk': "Денний ліміт невірних запитів для ip-адреси перевищено"
        }), _defineProperty(_module$exports, "IP-address exceeded the daily limit of requests", {
            'en': "IP-address exceeded the daily limit of requests",
            'ru': "Дневной лимит запросов для ip-адреса превышен",
            'uk': "Денний ліміт запитів для ip-адреси перевищено"
        }), _defineProperty(_module$exports, "Account is blocked", {
            'en': "Account is blocked",
            'ru': "Счет заблокирован",
            'uk': "Рахунок заблоковано"
        }), _defineProperty(_module$exports, "Account exceeded the minute limit of missed requests", {
            'en': "Account exceeded the minute limit of missed requests",
            'ru': "Минутный лимит неверных запросов для счета превышен",
            'uk': "Хвилинний ліміт невірних запитів для рахунку перевищено"
        }), _defineProperty(_module$exports, "Account exceeded the daily limit of missed requests", {
            'en': "Account exceeded the daily limit of missed requests",
            'ru': "Дневной лимит неверных запросов для счета превышен",
            'uk': "Денний ліміт невірних запитів для рахунку перевищено"
        }), _defineProperty(_module$exports, "Account exceeded the daily limit of requests", {
            'en': "Account exceeded the daily limit of requests",
            'ru': "Дневной лимит запросов для счета превышен",
            'uk': "Денний ліміт запитів для рахунку перевищено"
        }), _defineProperty(_module$exports, "Account does not exist", {
            'en': "Account does not exist",
            'ru': "Счет не существует",
            'uk': "Рахунок не існує"
        }), _defineProperty(_module$exports, "Unknown error", {
            'en': "Unknown error",
            'ru': "Неизвестная ошибка, обратитесь к администратору",
            'uk': "Невідома помилка, зверніться до адміністратора"
        }), _defineProperty(_module$exports, "UpdateError", {
            'en': "UpdateError",
            'ru': "Ошибка",
            'uk': "Помилка"
        }), _defineProperty(_module$exports, "Scan", {
            'en': "Scan",
            'ru': "Сканировать",
            'uk': "Сканувати"
        }), _defineProperty(_module$exports, "Scan QR-Code", {
            'en': "Scan QR-Code",
            'ru': "Сканировать QR-Код",
            'uk': "Сканувати QR-Код"
        }), _defineProperty(_module$exports, "Place a barcode inside the scan area", {
            'en': "Place a barcode inside the scan area",
            'ru': "Поместите код в область сканирования",
            'uk': "Помістіть код в область сканування"
        }), _defineProperty(_module$exports, "Scanning failed", {
            'en': "Scanning failed: ",
            'ru': "Ошибка сканирования: ",
            'uk': "Помилка сканування: "
        }), _defineProperty(_module$exports, "Unknown function number", {
            'en': "Unknown function number",
            'ru': "Неизвестный номер функции",
            'uk': "Невідомий номер функції"
        }), _defineProperty(_module$exports, "Scan code", {
            'en': "Scan code",
            'ru': "Сканировать код",
            'uk': "Сканувати код"
        }), _defineProperty(_module$exports, "Card has no enough money in this asset!", {
            'en': "Card has no enough money!",
            'ru': "На карте недостаточно денег!",
            'uk': "На карті недостатньо коштів!"
        }), _defineProperty(_module$exports, "Funding successful", {
            'en': "Funding successful",
            'ru': "Зачисление успешно",
            'uk': "Зарахування успішне"
        }), _defineProperty(_module$exports, "Can't make funding", {
            'en': "Can't make funding",
            'ru': "Невозможно провести зачисление",
            'uk': "Неможливо провести зарахування"
        }), _defineProperty(_module$exports, "Card", {
            'en': "Card",
            'ru': "Карта",
            'uk': "Карта"
        }), _defineProperty(_module$exports, "Scratch card", {
            'en': "Scratch card",
            'ru': "Карта пополнения",
            'uk': "Карта поповнення"
        }), _defineProperty(_module$exports, "Your balance", {
            'en': "Your balance",
            'ru': "Ваш счет",
            'uk': "Ваші кошти"
        }), _defineProperty(_module$exports, "Card balance", {
            'en': "Card balance",
            'ru': "Счет карты",
            'uk': "Кошти на карті"
        }), _defineProperty(_module$exports, "How much do you want to redeem?", {
            'en': "How much do you want to redeem?",
            'ru': "Сколько Вы хотите перевести?",
            'uk': "Скільки Ви хочете перевести?"
        }), _defineProperty(_module$exports, "Get money", {
            'en': "Get money",
            'ru': "Получить средства",
            'uk': "Отримати кошти"
        }), _defineProperty(_module$exports, "This card is already used", {
            'en': "This card is already used.",
            'ru': "Эта карточка уже использована.",
            'uk': "Ця карта вже використана."
        }), _defineProperty(_module$exports, "AccountId copied!", {
            'en': "AccountId copied!",
            'ru': "AccountId скопирован!",
            'uk': "AccountId скопійовано!"
        }), _defineProperty(_module$exports, "Release to refresh", {
            'en': "Release to refresh",
            'ru': "Отпустите для обновления",
            'uk': "Відпустіть для оновлення"
        }), _defineProperty(_module$exports, "Card", {
            'en': "Updating...",
            'ru': "Обновление...",
            'uk': "Оновлення..."
        }), _module$exports);
    }, {}], 15: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Errors = require('../errors/Errors.js');

        var Auth = {
            setDefaults: function setDefaults() {
                this.keypair = m.prop(false);
                this.type = m.prop(false);
                this.username = m.prop(false);
                this.balances = m.prop([]);
                this.assets = m.prop([]);
                this.payments = m.prop([]);
                this.wallet = m.prop(false);
                this.api = m.prop(false);
                this.ttl = m.prop(0);
                this.time_live = m.prop(0);
            },

            updateBalances: function updateBalances(account_id) {

                var assets = [];
                var balances = [];
                var account = null;

                return Auth.getAnonymousAssets().then(function (assets_list) {
                    Object.keys(assets_list).map(function (index) {
                        if (assets_list[index].asset_type != 'native') {
                            assets.push({
                                asset: assets_list[index].asset_code
                            });
                        }
                    });
                    // Use this function instead of load account to gather more data
                    return Auth.loadAccountById(account_id);
                }).then(function (source) {
                    var response = source.balances;
                    Object.keys(response).map(function (index) {
                        if (response[index].asset_type != 'native') {
                            balances.push({
                                balance: response[index].balance,
                                asset: response[index].asset_code
                            });

                            assets.push({
                                asset: response[index].asset_code
                            });
                        }
                    });

                    account = source;
                }).catch(function (err) {
                    console.log(err);
                    //step this err, because user can be not created yet (before first payment)
                }).then(function () {

                    //only unique values
                    var flags = {};
                    assets = assets.filter(function (item) {
                        if (flags[item.asset]) {
                            return false;
                        }
                        flags[item.asset] = true;
                        return true;
                    });

                    m.startComputation();
                    Auth.balances(balances);
                    Auth.assets(assets);
                    m.endComputation();

                    return account;
                });
            },
            loadingCB: function loadingCB(params, stage) {
                m.startComputation();
                if (stage.type == 'request') {
                    m.onLoadingStart(stage.prevTime + ' ' + stage.func);
                } else {
                    m.onIdleStart(stage.prevTime + ' ' + stage.func);
                }
                m.endComputation();
            },
            login: function login(_login, password) {
                var master = null;
                m.onIdleStart();
                return this.loadAccountById(Conf.master_key).then(function (master_info) {
                    master = master_info;
                    return StellarWallet.getWallet({
                        server: Conf.keyserver_host + '/v2',
                        username: _login,
                        password: password,
                        cb: Auth.loadingCB
                    });
                }).then(function (wallet) {
                    m.onIdleEnd();
                    m.onLoadingEnd();
                    var is_admin = false;
                    m.onIdleStart();
                    if (typeof master != 'undefined' && typeof master.signers != 'undefined') {
                        master.signers.forEach(function (signer) {
                            if (signer.weight == StellarSdk.xdr.SignerType.signerAdmin().value && signer.public_key == StellarSdk.Keypair.fromSeed(wallet.getKeychainData()).accountId()) {
                                is_admin = true;
                            }
                        });

                        if (is_admin) {
                            m.onIdleEnd();
                            throw new Error('Login/password combination is invalid');
                        }
                    }

                    return wallet;
                }).then(function (wallet) {
                    m.startComputation();
                    Auth.wallet(wallet);
                    Auth.keypair(StellarSdk.Keypair.fromSeed(wallet.getKeychainData()));
                    Auth.username(wallet.username);
                    Auth.api(new StellarWallet.Api(Conf.api_host, Auth.keypair()));
                    m.endComputation();
                    m.onIdleEnd();
                });
            },

            registration: function registration(login, password) {
                m.onIdleStart();
                var accountKeypair = StellarSdk.Keypair.random();
                m.onLoadingStart();
                return this.checkConnection().then(StellarWallet.createWallet({
                    server: Conf.keyserver_host + '/v2',
                    username: login,
                    password: password,
                    accountId: accountKeypair.accountId(),
                    publicKey: accountKeypair.rawPublicKey().toString('base64'),
                    keychainData: accountKeypair.seed(),
                    mainData: 'mainData',
                    kdfParams: {
                        algorithm: 'scrypt',
                        bits: 256,
                        n: Math.pow(2, 11),
                        r: 8,
                        p: 1
                    },
                    cb: Auth.loadingCB
                }));
            },

            logout: function logout() {
                window.location.reload();
            },

            updatePassword: function updatePassword(old_pwd, new_pwd) {
                return this.checkConnection().then(StellarWallet.getWallet({
                    server: Conf.keyserver_host + '/v2',
                    username: Auth.username(),
                    password: old_pwd
                })).then(function (wallet) {
                    return wallet.changePassword({
                        newPassword: new_pwd,
                        secretKey: Auth.keypair()._secretKey.toString('base64'),
                        cb: Auth.loadingCB
                    });
                }).then(function (wallet) {
                    Auth.wallet(wallet);
                });
            },

            update: function update(data) {
                return this.checkConnection().then(Auth.wallet().update({
                    update: data,
                    secretKey: Auth.keypair()._secretKey.toString('base64')
                })).catch(function (e) {
                    console.error(e);
                });
            },

            loadTransactionInfo: function loadTransactionInfo(tid) {
                return Conf.horizon.transactions().transaction(tid).call();
            },

            loadAccountById: function loadAccountById(aid) {
                return Conf.horizon.accounts().accountId(aid).call();
            },

            checkConnection: function checkConnection() {
                return new Promise(function (resolve, reject) {
                    if (Conf.networkStatus != null && Conf.networkStatus === false) {
                        reject({ message: Conf.tr('No internet connection') });
                    } else {
                        resolve();
                    }
                });
            },

            getAnonymousAssets: function getAnonymousAssets() {

                return m.request({ method: "GET", url: Conf.horizon_host + Conf.assets_url }).then(function (response) {
                    if (typeof response._embedded == 'undefined' || typeof response._embedded.records == 'undefined') {
                        throw new Error(Conf.tr(Errors.assets_empty));
                    }

                    var assets_list = response._embedded.records;

                    Object.keys(assets_list).forEach(function (key) {
                        if (typeof assets_list[key].is_anonymous == 'undefined') {
                            delete assets_list[key];
                        }
                        if (!assets_list[key].is_anonymous) {
                            delete assets_list[key];
                        }
                    });

                    return assets_list;
                });
            }
        };

        Auth.setDefaults();

        module.exports = Auth;
    }, { "../config/Config.js": 11, "../errors/Errors.js": 12 }], 16: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Footer = require('../components/Footer.js');
        var Auth = require('../models/Auth.js');

        var Cards = module.exports = {

            controller: function controller() {
                var ctrl = this;

                var needle_asset = 'EUAH'; //TODO change to multi-asset operations, when time is come

                this.keypair = m.prop(false);
                this.balances = m.prop([]);
                this.needle_balance = m.prop([]);
                this.card_balance = m.prop([]);
                this.card_balances_sum = m.prop(false);
                this.assets = m.prop([]);

                if (!Auth.keypair()) {
                    return m.route('/');
                }
                this.seed = m.prop(m.route.param('seed') ? m.route.param('seed') : '');

                this.updateCardBalances = function (accountId) {
                    return Auth.checkConnection().then(Auth.loadAccountById(accountId)).then(function (source) {

                        var response = source.balances;

                        var assets = [];
                        var balances = [];
                        var sum = 0;

                        Object.keys(response).map(function (index) {
                            if (response[index].asset_type != 'native') {
                                balances.push({
                                    balance: response[index].balance,
                                    asset: response[index].asset_code
                                });
                                sum += response[index].balance;
                                if (response[index].asset_code === needle_asset) {
                                    ctrl.card_balance(parseFloat(response[index].balance).toFixed(2));
                                    ctrl.needle_balance(ctrl.card_balance());
                                }
                                assets.push({
                                    asset: response[index].asset_code
                                });
                            }
                        });
                        m.startComputation();
                        ctrl.balances(balances);
                        ctrl.assets(assets);
                        ctrl.card_balances_sum(sum * 100); //we need sum in coins for calculations
                        m.endComputation();
                        m.onLoadingEnd();
                    });
                };

                if (this.seed().length == 56) {
                    m.onLoadingStart();
                    this.keypair(StellarSdk.Keypair.fromSeed(this.seed()));
                    this.updateCardBalances(this.keypair().accountId());
                }

                this.processTransfer = function (e) {
                    e.preventDefault();
                    var amount = parseFloat(ctrl.needle_balance()).toFixed(2);
                    if (parseFloat(amount) > parseFloat(ctrl.card_balance())) {
                        return m.flashError(Conf.tr("Card has no enough money in this asset!"));
                    }
                    //m.startComputation();
                    m.onLoadingStart();
                    Auth.checkConnection().then(Conf.horizon.loadAccount(ctrl.keypair().accountId())).then(function (source) {
                        var memo = StellarSdk.Memo.text("funding_card");
                        var tx = new StellarSdk.TransactionBuilder(source, { memo: memo }).addOperation(StellarSdk.Operation.payment({
                            destination: Auth.keypair().accountId(),
                            amount: amount,
                            asset: new StellarSdk.Asset(Conf.asset, Conf.master_key)
                        })).build();
                        tx.sign(ctrl.keypair());

                        return Conf.horizon.submitTransaction(tx);
                    }).then(function () {
                        m.flashSuccess(Conf.tr("Funding successful"));
                        return ctrl.updateCardBalances(ctrl.keypair().accountId()).bind(ctrl);
                    }).catch(function (err) {
                        m.flashError(err.message ? Conf.tr(err.message) : Conf.tr("Can't make funding"));
                    });
                };
            },

            view: function view(ctrl) {
                return [m.component(Navbar), ctrl.card_balances_sum() !== false ? { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "h2", attrs: {}, children: [Conf.tr("Card")] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "form", attrs: { class: "col-sm-4", onsubmit: ctrl.processTransfer.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "panel panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [Conf.tr("Scratch card")] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table m-b-30" }, children: [Auth.balances().length ? { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [{ tag: "b", attrs: {}, children: [Conf.tr("Your balance"), ":"] }] }, { tag: "td", attrs: {}, children: [{ tag: "b", attrs: {}, children: [Auth.balances().map(function (b) {
                                                            return parseFloat(b.balance).toFixed(2) + " " + Conf.asset;
                                                        })] }] }] } : '', { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Conf.tr("Card balance"), ":"] }, { tag: "td", attrs: {}, children: [ctrl.balances().map(function (b) {
                                                        return parseFloat(b.balance).toFixed(2) + " " + Conf.asset;
                                                    })] }] }] }, ctrl.balances().length && ctrl.card_balances_sum() > 0 ? { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "money_to_get" }, children: [Conf.tr("How much do you want to redeem?")] }, { tag: "input", attrs: { type: "number", name: "money_to_get", id: "money_to_get",
                                                        min: "0.01", step: "0.01", max: ctrl.card_balance(),
                                                        value: ctrl.needle_balance(),
                                                        oninput: m.withAttr('value', ctrl.needle_balance),
                                                        required: "required", class: "form-control" } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "button", attrs: { class: "btn btn-primary" }, children: [Conf.tr("Get money")] }] }] } : { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("This card is already used")] }] }] }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] } : { tag: "div", attrs: {}

                }, m.component(Footer)];
            }

        };
    }, { "../components/Footer.js": 7, "../components/Navbar.js": 8, "../config/Config.js": 11, "../models/Auth.js": 15 }], 17: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Payments = require('../components/Payments.js');
        var Footer = require('../components/Footer.js');
        var Auth = require('../models/Auth.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                this.myScroll = null; //iScroll

                this.pullDownPhrase = m.prop(0);

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                // We'll query balances on each page load until we receive some money and start a stream
                if (!Auth.payments().length) {
                    Auth.updateBalances(Auth.keypair().accountId()).then(function (source) {
                        if (source) {
                            Auth.type(source.type);
                        }
                        return Conf.horizon.payments().forAccount(Auth.keypair().accountId()).order('desc').limit(Conf.payments.onpage).call();
                    }).then(function (result) {
                        m.startComputation();
                        Auth.payments(result.records);
                        m.endComputation();
                        ctrl.initPullToRefresh();
                        return Conf.horizon.payments().forAccount(Auth.keypair().accountId()).cursor('now').stream({
                            onmessage: function onmessage(message) {
                                var result = message.data ? JSON.parse(message.data) : message;
                                m.startComputation();
                                Auth.payments().unshift(result);
                                m.endComputation();

                                // Update user balance
                                Auth.updateBalances(Auth.keypair().accountId());
                            },
                            onerror: function onerror() {
                                console.log('Cannot get payment from stream');
                            }
                        });
                    }).catch(function (err) {
                        console.log(err);
                        // If you're here, everything's still ok - it means acc wasn't created yet
                    });
                } else {
                    setTimeout(function () {
                        ctrl.initPullToRefresh();
                    }, 500);
                }

                this.copyAccountId = function (e) {
                    e.preventDefault();
                    cordova.plugins.clipboard.copy(Auth.keypair().accountId(), function () {
                        m.flashSuccess(Conf.tr("AccountId copied!"));
                    });
                    return false;
                };

                this.initPullToRefresh = function () {
                    console.debug(ctrl.myScroll);
                    if (ctrl.myScroll == null) {
                        var topnavSize = document.getElementById('topnav').offsetHeight;
                        document.getElementById('home-puller').style.top = topnavSize + 10 + "px";
                        document.addEventListener('touchmove', function (e) {
                            e.preventDefault();
                        }, false);
                        ctrl.myScroll = new IScroll('#home-puller', {
                            useTransition: true,
                            startX: 0,
                            topOffset: 0
                        });

                        ctrl.myScroll.on('scrollEnd', function () {
                            m.startComputation();
                            ctrl.pullDownPhrase(2);
                            m.endComputation();
                            Auth.updateBalances(Auth.keypair().accountId()).then(function () {
                                m.startComputation();
                                ctrl.pullDownPhrase(0);
                                ctrl.myScroll.refresh();
                                m.endComputation();
                            });
                        });
                        ctrl.myScroll.on('scrollCancel', function () {
                            m.startComputation();
                            ctrl.pullDownPhrase(0);
                            m.endComputation();
                        });
                        ctrl.myScroll.on('scrollStart', function () {
                            m.startComputation();
                            ctrl.pullDownPhrase(1);
                            m.endComputation();
                        });
                    }
                };
            },

            view: function view(ctrl) {
                var type = Auth.type() ? Auth.type() : 'anonymous_user';
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container puller", id: "home-puller" }, children: [{ tag: "div", attrs: {}, children: [ctrl.pullDownPhrase() == 1 ? { tag: "div", attrs: { id: "pull-info", class: "center-block" }, children: [{ tag: "p", attrs: { class: "lead m-t-10" }, children: [{ tag: "span", attrs: { class: "fa fa-arrow-up fa-2x m-r-10" } }, Conf.tr("Release to refresh")] }] } : ctrl.pullDownPhrase() == 2 ? { tag: "div", attrs: {}, children: [{ tag: "p", attrs: { class: "lead m-t-10" }, children: [{ tag: "i", attrs: { class: "fa fa-spinner fa-pulse fa-2x fa-fw" } }, Conf.tr("Updating...")] }] } : '', { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-sm-6" }, children: [{ tag: "div", attrs: { class: "card-box widget-user" }, children: [{ tag: "div", attrs: {}, children: [{ tag: "img", attrs: { src: "assets/img/no-avatar.png", class: "img-responsive img-circle",
                                                    alt: "user" } }, { tag: "div", attrs: { class: "wid-u-info" }, children: [{ tag: "h4", attrs: { class: "m-t-0 m-b-5" }, children: [Conf.tr("Welcome"), ", ", Auth.username()] }, { tag: "p", attrs: { class: "text-muted m-b-5 font-13 account_overflow" }, children: [{ tag: "a", attrs: { href: "#", onclick: ctrl.copyAccountId.bind(this) }, children: [Auth.keypair().accountId()] }] }, { tag: "small", attrs: {}, children: [{ tag: "b", attrs: {}, children: [Conf.tr(type)] }] }] }] }] }] }, { tag: "div", attrs: { class: "col-sm-6" }, children: [{ tag: "div", attrs: { class: "widget-simple text-center card-box" }, children: [{ tag: "h3", attrs: { class: "text-primary counter" }, children: [Auth.balances().length ? Auth.balances().map(function (b) {
                                                return { tag: "div", attrs: { class: "col-sm-2 p-t-10" }, children: [{ tag: "span", attrs: { class: "label label-primary" }, children: [parseFloat(b.balance).toFixed(2) + " " + Conf.asset] }] };
                                            }) : '0.00'] }, { tag: "p", attrs: { class: "text-muted", style: "margin: 2px;" }, children: [Conf.tr("Balance")] }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { class: "panel panel-color panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Account transactions")] }, { tag: "p", attrs: { class: "panel-sub-title font-13" }, children: [Conf.tr("Overview of recent transactions"), "."] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [m.component(Payments, { payments: Auth.payments() })] }, { tag: "div", attrs: { class: "panel-footer text-center" }, children: [{ tag: "a", attrs: { href: "/payments", config: m.route,
                                            class: "btn btn-primary btn-custom waves-effect w-md btn-sm waves-light" }, children: [Conf.tr("All transactions")] }] }] }] }] }] }, m.component(Footer)];
            }
        };
    }, { "../components/Footer.js": 7, "../components/Navbar.js": 8, "../components/Payments.js": 9, "../config/Config.js": 11, "../models/Auth.js": 15 }], 18: [function (require, module, exports) {
        var Qr = require('qrcode-npm/qrcode');
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Auth = require('../models/Auth.js');

        var Invoice = module.exports = {

            controller: function controller() {
                var ctrl = this;

                this.invoiceCode = m.prop(false);
                this.qr = m.prop(false);
                this.barcode = m.prop(false);

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.myScroll = null;
                this.initPullToRefresh = function () {
                    if (ctrl.myScroll == null) {
                        var topnavSize = document.getElementById('topnav').offsetHeight;
                        document.getElementById('container').style.top = topnavSize + 10 + "px";
                        document.addEventListener('touchmove', function (e) {
                            e.preventDefault();
                        }, false);
                        ctrl.myScroll = new IScroll('#container', {
                            useTransition: true,
                            startX: 0,
                            topOffset: 0
                        });
                    }
                };

                setTimeout(function () {
                    ctrl.initPullToRefresh();
                }, 500);

                //create invoice function
                this.createInvoice = function (e) {
                    e.preventDefault();

                    var amount = e.target.amount.value;
                    var asset = Conf.asset;
                    // TODO: check if asset is available in Auth.balances

                    m.onLoadingStart();

                    Auth.api().createInvoice({ asset: asset, amount: parseFloat(parseFloat(amount).toFixed(2)) }).then(function (response) {
                        m.flashSuccess(Conf.tr("Invoice created"));
                        if (typeof response.id == 'undefined') {
                            m.flashError(Conf.tr("Invalid response. Contact support"));
                        }
                        ctrl.invoiceCode(response.id);

                        // QR-CODE
                        var jsonData = {
                            "account": Auth.keypair().accountId(),
                            "amount": amount,
                            "asset": asset,
                            "t": 1
                        };
                        var jsonDataStr = JSON.stringify(jsonData);

                        //calculate the qrCode size
                        var qrSize = 8;
                        // 5 = (496b), 6 = (608b), 7 = (704b), 8 = 108 (880b), 9 = 130 (1056b)
                        var lenInBytes = Qr.qrcode.stringToBytes(jsonDataStr).length * 8 + 16;
                        if (lenInBytes > 880) qrSize++;
                        if (lenInBytes > 1056) qrSize++;
                        var qr = Qr.qrcode(qrSize, 'Q');
                        qr.addData(jsonDataStr);
                        qr.make();

                        var imgTag = qr.createImgTag(4);

                        m.startComputation();
                        ctrl.qr(m.trust(imgTag));
                        // ctrl.barcode(m.trust('<img width="230" height="118"' +
                        //     'src="http://www.barcode-generator.org/zint/api.php?bc_number=13&bc_data=482000' +
                        //     id + '">'));
                        m.endComputation();
                    }).catch(function (err) {
                        m.flashApiError(err);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.newForm = function (e) {
                    this.invoiceCode(false);
                };
            },

            view: function view(ctrl) {
                var code = ctrl.qr();

                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container puller", id: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [!ctrl.invoiceCode() ? { tag: "div", attrs: { class: "panel panel-color panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Create a new invoice")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.createInvoice.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-4" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Amount"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "number", required: "required",
                                                            id: "amount",
                                                            min: "0.01",
                                                            step: "0.01",
                                                            placeholder: "0.00",
                                                            name: "amount" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: {
                                                            class: "btn btn-primary btn-custom w-md waves-effect waves-light",
                                                            type: "submit" }, children: [Conf.tr("Create")] }] }] }] }] }] } : { tag: "div", attrs: { class: "panel panel-border panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Invoice code")] }] }, { tag: "div", attrs: { class: "panel-body text-center" }, children: [{ tag: "h2", attrs: {}, children: [ctrl.invoiceCode()] }, { tag: "i", attrs: {}, children: [Conf.tr("Copy this invoice code and share it with someone you need to get money from")] }, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, code, { tag: "br", attrs: {} }, { tag: "br", attrs: {} },
                                        /*{ctrl.barcode() ? ctrl.barcode() : ''}*/
                                        { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, { tag: "button", attrs: { class: "btn btn-purple waves-effect w-md waves-light m-b-5",
                                                onclick: ctrl.newForm.bind(ctrl) }, children: [Conf.tr("Create new")] }] }] }] }] }] }] }];
            }
        };
    }, { "../components/Navbar.js": 8, "../config/Config.js": 11, "../models/Auth.js": 15, "qrcode-npm/qrcode": 6 }], 19: [function (require, module, exports) {
        var Navbar = require('../components/Navbar.js');
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');

        var Login = module.exports = {
            controller: function controller() {
                var ctrl = this;
                var lastLogin = window.localStorage.getItem('lastLogin');
                this.lastLogin = m.prop(typeof lastLogin != 'undefined' || lastLogin != null ? lastLogin : '');
                if (Auth.keypair()) {
                    return m.route('/home');
                }

                /******/
                this.appVersion = m.prop('');
                cordova.getAppVersion.getVersionNumber(function (version) {
                    m.startComputation();
                    ctrl.appVersion('v' + version);
                    m.endComputation();
                });
                this.makeRequest = function (method, url, done) {
                    var xhr = new XMLHttpRequest();
                    xhr.open(method, url);
                    xhr.onload = function () {
                        done(null, xhr.response);
                    };
                    xhr.onerror = function () {
                        done(xhr.response);
                    };
                    xhr.send();
                };

                this.login = function (e) {
                    e.preventDefault();
                    Auth.login(e.target.login.value, e.target.password.value).then(function () {
                        window.localStorage.setItem('lastLogin', Auth.wallet().username);
                        m.route('/home');
                    }).catch(function (err) {
                        m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "a", attrs: { href: "index.html", class: "logo logo-lg" }, children: [Conf.localeStr == 'uk' || Conf.localeStr == 'ru' ? { tag: "img", attrs: { class: "logo-img", src: "./img/logo-ua-tagline.svg" } } : { tag: "img", attrs: { class: "logo-img", src: "./img/logo-en-tagline.svg" } }] }, { tag: "small", attrs: {}, children: [ctrl.appVersion()] }, { tag: "h4", attrs: {}, children: [Conf.tr('Login')] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.login.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "required", placeholder: Conf.tr("Username"),
                                        autocapitalize: "none",
                                        name: "login",
                                        onchange: m.withAttr("value", ctrl.lastLogin),
                                        value: ctrl.lastLogin() } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required", autocapitalize: "none",
                                        placeholder: Conf.tr("Password"),
                                        name: "password" } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-xs-6" }, children: [{ tag: "a", attrs: { href: "/sign", config: m.route,
                                        class: "btn btn-default btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Create an account")] }] }, { tag: "div", attrs: { class: "col-xs-6 text-right" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5",
                                        type: "submit" }, children: [Conf.tr("Log in")] }] }] }] }] };
            }
        };
    }, { "../components/Navbar.js": 8, "../config/Config.js": 11, "../models/Auth.js": 15 }], 20: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');

        var Logout = module.exports = {
            controller: function controller() {
                Auth.logout();
                m.route('/');
            },

            view: function view(ctrl) {}
        };
    }, { "../models/Auth.js": 15 }], 21: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Footer = require('../components/Footer.js');
        var Auth = require('../models/Auth.js');
        var Payments = require('../components/Payments.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;
                this.myScroll = null; //iScroll

                this.current_cursor = m.prop(null);
                this.payments = m.prop([]);
                this.next = m.prop(false);
                this.pullDownPhrase = m.prop(0);

                if (!Auth.keypair()) {
                    return m.route('/');
                }
                this.initPullToRefresh = function () {
                    if (ctrl.myScroll == null) {
                        var topnavSize = document.getElementById('topnav').offsetHeight;
                        document.getElementById('puller').style.top = topnavSize + 10 + "px";
                        document.addEventListener('touchmove', function (e) {
                            e.preventDefault();
                        }, false);
                        ctrl.myScroll = new IScroll('#puller', {
                            useTransition: true,
                            startX: 0,
                            topOffset: 0
                        });

                        ctrl.myScroll.on('scrollEnd', function () {
                            m.startComputation();
                            ctrl.pullDownPhrase(2);
                            m.endComputation();
                            ctrl.paymentsLoad().then(function () {
                                m.startComputation();
                                ctrl.pullDownPhrase(0);
                                ctrl.myScroll.refresh();
                                m.endComputation();
                            });
                        });
                        ctrl.myScroll.on('scrollCancel', function () {
                            m.startComputation();
                            ctrl.pullDownPhrase(0);
                            m.endComputation();
                        });
                        ctrl.myScroll.on('scrollStart', function () {
                            m.startComputation();
                            ctrl.pullDownPhrase(1);
                            m.endComputation();
                        });
                    }
                };

                this.checkNextPaymentsExist = function () {
                    m.startComputation();
                    ctrl.next(false);
                    m.endComputation();
                    return ctrl.current_cursor().next().then(function (next_result) {
                        if (next_result.records.length > 0) {
                            m.startComputation();
                            ctrl.next(true);
                            m.endComputation();
                        }
                    }).catch(function (err) {
                        m.flashError(err.name + (err.message ? ': ' + err.message : ''));
                    });
                };

                //show next payments
                this.loadMorePayments = function (e) {
                    e.preventDefault();
                    m.onLoadingStart();
                    return ctrl.current_cursor().next().then(function (result) {
                        m.startComputation();
                        ctrl.current_cursor(result);
                        ctrl.payments(ctrl.payments().concat(result.records));
                        m.endComputation();
                        myScroll.refresh();
                        return ctrl.checkNextPaymentsExist();
                    }).catch(function (err) {
                        m.flashError(err.name + (err.message ? ': ' + err.message : ''));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };
                this.paymentsLoad = function () {
                    return Conf.horizon.payments().forAccount(Auth.keypair().accountId()).order('desc').limit(Conf.payments.onpage).call().then(function (result) {
                        m.startComputation();
                        ctrl.current_cursor(result);
                        ctrl.payments(result.records);
                        m.endComputation();
                        ctrl.initPullToRefresh();
                        return ctrl.checkNextPaymentsExist();
                    }).catch(function (err) {
                        // If you're here, everything's still ok - it means acc wasn't created yet
                    });
                };

                ctrl.paymentsLoad();
            },

            view: function view(ctrl) {
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container puller", id: "puller" }, children: [{ tag: "div", attrs: {}, children: [ctrl.pullDownPhrase() == 1 ? { tag: "div", attrs: { id: "pull-info", class: "center-block" }, children: [{ tag: "p", attrs: { class: "lead m-t-10" }, children: [{ tag: "span", attrs: { class: "fa fa-arrow-up fa-2x m-r-10" } }, Conf.tr("Release to refresh")] }] } : ctrl.pullDownPhrase() == 2 ? { tag: "div", attrs: {}, children: [{ tag: "p", attrs: { class: "lead m-t-10" }, children: [{ tag: "i", attrs: { class: "fa fa-spinner fa-pulse fa-2x fa-fw" } }, Conf.tr("Updating...")] }] } : '', { tag: "div", attrs: { class: "panel panel-color panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Account transactions")] }, { tag: "p", attrs: { class: "panel-sub-title font-13" }, children: [Conf.tr("Overview of recent transactions"), "."] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [m.component(Payments, { payments: ctrl.payments() })] }, ctrl.next() ? { tag: "div", attrs: { class: "panel-footer text-center" }, children: [{ tag: "button", attrs: { class: "btn btn-primary waves-effect w-md waves-light m-b-5",
                                            onclick: ctrl.loadMorePayments.bind(ctrl) }, children: [Conf.tr("Show older")] }] } : '', { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }, m.component(Footer)];
            }
        };
    }, { "../components/Footer.js": 7, "../components/Navbar.js": 8, "../components/Payments.js": 9, "../config/Config.js": 11, "../models/Auth.js": 15 }], 22: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Auth = require('../models/Auth.js');

        var Settings = module.exports = {

            controller: function controller() {
                var ctrl = this;

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.myScroll = null;
                this.initPullToRefresh = function () {
                    if (ctrl.myScroll == null) {
                        var topnavSize = document.getElementById('topnav').offsetHeight;
                        document.getElementById('container').style.top = topnavSize + 10 + "px";
                        document.addEventListener('touchmove', function (e) {
                            e.preventDefault();
                        }, false);
                        ctrl.myScroll = new IScroll('#container', {
                            useTransition: true,
                            startX: 0,
                            topOffset: 0
                        });
                    }
                };

                setTimeout(function () {
                    ctrl.initPullToRefresh();
                }, 500);

                //return phone in pattern or prefix
                this.getPhoneWithViewPattern = function (number) {
                    if (number.substr(0, Conf.phone.prefix.length) != Conf.phone.prefix) {
                        number = Conf.phone.prefix;
                    }
                    return m.prop(VMasker.toPattern(number, { pattern: Conf.phone.view_mask, placeholder: "x" }));
                };

                this.addPhoneViewPattern = function (e) {
                    ctrl.phone = ctrl.getPhoneWithViewPattern(e.target.value);
                };

                this.phone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix + Auth.wallet().phone);
                this.email = m.prop(Auth.wallet().email || '');

                this.changePassword = function (e) {
                    e.preventDefault();

                    if (!e.target.oldpassword.value || !e.target.password.value || !e.target.repassword.value) {
                        m.flashError(Conf.tr("Please, fill all required fields"));
                        return;
                    }

                    if (e.target.password.value.length < 6) {
                        m.flashError(Conf.tr("Password should have 6 chars min"));
                        return;
                    }

                    if (e.target.password.value != e.target.repassword.value) {
                        m.flashError(Conf.tr("Passwords should match"));
                        return;
                    }

                    if (e.target.oldpassword.value == e.target.password.value) {
                        m.flashError(Conf.tr("New password cannot be same as old"));
                        return;
                    }

                    m.onLoadingStart();
                    m.startComputation();

                    Auth.updatePassword(e.target.oldpassword.value, e.target.password.value).then(function () {
                        m.flashSuccess(Conf.tr("Password changed"));
                        e.target.reset();
                    }).catch(function (err) {
                        m.flashError(err.message ? Conf.tr(err.message) : Conf.tr("Cannot change password"));
                    }).then(function () {
                        m.onLoadingEnd();
                        m.endComputation();
                    });
                };

                this.bindData = function (e) {
                    e.preventDefault();
                    //reformat phone to database format
                    e.target.phone.value = VMasker.toPattern(e.target.phone.value, Conf.phone.db_mask);
                    var phone_number = e.target.phone.value.substr(2) ? e.target.phone.value.substr(2) : '';

                    if (e.target.email.value != Auth.wallet().email || phone_number != Auth.wallet().phone) {

                        m.onLoadingStart();

                        var dataToUpdate = {};

                        //validate email
                        if (e.target.email.value.length > 0) {
                            var email_re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            if (!email_re.test(e.target.email.value)) {
                                return m.flashError(Conf.tr("Invalid email"));
                            }
                        }
                        dataToUpdate.email = e.target.email.value;

                        //validate phone
                        if (phone_number.length > 0) {
                            if (phone_number.match(/\d/g).length != Conf.phone.length) {
                                ctrl.phone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix + phone_number);
                                return m.flashError(Conf.tr("Invalid phone"));
                            }
                        }
                        dataToUpdate.phone = phone_number;

                        Auth.update(dataToUpdate).then(function () {
                            m.flashSuccess(Conf.tr("Profile saved"));
                        }).catch(function (err) {
                            if (err.message) {
                                if (err.message == 'Nothing to update') {
                                    m.flashSuccess(Conf.tr(err.message));
                                } else {
                                    m.flashError(err.message);
                                }
                            } else {
                                m.flashError(Conf.tr("Cannot update profile details"));
                            }
                        }).then(function () {
                            m.startComputation();
                            Auth.wallet().phone = dataToUpdate.phone;
                            Auth.wallet().email = dataToUpdate.email;
                            ctrl.phone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix + Auth.wallet().phone);
                            ctrl.email = m.prop(Auth.wallet().email || '');
                            m.onLoadingEnd();
                            m.endComputation();
                        });
                    }
                };
            },

            view: function view(ctrl) {
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container puller", id: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Change password")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.changePassword.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Old password"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                                            name: "oldpassword" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("New password"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                                            name: "password" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Repeat new password"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                                            name: "repassword" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom w-md waves-effect waves-light",
                                                            type: "submit" }, children: [Conf.tr("Change")] }] }] }] }] }] }] }, { tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Change additional data")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.bindData.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Email"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "text", name: "email",
                                                            oninput: m.withAttr("value", ctrl.email), value: ctrl.email() } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Phone"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "text", name: "phone",
                                                            placeholder: Conf.phone.view_mask,
                                                            oninput: ctrl.addPhoneViewPattern.bind(ctrl),
                                                            value: ctrl.phone() } }] }] }, ctrl.phone() != Auth.wallet().phone || ctrl.email() != Auth.wallet().email ? { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: {
                                                            class: "btn btn-primary btn-custom w-md waves-effect waves-light",
                                                            type: "submit" }, children: [Conf.tr("Save")] }] }] } : ''] }] }] }] }] }] }] }];
            }
        };
    }, { "../components/Navbar.js": 8, "../config/Config.js": 11, "../models/Auth.js": 15 }], 23: [function (require, module, exports) {
        var Qr = require('../../node_modules/qrcode-npm/qrcode');
        var Navbar = require('../components/Navbar.js');
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');

        var Sign = module.exports = {
            controller: function controller() {
                if (Auth.keypair()) {
                    return m.route('/home');
                }

                this.qr = m.prop(false);

                this.signup = function (e) {
                    e.preventDefault();

                    var ctrl = this;

                    if (!e.target.login.value || !e.target.password.value || !e.target.repassword.value) {
                        m.flashError(Conf.tr("Please, fill all required fields"));
                        return;
                    }

                    if (e.target.password.value.length < 6) {
                        m.flashError(Conf.tr("Password should have 6 chars min"));
                        return;
                    }

                    if (e.target.password.value != e.target.repassword.value) {
                        m.flashError(Conf.tr("Passwords should match"));
                        return;
                    }

                    m.onLoadingStart();
                    Auth.registration(e.target.login.value, e.target.password.value).then(function () {
                        /*var qr = Qr.qrcode(4, 'M');
                        qr.addData(e.target.password.value);
                        qr.make();
                        var imgTag = qr.createImgTag(4);
                        m.startComputation();
                        ctrl.qr(m.trust(imgTag));
                        m.endComputation();*/
                        Auth.login(e.target.login.value, e.target.password.value).then(function () {
                            m.onLoadingEnd();
                            m.route('/home');
                        }).catch(function (err) {
                            m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                        });
                    }, function (err) {
                        m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };
            },

            view: function view(ctrl) {
                if (ctrl.qr()) {
                    var code = ctrl.qr();
                    ctrl.qr(false);
                    var img = code.substring(code.indexOf('="') + 2, code.lastIndexOf('=="') + 2);
                    return { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel panel-color panel-success" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Registration successful")] }, { tag: "p", attrs: { class: "panel-sub-title font-13" }, children: [Conf.tr("Print this QR-code and keep it in secure place. This is the only possible way to recover your password"), "!"] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [code, { tag: "br", attrs: {} }, { tag: "a", attrs: { href: img, download: "qr_password.gif" }, children: [Conf.tr("Save code")] }, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, { tag: "a", attrs: { href: "/", config: m.route,
                                                class: "btn btn-success btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Log in")] }] }] }] }] }] };
                }

                return { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "a", attrs: { href: "index.html", class: "logo logo-lg" }, children: [Conf.localeStr == 'uk' || Conf.localeStr == 'ru' ? { tag: "img", attrs: { class: "logo-img", src: "./img/logo-ua-tagline.svg" } } : { tag: "img", attrs: { class: "logo-img", src: "./img/logo-en-tagline.svg" } }] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.signup.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "required", placeholder: Conf.tr("Username"),
                                        autocapitalize: "none",
                                        name: "login", pattern: "[A-Za-z0-9_-]{3,}",
                                        title: Conf.tr("Characters and numbers allowed") } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                        autocapitalize: "none",
                                        placeholder: Conf.tr("Password"), name: "password", pattern: ".{6,}",
                                        title: Conf.tr("6 characters minimum") } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                        autocapitalize: "none",
                                        placeholder: Conf.tr("Retype Password"), name: "repassword", pattern: ".{6,}",
                                        title: Conf.tr("6 characters minimum") } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20 text-center" }, children: [{ tag: "button", attrs: {
                                    class: "btn btn-inverse btn-lg btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Sign up")] }] }] }] };
            }
        };
    }, { "../../node_modules/qrcode-npm/qrcode": 6, "../components/Navbar.js": 8, "../config/Config.js": 11, "../models/Auth.js": 15 }], 24: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Footer = require('../components/Footer.js');
        var Auth = require('../models/Auth.js');
        var DateFormat = require('dateformat');

        var Transaction = module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.myScroll = null;
                this.initPullToRefresh = function () {
                    if (ctrl.myScroll == null) {
                        var topnavSize = document.getElementById('topnav').offsetHeight;
                        document.getElementById('container').style.top = topnavSize + 10 + "px";
                        document.addEventListener('touchmove', function (e) {
                            e.preventDefault();
                        }, false);
                        ctrl.myScroll = new IScroll('#container', {
                            useTransition: true,
                            startX: 0,
                            topOffset: 0
                        });
                    }
                };

                setTimeout(function () {
                    ctrl.initPullToRefresh();
                }, 500);

                this.navbar = new Navbar.controller();

                this.transaction = m.prop(false);
                this.account = m.prop(false);
                this.payment = m.prop(false);
                this.balances = m.prop([]);

                this.getAccount = function (aid) {
                    Auth.loadAccountById(aid).then(function (accountResult) {
                        m.startComputation();
                        ctrl.account(accountResult);
                        m.endComputation();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Can't load account by transaction"));
                    });
                };

                this.getTransaction = function (tid) {
                    Auth.loadTransactionInfo(tid).then(function (transactionResult) {
                        m.startComputation();
                        ctrl.transaction(transactionResult);
                        m.endComputation();
                    }).catch(function (err) {
                        console.log(err);
                        m.flashError(Conf.tr("Transaction loading error"));
                    });
                };

                this.getTransaction(m.route.param("trans_id"));
                this.getAccount(m.route.param("target_acc"));
            },

            view: function view(ctrl) {
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container puller", id: "container" }, children: [{ tag: "div", attrs: { class: "panel panel-border panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Transaction")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered m-0 small-table" }, children: [{ tag: "tbody", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Created at"), ":"] }, { tag: "td", attrs: {}, children: [DateFormat(ctrl.transaction().created_at, 'dd.mm.yyyy HH:MM:ss')] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Transaction ID"), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { class: "account_overflow" }, children: [ctrl.transaction().id] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Transaction amount"), ":"] }, { tag: "td", attrs: {}, children: [parseFloat(m.route.param("amount")).toFixed(2)] }] }, ctrl.transaction().memo ? { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Transaction memo"), ":"] }, { tag: "td", attrs: {}, children: [ctrl.transaction().memo] }] } : '', { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Target account ID"), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: 'http://info.smartmoney.com.ua/account?acc=' + ctrl.account().id,
                                                        target: "_blank"
                                                    }, children: [{ tag: "span", attrs: { class: "account_overflow" }, children: [ctrl.account().id] }] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Target account type"), ":"] }, { tag: "td", attrs: {}, children: [ctrl.account().type] }] }] }] }] }, { tag: "div", attrs: { class: "panel-footer text-center" }, children: [{ tag: "a", attrs: { href: '/transfer' + '?account=' + ctrl.account().id + '&amount=' + parseFloat(m.route.param("amount")).toFixed(2) + '&asset=' + m.route.param("asset"),
                                        config: m.route,
                                        class: "btn btn-inverse btn-custom waves-effect w-md waves-light"
                                    }, children: [{ tag: "span", attrs: { class: "fa fa-repeat" } }, " ", Conf.tr("Repeat")] }] }] }] }] }, m.component(Footer)];
            }
        };
    }, { "../components/Footer.js": 7, "../components/Navbar.js": 8, "../config/Config.js": 11, "../models/Auth.js": 15, "dateformat": 2 }], 25: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Auth = require('../models/Auth.js');

        var Invoice = module.exports = {

            controller: function controller() {
                var ctrl = this;

                //return phone in pattern or prefix
                this.getPhoneWithViewPattern = function (number) {
                    if (number.substr(0, Conf.phone.prefix.length) != Conf.phone.prefix) {
                        number = Conf.phone.prefix;
                    }
                    return m.prop(VMasker.toPattern(number, { pattern: Conf.phone.view_mask, placeholder: "x" }));
                };

                this.addPhoneViewPattern = function (e) {
                    ctrl.infoPhone = ctrl.getPhoneWithViewPattern(e.target.value);
                };

                this.infoAsset = m.prop(m.prop(m.route.param('asset') ? m.route.param('asset') : ''));
                this.infoAmount = m.prop(m.route.param("amount") ? m.route.param("amount") : '');
                this.infoAccount = m.prop(m.route.param("account") ? m.route.param("account") : '');
                this.infoPhone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix);
                this.infoEmail = m.prop(m.route.param("email") ? m.route.param("email") : '');
                this.transferType = m.prop('byAccount');
                this.infoMemo = m.prop(m.route.param("memo") ? m.route.param("memo") : 'by_account');

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.myScroll = null;
                this.initPullToRefresh = function () {
                    if (ctrl.myScroll == null) {
                        var topnavSize = document.getElementById('topnav').offsetHeight;
                        document.getElementById('container').style.top = topnavSize + 10 + "px";
                        document.addEventListener('touchmove', function (e) {
                            e.preventDefault();
                        }, false);
                        ctrl.myScroll = new IScroll('#container', {
                            useTransition: true,
                            startX: 0,
                            topOffset: 0
                        });
                    }
                };

                setTimeout(function () {
                    ctrl.initPullToRefresh();
                }, 500);

                this.changeTransferType = function (e) {
                    e.preventDefault();
                    m.startComputation();
                    this.transferType(e.target.value);
                    this.infoAccount = m.prop('');
                    this.infoPhone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix);
                    this.infoEmail = m.prop('');
                    switch (e.target.value) {
                        case 'byAccount':
                            this.infoMemo('by_account');
                            break;
                        case 'byPhone':
                            this.infoMemo('by_phone');
                            break;
                        case 'byEmail':
                            this.infoMemo('by_email');
                            break;
                        default:
                            this.infoMemo('');
                    }
                    m.endComputation();
                };

                this.getInvoice = function (e) {
                    var _this2 = this;

                    e.preventDefault();

                    m.onLoadingStart();

                    Auth.api().getInvoice({
                        id: e.target.code.value
                    }).then(function (response) {
                        var allow_inv = false;
                        Auth.assets().map(function (b) {
                            if (b.asset == response.asset) {
                                allow_inv = true;
                            }
                        });

                        if (!allow_inv) {
                            m.flashError(Conf.tr("Invalid invoice currency"));
                            return;
                        }

                        m.startComputation();
                        _this2.infoAsset(response.asset); // TODO: add this to form
                        _this2.infoAmount(response.amount);
                        _this2.infoAccount(response.account);
                        _this2.transferType('byAccount');

                        if (typeof response.memo == 'string' && response.memo.length > 0 && response.memo.length <= 14) {
                            _this2.infoMemo(response.memo);
                        } else {
                            _this2.infoMemo('by_invoice');
                        }
                        m.endComputation();

                        // Clear input data
                        e.target.code.value = '';

                        m.flashSuccess(Conf.tr("Invoice requested"));
                    }).catch(function (err) {
                        m.flashApiError(err);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.processPayment = function (e) {
                    e.preventDefault();
                    var phoneNum = VMasker.toPattern(e.target.phone.value, Conf.phone.db_mask).substr(2);
                    var email = e.target.email.value.toLowerCase();
                    var accountId = e.target.account.value;
                    var memoText = e.target.memo.value.replace(/<\/?[^>]+(>|$)/g, ""); //delete html tags from memo
                    var amount = parseFloat(e.target.amount.value);

                    // validate phone
                    if (phoneNum.length > 0 && phoneNum.match(/\d/g).length != Conf.phone.length) {
                        return m.flashError(Conf.tr("Invalid phone"));
                    }

                    if (!amount || amount < 0) {
                        return m.flashError(Conf.tr("Amount is invalid"));
                    }

                    if (memoText.length > 14) {
                        return m.flashError(Conf.tr("Memo text is too long"));
                    }

                    if (this.transferType() == 'byPhone') {
                        var formData = new FormData();
                        formData.append("phone", phoneNum);
                        memoText = 'by_phone';

                        try {
                            // TODO: move to wallet-sdk
                            var xhr = new XMLHttpRequest();
                            xhr.open("POST", Conf.keyserver_host + Conf.keyserver_v_url + '/get_wallet_data', false); // false for synchronous request
                            xhr.send(formData);

                            var response = JSON.parse(xhr.responseText);

                            if (response.status == 'fail') {
                                switch (response.code) {
                                    case 'not_found':
                                        return m.flashError(Conf.tr("User not found! Check phone number"));
                                    default:
                                        return m.flashError(Conf.tr("Connection error"));
                                }
                            }

                            accountId = response.accountId;
                        } catch (e) {
                            return m.flashError(Conf.tr("Connection error"));
                        }
                    }

                    if (this.transferType() == 'byEmail') {
                        var formData = new FormData();
                        formData.append("email", email);
                        memoText = 'by_email';

                        try {
                            // TODO: move to wallet-sdk
                            var xhr = new XMLHttpRequest();
                            xhr.open("POST", Conf.keyserver_host + Conf.keyserver_v_url + '/get_wallet_data', false); // false for synchronous request
                            xhr.send(formData);

                            var response = JSON.parse(xhr.responseText);

                            if (response.status == 'fail') {
                                switch (response.code) {
                                    case 'not_found':
                                        return m.flashError(Conf.tr("User not found! Check phone number"));
                                    default:
                                        return m.flashError(Conf.tr("Connection error"));
                                }
                            }

                            accountId = response.accountId;
                        } catch (e) {
                            return m.flashError(Conf.tr("Connection error"));
                        }
                    }

                    if (!StellarSdk.Keypair.isValidPublicKey(accountId)) {
                        return m.flashError(Conf.tr("Account is invalid"));
                    }

                    if (accountId == Auth.keypair().accountId()) {
                        return m.flashError(Conf.tr("You cannot send money to yourself"));
                    }

                    m.startComputation();
                    m.onLoadingStart();

                    return Conf.horizon.loadAccount(Auth.keypair().accountId()).then(function (source) {
                        // TODO: Do not add memo to tx if it's empty
                        var memo = StellarSdk.Memo.text(memoText);
                        var tx = new StellarSdk.TransactionBuilder(source, { memo: memo }).addOperation(StellarSdk.Operation.payment({
                            destination: accountId,
                            amount: amount.toString(),
                            asset: new StellarSdk.Asset(Conf.asset, Conf.master_key)
                        })).build();

                        tx.sign(Auth.keypair());

                        return Conf.horizon.submitTransaction(tx);
                    }).then(function () {
                        m.flashSuccess(Conf.tr("Transfer successful"));
                    }).catch(function (err) {
                        console.log(err);
                        m.flashError(Conf.tr("Cannot make transfer"));
                    }).then(function () {
                        ctrl.infoAsset('');
                        ctrl.infoAmount('');
                        ctrl.infoAccount('');
                        ctrl.infoPhone('');
                        ctrl.infoEmail('');
                        m.endComputation();
                    });
                };
            },

            view: function view(ctrl) {
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container puller", id: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "form", attrs: { class: "col-lg-6", onsubmit: ctrl.processPayment.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Transfer money")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("Transfer type")] }, { tag: "select", attrs: { name: "transType", required: "required", class: "form-control",
                                                    onchange: ctrl.changeTransferType.bind(ctrl),
                                                    value: ctrl.transferType()
                                                }, children: [{ tag: "option", attrs: { value: "byAccount" }, children: [Conf.tr("by account ID")] }, { tag: "option", attrs: { value: "byPhone" }, children: [Conf.tr("by phone")] }, { tag: "option", attrs: { value: "byEmail" }, children: [Conf.tr("by email")] }] }] }, { tag: "div", attrs: _defineProperty({ class: "form-group"
                                            }, "class", ctrl.transferType() != 'byAccount' ? 'hidden' : ''), children: [{ tag: "label", attrs: {}, children: [Conf.tr("Account ID")] }, { tag: "input", attrs: { name: "account",
                                                    oninput: m.withAttr("value", ctrl.infoAccount), pattern: ".{56}",
                                                    title: Conf.tr("Account ID should have 56 symbols"),
                                                    class: "form-control",
                                                    value: ctrl.infoAccount() } }] }, { tag: "div", attrs: _defineProperty({ class: "form-group"
                                            }, "class", ctrl.transferType() != 'byPhone' ? 'hidden' : ''), children: [{ tag: "label", attrs: {}, children: [Conf.tr("Phone number")] }, { tag: "input", attrs: { name: "phone",
                                                    class: "form-control",
                                                    placeholder: Conf.phone.view_mask,
                                                    oninput: ctrl.addPhoneViewPattern.bind(ctrl),
                                                    value: ctrl.infoPhone() } }] }, { tag: "div", attrs: _defineProperty({ class: "form-group"
                                            }, "class", ctrl.transferType() != 'byEmail' ? 'hidden' : ''), children: [{ tag: "label", attrs: {}, children: [Conf.tr("Email")] }, { tag: "input", attrs: { name: "email",
                                                    type: "email",
                                                    class: "form-control",
                                                    oninput: m.withAttr("value", ctrl.infoEmail),
                                                    value: ctrl.infoEmail() } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("Amount")] }, { tag: "input", attrs: { type: "number", required: "required", name: "amount",
                                                    min: "0.01",
                                                    step: "0.01",
                                                    placeholder: "0.00",
                                                    class: "form-control",
                                                    oninput: m.withAttr("value", ctrl.infoAmount),
                                                    value: ctrl.infoAmount() } }] }, { tag: "div", attrs: { class: "form-group", style: "display:none;" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("Memo message")] }, { tag: "input", attrs: { name: "memo",
                                                    size: "14", maxlength: "14",
                                                    disabled: "disabled",
                                                    oninput: m.withAttr("value", ctrl.infoMemo),
                                                    class: "form-control",
                                                    value: ctrl.infoMemo() } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom" }, children: [Conf.tr("Transfer")] }] }] }] }] }, { tag: "form", attrs: { class: "col-lg-6", onsubmit: ctrl.getInvoice.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Request invoice")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("Invoice code")] }, { tag: "input", attrs: { type: "number", name: "code", required: "required", class: "form-control" } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom" }, children: [Conf.tr("Request")] }] }] }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }];
            }

        };
    }, { "../components/Navbar.js": 8, "../config/Config.js": 11, "../models/Auth.js": 15 }] }, {}, [13]);