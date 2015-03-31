Shader class
============

A small thought document on a shader class implementation. I want to be able to simplify the following actions:

- Making a shader class

```js
var myShader = new Shader(GLContext);
```

- Generating (compile and link) a shaderprogram from strings

```js
myShader.generateProgram(vertexSource, fragmentSource);
var shaderProgram = myShader.generateProgram(vertexSource, fragmentSource); // should return ID
// or
var shaderProgram = myShader.getProgram();
```

- Should contain a static helper class to read shader source from <script>

```js
var vertShadString = Shader.stringFromScript(scriptTag);
```

- Should link javascript variables to GLSL variables

```js
myShader.setVertexAttribute('aVertexPosition');
myShader.getVertexAttribute('aVertexPosition');

myShader.setUniform('uMVMatrix');
myShader.getUniform('uMVMatrix');
```
