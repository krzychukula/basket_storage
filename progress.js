/*global console:true */
var Progress = (function(){
    "use strict";

    function Progress(callback){
        this.val = 0;
        this.targetVal = 10;
        this.callback = callback;
        this.prog = document.getElementById('init-prog');
    }

    var endAnimation = function(){

        var self = this;
        this.prog.value = this.val = 100;
        setTimeout(function(){
            if(self.removed){
                return;
            }
            self.prog.parentNode.removeChild(self.prog);
            self.removed = true;

            if(self.callback){
                console.timeEnd('stop');
                console.timeStamp('callback');
                self.callback();
            }
        }, 100);

    };

    var animateProgress = function(){
        if(this.val < this.targetVal){
            var plus = (this.targetVal - this.val) / 2;
            plus = (plus < 2)? 2 : plus;
            plus = (plus > 5)? 5 : plus;
            this.val += plus;
            console.log(this.val+"%");
        }
        if(this.val >= 100){
            endAnimation.call(this);
        }else{
            setTimeout(animateProgress.bind(this), 1000/60);
        }

        this.prog.value = this.val;
    };

    Progress.prototype.start = function(){
        animateProgress.call(this);
    };

    Progress.prototype.setProgress = function(value) {
        console.log('Set progress from: ', this.val, ' to: ', value);

        this.targetVal = value;
    };

    Progress.prototype.stop = function(){
        console.time('stop');
        console.log('stop called');

        this.setProgress(100);
    };

    return Progress;
}());