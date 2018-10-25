////////////////////////////////////////////////////////////////////////////////
//      Sticky microsite nav
////////////////////////////////////////////////////////////////////////////////

// elements and classes
var pageNavClass     = '.js-sticky-page-nav';
var pageNavContainer = '.js-sticky-page-nav-wrap';
var pageNavModifier  = 'is-stuck';

function pageNav(){
  var scrollTop = $(document).scrollTop();
  var nav       = $(pageNavClass);
  var navHeight = nav.outerHeight();
  var distance  = $(pageNavContainer).offset().top;

  if( scrollTop > distance ){
    nav.addClass(pageNavModifier);
  }else{
    nav.removeClass(pageNavModifier);
  }
}

// runs on page load and scroll if element is on page
if ($(pageNavClass).length > 0) {
  pageNav();
  $(document).scroll(function(){ pageNav(); });
}