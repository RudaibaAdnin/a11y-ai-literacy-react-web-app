import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { scenarioDetails } from "../Util/scenarioDetails.js";

import "./index.css";

const WhatstheCatchPage = () => {
  const { scenariotopic, scenarioid } = useParams();

  const [activeAgent, setActiveAgent] = useState("");
  const [question, setQuestion] = useState("");
  const [agentReply, setAgentReply] = useState("");
  const [hasInvestigated, setHasInvestigated] = useState(false);

  const [newChoice, setNewChoice] = useState("");
  const [finalChoice, setFinalChoice] = useState("");
  const [finalFeedback, setFinalFeedback] = useState("");

  const scenario = scenarioDetails[scenarioid];

  if (!scenario) {
    return (
      <main className="decision-landing-page">
        <h1>Scenario Not Found</h1>
      </main>
    );
  }

  const selectedOption = sessionStorage.getItem(`wyr-${scenarioid}`);

  const selectedText =
    scenario.WouldYouRather[selectedOption]?.text || "No choice selected.";

  const validMenuItems = [
    "Thai Steamed Dumplings",
    "Sweet & Sour with Crispy Chicken",
    "Khao Soi",
    "Mango Curry",
  ];

  const openAgent = (agent) => {
    setActiveAgent(agent);
    setQuestion("");
    setAgentReply("");
  };

  const closeAgent = () => {
    setActiveAgent("");
    setQuestion("");
    setAgentReply("");
  };

  const askAgent = () => {
    if (!question.trim()) return;

    const reply =
      activeAgent === "alice"
        ? "I may have made a mistake. Some menu details were unclear, so I might have filled in information that was not actually there."
        : `I checked the menu information again. ${scenario.AIResponse.AvailableInitialDataToAI}`;

    setAgentReply(reply);
    setHasInvestigated(true);
  };

  const saveFinalChoice = (choice, changed = false) => {
    setFinalChoice(choice);
    sessionStorage.setItem(`final-choice-${scenarioid}`, choice);

    if (!changed) {
      setFinalFeedback(
        `You kept your original choice: ${selectedText}. ${scenario.DecisionConsequence.details.text} The cross-check shows that this dish was not actually on the menu. Alice made up a detail that sounded believable.`,
      );
      return;
    }

    const isValidChoice = validMenuItems.some((item) =>
      choice.toLowerCase().includes(item.toLowerCase()),
    );

    if (isValidChoice) {
      setFinalFeedback(
        `You changed your decision from ${selectedText} to ${choice}. Good catch! Your previous choice was based on a made-up dish. If you had kept it, ${scenario.DecisionConsequence.details.text.toLowerCase()} AI can sometimes make up details that sound convincing, so changing your mind when you find better evidence can be a smart decision.`,
      );
    } else {
      setFinalFeedback(
        `You changed your decision from ${selectedText} to ${choice}, but this new choice does not match the menu information Bob found. Try cross-checking again before you lock in your answer.`,
      );
    }
  };

  return (
    <main
      className="decision-landing-page"
      aria-labelledby="catch-page-heading"
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
            id="catch-page-heading"
            className="decision-page-title"
            tabIndex={0}
          >
            What's the Catch?
          </h1>
        </div>

        <nav className="decision-page-nav" aria-label="Page navigation">
          <Link
            className="decision-nav-button"
            to={`/whats-the-catch/${scenariotopic}/${scenarioid}`}
          >
            Back to Topics
          </Link>
        </nav>
      </header>

      <section className="scenario-intro-section" aria-labelledby="catch-title">
        <h2 id="catch-title" className="decision-guide-title" tabIndex={0}>
          Before You Lock In Your Choice...
        </h2>

        <p className="scenario-after-ai-text" tabIndex={0}>
          <strong>Your current choice:</strong>
          <br />
          {selectedText}
        </p>

        <p tabIndex={0}>
          You can ask Alice more questions or cross-check her answer with
          another AI agent, Bob. Investigate before deciding whether to keep or
          change your choice.
        </p>
      </section>

      <div className="catch-action-list">
        <button
          type="button"
          className="scenario-ask-ai-button"
          onClick={() => openAgent("alice")}
        >
          Ask Alice a Question
        </button>

        <button
          type="button"
          className="scenario-ask-ai-button"
          onClick={() => openAgent("bob")}
        >
          Ask Bob a Question
        </button>
      </div>

      {activeAgent && (
        <div className="agent-modal-overlay">
          <section
            className="agent-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-modal-title"
          >
            <div className="agent-modal-heading">
              <img
                src="/images/ai-avatar.png"
                className="scenario-ai-avatar"
                alt=""
                aria-hidden="true"
              />

              <h2 id="agent-modal-title" className="decision-guide-title">
                Ask {activeAgent === "alice" ? "Alice" : "Bob"}
              </h2>
            </div>

            <label htmlFor="agent-question">What would you like to ask?</label>

            <textarea
              id="agent-question"
              rows="2"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="For example: Are you sure that dish is on the menu?"
            />

            <button
              type="button"
              className="scenario-ask-ai-button"
              onClick={askAgent}
            >
              Ask
            </button>

            {agentReply && (
              <div className="scenario-ai-response-box" tabIndex={0}>
                <p className="scenario-ai-response-text">
                  <strong>{activeAgent === "alice" ? "Alice" : "Bob"}:</strong>{" "}
                  {agentReply}
                </p>
              </div>
            )}
            <button
              type="button"
              className="decision-nav-button"
              onClick={closeAgent}
              aria-label={`Close ${activeAgent} conversation`}
            >
              Close
            </button>
          </section>
        </div>
      )}

      {hasInvestigated && (
        <section
          className="scenario-wyr-section"
          aria-labelledby="final-choice-title"
        >
          <h2
            id="final-choice-title"
            className="decision-guide-title"
            tabIndex={0}
          >
            Now, Let's Make Your Final Choice
          </h2>

          <p className="scenario-wyr-title" tabIndex={0}>
            Would you like to keep your choice or change it?
          </p>

          <div className="scenario-wyr-options">
            <button
              type="button"
              className="scenario-wyr-option scenario-wyr-option-a"
              onClick={() => saveFinalChoice(selectedText)}
            >
              <span className="scenario-wyr-option-label">
                Keep My Old Choice
              </span>
              {selectedText}
            </button>

            <span className="scenario-wyr-or">OR</span>

            <div className="catch-new-choice">
              <label htmlFor="new-choice">Choose something new</label>

              <input
                id="new-choice"
                type="text"
                value={newChoice}
                onChange={(e) => setNewChoice(e.target.value)}
                placeholder="Type your new choice"
              />

              <button
                type="button"
                className="scenario-wyr-option scenario-wyr-option-b"
                disabled={!newChoice.trim()}
                onClick={() => saveFinalChoice(newChoice.trim(), true)}
              >
                Change My Choice
              </button>
            </div>
          </div>

          {finalChoice && (
            <div className="final-decision-result" tabIndex={0}>
              <h2 className="decision-guide-title">Your Final Choice</h2>

              <p>
                <strong>{finalChoice}</strong>
              </p>

              <p>{finalFeedback}</p>

              <p>
                <strong>What's the catch?</strong> AI can sometimes make up
                details that sound believable. Cross-checking information and
                changing your mind when you find better evidence can help you
                make a better decision.
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default WhatstheCatchPage;
