app.register("home-view", {
  "html":`
    <h2>Welcome <small>:)</small></h2>
    <p>Going-UI.js is a tiny (<4KB) but powerful UI building framework designed to be as close to native HTML and JavaScript as possible. You can use it for basic templating, or you can use it to build your entire UI. Features include two way data binding, support for native HTML and native JS templates, and view routing. It's all about ease of use and flexibility.</p>
    <h2>How does this compare to other frameworks?</h2>
    <p>Other frameworks have many of the same features with much steeper learning curves. The big benefit of Going-UI is that it feels like an extension of JavaScript, not its own language. Basically, if you know JS, you'll be able to get going with Going-UI in a few minutes.</p>
    <h2>Where can I learn Going-UI?</h2>
    <p>If you want to get to know Going-UI, check out the documentation at <a href = 'https://docs.goingui.com'>docs.goingui.com</a>. If you want to see a quick example of Going-UI, you can view the source code of this page.</p>
    <h2>Can I contribute?</h2>
    <p>Sure! We're on GitHub! If you want to support Going-UI monetarily, donations are welcome.</p>

    <hr/>

    <input type = 'text' class = 'jbind' data-jname = 'exampleModel' value = 'Input &lt;3 Span'> 
    <span class = 'jmodel' data-jname = 'exampleModel'></span>

  `,
  "script":function(){ },
  "view":"home"
});
