export default function CardHistory(props) {
  const { history, user } = props;

  return (
    <div className="card mb-3 bg-dark" id={history.id}>
      <div className="card-body">
        <div className="row justify-content-center">
          <div
            className="col-12 h3 font-minecraft m-0"
            style={{ color: "#999999" }}
          >
            {+history.playerOne === +user.id ? "WIN" : "LOSE"}
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-5">
            <div
              className="row"
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <img
                src={history.PlayerOne.pictureUrl}
                alt={history.PlayerOne.username}
                style={{ width: "6rem", height: "6rem" }}
              />
            </div>
            <div className="row">
              <div className="col-12 h5" style={{ color: "#999999" }}>
                {history.PlayerOne.username}
              </div>
            </div>
          </div>
          <div
            className="col-2 p-0 m-0"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "3rem", color: "#999999" }}>
              {/* <i className="fab fa-vimeo-v" size="5" style={{ color: "#999999" }}></i>
              <i className="fab fa-stripe-s" style={{ color: "#999999" }}></i> */}
              VS
            </p>
          </div>
          <div className="col-5">
            <div
              className="row"
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <img
                src={history.PlayerTwo.pictureUrl}
                alt={history.PlayerTwo.username}
                style={{ width: "6rem", height: "6rem" }}
              />
            </div>
            <div className="row">
              <div className="col-12 h5" style={{ color: "#999999" }}>
                {history.PlayerTwo.username}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
