/*global document, XMLHttpRequest, localStorage, basket, RSVP*/

/* https://raw.github.com/amrnt/basket.js/565f1f3c9e2870bf53ed5f9c0962dd9b8571251f/lib/basket.js
* With support for loading CSS files
*/

(function( window, document ) {
    'use strict';

    var head = document.head || document.getElementsByTagName('head')[0];
    var storagePrefix = 'basket-';
    var defaultExpiration = 5000;

    var addLocalStorage = function( key, storeObj ) {
        try {
            localStorage.setItem( storagePrefix + key, JSON.stringify( storeObj ) );
            return true;
        } catch( e ) {
            if ( e.name.toUpperCase().indexOf('QUOTA') >= 0 ) {
                var item;
                var tempScripts = [];

                for ( item in localStorage ) {
                    if ( item.indexOf( storagePrefix ) === 0 ) {
                        tempScripts.push( JSON.parse( localStorage[ item ] ) );
                    }
                }

                if ( tempScripts.length ) {
                    tempScripts.sort(function( a, b ) {
                        return a.stamp - b.stamp;
                    });

                    basket.remove( tempScripts[ 0 ].key );

                    return addLocalStorage( key, storeObj );

                } else {
                    // no files to remove. Larger than available quota
                    return;
                }

            } else {
                // some other error
                return;
            }
        }

    };

    var getUrl = function( url ) {
        var xhr = new XMLHttpRequest();
        var promise = new RSVP.Promise();
        xhr.open( 'GET', url );

        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 ) {
                if( xhr.status === 200 ) {
                    promise.resolve( xhr );
                } else {
                    promise.reject( new Error( xhr.statusText ) );
                }
            }
        };

        xhr.send();

        return promise;
    };

    var saveUrl = function( obj ) {
        return getUrl( obj.url ).then( function( text ) {
            var storeObj = wrapStoreData( obj, text );

            addLocalStorage( obj.key , storeObj );

            return storeObj;
        });
    };

    var addToDOM = function( source ) {
        var text = source.data;
        var isCSS = source.dataType.indexOf('css') !== -1;

        var el = document.createElement( isCSS ? 'style' : 'script');
        if ( isCSS ) {
            el.setAttribute('type', 'text/css');
            if (el.styleSheet){ // >= IE6
                el.styleSheet.cssText = text;
            } else { // Rest
                el.appendChild(document.createTextNode(text));
            }
        } else {
            el.defer = true;
            // Have to use .text, since we support IE8,
            // which won't allow appending to a script
            el.text = text;
        }
        head.appendChild( el );
    };

    var wrapStoreData = function( obj, data ) {
        var now = +new Date();
        obj.data = data.responseText;
        obj.dataType = data.getResponseHeader('content-type');
        obj.stamp = now;
        obj.expire = now + ( ( obj.expire || defaultExpiration ) * 60 * 60 * 1000 );

        return obj;
    };

    var isValidItem = function(source, obj) {
        return (!source || source.expire - +new Date() < 0  || obj.unique !== source.unique || (basket.isValidItem && !basket.isValidItem(source, obj)));
    };

    var handleStackObject = function( obj ) {
        var source, promise;

        if ( !obj.url ) {
            return;
        }

        obj.key =  ( obj.key || obj.url );
        source = basket.get( obj.key );

        obj.execute = obj.execute !== false;

        if (isValidItem(source, obj)) {
            if ( obj.unique ) {
                // set parameter to prevent browser cache
                obj.url += ( ( obj.url.indexOf('?') > 0 ) ? '&' : '?' ) + 'basket-unique=' + obj.unique;
            }
            promise = saveUrl( obj );
        } else {
            promise = new RSVP.Promise();
            promise.resolve( source );
        }

        if( obj.execute ) {
            return promise.then( addToDOM );
        } else {
            return promise;
        }
    };

    var thenRequire = function() {
        var args = arguments;
        var promise = this.then( function() {
            return basket.require.apply( basket, args );
        });
        promise.thenRequire = thenRequire;
        return promise;
    };

    window.basket = {
        require: function() {
            var i, l, promises = [];

            for ( i = 0, l = arguments.length; i < l; i++ ) {
                promises.push( handleStackObject( arguments[ i ] ) );
            }

            var all = RSVP.all( promises );
            all.thenRequire = thenRequire;
            return all;
        },

        remove: function( key ) {
            localStorage.removeItem( storagePrefix + key );
            return this;
        },

        get: function( key ) {
            var item = localStorage.getItem( storagePrefix + key );
            try {
                return JSON.parse( item || 'false' );
            } catch( e ) {
                return false;
            }
        },

        clear: function( expired ) {
            var item, key;
            var now = +new Date();

            for ( item in localStorage ) {
                key = item.split( storagePrefix )[ 1 ];
                if ( key && ( !expired || this.get( key ).expire <= now ) ) {
                    this.remove( key );
                }
            }

            return this;
        },

        isValidItem: null
    };

    // delete expired keys
    basket.clear( true );

})( this, document );