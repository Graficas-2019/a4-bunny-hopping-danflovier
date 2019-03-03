var renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
cube = null,
grass = null,
directionalLight = null;

var duration = 10, // sec
bunnyAnimator = null,
lightAnimator = null,
animateBunny = true,
animateLight = true,
loopAnimation = true;

var grassMapUrl = "./images/grass.png";

var objLoader = null;
var mtlLoader = null;
var orbitControls = null;

function loadObj()
{
    if(!objLoader){
        objLoader = new THREE.OBJLoader();
    }
    
    if(!mtlLoader){
        mtlLoader = new THREE.MTLLoader();
    }

    mtlLoader.load('./bunny/bunny.mtl', 
        function( materials )
        {
            materials.preload();
            objLoader.setMaterials(materials);
            
            objLoader.load('./bunny/bunny.obj',
                function( object )
                {
                    var texture = new THREE.TextureLoader().load('./bunny/bunny_A.jpg');
                    object.traverse( function ( child )
                    {
                        if ( child instanceof THREE.Mesh ) 
                        {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            child.material.map = texture;
                        }
                    } );
                    bunny = object;
                    bunny.scale.set(5, 5, 5);
                    bunny.position.z = 0;
                    bunny.position.x = 0;
                    bunny.rotation.x = 0;
                    bunny.rotation.y = Math.PI / 180 * 90;
                    group.add(object);
                },

                function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                // called when loading has errors
                function ( error ) {
                    console.log( 'An error happened' );
                });
        });
}

function run()
{
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Update the animations
        KF.update();

        // Update the camera controller
        orbitControls.update();
        //console.log(camera.position.x, camera.position.y, camera.position.z);
}

function createScene(canvas) 
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Set for OrbitControls
    document.body.appendChild(renderer.domElement);
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-0.53, 34.67, 0);

    scene.add(camera);
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(0, 1, 2);
    root.add(directionalLight);

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var grassMap = new THREE.TextureLoader().load(grassMapUrl);
    grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
    grassMap.repeat.set(4, 4);

    var color = 0xffffff;
    var ambient = 0x888888;
    
    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(50, 50, 50, 50);
    grass = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:grassMap, side:THREE.DoubleSide}));
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0;
    
    // Add the grass to our group
    root.add( grass );
    
    // Add the mesh to our group
    loadObj();

    // Now add the group to our scene
    scene.add( root );
}


function generatePoints(a, degree){
    var degrees = 360;
	var points = [];

    for (var i = 0; i <= degrees; i = i + degree){
        var rad = i * Math.PI / 180;
        var coordX = (a * Math.cos(rad) * Math.sin(rad)) / (1 + Math.pow( Math.cos(rad), 2) );
        var coordY = (a * Math.sin(rad)) / (1 + (Math.pow(Math.cos(rad), 2)));

        points.push([coordX, coordY]);
    }

    return points;
}

var coordinates = [];
var directions = [];
var key = [];

function generateCoordinatesWithDirections(points, segments, zPos){
    var nKeys = 0;
    var x1, y1, x2, y2 = 0;
    var x, y = 0;
    
    var nPoints = points.length;
    var theta = 0;
    for (var i = 0; i < nPoints; i++){
    	
    	x1 = points[i][0];
    	y1 = points[i][1];
    	
    	x2 = points[(i + 1) % nPoints][0];
    	y2 = points[(i + 1) % nPoints][1];
    	//coordinates.push({ x: x1, y: 0, z: y1 });
    	if (i == 0){
    		//console.log(x1, y1, zPos[0]);
    		coordinates.push({ x: x1, y: zPos[0], z: y1 });
    		theta = (Math.atan2(x2 - x1, y2 - y1));
    		directions.push({ y : theta });
    		key.push(nKeys);
    		//console.log(theta);
    		nKeys += 1 / 95;
    		//console.log(nKeys);
    	}
    	for (var j = 1; j <= segments; j++){
    		x = (x1 + ((x2 - x1) / segments))
    		y = (y1 + ((y2 - y1) / segments))
    		//console.log(x, y, zPos[j]);
    		coordinates.push({ x: x, y: zPos[j], z: y });
    		theta = (Math.atan2(x2 - x1, y2 - y1));
    		directions.push({ y : theta });
    		//console.log(theta);
    		x1 = x;
    		y1 = y;
    		key.push(nKeys);
    		//console.log(nKeys);
    		nKeys += 1 / 95;
    	}
    	//console.log(x2, y2, zPos[5]);
    	coordinates.push({ x: x2, y: zPos[0], z: y2 });
    	theta = (Math.atan2(x2 - x1, y2 - y1));
    	directions.push({ y : theta });
    	//console.log(theta);

    	key.push(nKeys);
    	//console.log(nKeys);
    	nKeys += 1 / 95;
    }
}

function playAnimations()
{
    // position animation
    if (bunnyAnimator)
        bunnyAnimator.stop();
    
    group.position.set(0, 0, 0);
    group.rotation.set(0, 0, 0);


    var points = []
    points = generatePoints(20, 20);

    var segments = 4;
    var zPos = [0, 0.5, 1, 1, 0.5, 0];
    generateCoordinatesWithDirections(points,segments, zPos);
    
    if (animateBunny)
    {
        bunnyAnimator = new KF.KeyFrameAnimator;
        bunnyAnimator.init({ 
            interps:
                [
                    { 
                        keys: key,
                        values: coordinates,
                        target: group.position
                    },
                    
                    { 
                        keys: key, 
                        values: directions,
                        target: group.rotation
                    },
                ],
            loop: loopAnimation,
            duration:duration * 1000,
            easing:TWEEN.Easing.Linear.None,
        });
        bunnyAnimator.start();
        
    }
    
    // color animation
    if (lightAnimator)
        lightAnimator.stop();

    directionalLight.color.setRGB(1, 1, 1);

    if (animateLight)
    {
        lightAnimator = new KF.KeyFrameAnimator;
        lightAnimator.init({ 
            interps:
                [
                    { 
                        keys:[0, .4, .6, .7, .8, 1], 
                        values:[
                                { r: 1, g : 1, b: 1 },
                                { r: 0.66, g : 0.66, b: 0.66 },
                                { r: .333, g : .333, b: .333 },
                                { r: 0, g : 0, b: 0 },
                                { r: .667, g : .667, b: .667 },
                                { r: 1, g : 1, b: 1 },
                                ],
                        target:directionalLight.color
                    },
                ],
            loop: loopAnimation,
            duration:duration * 1000,
        });
        lightAnimator.start();
    }
              
}