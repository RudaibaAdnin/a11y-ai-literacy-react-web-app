import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./index.css";

const DecisionMakingLandingPage = () => {
  const navigate = useNavigate();
  const [currentFocusedPanel, setCurrentFocusedPanel] = useState("");

  const categories = [
    {
      name: "Social Situations",
      path: "/whats-the-catch/social-situations",
    },
    {
      name: "Everyday Labels",
      path: "/whats-the-catch/everyday-labels",
    },
    {
      name: "Academic Tasks",
      path: "/whats-the-catch/academic-tasks",
    },
  ];

  const focusPanel = (panel) => {
    setCurrentFocusedPanel(panel);
  };

  return (
    <main
      className="decision-landing-page"
      aria-labelledby="decision-landing-page-title"
    >
      <header className="decision-header">
        <div className="decision-header-space" aria-hidden="true" />

        <div className="decision-header-title-group">
          <img
            src="/images/decision-avatar.png"
            className="decision-title-image"
            alt=""
            aria-hidden="true"
          />

          <h1
            id="decision-landing-page-title"
            className="decision-page-title"
            tabIndex={0}
          >
            What's the Catch?
          </h1>
        </div>

        <nav className="decision-page-nav" aria-label="Main menu navigation">
          <Link className="decision-nav-button" to="/whats-the-catch">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section
        className={
          currentFocusedPanel === "decisionGuideSection"
            ? "decision-guide-section decision-current-focused-panel"
            : "decision-guide-section"
        }
        aria-labelledby="decision-guide-title"
        onMouseEnter={() => focusPanel("decisionGuideSection")}
        onFocusCapture={() => focusPanel("decisionGuideSection")}
      >
        <h2
          id="decision-guide-title"
          className="decision-guide-title"
          tabIndex={0}
        >
          Game Guide
        </h2>

        <p className="decision-guide-text" tabIndex={0}>
          Choose a category below. Explore the situation, think about the
          information you receive, and decide what you would do.
        </p>
      </section>

      <section
        className="decision-selection-section"
        aria-labelledby="decision-selection-title"
        onMouseEnter={() => focusPanel("decisionSelectionSection")}
        onFocusCapture={() => focusPanel("decisionSelectionSection")}
      >
        <h2
          id="decision-selection-title"
          className="decision-selection-title"
          tabIndex={0}
        >
          Choose a Category
        </h2>

        <ul className="decision-choice-list" aria-label="Category choices">
          {categories.map((category) => (
            <li key={category.path} className="decision-choice-item">
              <button
                type="button"
                className="decision-choice-button"
                onClick={() => navigate(category.path)}
                aria-label={`Select ${category.name}`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default DecisionMakingLandingPage;
