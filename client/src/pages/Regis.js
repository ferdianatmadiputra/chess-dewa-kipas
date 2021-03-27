import axios from "../api/axios";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { GoogleLogin } from "react-google-login";
import loginImage from "../assets/horse.svg";

export default function Login() {
  const history = useHistory();
  const [validate, setValidate] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  async function register(e) {
    try {
      e.preventDefault();
      setValidate(true);
      if (username || email || password) {
        const { data } = await axios({
          method: "post",
          url: "users/register",
          data: { username, email, password },
        });
        history.push("/login");
      }
    } catch ({ response }) {
      console.log(response);
    }
  }
  async function responseGoogle(res) {
    try {
      const { data } = await axios({
        method: "post",
        url: "users/googlelogin",
        data: res.profileObj,
      });
      await localStorage.setItem("access_token", data.access_token);
      await history.push("/home", data);
    } catch ({ response }) {
      console.log(response.data);
    }
  }
  return (
    <div
      className="row justify-content-center color-light"
      style={{ color: "#999999" }}
    >
      <div id="form-login">
        <div className="container">
          <div className="row content">
            <div className="col-md-6 mt-1" style={{ textAlign: "center" }}>
              <div>
                <img
                  src={loginImage}
                  className="img-fluid"
                  alt="loginimage"
                  style={{ width: "13em" }}
                />
              </div>
              <span className="title-logo mt-1">Dewa Kipas</span>
            </div>
            <div className="col-md-6 mt-1">
              <h3 className="header-text mb-3">REGISTER</h3>
              <form
                id="form-login-user"
                noValidate
                onSubmit={(e) => register(e)}
              >
                <div className="form-group">
                  <label>Username :</label>
                  <input
                    type="text"
                    name="email"
                    className="form-control"
                    required
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email :</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Password :</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-outline-warning btn-login mb-3"
                >
                  REGISTER
                </button>
              </form>
              <button
                type="button"
                className="btn btn-outline-dark btn-login mb-3"
              >
                <GoogleLogin
                  clientId="530630525203-62hcamr2a1e2or3qkidkgashtfd0tj4l.apps.googleusercontent.com"
                  buttonText="Login"
                  onSuccess={responseGoogle}
                  onFailure={responseGoogle}
                  cookiePolicy={"single_host_origin"}
                  className="btn-google"
                />
              </button>
              <p>
                Already have an Account? <Link to="/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
