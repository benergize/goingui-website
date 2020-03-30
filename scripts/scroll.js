
window.onscroll = function() {
	if(window.scrollY >= 64) { app.select('header')[0].style.padding="20px 0px"; } 
	if(window.scrollY == 0) { app.select('header')[0].style.padding="50px 0px"; }
}