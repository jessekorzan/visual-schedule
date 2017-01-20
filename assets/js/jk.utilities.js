var Utilities = (function ($) {
    // 2016
    // @jessekorzan
    // emptycan.com
    
   
	var jk = {};
/* --------------------------------------------------	
-------------------------------------------------- */

    // ########################################
    // 
    // UTILITIES
    //
    // ########################################
    
	jk.pubSub = (function(){
		// David Walsh, genius advice
		// https://davidwalsh.name/pubsub-javascript
		var topics = {},
			hOP = topics.hasOwnProperty;
		return {
			subscribe: function(topic, listener) {
				// Create the topic's object if not yet created
				if(!hOP.call(topics, topic)) topics[topic] = [];
		
				// Add the listener to queue
				var index = topics[topic].push(listener) -1;
		
				// Provide handle back for removal of topic
				return {
					remove: function() {
						delete topics[topic][index];
					}
				};
			},
			publish: function(topic, info) {
				// If the topic doesn't exist, or there's no listeners in queue, just leave
				if(!hOP.call(topics, topic)) return;
		
				// Cycle through topics queue, fire!
				topics[topic].forEach(function(item) {
					item(info != undefined ? info : {});
				});
			}
		}
	})();
	jk.mustache = (function(){
    	var options = {};
    	
    	return {
        	output : function (options) {
                var render = Mustache.to_html($(options.template).html(), options.data);
                
                switch (options.position) {
                    case "replace":
                        $(options.container).html(render);
                        break;
                    case "after":
                    $(options.container).after(render);
                        break;
                    default:
                         $(options.container).append(render);
                }
            }
		}
	})();
	jk.toolTip = (function(){
    	var options = {};
    	
    	return {
        	wrapper : ("body .ui-tool-tip"),
        	create : function() {
            	var _toolTip = $("<div/>").addClass("ui-tool-tip");
            	$("body").append(_toolTip);
        	},
        	destroy : function() {
            	$(jk.toolTip.wrapper).remove();
        	},
        	position : function (target) {
            
                
             
            	$(jk.toolTip.wrapper).css({
                    top : target.offset().top - ($(jk.toolTip.wrapper).outerHeight() + 12) + "px",
                    left : target.offset().left - (target.outerWidth()/2) + "px"
                });
                               
        	},
        	render : function (options) {
                var _mouse = {};
                                
                
                if ($(jk.toolTip.wrapper).length < 1) {
                    jk.toolTip.create();
                }
                                
                Utilities.toolTip.position(options.target);
                
                Utilities.mustache.output({
                    container : $(".ui-tool-tip"),
                    template : options.template,
                    data : {}
                });
                
            }
		}
	})();
	jk.gui = (function(){
    	var options = {};
    	return {
            ID : function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            }
    	}
	})();
	jk.dates = (function(){
    	return {
        	today : function () {
            	var d = new Date(),
            	    weekday = new Array(7);
                
                weekday[0] =  "Sunday";
                weekday[1] = "Monday";
                weekday[2] = "Tuesday";
                weekday[3] = "Wednesday";
                weekday[4] = "Thursday";
                weekday[5] = "Friday";
                weekday[6] = "Saturday";
                
                return weekday[d.getDay()];
        	}
    	}
	})();
	jk.randomNumber = (function(){
    	
    	return {
            range : function (min, max) {
                return Math.random() * (max - min) + min;
            }
        }
    })();
	jk.getJSON = (function(){
    	var options = {};
    	
    	return {
        	process : function (options) {
                var options = (typeof options !== "object") ? {} : options;
                
                $.ajaxSetup({ async: true, cache: false });
                $.ajax ({
                    //dataType : "json",
                    url: options.url,
                    data: options.data,
                    headers: {
                        "Authorization": options.authorization
                    },
                    success: function (data) { 
                		options.callBack(data);
                	},
                    error: function(e) {
                	    console.error(e);
                	    $("body").append("<mark>" + e.responseText + "</mark>");
                	}
                });
            }
        }
        
	})();   
	jk.modal = (function(){
    	var options = {};
    	return {
        	wrapper : ("body .ui-modal"),
        	create : function () {
            	var _modal = $("<div/>").addClass("ui-modal off");
            	$("body").append(_modal);
        	},
        	destroy : function() {
            	$(jk.modal.wrapper).addClass("off");
            	Utilities.animationHelpers.transitionEnd($(jk.modal.wrapper), function(){
                	setTimeout(function(){
                        $(jk.modal.wrapper).remove();
                    }, 260);
                });
        	},
        	render : function (options) {
            	
            	if ($(jk.modal.wrapper).length < 1) {
                    jk.modal.create();
                }
            	
                Utilities.mustache.output({
                    container : $(".ui-modal"),
                    template : options.template,
                    data : options.data
                });
                
                setTimeout(function(){
                    $(jk.modal.wrapper).removeClass("off");
                }, 260);
                
            }
		}
	})();  
	jk.animationHelpers = (function(){
    	var options = {};
    	
    	return {
        	transitionEnd : function (target, func) {
			    target.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",   
				    function(e) {
					    console.log("transition.end");
                        $(this).off("webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd");
                        setTimeout(function(){
                            func();   
                        }, 160);
				    }
				)
		    }
    	}
	})(); 
    return jk;
})(jQuery);