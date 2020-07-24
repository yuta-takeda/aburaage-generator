import React from 'react';
import ReactDOM from 'react-dom';
import { SnackbarProvider } from "notistack";
import App from './container/App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <SnackbarProvider maxSnack={2} preventDuplicate>
    <App />
  </SnackbarProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
