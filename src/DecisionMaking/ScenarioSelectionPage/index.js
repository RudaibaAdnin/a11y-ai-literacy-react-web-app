import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { scenarioTopic } from "../Util/scenarioTopic.js";

import "./index.css";

const ScenarioSelectionPage = () => {
  const navigate = useNavigate();
  const { scenariotopic } = useParams();

  const [currentFocusedPanel, setCurrentFocusedPanel] = useState("");

  const topic = scenarioTopic[scenariotopic];

  const focusPanel = (panel) => {
    setCurrentFocusedPanel(panel);
  };

  if (!topic) {
    return (
      <main className="decision-landing-page">
        <h1>Category Not Found</h1>

        <Link className="decision-nav-button" to="/whats-the-catch">
          Back to Menu
        </Link>
      </main>
    );
  }

  return (
    <main
      className="decision-landing-page"
      aria-labelledby="scenario-selection-page-title"
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
            id="scenario-selection-page-title"
            className="decision-page-title"
            tabIndex={0}
          >
            What's the Catch?
          </h1>
        </div>

        <nav className="decision-page-nav" aria-label="Page navigation">
          <Link className="decision-nav-button" to="/whats-the-catch">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section
        className={
          currentFocusedPanel === "scenarioGuideSection"
            ? "decision-guide-section decision-current-focused-panel"
            : "decision-guide-section"
        }
        aria-labelledby="scenario-guide-title"
        onMouseEnter={() => focusPanel("scenarioGuideSection")}
        onFocusCapture={() => focusPanel("scenarioGuideSection")}
      >
        <h2
          id="scenario-guide-title"
          className="decision-guide-title"
          tabIndex={0}
        >
          Choose a Scenario on {topic.title}
        </h2>

        <p className="decision-guide-text" tabIndex={0}>
          Pick a scenario from below.
        </p>
      </section>

      <section
        className={
          currentFocusedPanel === "scenarioCardSection"
            ? "scenario-card-section"
            : "scenario-card-section"
        }
        aria-label={`${topic.title} scenarios`}
        onMouseEnter={() => focusPanel("scenarioCardSection")}
        onFocusCapture={() => focusPanel("scenarioCardSection")}
      >
        <ul className="scenario-card-list">
          {topic.scenarios.map((scenario) => (
            <li key={scenario.id} className="scenario-card-item">
              <button
                type="button"
                className="scenario-card"
                onClick={() =>
                  navigate(`/whats-the-catch/${scenariotopic}/${scenario.id}`)
                }
                aria-label={`Start ${scenario.name}`}
              >
                <div className="scenario-card-title-row">
                  <span className="scenario-sparkle" aria-hidden="true" />

                  <h2 className="scenario-card-title">{scenario.name}</h2>
                </div>

                <p className="scenario-card-description">
                  {scenario.description}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default ScenarioSelectionPage;
