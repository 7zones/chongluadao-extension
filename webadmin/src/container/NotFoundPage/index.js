import React from "react";
import "./index.scss"

export default function index() {
  return (
    <section className="flat-row flat-error">
      <div className="wrap-error text-center">
        <div className="header-error">404</div>
        <div className="content-error">
          <h2>Oops, Page Not Found!</h2>
          <p>
            It looks like nothing was found at this location. Click{" "}
            <a href="/" className="btn-error">
              here
                  </a>{" "}
                  to return Homepage
                </p>
        </div>
      </div>
    </section >
  );
}
