# CellCounter

Hello, this project intends to bridge imageJ and nodeJs, the main idea is to create a wrapper so we can run imageJ in nodeJs. CellCounter does what it's name says, it count cells for a given folder following a defined algorithm. BUT the project is designed to be able to host many more algorithms and particularities, so feel free to contribute! 

## CellCounter Algorithm:
We need to specify an input folder and then for each image inside that folder the algorithm will run, in this example we show the steps taken by the cell counter from an input image, see the following:

![Algorithm Img](/assets/img/algorithmCellCounter.png)

## How to use:

1. So we have a folder filled with photos such as the following:
    ![Input Img](/assets/img/input.png)
    Format: ![see](__tests__/img/cellCounter/input/RealCase/README.md)

1. We configure cell-Counter to use that directory with a .env file (there is an .env_example feel free to rename it to .env) [see](/src/algorithms/cellCounter/README.md)

1. We output the result into the output directory in this case the following image with its csv.

    ![Input Img](/assets/img/result.png)

| #Cell | Area |
|:-----:|------|
|   1   |  35  |
|   2   |  34  |
|   3   |  27  |
|   4   |  44  |
| ...   |      |

## Getting Started

This project is intended to be used with the latest Active LTS release of Node.js.

1. Install NodeJs
1. Install npm
1. Download ImageJ (Fiji) from here [link](https://downloads.imagej.net/fiji/archive/20200810-1942/fiji-linux64.zip)
1. Unzip Fiji anywhere you want
1. Download the source code of this project as a zip or with git
1. open a terminal and navigate to the project 
1. execute "npm i"
1. rename .env_example to .env and check the compulsory properties and optionals are for the algorithm to run.
1. place the needed configurations into the .env file *you might need to comment some lines*
1. run "npm build" 
1. run "npm start" 
1. examine the results, you are now free to touch stuff like FILTER_MIN_SIZE or FILTER_GAUSS_SIGMA to have better results depending on your data.
 

 ## I want to add a new algorithm to run, how can I?

If you think that your work can be usefull to others (which im sure it will) why not add it here? it easy:

1. Add a new folder with a descreptive name inside /src/algorithms/
1. Create a new class and extend from AlgorithmToRun
1. Specify what params are needed in order to run this algorithm in the method hasValidInputConfig().
1. Transform and add information to your custom class with the method loadConfig(). 
1. At last create the sequence of instructions in img nedded using the start(ij: IImageJ, NodeJavaCore: NodeAPI) method.
1. Remember to test everything expect start in the class with a unit test.
1. Remember to add good E2E tests to check that the exepcted behaviour is covered.

From there create a pull request and BANG! antoher algorithm added!

## Available Scripts

+ `clean` - remove coverage data, Jest cache and transpiled files,
+ `build` - transpile TypeScript to ES6,
+ `start` - runs ImageJ with the inputs given in the .env file,
+ `build:watch` - interactive watch mode to automatically transpile source files,
+ `lint` - lint source files and tests,
+ `test` - run tests,
+ `test:watch` - interactive watch mode to automatically re-run tests
+ `test:debug` - to debug using google's chromium console.

## Acknowledgements
The initial code is based on [imagej/imagej-node](https://github.com/imagej/imagej-node)

## License
Licensed under the APLv2. See the [LICENSE](https://github.com/jsynowiec/node-typescript-boilerplate/blob/master/LICENSE) file for details.
