angular.module('app').service('activeColumn', activeColumn);

activeColumn.$inject = [
];


function activeColumn() {
    var self = this;

    var column = undefined;
    var run = undefined

    self.getColumn = getColumn;
    self.getRun = getRun

    self.setColumn = setColumn;
    self.setRun = setRun;

    self.isActive = isActive;

    self.clear = clear;

    self.subscribeActiveChange = subscribeActiveChange;
    self.publishActiveChange = publishActiveChange;

    function getColumn(){
        return column;
    }

    function getRun(){
        return run;
    }

    function setColumn(columnName){
        column = columnName;
    }

    function setRun(runId){
        run = runId;
    }

    function isActive(runId,columnName){
        return (run === runId && column === columnName);
    }

    function clear(){
        column = undefined;
        run = undefined;
    }

    var changeActiveSubs = [];
    function subscribeActiveChange(fn){
        changeActiveSubs.push(fn);
    }

    function publishActiveChange(){
        for(var i=0,len = changeActiveSubs.length;i<len;i++){
            changeActiveSubs[i]();
        }
    }

}