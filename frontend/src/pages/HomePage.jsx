import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { isAuthenticated, fullName, isHost } = useAuth();

  return (
    <div className="page-wrapper">
      <section className="page-content">
        <div className="home-hero container animate-fade-in-up">
          <div className="home-hero__content">
            <p className="home-hero__eyebrow">BUET CSE 326 - Airbnb</p>
            <h1 className="home-hero__title">
              Stay anywhere.
              <br />
              <span>Live like a local.</span>
            </h1>
            <p className="home-hero__subtitle">
              Discover unique stays hosted by real people. The current build
              already supports account creation, login, and profile management
              through the user service.
            </p>

            <div className="home-hero__actions">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="btn btn-primary btn-lg">
                    Go to your profile
                  </Link>
                  <Link to="/profile" className="btn btn-outline">
                    Update your details
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register?role=GUEST"
                    className="btn btn-primary btn-lg"
                  >
                    Start your Airbnb journey
                  </Link>
                  <Link to="/login" className="btn btn-ghost">
                    Already have an account? Log in
                  </Link>
                </>
              )}
            </div>

            {isAuthenticated && (
              <p className="home-hero__welcome">
                Signed in as <strong>{fullName}</strong>. Your account is live
                now, while trips, listings, and hosting tools are the next
                features to be wired.
              </p>
            )}
          </div>

          <div className="home-hero__card-grid">
            <div className="home-hero__card">
              <div className="home-hero__badge home-hero__badge--secondary">
                Trips and hosting
              </div>
              <h3>
                {isHost
                  ? "Hosting tools are next"
                  : "Trips and hosting are coming next"}
              </h3>
              <p>
                This project is moving toward booking history, status tracking,
                and host-side tools. Right now, your account and profile are
                ready, and the next major screens will build on top of them.
              </p>
              <ul className="home-hero__card-list">
                <li>Upcoming trips and booking history can live here later</li>
                <li>
                  Booking status steps like PENDING, CONFIRMED, and CHECKED_OUT
                  fit naturally in this area
                </li>
                <li>
                  {isHost
                    ? "Host dashboard shortcuts and listing stats can be added here"
                    : "Host onboarding and listing access can be added here later"}
                </li>
              </ul>
              <Link
                to={isAuthenticated ? "/profile" : "/register?role=GUEST"}
                className="home-hero__card-action"
              >
                {isAuthenticated
                  ? "Finish your profile"
                  : "Create your account"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
