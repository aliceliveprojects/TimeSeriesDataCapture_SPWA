angular.module('app').service('timeSeriesTrendService', timeSeriesTrendService);

timeSeriesTrendService.$inject = [
];


function timeSeriesTrendService() {
    var self = this;


    var trends = [];

    function trendLine(id, columnName,data = []) {
        this.id = id,
            this.columnName = columnName,
            this.data = data
    }




    self.addTrend = function (id, columnName, data) {
        var newTrend = new trendLine(id, columnName, data);
        trends.push(newTrend);
        return newTrend;
    }



    self.removeTrend = function(id,columnName){
        for(var i=0,length=trends.length;i<length;i++){
            if(trends[i].id === id && trends[i].columnName === columnName){
                trends.splice(i,1);
            }
        }
    }

    self.getTrend = function (id, columnName) {
        for (var i = 0, n = trends.length; i < n; i++) {
            if (trends[i].id === id && trends[i].columnName === columnName) {
                return trends[i];
            }
        }
    }

    self.getTrends = function () {
        return trends;
    }

    self.clearTrends = function () {
        trends = [];
    }

}



