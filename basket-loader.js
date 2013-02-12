/*global console:true */
(function( window, basket ) {
    'use strict';

    function load(list, itemCallback){
        var items = list.shift();
        if(items){
            console.log(items, list);
            basket.require.apply(basket, items).then(function(){
                itemCallback();
                load(list, itemCallback);
            }, function(){
                console.log('error', this, arguments);
            });
        }else{
            itemCallback();
        }
    }

    var loadItems = function( requiredList, progressCallback ) {
        var progress = 0;
        var max = requiredList.length;

        var itemCallback = function(){
            progress++;
            console.log("itemCallback", progress, max);
            if(progressCallback){
                try{
                    console.log('run progressCallback', progress/max);
                    progressCallback(progress/max);
                }catch(e){
                    console.log('progress error');
                }
            }
        };

        load(requiredList, itemCallback);
    };


    window.basketLoader = {
        load: loadItems
    };


})( this, basket );