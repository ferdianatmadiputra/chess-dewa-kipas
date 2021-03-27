import "./App.css";
import Login from "./pages/Login";
import { Redirect, Route, Switch } from "react-router-dom";
import Regis from "./pages/Regis";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import WithMoveValidation from "./integrations/WithMoveValidation";

// import TestingTimer from "./pages/TestingTimer";

function App() {
  return (
    <Switch>
      <Route exact path="/">
        {localStorage.access_token ? (
          <Redirect to="/home" />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route
        path="/login"
        render={() =>
          localStorage.access_token ? <Redirect to="/home" /> : <Login />
        }
      />
      <Route
        path="/home"
        render={() =>
          localStorage.access_token ? <Home /> : <Redirect to="/login" />
        }
      />
      <Route
        path="/dashboard/bot"
        render={() =>
          localStorage.access_token ? <WithMoveValidation /> : <Redirect to="/login" />
        }
      />
      <Route
        path="/dashboard/:loc/:roomid"
        render={() =>
          localStorage.access_token ? <WithMoveValidation /> : <Redirect to="/login" />
        }
      />
      <Route
        path="/register"
        render={() =>
          localStorage.access_token ? <Redirect to="/home" /> : <Regis />
        }
      />
      {/* <Route
        path="/testing"
        render={() =>
          localStorage.access_token ? <TestingTimer /> : <Redirect to="/home" />
        }
      /> */}
    </Switch>
  );
}

export default App;
