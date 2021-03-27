// import { useState } from "react";
import { useHistory } from "react-router-dom";
// import Button from "react-bootstrap/Button";
import logoImage from "../assets/horse.png";

export default function Nav() {
  // const [color, setColor] = useState("btn btn-outline-dark");
  // function changeColor(e) {
  //   if (e === "over") {
  //     setColor("btn btn-outline-warning");
  //   } else {
  //     setColor("btn btn-outline-dark");
  //   }
  // }
  const history = useHistory();

  async function logout() {
    await localStorage.clear();
    await history.push("/login");
  }
  return (
    // <div
    //   className="col-12"
    //   style={{
    //     display: "flex",
    //     justifyContent: "flex-end",
    //     backgroundColor: "#161512",
    //   }}
    // >
    //   <Button
    //     variant="secondary"
    //     className={color}
    //     style={{backgroundColor: "#161512"}}
    //     // onMouseOver={() => changeColor("over")}
    //     // onMouseLeave={() => changeColor("leave")}
    //     onClick={() => logout()}
    //   >
    //     <i className="fas fa-sign-out-alt" style={{ color: "black" }} />
    //     <span>&nbsp;Log Out</span>
    //   </Button>
    // </div>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <span
        className="navbar-brand m-1 h1"
        style={{ fontSize: "23px", color: "#999999" }}
      >
        <img
          src={logoImage}
          className="mr-3"
          alt="logo"
          width="45"
          height="39"
        ></img>
        DEWA KIPAS
      </span>
      {/* <div className="d-flex align-items-center">
      </div> */}
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav mr-auto">
          {/* <li className="nav-item active">
            <a className="nav-link" href="#">
              Home <span className="sr-only">(current)</span>
            </a>
          </li> */}
        </ul>
        <button
          className="btn btn-outline-warning"
          style={{ justifyContent: "flex-end" }}
          onClick={() => logout()}
        >
          <i className="fas fa-sign-out-alt" style={{ color: "yellow" }} />
          <span>&nbsp;Log Out</span>
        </button>
      </div>
    </nav>
  );
}
