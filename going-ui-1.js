function GoingUI(viewElement = -1,animate=true) {
	
	var pel = this;

	this.registry = {}
	this.data = {}
	this.views = {};
	this.viewElement = viewElement;
	this.started = false;
	this.animate = animate;

	this.set = function(varv,val=-1, caller='not input') {

		if(typeof varv === "object") {

			Object.assign(this.data,varv)
			
		}
		else {
			this.data[varv] = val;

		}
		this.update(caller);
	}
	this.get = function(varv) {
		
		if(typeof this.data[varv] != "undefined") {
			return this.data[varv];
		}
		else {

			return undefined;
		}
	}
	
	
	this.init = function(vE = -1, anim=this.animate) {

		if(vE !== -1) { this.setViewElement(vE,anim); }

		this.started = true;
		
		let arr = this.select(".jbui");
		
		
		
		this.select(".jbui").forEach(function(el) {
			
			
			if(typeof el.dataset.template == "undefined") {
				this.registry[el.dataset.jname] = {"element":el};
				el.remove();
			}
			else {
				
				el.outerHTML = this.create(el.dataset.template,{}).outerHTML;
				
			}

		},this);

		this.bind();
		this.update();

	}
	this.bind = function(element = -1) {


		if(element === -1) { 
			element = this.select('.jbind');
		}
		else {
			if(typeof element === "string") { element = document.querySelector(element).querySelectorAll('.jbind'); }
			else { element = element.querySelectorAll('.jbind'); }
		}

		element = Array.from(element);

		

		element.forEach(el=>{

			console.log(el);

			let name = typeof el.dataset.jname != "undefined" ? el.dataset.jname : el.dataset.bind;
			el.addEventListener("keypress",ev=>{ pel.set(name,el.value,'input'); });
			el.addEventListener("keyup",ev=>{ pel.set(name,el.value, 'input'); });
			el.addEventListener("change",ev=>{ pel.set(name,el.value,'input'); });
			
			if(typeof pel.data[name] == "undefined") { pel.data[name] = el.value; }
		});

		this.update();

	}
	this.update = function(caller){
		
		
		this.select('.jmodel').forEach(el=>{
			
			let jname = typeof el.dataset.bind != "undefined" ? el.dataset.bind : el.dataset.jname;
			
			if(typeof el.dataset.attr != "undefined") {
				
				if(el.dataset.attr.indexOf(".") === -1) {
					el[el.dataset.attr] = this.data[jname];
				}
				else {
					let atrchain = el.dataset.attr.split(".");
					el[atrchain[0]][atrchain[1]] = this.data[jname];
					 
				}
			}
			else if(typeof this.data[el.dataset.value] != "undefined") { el.value = this.data[el.dataset.value]; }
			else { el.innerHTML = typeof this.data[jname] != "undefined" ? this.data[jname] : ""; }

		},this);
		
		if(caller != 'input') {
			this.select('.jbind').forEach(el=>{
				
				let bind = typeof el.dataset.bind != "undefined" ? el.dataset.bind : el.dataset.jname;
				
				if(typeof this.data[bind] == "undefined") { this.data[bind] = el.value; this.update('input'); }
				else { el.value = this.data[bind]; }
				
			}, this);
		}
	}

	this.register = function(templateName, templateData) {

		if(typeof this.registry[templateName] != "undefined") { console.warn("Template '" + templateName + "' was already defined."); }
 
		let holderDiv = document.createElement("template");
		holderDiv.innerHTML = typeof templateData == "object" ? templateData.html : templateData;

		if(typeof templateData.view != "undefined") { 
			this.bind(holderDiv.content); 
			this.views[templateData.view] = templateName; 
		}

		let superSnake = "";
		if(templateName.indexOf("-") === -1) {
			
			let mat = templateName.match(/(^[a-z]|[A-Z0-9])[a-z]*/g);
			
			if(mat.length > 1) {
				superSnake = mat.join("-").toLowerCase();
				console.warn("Template name did not contain a -, but contained camelcase. Template name has been converted to '" + superSnake + "' to make it valid HTML.");
			}
			else if(mat.length == 1) {
			
				console.warn("Template name '" + templateName + "' did not contain a -. '-template' has been appended to the end of the template name.");
				superSnake = mat[0].toLowerCase() + "-template";
			}
			else {
				console.warn("Invalid template name '" + templateName + "'.");
			}
		}
		else { superSnake = templateName; }

		if(superSnake != "") {
 
			let newElement = customElements.define(superSnake,
				class extends HTMLElement {
					constructor() {
						super();
						this.outerHTML = typeof templateData == "object" ? templateData.html : templateData;
						if(typeof templateData.script == 'function') { templateData.script(this.content); } 
					}
				}
			);
			
			this.registry[superSnake] = {"element":holderDiv,"script":templateData.script};
			
			if(typeof templateData.view != "undefined") { this.views[superSnake] = templateName; }
		}
		
		
	}

	this.create = function(componentToCreate, inputs) {

		if(Object.keys(this.registry).indexOf(componentToCreate) === -1) { console.warn("Unregistered component or view '" + componentToCreate + "'."); return false; }

		let newElement = this.registry[componentToCreate].element.cloneNode(true);
		let sarray = Array.from(newElement.getElementsByClassName('jelement')).concat(newElement);

		sarray.forEach(function(thisElement) {

			for(v in inputs) { 

				if(thisElement.dataset.jname === v) {

					let thisInput = inputs[v];

					for(property in thisInput) {

						if(property === "data" || property === "dataset") { for(dataProperty in thisInput[property]) { thisElement.dataset[dataProperty] = thisInput[property][dataProperty]; } }
						else if(property === "style") { for(styleProperty in thisInput[property]) { thisElement.style[styleProperty] = thisInput[property][styleProperty]; } }
						else { thisElement[property] = thisInput[property]; }
					}

				}
			}
		});

		
		this.bind(newElement);
		
		if(typeof this.registry[componentToCreate].script == 'function') { this.registry[componentToCreate].script(newElement.content); }
		
		return newElement;

	}


	this.select = function(needle,hayStack=document) {

		let selectFrom = hayStack;

		if(hayStack !== document) { 
			if(typeof hayStack === 'string') { selectFrom = document.querySelector(hayStack); }
			else { selectFrom = hayStack; }	
		}
		

		let result = selectFrom.querySelectorAll(needle);
		
		if(needle.indexOf("#") !== -1) { return result[0]; }
		else { return Array.from(result); }
		

	}

	this.import = function(imp,the) {
		
		if(!Array.isArray(imp)) { imp = [imp]; }
		
		imp.forEach(function(fi,ind){
			
			try {
				let s = -1;
				if(fi.indexOf('.js') !== -1) { s = document.createElement("script"); s.src = fi; }
				if(fi.indexOf('.css') !== -1) { s = document.createElement("link"); s.rel = "stylesheet"; s.href = fi; }
				
				 
				if(ind == imp.length - 1) { s.onload=the; }
				document.head.appendChild(s);
			}
			catch(e) {
				console.error("Could not import '" + fi + "':" + e);
			}
		});
		 
	}

	this.changeView = function() {
		

		if(!app.isset(location.hash)) { return false; }


		let elemental = document.querySelector(pel.viewElement);
		let toBe = location.hash.replace("#","");
		elemental.innerHTML = pel.create(pel.views[toBe],{}).innerHTML;
		pel.bind(this.viewElement);

		
		if(pel.animate) {

			elemental.style.transition = "opacity 0s";
			elemental.style.opacity = 0;
			setTimeout(ev=>{
				elemental.style.transition = "opacity .15s";
				elemental.style.opacity=1;
			},10);
		}

		this.select("input").forEach(el=>{el.placeholder = el.placeholder == "" ? " " : el.placeholder; });

	}

	this.isset = function(data) { if(typeof data === "undefined") { return false; } if(data === null) { return false; } if(Array.isArray(data)) { if(data.length === 0) { return false; } } if(data === "") { return false; } return true; }

	this.setViewElement = function(vE,anim=this.animate) {

		if(vE === -1) { return false; }
		
		this.animate = anim;
		this.viewElement = vE;

		if(document.querySelectorAll(vE).length > 0) {
			
			window.addEventListener("hashchange", function() { pel.changeView(); });
			window.addEventListener("load",  ev=>{ pel.changeView()});
		}
	}
	
	if(viewElement !== -1) { this.setViewElement(viewElement); }
	
	return this;
}