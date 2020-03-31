app.register("nav-bar", {
	"html":`<nav>
					
		<ul>
			<li><a href = '#about'>About</a></li>
			<li><a href = '#download'>Download/CDN</a></li>
			<li>
				<div class = 'dropdown'>
					<a href = '#resources' class = 'dropDownTitle'>Resources <i class="fas fa-angle-down"></i></a>
					
					<div>
						<a href = 'https://docs.goingui.com' target = '_BLANK'><small class="fas fa-external-link-alt"></small> Docs</a>
						<a href = 'https://github.com/benergize/goingui' target = '_BLANK'><small class="fas fa-external-link-alt"></small> GitHub</a>
						<a href = '#'>Donate</a>
					</div>
				</div>
			</li>
			<li><a href = '#contact'>Contact</a></li>
		</ul>
	</nav>`,
	"script":function(){}
});