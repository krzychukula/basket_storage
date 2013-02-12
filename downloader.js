/*global console:true */
;(function(window, undefined){
    "use strict";

    function Downloader(){

    }

    Downloader.prototype.start = function () {

        console.log("Start!");

    };

    window.Downloader = Downloader;

})( window );