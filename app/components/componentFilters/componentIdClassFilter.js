app.filter('componentIdClassFilter',function(){
    return function(componentId){
       var filterId = "_";
       // filter out no alphanum characters 
        for(var i=0,len=componentId.length;i<len;i++){
            var code = componentId.charCodeAt(i);
            if((code > 47 && code <58) 
            || (code >64 && code <91) 
            || (code > 96 && code < 123)){
                filterId += componentId[i];
            }
        }

      
        return filterId
    }
})