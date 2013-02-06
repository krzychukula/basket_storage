/*global console:true */
;(function(window, undefined){
    "use strict";

    function App(){

    }

    App.prototype.start = function () {
        console.log("Start!");
        var title = document.createElement('h1');
        title.innerText = 'Witaj!';
        document.body.appendChild(title);
        console.timeStamp('app started');
    };

    window.App = App;

})( window );