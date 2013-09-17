(function($){
	var jMeny = function(element, options, $content){
		this.$element = $(element);
		this.$content = $content;
		this.options = $.extend({}, $.fn.jMeny.defaults, options);
		this.select = this.options.select || function($elem, event){};
		this.initialize();
	};
	jmeny.prototype = {
		elemNum: 0,
		listNum: 0,
		makeList: function($parent){
			var $menu = $('<div>').addClass('jmlmenu jmlm-sub' + (this.options.orientation=='up' ? 'jmlmenu-up':'jmlmenu-down')).css('position', (this.options.fixed)?'fixed'|'absolute').css('width', this.options.width).css('display','none');
			var $display = $('<div>').addClass('jmlmenu-display').appendTo($menu);
			var num = this.options.maxElementInOneLevel;
			var outOfBounds = false;
			var pageNum = 1;
			var $nowPage = $('<ul>').addClass('jmlmenu-page').attr('page', pageNum++).addClass('jmlm-nowpage').appendTo($display);
			var that = this;
			$parent.children('li').each(function(i){
				var $li = $(this).addClass('jmlmenu-elem').attr('mid', that.elemNum++);
				var cont = $li.children('.jmlm-content').text();
				$li.attr('title', cont);
				if($li.attr('elem-color')){
					$li.css('background-color', $li.attr('elem-color'));
				}
				if($li.attr('font-color')){
					$li.css('color', $li.attr('font-color'));
				}
				if((i % num == 0) && i > 0){
					$nowPage = $('<ul>').addClass('jmlmenu-page').attr('page', pageNum++).css('display', 'none').appendTo($display);
					outOfBounds = true;
				}
				if(that.options.ajaxExpand && $li.attr('expanable') != undefined){
					$li.addClass('jmlmenu-expanable jmlm-ajax').append($('<i>').addClass('icon-chevron-right').css('float', 'right').css('margin-right', '3px').css('margin-top','auto').css('margin-bottom','auto'));
				}
				else if($li.children('ul').length > 0 && $li.children('ul').children('li').length > 0){
					$li.children('ul').css('display', 'none');
					$li.addClass('jmlmenu-expanable').append($('<i>').addClass('icon-chevron-right').css('float', 'right').css('margin-right', '3px').css('margin-top','auto').css('margin-bottom','auto'));
				}
				$li.addClass('jmlmenu-selectable');
				$li.appendTo($nowPage);
			});
			if(outOfBounds){
				$menu.append($('<li>').addClass('jmlmenu-elem jmlmenu-nav jmlm-next').append($('<i>').addClass('icon-chevron-down').css('margin-left', '110px')));
			}
			else if(this.options.enableRefresh){
				$menu.append($('<li>').addClass('jmlmenu-elem jmlmenu-nav jmlm-refresh').append($('<i>').addClass('icon-refresh').css('margin-left', '110px')));
			}
			var head = $parent.attr('head');
			if(head){
				var wid = this.options.width.substring(0, this.options.width.length - 2);
				var width = parseInt(wid) - 20;
				$('<div>').addClass('jmlmenu-head').text(head).prependTo($menu).css('width', width);
			}
			return $menu;
		},
		_initFromData: function(){	
			var $menu = this.makeList(this.$content);
			$menu.removeClass('jmlm-sub');
			if(this.options.orientation == 'up'){
				var pos = this.$element.offset();
				pos.top -= $(window).scrollTop();
				var bottom = $(window).height() - pos.top;
				$menu.css('left', pos.left).css('bottom', bottom).attr('lid', this.listNum++);
			}
			$menu.appendTo(this.$hidden);
		},
		initialize: function(){
			this.$hidden = $('#jmlmenu-hidden');
			if(this.$hidden.length == 0){
				this.$hidden = $('<div>').attr('id', 'jmlmenu-hidden').css('display', 'none');
			}
			this._initFromData();
			var that = this;
			$('body').on('click', '.jmlmenu-selectable', function(event){
				that.options.select($(this), event);
				that.hide();
			});
			$('body').on('mouseenter', '.jmlmenu-expanable', function(event){
				if($(this).attr('loading') == undefined){
					$(this).removeAttr('noShow');
					that.expand($(this));
				}
			});
			$('body').on('mouseleave', '.jmlmenu-expanable', function(event){
				var $menu = $(this).data('submenu');
				if(that._isPosInElement({left: event.pageX, top: event.pageY}, $menu)){
					return;
				}
				$(this).removeClass('tb-active');
				$(this).attr('noShow', true);
				if($menu == undefined)
					return;
				if($menu.length > 0){
					if($menu.data('elem'))  
						$menu.data('elem').removeClass('tb-active');
					$menu.hide(that.options.delay, function(){
						$(this).remove();
					});
				}
			});
			$('body').on('mouseleave', '.jmlmenu', function(event){
				var hideAll = true;
				var mpos = {left: event.pageX, top: event.pageY};
				$('.jmlmenu').each(function(){
					if(that._isPosInElement(mpos, $(this))){
						hideAll = false;
						return false;
					}
				});
				if(hideAll)
					$('.jmlmenu').each(function(){
						if($(this).attr('lid') == 0)
							return;
						if($(this).data('elem'))
							$(this).data('elem').removeClass('tb-active');
						$(this).hide(that.options.delay, function(){
							$(this).remove();
						});
					});
			});
			$('body').on('click','.jmlm-next', function(event){
				var $nowPage = $(this).siblings('.jmlmenu-display').children('.jmlm-nowpage');
				var $nextPage = $nowPage.next('.jmlmenu-page');
				$nowPage.removeClass('jmlm-nowpage').hide(that.options.delay);
				$nextPage.addClass('jmlm-nowpage').show(that.options.delay);
				if($(this).siblings('.jmlm-prev').length == 0){
					var $prev = $('<li>').addClass('jmlmenu-elem jmlmenu-nav jmlm-prev').append($('<i>').addClass('icon-chevron-up').css('margin-left', '110px'));
					$(this).siblings('.jmlmenu-display').before($prev);
				}
				if($nextPage.next('.jmlmenu-page').length == 0){
					if(that.options.enableRefresh){
						$(this).unbind('click');
						$(this).removeClass('jmlm-next').addClass('jmlm-refresh');
						$(this).children('i').removeClass().addClass('icon-refresh');
					}
					else{
						$(this).remove();
					}
				}
			});
			$('body').click(function(event){
				if(that._isPosInElement({top: event.pageY, left: event.pageX}, that.$element))
					return;
				var close = true;
				$('body').find('.jmlmenu').each(function(){
					if(that._isPosInElement({top: event.pageY, left: event.pageX}, $(this))){
						close = false;
						return false;
					}
				});
				if(that.$rootMenu.css('display') == 'none')
					close = false;
				if(close)
					that.hide();
			});
			$('body').on('click', '.jmlm-refresh', function(event){
				event.preventDefault();
				that._refresh();
			});
			$('body').on('click', '.jmlm-prev', function(event){
				var $menu = $(this).parent();
				var $nowPage = $menu.find('.jmlm-nowpage');
				$nowPage.removeClass('jmlm-nowpage').hide(that.options.delay);
				var $prevPage = $nowPage.prev('.jmlmenu-page');
				$prevPage.addClass('jmlm-nowpage').show(that.options.delay);
				var $refresh = $menu.children('.jmlm-refresh');
				if($refresh.length > 0){
					$refresh.unbind('click');
					$refresh.removeClass('jmlm-refresh').addClass('jmlmm-next');
					$refresh.children('i').removeClass().addClass('icon-chevron-down');
				}
				if($prevPage.attr('page') == '1'){
					$(this).remove();
				}
				if($menu.children('.jmlm-next').length == 0)
					$menu.append(($('<li>').addClass('jmlmenu-elem jmlmenu-nav jmlm-next').append($('<i>').addClass('icon-chevron-down').css('margin-left', '110px'))));
			});
			if(this.options.trigger == 'hover'){
				this.$element.hover(function(event){
						that.show();
				}, function(event){
					if(that._isPosInElement({left: event.pageX, top: event.pageY}, that.$display)){
						return;
					}
					else{
						that.hide();
					}
				});
			}
			else if(this.options.trigger == 'click'){
				this.$element.click(function(event){
					event.preventDefault();
					console.log('click!!!');
					if(this.$rootMenu != null){
						that.hide();
					}
					else{
						that.show();
					}
				});
			}
		},
		reInitialize: function(){
			if(this.options.refresh == undefined)
				return;
			this.$hidden.empty();
			$('body').children('.jmlmenu').remove();
			this.$content = this.options.refresh();
			this._initFromData();
		},
		_appendMenu: function($menu, $elem){
			$menu.css('display', 'none').addClass('.jmlm-sub').css('position', 'fixed').data('elem', $elem);
			var pos = $elem.offset();
			pos.top -= $(window).scrollTop();
			var winwidth = $(window).width();
			var widthNum = parseFloat(this.options.width.substring(0, this.options.width.length - 2));
			if(this.options.orientation == 'up' && this.options.fixed){
				if((winwidth - pos.left) > 2 * widthNum){
					$menu.css('left', pos.left + widthNum);
					$menu.css('bottom', $(window).height() - pos.top - 40);
				}
				else{
					$menu.css('left', pos.left - widthNum);
					$menu.css('bottom', $(window).height() - pos.top - 40);
				}
			}
			else if(this.options.orientation == 'down' && this.options.fixed){
				//TODO down 
			}
			else if(this.options.orientation == 'up' && this.options.fixed == false){
				//TODO
			}
			else{
				//TODO
			}
			$menu.appendTo($('body'));
			$menu.show(this.options.delay,function(){
				var mpos = $menu.offset();
				if(mpos.top <= 0){
					mpos.top = 5;
					$menu.offset(mpos);
				}
			});
		},
		expand: function($elem){
			var $menu = $elem.data('submenu');
			var $subs = $elem.children('ul');
			if($menu){
				this._appendMenu($menu, $elem);
				$elem.addClass('tb-active');
			}
			else if($subs.length == 1 && $subs.children('li').length > 0){
				$subs.css('display', 'block');
				$menu = this.makeList($subs, true);
				this._appendMenu($menu, $elem);
				$elem.addClass('tb-active');
				$elem.data('submenu', $menu);
			}
			else if(this.options.ajaxExpand && $elem.attr('expanable')){
				var that = this;
				$elem.attr('loading', true);
				$elem.find('i').hide();
				$elem.append($('<img>').addClass('load').attr('src', WEBAPP + 'icons/loading.gif').attr('alt', 'loading').css('margin-right', '3px').addClass('pull-right'));
				var callback = function($ul){
					console.log('ajax load');
					$elem.removeAttr('loading');
					$elem.children('img.load').remove();
					$elem.find('i').show();
					if($ul.children('li').length == 0){
						return;
					}
					$menu = that.makeList($ul);
					$menu.attr('lid', that.listNum++);
					if($elem.attr('noShow') == undefined){
						that._appendMenu($menu, $elem);
						$elem.addClass('tb-active');
					}
					$ul.css('display', 'none');
					$ul.appendTo($elem);
					$elem.data('submenu', $menu);
				};
				this.options.ajaxExpand($elem, callback);
			}
		},
		_isPosInElement: function(pos, $elem){
			if($elem == undefined)
				return false;
			var epos = $elem.offset();
			if(pos.left < epos.left || pos.left > epos.left + $elem.outerWidth())
				return false;
			if(pos.top < epos.top || pos.top > epos.top + $elem.outerHeight())
				return false;
			return true;
		},
		show: function(){
			this.$element.addClass('tb-active');
			this.$rootMenu = this.$hidden.children('.jmlmenu');
			this.$hidden.empty();
			console.log(this.$rootMenu);
			this.$rootMenu.appendTo($('body'));
			if(this.options.orientation == 'down'){
					this.$rootMenu.show(this.options.delay);
			}
			else{
					this.$rootMenu.show(this.options.delay);
			}
			
		},
		hide: function(){
			this.$element.removeClass('tb-active');
			if(this.options.ajaxExpand){
				this.$rootMenu.find('.jmlmenu-expanable').each(function(){
					if($(this).attr('expanable') == undefined)
						return;
					$(this).children('ul').remove();
				});
			}
			var that = this;
			if(this.options.orientation == 'down'){
					this.$rootMenu.hide(this.options.delay, function(){
						that.$rootMenu.appendTo(that.$hidden);
						that.$rootMenu = null;
					});
			}
			else{
					this.$rootMenu.hide(this.options.delay, function(){
						that.$rootMenu.appendTo(that.$hidden);
						that.$rootMenu = null;
					});
			}
			
		},
		destroy: function(){
			$('body').children('.jmlmenu').remove();
			this.$rootMenu = null;
			$('#jmlmenu-hidden').remove();
			this.$element.data('jMLMenu', undefined);
		}
	};
	
	$.fn.jMeny = function(option, $content){
		return this.each(function () {
      		var $this = $(this)
        	, data = $this.data('jMLMenu'),
			options = typeof option == 'object' && option;
     		if (!data) $this.data('jMLMenu', (data = new JMLMenu(this, options, $content)));
      		if (typeof option == 'string') data[option]();
    	});
	};
	$.fn.jMeny.defaults = {
		trigger: 'click',
		orientation: 'down',
		delay: 300,
		fixed: true,
		refresh: false,
		ajaxExpand: false,
		maxElementInOneLevel: 10,
		enableSearch: false,
		width: '200px'
	};
	
}(jQuery));