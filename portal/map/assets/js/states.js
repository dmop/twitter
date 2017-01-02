function getUrlVars(){
    var vars = {}, hash;
    var hashes = [];
    if(window.location.search)
      hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++){
        hash = hashes[i].split('=');
        vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
}

function pushState(obj){
  var str = Object.keys(obj).map(function(key){
    return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
  }).join('&');
  var title = Object.keys(obj).map(function(key){
    return " - " + encodeURIComponent(obj[key]);
  }).join('&');

  History.pushState(obj, title , "?"+str);
}

// Establish Variables
var History = window.History;
var State = History.getState();
var initState = getUrlVars();

// Bind to State Change
History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
  var State = History.getState();
   //console.log('statechange:', State.data, State.title, State.url);
});

pushState(initState)
//console.log(initState);
