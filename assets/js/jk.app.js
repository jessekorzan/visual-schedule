var App = (function ($) {
    // 2017
    // @jessekorzan
    //
	var jk = {};
	jk.config = {
    	key : "AIzaSyDLeXJ9r25Yx7VM33h5FDQuZNlfZGixfE8", // google search API key
    	defaults : {
        	imgPlaceholder : "../assets/img/default.svg",
        	user : {
            	"userName" : "click to edit name",
                "days" : {
                	"monday" : [],
            	    "tuesday" : [],
            	    "wednesday" : [],
            	    "thursday" : [],
            	    "friday" : [],
            	    "saturday" : [],
            	    "sunday" : []
                }
            }
    	}
	};
	jk.vars = {
    	state : "users",
    	file : "visualSched",
    	data : {},
    	currenUser : "",
    	currentDay : "monday",
    	currentCardID : 0,
    	title : "h1",
    	userCard : ".card-user",
    	schedCard : ".card-item",
    	usersContainer : ".list-users",
    	schedContainer : ".list-sched",
    	stateContainer : "body",
    	navContainer : "nav.ui-schedule ul"
	}
/* --------------------------------------------------	
-------------------------------------------------- */
    // start it up
    jk.init = function () {
        App.controller.ui();
        App.controller.subscribers();
        App.views.defaults();
    };
/* --------------------------------------------------	
-------------------------------------------------- */
    jk.services = {
        imageSearch : function (query, func) {
            var _options = {
                url : "https://www.googleapis.com/customsearch/v1",
                //authorization : "Bearer " + ACCESS_TOKEN,
                data : {
                    q : query,
                    cx : "013305223341776888441:bzt8j7us5kw",
                    searchType : "image",
                    imgSize : "large",
                    //rights : "cc_noncommercial",
                    safe : "high",
                    key :   App.config.key,
                },
                callBack : func
            }
            Utilities.getJSON.process(_options);
        },
        autoSave : function () {
            console.log("saving");
            localStorage.setItem(App.vars.file, JSON.stringify(App.vars.data));
        }
    };
    jk.views = {
        state : function (state) {
            App.vars.state = state;
            $(App.vars.stateContainer).attr({"data-state" : App.vars.state});
        },

        defaults : function () {
            
            var _saved = JSON.parse(localStorage.getItem(App.vars.file));
            
            if (_saved) {
                // use local storage
                App.vars.data = _saved;
                
                var _hashbang = window.location.hash.substr(1).split("!/")[1];
        
                if (_hashbang != "users" && _hashbang != undefined) {
                    Schedule.views.viewSchedule(_hashbang);
                } else {     
                    Schedule.views.clearSchedule();
                    Users.views.listUsers();
                }
            } else {
                // first time (or no saved data)
                Users.services.createNewUser();
                Users.views.listUsers();
            }
        }
    }
     // ########################################
    // 
    // CONTROLLER
    //
    // ########################################
    jk.controller = {
        ui : function () {
            $("body").on("click", "[data-action]", function(e){
                e.preventDefault();
                e.stopPropagation();
                var _action = $(this).data().action,
                    _id = $(this).data().target;
                    
                console.log(_action);
                
                if ($(e.target).parent().hasClass("edit") && _action != "save") {
                    $("input[data-target='" + _id + "'").select();
                    
                } else {
                    Utilities.pubSub.publish(_action, {
                        id : _id
                    });
                }
            });
            
            // edits
            $("body").on("change", ".ui-label", function(e){
                var _id = $(this).data().target;
                Schedule.services.updateCard(_id);
            });
            $("body").on("change", ".ui-time", function(e){
                var _id = $(this).data().target;
                App.vars.data[App.vars.currentUser].days[App.vars.currentDay][Schedule.services.findCard(_id)].time = $(this).val();
                App.services.autoSave();
            });
            $("body").on("keydown", "input", function(e){
                var _id = $(this).data().target;
                if (e.keyCode == 13) {
                    Utilities.pubSub.publish("save", {
                        id : _id
                    });
                }
            });
            
        },
        subscribers : function() {            
            Utilities.pubSub.subscribe("create", function(obj){
                Users.services.createNewUser();
                Users.views.listUsers();
            });
            Utilities.pubSub.subscribe("schedule", function(obj){
                // view schedule
                Schedule.views.viewSchedule(obj.id);
            });
            Utilities.pubSub.subscribe("add", function(obj){
                // insert after this ID
                App.vars.currentCardID = obj.id;
                Schedule.views.newCard();
            });
            Utilities.pubSub.subscribe("delete", function(obj){
                Schedule.views.deleteCard(obj.id);
            });
            Utilities.pubSub.subscribe("refresh", function(obj){
                Schedule.services.updateCard(obj.id);
            });
            Utilities.pubSub.subscribe("changeDay", function(obj){
                Schedule.views.listDay(obj.id);
            });
            
            // user card actions
            Utilities.pubSub.subscribe("edit", function(obj){
                // edit user name
                Users.views.editUserName(obj.id);
            });
            Utilities.pubSub.subscribe("removeUser", function(obj){
                Utilities.modal.render({
                    template : "#modal-01",
                    data : {
                        id : obj.id
                    }
    	        }); 
            });
            Utilities.pubSub.subscribe("save", function(obj){
                // are we in users or schedule?
                if (App.vars.state == "users") {
                    // saving a user name
                    App.vars.data[obj.id].name = $("input[data-target='" + obj.id + "'").val();
                }
                App.services.autoSave();
                $("[data-target='" + obj.id + "']").removeClass("edit").blur();
            });    
            Utilities.pubSub.subscribe("back", function(obj){
                Schedule.views.clearSchedule();
                App.views.state("users");
                App.views.defaults();
            }); 
            window.addEventListener("popstate", function(e) {
                jk.views.state(e.state);
                if (e.state == "users") {
                    App.views.defaults();
                } else {
                    Schedule.views.viewSchedule(jk.vars.currentUser);
                }
            });
        }
    }
    return jk;
})(jQuery);
$(function () {
	App.init();
});