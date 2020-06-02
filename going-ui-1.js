function GoingUI(viewElement = -1,animate=true) {
	
	var thisUI = this;

	this.registry = {}
	this.data = {}
	this.views = {};
	this.view = "";
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
	
		
		this.select(".goui").concat(this.select("[data-going-template]")).forEach(function(el) {
			

			
			if(typeof el.dataset.template == "undefined" && typeof el.dataset.goingTemplate == "undefined") {

				this.registry[el.dataset.jname] = {"element":el};
				el.remove();
			}
			else {
				
				this.create(
					typeof el.dataset.template !== "undefined" ? el.dataset.template : el.dataset.goingTemplate,
				{},el);
				
			}

		},this);

		this.bind();
		this.update();
 

	}
	this.bind = function(element = -1) {


		if(element === -1) { 
			element = document.querySelectorAll("[data-gobind]");
		}
		else {

			let fie = typeof element === "string" ? document.querySelector(element) : element; //fie=findInElement
			 
			element = Array.from(fie.querySelectorAll('.jbind')).concat(Array.from(fie.querySelectorAll("[data-gobind]")));
			 
		}

		element = Array.from(element);
		 

		element.forEach(el=>{
 
			if(!thisUI.isset(el.dataset.gobound)) {

				let name = thisUI.isset(el.dataset.jname) ? el.dataset.jname : el.dataset.gobind;

				el.addEventListener("keypress", ev=>{ console.log(name); thisUI.set(name,el.type == "checkbox" ? el.checked : el.value,'input'); });
				el.addEventListener("keyup", ev=>{ console.log(name); thisUI.set(name,el.type == "checkbox" ? el.checked : el.value, 'input'); });
				el.addEventListener("change", ev=>{ console.log(name); thisUI.set(name,el.type == "checkbox" ? el.checked : el.value,'input'); });
				
				if(typeof thisUI.data[name] == "undefined") { thisUI.data[name] = el.value; }

				//el.dataset.gobound = 1;
			} 
		});

		this.update();

	}
	this.update = function(caller){
		
		
		thisUI.select("[data-gomodel]").concat(thisUI.select('.gomodel')).concat(thisUI.select('.jmodel')).forEach(el=>{
			
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
			else if(thisUI.isset(el.dataset.attrs) || thisUI.isset(el.dataset.gomodel)) {

				//console.log(el.dataset.attrs);

				try {

					let attrTarget = thisUI.isset(el.dataset.attrs) ? el.dataset.attrs : el.dataset.gomodel;
					let attrs = JSON.parse(attrTarget);
					//.log(attrs,attrTarget);
					//console.log(parseJSON(el.dataset.attrs));
					

					if(typeof attrs == "object") {

						for(let attribute in attrs) {
							//el[attr] = thisUI.isset(thisUI.data[attrs[attr]]) ? thisUI.data[attrs[attr]] : "";

							let dataFrom = attrs[attribute]; 
							//console.log(dataFrom,attribute);

							if(attribute.indexOf(".") === -1 && String(dataFrom).indexOf(".") === -1) {
				
								//console.log(typeof attribute,attrs[attribute],attribute);

								if(typeof attrs[attribute] === "object") {

									let atrobj = attrs[attribute];

									//let topattr = {};

									for(let subattribute in atrobj) {
										el[attribute][subattribute] = thisUI.data[atrobj[subattribute]];
										//console.log(el[attribute][subattribute]);
									}
								}
								else {
									el[attribute] = thisUI.data[dataFrom];
								}
							}
							else if(attribute.indexOf(".") !== -1 && String(dataFrom).indexOf(".") === -1) {

								let atrchain = attribute.split(".");
								//console.log(atrchain)
								//el[atrchain[0]][atrchain[1]] = thisUI.data[dataFrom]; 

								let propertyTarget = el; 
								atrchain.forEach(elementProperty=>{
									propertyTarget = propertyTarget[elementProperty];
								});

								propertyTarget = thisUI.data[dataFrom];
							}
							else if(attribute.indexOf(".") === -1 && String(dataFrom).indexOf(".") !== -1) {

								let atrchain = attrs[attribute].split(".");
								let dataTarget = app.data;
								atrchain.forEach(property=>{ dataTarget = dataTarget[property];  });
								
								el[attribute] = dataTarget;
							}
							else {
								throw "Guru meditation error.";
							}
						}
					}
				}
				catch(e) {
					console.warn("Invalid JSON at " + jname + ": " + String(e));
				}
			}
			else if(typeof this.data[el.dataset.value] != "undefined") { el.value = thisUI.data[el.dataset.value]; }
			else { el.innerHTML = typeof thisUI.data[jname] != "undefined" ? thisUI.data[jname] : ""; }

		},this);
		
		if(caller != 'input') {
			thisUI.select('[data-gobind]').forEach(el=>{
 
				let bind = el.dataset.gobind;
				//if(!thisUI.isset(el.dataset.gobound)) { thisUI.bind(); }
				
				if(typeof thisUI.data[bind] == "undefined") { 
					
					if(el.type == "checkbox") { thisUI.data[bind] = el.checked; }
					else { thisUI.data[bind]=el.value; }
					thisUI.update('input'); 
				}
				else { 
					if(el.type == "checkbox") { el.checked = thisUI.data[bind] }
					else { el.value = thisUI.data[bind]; }
				}
				
			}, this);
		}
	}

	//updateUserData({...props.userData, "emailEnabled": masterDoc.data().emailsEnabled});

	this.register = function(templateName, templateData) {

		if(typeof this.registry[templateName] != "undefined") { console.warn("Template '" + templateName + "' was already defined."); }
 
		let holderDiv = document.createElement("template");
		holderDiv.innerHTML = typeof templateData == "object" ? templateData.html : templateData;

		let script = typeof templateData.script != "undefined" ? templateData.script : typeof templateData.js != "undefined" ? templateData.js : function(){};

		this.registry[templateName] = {"element":holderDiv,"script":templateData.script,"css":templateData.css};

		if(typeof templateData.view != "undefined") { 
			this.bind(holderDiv.content); 
			this.views[templateData.view] = templateName; 
		}
	}

	this.create = function(componentToCreate, customProperties={}, returnObjectAndScript=false) {

		//Search the registry--return false if the requested component wasn't registered
		if(Object.keys(this.registry).indexOf(componentToCreate) === -1) { console.warn("Unregistered component or view '" + componentToCreate + "'."); return false; }

		//Create a copy of the element in registry
		let newElement = this.registry[componentToCreate].element.cloneNode(true); 
		
		//Compile an array of all the gofields (fields to be customized)
		let goElements = Array.from(newElement.content.querySelectorAll('.gofield')).concat(Array.from(newElement.content.querySelectorAll("[data-gofield]")));
		//console.log(goElements);

		//Go through them as goElement
		goElements.forEach(function(goElement) { 


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

		//console.log(goElements);

		
		this.bind(newElement);
 
 
		if(thisUI.isset(this.registry[componentToCreate].css)) { 

			//if(thisUI.goingStyle.innerHTML.indexOf("/* GOINGUI-GOINGSTYLE."+ componentToCreate +": */") === -1) {
			//	thisUI.goingStyle.innerHTML += "/* GOINGUI-GOINGSTYLE."+ componentToCreate +": */" + this.registry[componentToCreate].css + " /* GOINGUI-ENDSTYLE */"; 
			//}

			if(!thisUI.isset(thisUI.select("#goingstyle-" + Object.keys(thisUI.registry).indexOf(componentToCreate)))) {
				let styleObject = document.createElement("style");
				styleObject.id = "goingstyle-" + Object.keys(thisUI.registry).indexOf(componentToCreate);
				styleObject.innerHTML = this.registry[componentToCreate].css
				document.head.appendChild(styleObject);
			}
		}

		//newElement = newElement.content;
		
		if(returnObjectAndScript === true) { return {'element':newElement,"script":this.registry[componentToCreate].script,"css":this.registry[componentToCreate].css} } 
		if(typeof returnObjectAndScript === "object") {
		
			//Content to put inside the new element
			let oldInner = returnObjectAndScript.innerHTML;
			if(newElement.querySelector("going-content") != null) { newElement.querySelector("going-content").outerHTML=oldInner; }
			
			//Replace the target element with the new element
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

		let stage = document.querySelector(thisUI.viewElement);
		let toBe = location.hash.replace("#","");
		thisUI.view = toBe;
		stage.dataset.view = toBe;

		let newElement = thisUI.create(thisUI.views[toBe],{}, true);

		stage.innerHTML = "";
		stage.appendChild(newElement.element.content);
 
		thisUI.bind(thisUI.viewElement);
		thisUI.script(newElement);

		
		if(thisUI.animate) {

			stage.style.transition = "opacity 0s";
			stage.style.opacity = 0;
			setTimeout(ev=>{
				stage.style.transition = "opacity .15s";
				stage.style.opacity=1;
			},10);
		}

		this.select("input").forEach(el=>{el.placeholder = el.placeholder == "" ? " " : el.placeholder; });

	}

	this.isset = function(data) { if(typeof data === "undefined") { return false; } if(data === null) { return false; } if(Array.isArray(data)) { if(data.length === 0) { return false; } } if(data === "") { return false; } return true; }
	this.json = function(data) { return typeof data === "object" ? JSON.stringify(data) : JSON.parse(data); }

	this.setViewElement = function(vE,anim=this.animate) {

		if(vE === -1) { return false; }
		
		this.animate = anim;
		this.viewElement = vE;

		if(document.querySelectorAll(vE).length > 0) {
			
			//window.addEventListener("hashchange", function() { thisUI.changeView(); thisUI.bind(); });
			window.addEventListener("load",  ev=>{ thisUI.changeView();/* thisUI.bind(); */});
		}
	}
	
	if(viewElement !== -1) { this.setViewElement(viewElement); }
	
	return this;
}