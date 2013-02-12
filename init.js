

(function(){
    var prog;
    var app;

    var runApp = function(){
        //init application
        app = new App();
        app.start();

        prog.stop();

        var clear = function(){
            basket.clear();
            window.location.reload();
        };

        Zepto(document.body).tap(clear);
        jQuery(document.body).click(clear);
    };

    var progressCallback = function (progress) {
        //init
        console.log('progressCallback', progress);

        if(!prog){
            prog = new Progress(runApp);

            prog.setProgress(progress * 100);
            prog.start();
        }

        prog.setProgress(progress * 100);
    };

    basketLoader.load([
        [{
            url: 'style.css'
        },{
            url: 'progress.js'
        }],[{
            url: 'jquery-1.9.1.js'
        }],[{
            url: 'zepto.js'
        }],[{
            url: 'app.js'
        }]
        ], progressCallback);


}());