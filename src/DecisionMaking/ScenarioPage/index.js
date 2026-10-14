import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { scenarioDetails } from "../Util/scenarioDetails.js";

import "./index.css";

const ScenarioPage = () => {
  const { scenariotopic, scenarioid } = useParams();
  const navigate = useNavigate();

  const [showAIResponse, setShowAIResponse] = useState(false);

  const scenario = scenarioDetails[scenarioid];

  if (!scenario) {
    return (
      <main className="decision-landing-page">
        <h1>Scenario Not Found</h1>

        <Link
          className="decision-nav-button"
          to={`/whats-the-catch/${scenariotopic}`}
        >
          Back to Topics
        </Link>
      </main>
    );
  }

  const {
    scenarioBuildingInitialPart,
    AIResponse,
    settings_ai_after,
    WouldYouRather,
  } = scenario;

  const handleDecision = (option) => {
    sessionStorage.setItem(`wyr-${scenarioid}`, option);

    navigate(`/whats-the-catch/${scenariotopic}/${scenarioid}/catch`);
  };

  return (
    <main
      className="decision-landing-page"
      aria-labelledby="scenario-page-heading"
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
            id="scenario-page-heading"
            className="decision-page-title"
            tabIndex={0}
          >
            What's the Catch?
          </h1>
        </div>

        <nav className="decision-page-nav" aria-label="Page navigation">
          <Link
            className="decision-nav-button"
            to={`/whats-the-catch/${scenariotopic}`}
          >
            Back to Topics
          </Link>
        </nav>
      </header>

      <section
        className="scenario-intro-section"
        aria-labelledby="scenario-title"
      >
        <h2 id="scenario-title" className="decision-guide-title" tabIndex={0}>
          {scenarioBuildingInitialPart.title}
        </h2>

        <p className="scenario-after-ai-text" tabIndex={0}>
          {scenarioBuildingInitialPart.settings}
        </p>

        {scenarioBuildingInitialPart.settings_ai_before && (
          <p className="scenario-after-ai-text" tabIndex={0}>
            {scenarioBuildingInitialPart.settings_ai_before}
          </p>
        )}

        {scenarioBuildingInitialPart.imagePath && (
          <img
            src={scenarioBuildingInitialPart.imagePath}
            className="scenario-image"
            alt="Vietnamese restaurant menu"
          />
        )}

        {!showAIResponse && (
          <button
            type="button"
            className="scenario-ask-ai-button"
            onClick={() => setShowAIResponse(true)}
            aria-expanded={showAIResponse}
            aria-controls="scenario-ai-content"
          >
            Ask AI to read the menu
          </button>
        )}
      </section>

      {showAIResponse && (
        <div id="scenario-ai-content" aria-live="polite">
          <section
            className="scenario-ai-section"
            aria-labelledby="scenario-ai-title"
          >
            <h2
              id="scenario-ai-title"
              className="decision-guide-title"
              tabIndex={0}
            >
              AI Says:
            </h2>

            <div className="scenario-ai-response-row">
              <img
                src="/images/ai-avatar.png"
                className="scenario-ai-avatar"
                alt=""
                aria-hidden="true"
              />

              <div className="scenario-ai-response-box" tabIndex={0}>
                <p className="scenario-ai-response-text">
                  {AIResponse.AIResponseText}
                </p>
              </div>
            </div>

            {settings_ai_after && (
              <p className="scenario-after-ai-text" tabIndex={0}>
                {settings_ai_after}
              </p>
            )}
          </section>

          <section
            className="scenario-wyr-section"
            aria-labelledby="scenario-wyr-title"
          >
            <h2
              id="scenario-wyr-title"
              className="decision-guide-title"
              tabIndex={0}
            >
              {scenarioBuildingInitialPart.task}
            </h2>

            <p className="scenario-wyr-title" tabIndex={0}>
              Would You Rather...
            </p>

            <div className="scenario-wyr-options">
              <button
                type="button"
                className="scenario-wyr-option scenario-wyr-option-a"
                onClick={() => handleDecision("optionA")}
              >
                <span className="scenario-wyr-option-label">A</span>
                {WouldYouRather.optionA.text}
              </button>

              <span className="scenario-wyr-or">OR</span>

              <button
                type="button"
                className="scenario-wyr-option scenario-wyr-option-b"
                onClick={() => handleDecision("optionB")}
              >
                <span className="scenario-wyr-option-label">B</span>
                {WouldYouRather.optionB.text}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default ScenarioPage;
