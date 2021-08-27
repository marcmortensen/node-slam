// Boid class
class Boid {
    constructor(x,y,z) {
      this.pos = createVector(x,y,z);
    }
  
    display() {
      translate(this.pos);
      fill(255, 102, 94);
      box(10);
    }
  }
  
  let boids = [];
  let planes = [];
  let currCamera;
    
  function moveCameraLeft() {
    
    // Look at the given position
    // in the world space
    currCamera.move(-15, 0, 0);
  }
    
  function moveCameraRight() {
    
    // Look at the given position
    // in the world space
    currCamera.move(15, 0, 0);
  }
    
  function moveCameraUp() {
    
    // Look at the given position
    // in the world space
    currCamera.move(0, -15, 0);
  }
    
  function moveCameraDown() {
    
    // Look at the given position
    // in the world space
    currCamera.move(0, 15, 0);
  }
  
  function moveCameraInside() {
    
    // Look at the given position
    // in the world space
    currCamera.move(0, 0, -500);
  }
  
  function setup() {
    createCanvas(600, 600, WEBGL);
    helpText = createP(
      "Click the buttons to move the " +
      "camera in that direction");
    helpText.position(20, 0);
    
    currCamera = createCamera();
    frustum(-0.1, 0.1, -0.1, 0.1, 0.1, 200*100);
    
    // Create three buttons for moving the
    // position camera
    newCameraBtn = createButton("Move Left");
    newCameraBtn.position(20, 40);
    newCameraBtn.mouseClicked(moveCameraLeft);
      
    newCameraBtn = createButton("Move Right");
    newCameraBtn.position(120, 40);
    newCameraBtn.mouseClicked(moveCameraRight);
    
    newCameraBtn = createButton("Move Up");
    newCameraBtn.position(20, 70);
    newCameraBtn.mouseClicked(moveCameraUp);
    
    newCameraBtn = createButton("Move Down");
    newCameraBtn.position(120, 70);
    newCameraBtn.mouseClicked(moveCameraDown);
    
    newCameraBtn = createButton("Move Inside");
    newCameraBtn.position(220, 70);
    newCameraBtn.mouseClicked(moveCameraInside);
    
    // Feel free to add more points.
    points = [[
      39.721588651256006,20.987779405845895,44.38503443726529],
      [2.327232513696223,1.9804133391064567,13.000083531988379],
      [208.24026597562732,104.59431268285263,135.67962884802355],
      [201.68506259362,105.10434425630271,136.3460399068227],
      [2.8525241172915363,2.0564296703562577,13.193996732769545],
      [49.42010453900524,39.96530718569523,51.16632145038237],
      [5.767841493792527,2.574674387976622,16.076482676978234],
      [52.010017878401,40.20388070370317,51.47413023370005],
      [9.728792335633585,4.530856529931713,19.417868306203882],
      [160.588197273814,83.15788799128899,107.25062329139459],
      [45.014024129436955,36.84334790287184,47.47439226844328],
      [9.861330754843758,4.389096316988263,20.220643753529075],
      [4.0919923316153115,2.523837838061977,14.249858151648919],
      [5.365202565584439,2.6911752822963853,15.293801997451],
      [94.98543458523761,60.784138678261364,78.83635239298245],
      [2.3423692180755307,2.3894304249339133,13.105167009842342],
      [2.5513671564606453,2.4012619838232707,13.176675513531762],
      [8.826150174706722,3.3573517282226395,19.229625988928326],
      [3.532759384861669,2.457536609654287,12.924257289988336],
      [2.4579856650552956,2.812867814590648,12.752744991904098],
      [12.02265394800136,6.317029385656449,21.132396844167037],
      [183.2284248477299,91.25755948341624,119.76177514091529],
      [3.87144303609242,2.7337198201339743,14.22469138209327],
      [4.028341673702569,2.642823807291083,13.701669729476178],
      [2.4547635067336584,2.6029679757490896,13.19476460364363],
      [3.81959764108555,2.8420309729363225,14.231910563335386],
      [5.389275319868331,3.0497570758061023,15.369304171707505],
      [10.77677812899617,9.083903328234072,22.019538328298125],
      [2.4589039460563313,2.707455123834659,13.222082532192832],
      [7.975157989966908,3.6554797970371564,18.13085761257155],
      [7.748983774392068,3.7126893477157354,18.07535333423628],
      [8.924366794750801,3.780070398119563,18.423474913519417],
      [10.233223122601338,4.245672335769622,20.854382342582284],
      [6.492278736510771,3.5111116698115046,16.07854302561652]
      ];
    for (let i = 0; i < points.length -1; i++) {
      boids.push(new Boid(points[i][0],points[i][1],points[i][2]));
    }
  }
  
  function draw() {
    orbitControl(5,5,5);
    background(220);
    for (let boid of boids) {
      boid.display();
    }
  }
  
