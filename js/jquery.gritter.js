/*
 * Gritter for jQuery
 * http://www.boedesign.com/
 *
 * Copyright (c) 2009 Jordan Boesch
 * Dual licensed under the MIT and GPL licenses.
 *
 * Date: December 1, 2009
 * Version: 1.6
 */

(function($){
 	
	/**
	* Set it up as an object under the jQuery namespace
	*/
	$.gritter = {};
	
	/**
	* Set up global options that the user can over-ride
	*/
	$.gritter.options = {
		fade_in_speed: 'medium', // how fast notifications fade in
		fade_out_speed: 2000, // how fast the notices fade out
		time: 6000 // hang on the screen for...
	}
	
	/**
	* Add a gritter notification to the screen
	* @see Gritter#add();
	*/
	$.gritter.add = function(params){

		try {
			// returns a unique id
			return Gritter.add(params);
		} catch(e) {
			var err = 'Gritter Error: ' + e;
			(console && console.error) ? console.error(err, params) : alert(err);
		}
		
	}
	
	/**
	* Remove a gritter notification from the screen
	* @see Gritter#removeSpecific();
	*/
	$.gritter.remove = function(id, params){
		Gritter.removeSpecific(id, params || '');
	}
	
	/**
	* Remove all notifications
	* @see Gritter#stop();
	*/
	$.gritter.removeAll = function(params){
		Gritter.stop(params || '');
	}
	
	/**
	* The initialization of our Gritter object literal goodness
	* @constructor
	*/
	var Gritter = {
	    
	    // Public - options to over-ride with $.gritter.options in "add"
		fade_in_speed: '',
		fade_out_speed: '',
		time: '',
	    
	    // Private - no touchy the private parts
		_custom_timer: 0,
		_item_count: 0,
		_is_setup: 0,
		_tpl_close: '<div class="gritter-close"></div>',
		_tpl_item: '<div id="gritter-item-[[number]]" class="gritter-item-wrapper [[item_class]]" style="display:none"><div class="gritter-top"></div><div class="gritter-item">[[image]]<div class="[[class_name]]"><span class="gritter-title">[[username]]</span><p>[[text]]</p></div><div style="clear:both"></div></div><div class="gritter-bottom"></div></div>',
		_tpl_wrap: '<div id="gritter-notice-wrapper"></div>',
	    
		/**
		* Add a gritter notification to the screen
		* @param {Object} params The object that contains all the options for drawing the notification
		* @return {Integer} The specific numeric id to that gritter notification
		*/
		add: function(params){
	        
			// We might have some issues if we don't have a title or text!
			if(!params.title || !params.text){
				throw 'You need to fill out the first 2 params: "title" and "text"'; 
			}
			
			// check the options and set them once
			if(!this._is_setup){
				this._runSetup();
			}
	        
			// basics
			var user = params.title, 
				text = params.text,
				image = params.image || '',
				sticky = params.sticky || false,
				item_class = params.class_name || '',
				time_alive = params.time || '';
			
			this._verifyWrapper();
			
			this._item_count++;
			var number = this._item_count, 
				tmp = this._tpl_item;
			
			// callbacks - each callback has a unique identifier so they don't get over-ridden
			this['_before_open_' + number] = ($.isFunction(params.before_open)) ? params.before_open : function(){};
			this['_after_open_' + number] = ($.isFunction(params.after_open)) ? params.after_open : function(){};
			this['_before_close_' + number] = ($.isFunction(params.before_close)) ? params.before_close : function(){};
			this['_after_close_' + number] = ($.isFunction(params.after_close)) ? params.after_close : function(){};
		
			// reset
			this._custom_timer = 0;
			
			// a custom fade time set
			if(time_alive){
				this._custom_timer = time_alive;
			}
			
			var image_str = (image != '') ? '<img src="' + image + '" class="gritter-image" />' : '',
				class_name = (image != '') ? 'gritter-with-image' : 'gritter-without-image';
			
			tmp = this._str_replace(
				['[[username]]', '[[text]]', '[[image]]', '[[number]]', '[[class_name]]', '[[item_class]]'],
				[user, text, image_str, this._item_count, class_name, item_class], tmp
			);
	        
			this['_before_open_' + number]();
			$('#gritter-notice-wrapper').append(tmp);
			
			var item = $('#gritter-item-' + this._item_count);
			
			item.fadeIn(this.fade_in_speed, function(){
				Gritter['_after_open_' + number]($(this));
			});
	        
			if(!sticky){
				this._setFadeTimer(item, number);
			}
			
			// bind the hovering states
			$(item).bind('mouseenter mouseleave', function(event){
				if(event.type == 'mouseenter'){
					if(!sticky){ 
						Gritter._restoreItemIfFading(this, number);
					}
				}
				else {
					if(!sticky){
						Gritter._setFadeTimer($(this), number);
					}
				}
				Gritter._hoverState($(this), event.type);
			});
			
			return number;
	    
		},
		
		/**
		* If we don't have any more gritter notifications, get rid of the wrapper using this check
		* @param {Integer} unique_id The ID of the element that was just deleted, use it for a callback
		*/
		_countRemoveWrapper: function(unique_id){
		    
			// callback
			this['_after_close_' + unique_id]($('#gritter-item-' + unique_id));
			// check if it's empty, if it is.. remove the wrapper
			if($('.gritter-item-wrapper').length == 0){
				$('#gritter-notice-wrapper').remove();
			}
		
		},
		
		/**
		* Fade out an element after it's been on the screen for x amount of time
		* @param {Object} e The jQuery element to get rid of
		* @param {Integer} unique_id The id of the element to remove
		*/
		_fade: function(e, unique_id){
			
			Gritter['_before_close_' + unique_id](e);
			e.animate({
				opacity:0
			}, Gritter.fade_out_speed, function(){
				e.animate({ height: 0 }, 300, function(){
					e.remove();
					Gritter._countRemoveWrapper(unique_id);
				})
			})
		    
		},
		
		/**
		* Perform actions based on the type of bind (mouseenter, mouseleave) 
		* @param {Object} e The jQuery element
		* @param {String} type The type of action we're performing: mouseenter or mouseleave
		*/
		_hoverState: function(e, type){
			
			// Change the border styles and add the (X) close button when you hover
			if(type == 'mouseenter'){
		    	
				e.addClass('hover');
		    	
				if(e.find('img').length){
					e.find('img').before(this._tpl_close);
				}
				else {
					e.find('span').before(this._tpl_close);
				}
				
				e.find('.gritter-close').click(function(){
					Gritter._remove(this);
				});
			
			}
			// Remove the border styles and (X) close button when you mouse out
			else {
				
				e.removeClass('hover');
				e.find('.gritter-close').remove();
				
			}
		    
		},
		
		/**
		* Remove a notification, this is called from "close" button
		* @param {Object} e The jQuery element
		*/
		_remove: function(e){
			
			var gritter_wrap = $(e).parents('.gritter-item-wrapper');
			var unique_id = gritter_wrap.attr('id').split('-')[2];
			this['_before_close_' + unique_id](gritter_wrap);
		    
			gritter_wrap.fadeOut('medium', function(){ 
				$(this).remove();  
				Gritter._countRemoveWrapper(unique_id);
			});
		     
		},
		
		/**
		* Remove a specific notification based on an ID
		* @param {Integer} unique_id The ID used to delete a specific notification
		* @param {Object} params A set of options passed in to determine how to get rid of it
		*/
		removeSpecific: function(unique_id, params){
			
			var e = $('#gritter-item-' + unique_id);
			this['_before_close_' + unique_id](e);
			
			if(typeof(params) === 'object'){
				if(params.fade){
					var speed = this.fade_out_speed;
					if(params.speed){
						speed = params.speed;
					}
					e.fadeOut(speed, function(){
						e.remove();
					});
				}
			}
			else {
				e.remove();
			}
			
			this._countRemoveWrapper(unique_id);
			
		},
		
		/**
		* If the item is fading out and we hover over it, restore it!
		* @param {Object} e The HTML element to remove
		* @param {Integer} unique_id The ID of the element
		*/
		_restoreItemIfFading: function(e, unique_id){
			
			clearTimeout(Gritter['_int_id_' + unique_id]);
			$(e).stop().css({ opacity: 1 });
		    
		},
		
		/**
		* Setup the global options - only once
		*/
		_runSetup: function(){
		
			for(opt in $.gritter.options){
				this[opt] = $.gritter.options[opt];
			}
			this._is_setup = 1;
		    
		},
		
		/**
		* Set the notification to fade out after a certain amount of time
		* @param {Object} item The HTML element we're dealing with
		* @param {Integer} unique_id The ID of the element
		*/
		_setFadeTimer: function(item, unique_id){
			
			var timer_str = (this._custom_timer) ? this._custom_timer : this.time;
			Gritter['_int_id_' + unique_id] = setTimeout(function(){ Gritter._fade(item, unique_id); }, timer_str);
		
		},
		
		/**
		* Bring everything to a halt
		* @param {Object} params A list of callback functions to pass when all notifications are removed
		*/  
		stop: function(params){
			
			// callbacks (if passed)
			var before_close = ($.isFunction(params.before_close)) ? params.before_close : function(){};
			var after_close = ($.isFunction(params.after_close)) ? params.after_close : function(){};
			
			var wrap = $('#gritter-notice-wrapper');
			before_close(wrap);
			wrap.fadeOut(function(){
				$(this).remove();
				after_close();
			});
		
		},
		
		/**
		* An extremely handy PHP function ported to JS, works well for templating
		* @param {String/Array} search A list of things to search for
		* @param {String/Array} replace A list of things to replace the searches with
		* @return {String} sa The output
		*/  
		_str_replace: function(search, replace, subject, count){
		
			var i = 0, j = 0, temp = '', repl = '', sl = 0, fl = 0,
				f = [].concat(search),
				r = [].concat(replace),
				s = subject,
				ra = r instanceof Array, sa = s instanceof Array;
			s = [].concat(s);
			
			if(count){
				this.window[count] = 0;
			}
		
			for(i = 0, sl = s.length; i < sl; i++){
				
				if(s[i] === ''){
					continue;
				}
				
		        for (j = 0, fl = f.length; j < fl; j++){
					
					temp = s[i] + '';
					repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
					s[i] = (temp).split(f[j]).join(repl);
					
					if(count && s[i] !== temp){
						this.window[count] += (temp.length-s[i].length) / f[j].length;
					}
					
				}
			}
			
			return sa ? s : s[0];
		    
		},
		
		/**
		* A check to make sure we have something to wrap our notices with
		*/  
		_verifyWrapper: function(){
		  
			if($('#gritter-notice-wrapper').length == 0){
				$('body').append(this._tpl_wrap);
			}
		
		}
	    
	}
	
})(jQuery);
