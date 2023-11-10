# tour3d

tour3d project is developed using [three.js](https://threejs.org/) and [react](https://reactjs.org/) technology. `three.js` is used for rendering 3D objects on `canvas` whereas `react` is used for rendering other HTML5 elements. 

## Getting Started

### Clone the source code
- `git clone git@github.com:prolincur/tour3d.git`

### Setup

- Make ensure you have `yarn` installed on your machine. Run following command to check.

`yarn --version`

- In case `yarn` is not not installed, refer [these installation steps.](https://classic.yarnpkg.com/en/docs/install)

- Next, run following command in the project directory to install all the project dependendies. This command will create `node_modules` folder in your project directory.

`yarn install`

### Available Scripts

After setup is done, you can run any of following scripts in your project directory:

#### yarn start

`yarn start` script runs the app in the development mode. Opens [http://localhost:3000](http://localhost:3000) to view it in the browser. If you make edits in source code, the page will automatically reload. The `console` messages are enabled and `version` of package is suffixed with 'dev'.

#### yarn build

You can run `yarn build` script to bundle a deployment-ready app. 
It bundles React app in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.
It will create a `build` folder in the project directory, which is ready to be deployed.
See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### yarn lint

`yarn lint` script performs error checking using `eslint`. Manual fix the errors which are shown on the command prompt.

#### yarn prettier

`yarn prettier` script performs code style checking and fixing using `prettier`.

## Project Details

### Project Dependencies

Project uses following open-source libraries:

- [three.js](https://threejs.org/) for 3D graphics rendering
- [react](https://reactjs.org/) as core front-end library
- [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) Wrapper on `three.js` to make it declarative and compatible with `react`

### Supported Web Browsers

Mozilla Firefox, Microsoft Edge, Chrome

### Developer

[Sourabh Soni](mailto:Sourabh.Soni@prolincur.com)\
[Prolincur Technologies](https://prolincur.com)

### Sponsor

[Floored At Home Inc](https://flooredathome.com/)