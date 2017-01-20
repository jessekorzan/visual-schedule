var Users = (function ($) {
    // 2017
    // @jessekorzan
    //
	var jk = {};
/* --------------------------------------------------	
-------------------------------------------------- */
    jk.services = {
        createNewUser : function() {
            var _newUserID = Utilities.gui.ID(),
                _newUser = {};
                
            _newUser = {
                "id" : _newUserID,
                "name" : "new user",
                "days" : App.config.defaults.user.days
            }
            
            App.vars.currentUser = _newUserID;
            App.vars.data[_newUserID] = _newUser;
            App.services.autoSave();       
        },
        deleteUser : function(id) {
            var _card = $(App.vars.userCard + "[data-target='" + id + "']");
            _card.removeClass("edit");
            Utilities.animationHelpers.transitionEnd(_card, function(){
                delete App.vars.data[id];
                App.services.autoSave();
                $(App.vars.usersContainer).html("");
                Users.views.listUsers();    
            });
        }
    };
    jk.views = {
        listUsers : function () {
            $(App.vars.title).html("Schedules");
            $.each(App.vars.data, function(i,v){
                //already on screen?
                if ($("#" + v.id).length == 0) {
                
                    Utilities.mustache.output({
                        container : $(App.vars.usersContainer),
                        template : "#user",
                        data : {
                            name : v.name,
                            userID : v.id,
                            action : "schedule"
                        }
        	        });
        	        $("#" + v.id).addClass("inject");
                    setTimeout(function(){
        	            $("#" + v.id).removeClass("inject");    
    	            }, 260);
	            }
            });
            // adduser 
            if ($(".new").length == 0) {
                Utilities.mustache.output({
                    container : $(App.vars.usersContainer),
                    template : "#new-user",
                    data : {
                        action : "create",
                        class : "new"
                    }
    	        });
	        } else {
    	        $(App.vars.usersContainer).append($(".new"));
	        }
        },
        editUserName : function (id) {
            var _card = $(App.vars.userCard + "[data-target='" + id + "']");
            _card.addClass("edit").find("input").focus();
            _card.find("input").val(_card.find("input").val());
        }
    }
    return jk;
})(jQuery);