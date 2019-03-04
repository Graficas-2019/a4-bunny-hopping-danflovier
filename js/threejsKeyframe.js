var renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
grass = null;

var duration = 10, // sec
bunnyAnimator = null,
animateBunny = true,
loopAnimation = true;

var grassMapUrl = "./images/grass.png";

var objLoader = null;
var mtlLoader = null;
var orbitControls = null;
var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var pointLight = null;

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


var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) 
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    
    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Set for OrbitControls
    document.body.appendChild(renderer.domElement);
    
    // Turn on shadows
    renderer.shadowMap.enabled = true;
    
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
    // Directional light
    directionalLight.position.set(0, 1, 2);
    root.add(directionalLight);

    // Spotlight
    spotLight = new THREE.SpotLight (0x000000);
    spotLight.position.set(17, 8, 0);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 80;
    spotLight.shadow.camera.fov = 85;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    // Ambient light
    ambientLight = new THREE.AmbientLight ( 0x303030 );
    root.add(ambientLight);

    // Point light
    pointLight = new THREE.PointLight(0xffffff, 1.5, 0);
    pointLight.position.set(18, 2.0, 0);

    pointLight.castShadow = true;

    pointLight.shadow.camera.near = 1;
    pointLight.shadow.camera.far = 80;
    pointLight.shadow.camera.fov = 85;

    pointLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    pointLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    
    // Point light helper
    var pointLightHelper = new THREE.PointLightHelper( pointLight, 1.1 );
    root.add(pointLight);
    
    root.add(pointLightHelper);
    
    // Create the objects
    loadObj();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var grassMap = new THREE.TextureLoader().load(grassMapUrl);
    grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
    grassMap.repeat.set(4, 4);

    var color = 0xffffff;
    
    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(50, 50, 50, 50);
    grass = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:grassMap, side:THREE.DoubleSide}));
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0;
    
    grass.castShadow = false;
    grass.receiveShadow = true;
    // Add the grass to our group
    root.add( grass );

    // Now add the group to our scene
    scene.add( root );
}

// Function that generates the points of the Lemniscate of Bernoulli
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

// Function that generates coordinates and directions for the bunny
function generateCoordinatesWithDirections(points, segments, zPos){
    var nKeys = 0;
    var x1, y1, x2, y2 = 0;
    var x, y = 0;
    
    var nPoints = points.length;
    var theta = 0;
    for (var i = 0; i < nPoints; i++){
    	// Point A
    	x1 = points[i][0];
    	y1 = points[i][1];
    	// Point B
    	x2 = points[(i + 1) % nPoints][0];
    	y2 = points[(i + 1) % nPoints][1];
    	
        if (i == 0){
            // Adds coordinates of point A
    		coordinates.push({ x: x1, y: zPos[0], z: y1 });
            // Get direction of the object calculating its angle
    		theta = (Math.atan2(x2 - x1, y2 - y1));
    		directions.push({ y : theta });
    		
            key.push(nKeys);
    		nKeys += 1 / 95;
            //console.log(x1,zPos[0],y1);
    	}

        
    	for (var j = 1; j <= segments; j++){
    		x = (x1 + ((x2 - x1) / segments))
    		y = (y1 + ((y2 - y1) / segments))

    		// Adds coordinates of new points from A to B
            coordinates.push({ x: x, y: zPos[j], z: y });

            // Get direction of the object calculating its angle
    		theta = (Math.atan2(x2 - x1, y2 - y1));
    		directions.push({ y : theta });
    		
            x1 = x;
    		y1 = y;
    		
            key.push(nKeys);
    		nKeys += 1 / 95;
            //console.log(x,zPos[j],y);
    	}
    	// Adds coordinates of point B
        coordinates.push({ x: x2, y: zPos[5], z: y2 });

        // Get direction of the object calculating its angle
    	theta = (Math.atan2(x2 - x1, y2 - y1));
    	directions.push({ y : theta });

    	key.push(nKeys);
    	nKeys += 1 / 95;
        //console.log(x2,zPos[5],y2);
    }

    /*
    console.log(directions.length);
    console.log(coordinates.length);
    console.log(nKeys);
    */
}

function playAnimations()
{
    // position animation
    if (bunnyAnimator)
        bunnyAnimator.stop();
    
    group.position.set(0, 0, 0);
    group.rotation.set(0, 0, 0);

    // generate points of the lemniscate of Bernoulli
    var points = []
    points = generatePoints(20, 20);

    // Generate coordinates with directions to create the animation
    var segments = 4;                                // Segments to divide of each line from point A to point B
    var zPos = [0.0, 0.75, 1.5, 1.5, 0.75, 0.0];   // Division of the moments of Z axis to animate the hopping
    generateCoordinatesWithDirections(points, segments, zPos);
    
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
}