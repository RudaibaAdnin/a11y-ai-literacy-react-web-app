import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const BiasBusterLandingPage = () => {
  const navigate = useNavigate();

  const pages = [
    {
      title: "Teacher Guide Page",
      description:
        "Choose the bias types you want Mia to include in the story and image before starting the activity.",
      button: "Go to Teacher Guide Page",
      path: "/bias-buster/teacher-guide",
    },
    {
      title: "Game Page",
      description:
        "Start the Bias Buster activity and guide Mia to create a fairer story and image.",
      button: "Go to Game Page",
      path: "/bias-buster/story-topic-selection",
    },
  ];

  return (
    <main
      className="bias-buster-landing-page"
      aria-labelledby="bias-buster-landing-title"
    >
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-bias-avatar.png"
            className="title-image"
            alt=""
            aria-hidden="true"
          />

          <h1
            id="bias-buster-landing-title"
            className="page-title"
            tabIndex={0}
          >
            Bias Buster
          </h1>
        </div>

        <div className="header-spacer" aria-hidden="true" />
      </header>

      <p className="landing-instructions" tabIndex={0}>
        Choose which page you would like to go from below.
      </p>

      <div className="landing-page-options">
        {pages.map(({ title, description, button, path }) => {
          const id = title.toLowerCase().replaceAll(" ", "-");

          return (
            <section
              key={title}
              className="landing-page-panel"
              aria-labelledby={id}
            >
              <h2 id={id} className="panel-title" tabIndex={0}>
                {title}
              </h2>

              <p className="landing-panel-instructions" tabIndex={0}>
                {description}
              </p>

              <button
                type="button"
                className="page-button"
                onClick={() => navigate(path)}
                tabIndex={0}
              >
                {button}
              </button>
            </section>
          );
        })}
      </div>
    </main>
  );
};

export default BiasBusterLandingPage;
