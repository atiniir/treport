/* 
A big part of the code comes from an example provided by Trello.
*/


/*
    The Script iself
*/

//creates the markdown converter for later use
var converter=new Markdown.Converter();
    editor=new Markdown.Editor(converter);

//Authorizes if the user is already connected
Trello.authorize({interactive:false,success: onAuthorize});

$(function(){
	bindEvents();
});

/*
    Events
*/

//uses the value of the clicked button to make the API call through getFormattedActions()
var bindEvents=function(){
	$(".reportButton").click(function(e){
		var startDate=getStartDate(this.value);
		
		getFormattedActions(startDate,function(actionList){
			$("#wmd-input").text(renderActions(actionList));
			editor.refreshPreview();
			$(".report").show();        
		});
		
	});

	//Uses the Trello API authorize method to connect
	$("#connectLink").click(function(){
		Trello.authorize({
			type: "popup",
			success: onAuthorize
		})
	});
		
	//... Disconnects!
	$("#disconnect").click(logout);
};
	


/*
    Under the hood    
*/


//Takes the action feed and makes an object that will be easier to render
var groupActions=function(actions){
    var list={};
    _.each(actions,function(action){
        if (action.data.board && action.data.card && (action.data.listAfter || (action.data.list && action.data.list.name == "To Do"))) {
            var listName=action.data.listAfter?action.data.listAfter.name: "To Do",
                cardName=action.data.card.name,
                boardName=action.data.board.name;
            if (!list[boardName]){
                list[boardName]={};                
            }
            if (!list[boardName][listName]){
                list[boardName][listName]=[];                
            }       
            list[boardName][listName].push(cardName);
        }
    });
    return list;
};




//renders Markdown from the object generated by groupActions()
var renderActions=function(actionList){
    var buffer="#Report\n";
    _.each(actionList,function(lists,board){
        buffer+="## On the "+board+" project\n";
        _.each(lists,function(cards,list){
            switch (list){
                case "Done":
                    buffer+="### I finished:";
                break;
                case "Doing":
                    buffer+="### I got started with:";
                break;
                case "To Do":
                    buffer+="### I added to my Todo list:";
                break;
            }
            buffer+="\n";
            _.each(cards,function(card,current){
                buffer+="* "+card+"\n";
            });
            buffer+="\n";
        });
    });
    return buffer;
};

//Calls the API, makes an object (using groupActions) with the result, and sends it to the callback
var getFormattedActions=function(time,callback){
    Trello.get("members/me/actions?since="+time,function(actions){
		callback(groupActions(actions));
    });
};


//Prepares a date String to be used as value of the "since" parameter in the API call 
var getStartDate=function(time){
    var startDate=new Date();
    if (time=="Weekly"){
        startDate.setDate(startDate.getDate()-startDate.getDay()+1);//we need it to start on Monday
    }
    startDate.setUTCHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    //startDate.setDate(22); #for testing purposes
    return startDate.toISOString();    
};

//callback from the connection event
var onAuthorize = function() {
    updateLoggedIn();
    updateFullName();
    editor.run();//only run the editor if the user actually connects
};





/*
The functions after this comment were in the original Trello API example
*/

var updateFullName=function(){
    Trello.members.get("me", function(member){
        $("#fullName").text(member.fullName); 
    });
};

var updateLoggedIn = function() {
    var isLoggedIn = Trello.authorized();
    $("#loggedout").toggle(!isLoggedIn);
    $("#loggedin").toggle(isLoggedIn);        
};
    
var logout = function() {
    Trello.deauthorize();
    updateLoggedIn();
};


















