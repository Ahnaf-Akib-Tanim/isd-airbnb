import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, fullName, isHost } = useAuth();

  return (
    <div className="page-wrapper">
      <section className="page-content">
        <div className="home-hero container animate-fade-in-up">
          <div className="home-hero__content">
            <p className="home-hero__eyebrow">BUET CSE 326 · ISD Airbnb</p>
            <h1 className="home-hero__title">
              Stay anywhere.
              <br />
              <span>Live like a local.</span>
            </h1>
            <p className="home-hero__subtitle">
              Discover unique stays hosted by real people. Designed as a microservice-based Airbnb clone
              with booking status history and rich tracking.
            </p>

            <div className="home-hero__actions">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="btn btn-primary btn-lg">
                    Go to your profile
                  </Link>
                  {isHost && (
                    <Link to="/my-listings" className="btn btn-outline">
                      Manage your listings
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
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
                Signed in as <strong>{fullName}</strong>. Your bookings and status history will appear in the
                dedicated history views as we wire other microservices.
              </p>
            )}
          </div>

          <div className="home-hero__card-grid">
            <div className="home-hero__card">
              <div className="home-hero__badge">Microservices</div>
              <h3>User service</h3>
              <p>
                Secure authentication, JWT-based sessions, and profile management built with Spring Boot and
                MongoDB.
              </p>
            </div>
            <div className="home-hero__card">
              <div className="home-hero__badge home-hero__badge--secondary">Status & history</div>
              <h3>Booking lifecycle</h3>
              <p>
                From <strong>PENDING</strong> to <strong>CHECKED_OUT</strong>, every transition is captured for
                rich history and analytics.
              </p>
            </div>
            <div className="home-hero__card">
              <div className="home-hero__badge home-hero__badge--ghost">CI/CD · Docker</div>
              <h3>Production-style setup</h3>
              <p>
                GitHub Actions, Docker, and an API gateway give you a realistic cloud‑native Airbnb-style stack.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

