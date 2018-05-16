const vendorScripts = [

	// jquery
	{
		src: 'https://code.jquery.com/jquery-3.3.1.min.js',
		onload: documentReady,
	},

	// youtube
	{
		src: 'https://www.youtube.com/iframe_api',
	}

];




/**
 * Preload vendor scripts
 */
vendorScripts.forEach(({src, onload}) => {
	if ( !src ) return;
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.async = true;
	script.onload = () => {
		script.remove();
		if ( typeof onload === 'function' ) onload();
	};
	script.src = src;
	document.getElementsByTagName('head')[0].appendChild(script);
});




/**
 * --------------------------------------------------------------------------------------------
 * APP SCRIPTS
 * --------------------------------------------------------------------------------------------
 */

let $titles;

let player;
let duration;
let activeItem;
let currentTime = 0;
let playbackInterval;
let ctaInstance = {
	clicked: false,
	index: null
};
// let VIDEO_ID = '6CgrVt3BGqY';
let VIDEO_ID = 'xQ1XTHE2OwQ';
let RECIPE_ID = 'f_FyfpypvO8';
let recipePlayer;

// Player Variables
let PLAYER_VARS = {
	autoplay: 1, 
	autohide: 1, 
	modestbranding: 0, 
	rel: 0, 
	showinfo: 0, 
	controls: 0,
	loop: 1, 
	disablekb: 1, 
	enablejsapi: 0, 
	iv_load_policy: 3,
	playsinline: 1
}

// Player Variables
let PLAYER_VARS_RECIPE = {
	autoplay: 0, 
	autohide: 1, 
	modestbranding: 0, 
	rel: 0, 
	showinfo: 0, 
	controls: 0,
	loop: 1, 
	disablekb: 1, 
	enablejsapi: 0, 
	iv_load_policy: 3,
	playsinline: 1
}

// Video Object
let VIDEO_OBJ = {
	videoId: VIDEO_ID,
	suggestedQuality: 'hd720'
}

let RECIPE_OBJ = {
	videoId: RECIPE_ID,
	suggestedQuality: 'hd720'
}

const segmentDuration = 5;
const segments = [
	segmentDuration*0,
	segmentDuration*1,
	segmentDuration*2
];


function documentReady () {
	$titles = $('.hero__title');
	$blackOverlay = $('.hero__black_overlay');
	$heroContent = $('.hero__content');
	$heroPlate = $('.hero__plate');

	bindTitleClick();

	// CTA Click
	$('.hero__cta__button').click(() => {
		$heroContent.addClass('animated');
		$blackOverlay.addClass('animated');

		setTimeout(() => {
			$heroPlate.addClass('animated');
		}, 2000)

		ctaInstance.clicked = true;
		ctaInstance.index = $('.hero__cta__button').data('index');
	})

	$('.hero__plate').on('transitionend', function() {
		$('.hero__plate > img').hide();
		$('.hero__plate iframe, .hero__plate #hero__plate_video').addClass('active');
		recipePlayer.playVideo();
		recipePlayer.mute();
	})
}


function onYouTubeIframeAPIReady() {
	player = new YT.Player('hero__video__player', {
		playerVars: PLAYER_VARS,
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});

	recipePlayer = new YT.Player('hero__plate_video', {
		playerVars: PLAYER_VARS_RECIPE,
		events: {
			'onReady': onRecipePlayerReady
		}
	})
}

function onRecipePlayerReady() {
	recipePlayer.loadVideoById(RECIPE_OBJ);
	recipePlayer.playVideo();
	recipePlayer.mute();
	recipePlayer.stopVideo();
}

function onPlayerReady() {
	// Loaded video on player on player ready
	player.loadVideoById(VIDEO_OBJ);
	player.playVideo();
	player.mute();
	duration = player.getDuration();
	playbackInterval = setInterval(onTimeUpdate, 100);
}

// For smooth transition when video reaches the end.
function onPlayerStateChange(e) {
	if ( e.data === 0 ) {
		player.seekTo(segments[0]);
	}
}

function onTimeUpdate () {
	currentTime = player.getCurrentTime();

	if ( !ctaInstance.clicked ) {
		switch( true ) {
			case (currentTime >= segments[2]):
				activateItem(2);
				break;
			case (currentTime >= segments[1]):
				activateItem(1);
				break;
			default:
				activateItem(0);
		}
	
		updateProgessBar();
	} else {
		switch ( ctaInstance.index ) {
			case 0:
				if ( currentTime >= segments[1] ) {
					player.seekTo(segments[0]);
				}
				break;
			case 1:
				if ( currentTime >= segments[2] ) {
					player.seekTo(segments[1]);
				}
				break;
			case 2:
				if ( currentTime >= parseInt(player.getDuration()) ) {
					player.seekTo(segments[2]);
				}
				break;
		}
	}
}

function activateItem( itemIndex ) {
	if ( itemIndex === activeItem ) return;

	$('.hero__cta__button').attr('data-index', itemIndex);

	$titles.filter('.active')
		// Remove active class
		.removeClass('active')
		// Remove progress bar transform
		.find('.hero__title__progress')
		.css('transform', '')
		.end().end()
		// Active cuttent item
		.eq(itemIndex).addClass('active');

	activeItem = itemIndex;

}

function updateProgessBar() {
	if ( typeof activeItem !== 'number' ) return;

	let $activeItem = $titles.eq(activeItem);
	let $activeProgressBar = $activeItem.find('.hero__title__progress');
	let progressRatio = (currentTime - (segmentDuration * activeItem)) / segmentDuration;
	let progressPercent = 100 * progressRatio;
	let transformPercent = progressPercent - 100;

	$activeProgressBar.css('transform', 'translateX('+transformPercent+'%)');

}

function bindTitleClick() {
	$titles.each(function (index) {
		$(this).click(function () {
			player.seekTo(segments[index]);
		});
	});
}

