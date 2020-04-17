function GoingUI(viewElement = -1,animate=true) {
	
	var thisUI = this;

	this.registry = {}
	this.data = {}
	this.views = {};
	this.viewElement = viewElement;
	this.started = false;
	this.animate = animate; 


	this.goingStyle = document.createElement("style");
	document.head.appendChild(this.goingStyle);

	customElements.define("going-content", class extends HTMLElement { constructor() { super(); } });

	this.set = function(toSet, setTo=-1, caller='not input') {

		if(typeof toSet === "object") {

			Object.assign(this.data,toSet)
			
		}
		else {
			this.data[toSet] = setTo;

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

	this.script = function(element) {
		

		if(typeof element === "string") { 
			if(typeof this.registry[element] !== "undefined") {
				if(typeof this.registry[element].script === "function") { return this.registry[element].script(); }
			}
		}
		else if(typeof element === "object") {
			if(typeof element.script === "function") { element.script(); }
		}
	}
	
	
	this.init = function(vE = -1, anim=this.animate) {

		if(vE !== -1) { this.setViewElement(vE,anim); }

		this.started = true;
	
		
		this.select(".goui").forEach(function(el) {
			
			
			if(typeof el.dataset.template == "undefined") {

				this.registry[el.dataset.jname] = {"element":el};
				el.remove();
			}
			else {
				
				this.create(el.dataset.template,{},el);
				
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

			if(!thisUI.isset(el.dataset.bound)) {

				let name = typeof el.dataset.jname != "undefined" ? el.dataset.jname : el.dataset.bind;
				el.addEventListener("keypress",ev=>{ thisUI.set(name,el.value,'input'); });
				el.addEventListener("keyup",ev=>{ thisUI.set(name,el.value, 'input'); });
				el.addEventListener("change",ev=>{ thisUI.set(name,el.value,'input'); });
				
				if(typeof thisUI.data[name] == "undefined") { thisUI.data[name] = el.value; }

				el.dataset.jbound = 1;
			} 
		});

		this.update();

	}
	this.update = function(caller){
		
		
		this.select('.jmodel').forEach(el=>{
			
			let jname = 
				thisUI.isset(el.dataset.bind) ? el.dataset.bind : 
				thisUI.isset(el.dataset.jname) ? el.dataset.jname :
				thisUI.isset(el.dataset.innerhtml) ? el.dataset.innerhtml : "";

			
			if(thisUI.isset(el.dataset.attr)) {
				
				if(el.dataset.attr.indexOf(".") === -1) {
					
					el[el.dataset.attr] = thisUI.data[jname];
				}
				else {
					let atrchain = el.dataset.attr.split(".");
					el[atrchain[0]][atrchain[1]] = thisUI.data[jname];
					 
				}
			}
			else if(typeof this.data[el.dataset.value] != "undefined") { el.value = thisUI.data[el.dataset.value]; }
			else { el.innerHTML = typeof thisUI.data[jname] != "undefined" ? thisUI.data[jname] : ""; }

		},this);
		
		if(caller != 'input') {
			this.select('.jbind').forEach(el=>{
				
				let bind = typeof el.dataset.bind != "undefined" ? el.dataset.bind : el.dataset.jname;
				
				if(typeof this.data[bind] == "undefined") { this.data[bind] = el.value; this.update('input'); }
				else { el.value = this.data[bind]; }
				
			}, this);
		}
	}

	//updateUserData({...props.userData, "emailEnabled": masterDoc.data().emailsEnabled});

	this.register = function(templateName, templateData) {

		if(typeof this.registry[templateName] != "undefined") { console.warn("Template '" + templateName + "' was already defined."); }
 
		let holderDiv = document.createElement("template");
		holderDiv.innerHTML = typeof templateData == "object" ? templateData.html : templateData;

		this.registry[templateName] = {"element":holderDiv,"script":templateData.script,"css":templateData.css};

		if(typeof templateData.view != "undefined") { 
			this.bind(holderDiv.content); 
			this.views[templateData.view] = templateName; 
		}
	}

	this.create = function(componentToCreate, customProperties, returnObjectAndScript=false) {

		//Search the registry--return false if the requested component wasn't registered
		if(Object.keys(this.registry).indexOf(componentToCreate) === -1) { console.warn("Unregistered component or view '" + componentToCreate + "'."); return false; }

		//Create a copy of the element in registry
		let newElement = this.registry[componentToCreate].element.cloneNode(true);
		
		//Compile an array of all the gofields (fields to be customized)
		let goElements = Array.from(newElement.getElementsByClassName('gofield')).concat(newElement).concat(Array.from(newElement.querySelectorAll("[data-gofield]")));
		console.log(goElements);

		//Go through them as goElement
		goElements.forEach(function(goElement) {
		//for(let v = 0; v < goElements.length; v++) {


			//There's a bunch of ways you can specify the name of the gofield--figure out how they specified it.
			let fieldName = thisUI.isset(goElement.dataset.gofield) ? goElement.dataset.gofield :
				thisUI.isset(goElement.dataset.jname) ? goElement.dataset.jname : "";

			//If custom properties were supplied under this fieldname
			if(thisUI.isset(customProperties[fieldName])) {

				//Shorthand the properties as 'theseProperties'
				let theseProperties = customProperties[fieldName];

				//Run through the properties object
				for(property in theseProperties) {

					//Set the custom values for the goElement
					if(property === "data" || property === "dataset") { for(dataProperty in theseProperties[property]) { goElement.dataset[dataProperty] = theseProperties[property][dataProperty]; } }
					else if(property === "style") { for(styleProperty in theseProperties[property]) { goElement.style[styleProperty] = theseProperties[property][styleProperty]; } }
					else { goElement[property] = theseProperties[property]; }
				}
			}
		});

		console.log(goElements);

		
		this.bind(newElement);
 
 
		if(thisUI.isset(this.registry[componentToCreate].css)) { 

			if(thisUI.goingStyle.innerHTML.indexOf("/* GOINGUI-GOINGSTYLE."+ componentToCreate +": */") === -1) {
				thisUI.goingStyle.innerHTML += "/* GOINGUI-GOINGSTYLE."+ componentToCreate +": */" + this.registry[componentToCreate].css + " /* GOINGUI-ENDSTYLE */"; 
			}
		}

		newElement = newElement.content;
		
		if(returnObjectAndScript === true) { return {'element':newElement,"script":this.registry[componentToCreate].script,"css":this.registry[componentToCreate].css} } 
		if(typeof returnObjectAndScript === "object") {
			let oldInner = returnObjectAndScript.innerHTML;
			if(newElement.querySelector("going-content") != null) { newElement.querySelector("going-content").outerHTML=oldInner; }
			returnObjectAndScript.outerHTML = newElement.innerHTML;
			thisUI.script(componentToCreate);
		}
		else {
			
			return newElement;
		}

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

	this.getElement = function(el) {
		return this.registry[el];
	}

	this.changeView = function(vw = -1) {
		
		if(vw !== -1) { location.hash = vw; }
		if(!this.isset(location.hash)) { return false; } 

		let elemental = document.querySelector(thisUI.viewElement);
		let toBe = location.hash.replace("#","");

		let newElement = thisUI.create(thisUI.views[toBe],{}, true);

		elemental.innerHTML = newElement.element.innerHTML;
		thisUI.bind(this.viewElement);
		thisUI.script(newElement);//.script();

		
		if(thisUI.animate) {

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
			
			window.addEventListener("hashchange", function() { thisUI.changeView(); thisUI.bind(); });
			window.addEventListener("load",  ev=>{ thisUI.changeView(); thisUI.bind(); });
		}
	}
	
	if(viewElement !== -1) { this.setViewElement(viewElement); }
	
	return this;
}