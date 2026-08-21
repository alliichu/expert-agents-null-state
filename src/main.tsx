import ReactDOM from 'react-dom';
// direct path — @pine-ds/core's exports map doesn't expose the css subpath
import '../node_modules/@pine-ds/core/dist/pine-core/pine-core.css';
// vendored @kajabi-ui/styles@1.4.0 kajabi_products.css — the same theme sheet prod
// loads. MUST come after pine-core so Kajabi token overrides win (prod load order).
import './styles/kajabi-theme.css';
import './styles/global.css';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
