import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../../SpotTheLieReducer";

const helpGuideInstructions = [
  <>
    Press left square bracket key{" "}
    <span className="kbd" aria-label="left square bracket key">
      [
    </span>{" "}
    to go to the previous line.
  </>,
  <>
    Press right square bracket key{" "}
    <span className="kbd" aria-label="right square bracket key">
      ]
    </span>{" "}
    to go to the next line.
  </>,
  <>
    Press{" "}
    <span className="kbd" aria-label="Enter key">
      Enter
    </span>{" "}
    key to check the current line as a possible lie.
  </>,
  <>
    Press equal key{" "}
    <span className="kbd" aria-label="equal key">
      =
    </span>{" "}
    to jump to Sara's detective follow-up question panel.
  </>,
  <>
    Press slash key{" "}
    <span className="kbd" aria-label="slash key">
      /
    </span>{" "}
    to jump to Adam's new AI image description panel.
  </>,
];

const HelpGuidePanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  const justOpenedPanelRef = useRef(false);

  useEffect(() => {
    justOpenedPanelRef.current = true;
    dispatch(setCurrentFocusedPanel("helpGuidePanel"));
    panelRef.current?.focus();
  }, [dispatch]);

  useEffect(() => {
    if (justOpenedPanelRef.current) {
      justOpenedPanelRef.current = false;
      return;
    }

    if (currentFocusedPanel !== "helpGuidePanel") {
      onClose();
    }
  }, [currentFocusedPanel, onClose]);

  const focusHelpGuidePanel = () => {
    dispatch(setCurrentFocusedPanel("helpGuidePanel"));
  };

  const closeHelpGuidePanel = () => {
    onClose();
  };

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-labelledby="help-guide-title"
      aria-describedby="help-guide-list"
      className={
        currentFocusedPanel === "helpGuidePanel"
          ? "help-guide-sidebar-panel current-focused-panel"
          : "help-guide-sidebar-panel"
      }
      onMouseEnter={focusHelpGuidePanel}
      onFocusCapture={focusHelpGuidePanel}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeHelpGuidePanel();
        }
      }}
    >
      <h2 id="help-guide-title" className="help-guide-title">
        Help Guide with Keyboard Instructions
      </h2>

      <ul
        id="help-guide-list"
        className="help-guide-list"
        aria-label="Keyboard shortcuts for the Spot the Lie game"
      >
        {helpGuideInstructions.map((instruction, index) => (
          <li key={index}>{instruction}</li>
        ))}
      </ul>

      <button
        type="button"
        className="page-button"
        onClick={closeHelpGuidePanel}
        aria-label="Close help guide"
      >
        Close
      </button>
    </section>
  );
};

export default HelpGuidePanel;
