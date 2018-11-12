// stopped on touch devices
if ( $('html.touch').length === 0 ) {

  // Loops through all videos on page
  $('.js-youtube-thumbnail').each(function(index, el) {
    var container         = $(this),
        video             = $(this).find('.video__iframe'),
        videoSrc          = video.attr('src'),
        thumbnailImg      = $(this).data('thumbnail-img'),
        thumbnailElement  = '<div class="video__thumbnail" style="background-image: url(\'' + thumbnailImg + '\')"><div class="video__play js-play-video"></div></div>';

    // hide video, but keep aspect ratio
    video.css('visibility', 'hidden');

    // Add thumbnail element to hold image & play button
    $(this).prepend(thumbnailElement);
    var thumbnail   = $(this).find('.video__thumbnail'),
        play        = $(this);

    // play button event
      play.on('click', function(e) {
        e.preventDefault();
        container.addClass('is-active');
        // add auto play query to iframe
        video.attr('src', videoSrc + '&autoplay=1');
        // fade out iframe and show video
        thumbnail.fadeOut( 175, function() {
          video.css('visibility', 'visible');
        });
      });

  });

}