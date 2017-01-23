var Schedule = (function ($) {
    // 2017
    // @jessekorzan
    //
	var jk = {};
/* --------------------------------------------------	
-------------------------------------------------- */
    jk.services = {
        checkScheduleEmpty :  function () {
            if (App.vars.data[App.vars.currentUser].days[App.vars.currentDay].length <= 0) {
                Schedule.services.newCard(Utilities.gui.ID());
            }  
        },
        newCard : function (id) {
            //new card position
            var _pos = $(App.vars.schedCard).index($("#" + App.vars.currentCardID));
            
            // new card
            var _new = {
                day : App.vars.currentDay,
                class : "new",
                time : "00:00",
                id : id,
                label : "enter label",
                imageURL : App.config.defaults.imgPlaceholder
            } 
            
            // if add+ button, insert "into" the data
            if (App.vars.currentCardID) {
                App.vars.data[App.vars.currentUser].days[App.vars.currentDay].splice(_pos + 1, 0, _new);
                
            } else {
                App.vars.data[App.vars.currentUser].days[App.vars.currentDay].push(_new);
            }

            Schedule.views.schedCard(_new); 
            App.services.autoSave();
        },
        findCard : function (id) {
            var _rtn;
            
            $.each(App.vars.data[App.vars.currentUser].days[App.vars.currentDay], function(i,v){
                if (v.id === id) {
                    _rtn = i;
                }
            });
            return _rtn;
            
           
        },
        deleteCard : function (id) {
            App.vars.data[App.vars.currentUser].days[App.vars.currentDay].splice(Schedule.services.findCard(id), 1);
            App.services.autoSave();
        },
        updateCard : function (id) {
            var _card = $("#" + id),
                _index = Schedule.services.findCard(id);
            
            App.vars.data[App.vars.currentUser].days[App.vars.currentDay][Schedule.services.findCard(id)] = {
                label : _card.find(".ui-label").val(),
                day : App.vars.currentDay,
                id : id,
                time : _card.find(".ui-time").val(),
                imageURL : _card.find("img").attr("src")
            };
            _card.addClass("refresh");
            Schedule.views.cardImage(id, App.config.defaults.imgPlaceholder);
            // update view
            $(App.vars.schedCard).removeClass("new");
            App.services.imageSearch(_card.find(".ui-label").val(), function(data){
                var _num = Math.floor(Utilities.randomNumber.range(1, data.items.length)),
                    _src = data.items[_num].link;    
                
                App.vars.data[App.vars.currentUser].days[App.vars.currentDay][Schedule.services.findCard(id)].imageURL = _src;
                // update view
                 setTimeout(function(){
                    Schedule.views.cardImage(id, _src);
                    _card.removeClass("refresh");
                }, 1000);
                
                // update the data
                App.services.autoSave();
                    
            });
        }
    };
    jk.views = {
        cardImage : function (id, src) {
            var _img = $("#" + id).find("img");
            
            _img.attr({"src" : src});
            _img.css({
                //"height" : "300px"
            });
        
        },
        schedCard : function (data) {
            data = $.extend({}, {
                container : $(App.vars.schedContainer)
            }, data);
            if (App.vars.currentCardID) {
                data.position = "after";
                data.container = $("#" + App.vars.currentCardID);
                App.vars.currentCardID = null;
            }
            // generate display view
            Utilities.mustache.output({
                container : data.container,
                template : "#card-item",
                position : data.position,
                data : data
	        });
	        $("#" + data.id).addClass("inject");
	        setTimeout(function(){
    	         $("#" + data.id).removeClass("inject");    
	        }, 260);
        },
        deleteCard : function (id) {
            var _card = $("#" + id);
            
            // update data
            Schedule.services.deleteCard(id);
            // update display
            $(App.vars.schedCard).removeClass("new")
            _card.addClass("delete");
            Utilities.animationHelpers.transitionEnd(_card, function(){
                _card.remove();
                Schedule.services.checkScheduleEmpty();    
            });
            
        },
        newCard : function () {
            var _newID = Utilities.gui.ID();
            
            $(App.vars.schedCard).removeClass("new");
            Schedule.services.newCard(_newID);
            
            $('html, body').animate({
                    scrollTop: $("#" + _newID).offset().top - 122
            }, 500);
        },
        listDay : function (day) {
            // reset view
            App.vars.currentDay = day.toLowerCase();
            $(App.vars.title).html(App.vars.data[App.vars.currentUser].name + " &mdash; " + day);
            $(App.vars.schedContainer).html("");
            $(App.vars.navContainer).find("li a").removeClass("on");
            $(App.vars.navContainer).find("[data-target='" + App.vars.currentDay + "']").addClass("on");
            
            // display cards per current day
            $.each(App.vars.data[App.vars.currentUser].days[App.vars.currentDay], function(i,v){
                Schedule.views.schedCard({
                    day : this.day,
                    id : this.id,
                    label : this.label,
                    time : this.time,
                    imageURL : this.imageURL
                });
            });
            
            Schedule.services.checkScheduleEmpty(); 
            
        },
        listWeek : function () {
            $.each(App.vars.data[App.vars.currentUser].days, function(i,v){
                // add days to days navigator
                // generate display view
                Utilities.mustache.output({
                    container : $(App.vars.navContainer),
                    template : "#nav-item",
                    data : {
                        str : i
                    }
    	        });
    	        $("#" + i).addClass("inject");
                setTimeout(function(){
    	            $("#" + i).removeClass("inject");    
	            }, 260);
            });
        },

        clearSchedule : function () {
            $(App.vars.navContainer).html("");
            $(App.vars.schedContainer).html("");
            history.replaceState("users", null, "#!/users");
        },
        viewSchedule : function (id) {
            App.views.state("schedule");
            App.vars.currentUser = id;
            Schedule.views.listWeek();
            Schedule.views.listDay(Utilities.dates.today());
            history.pushState(App.vars.state, null, "#!/" + id);
        }
    }
    return jk;
})(jQuery);