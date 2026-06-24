import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../../SpotTheBiasReducer";

const instructions = [
  <>
    Press left square bracket key
    <span className="kbd" aria-hidden="true">
      [
    </span>{" "}
    to go to the previous paragraph. Press right square bracket key
    <span className="kbd" aria-hidden="true">
      ]
    </span>
    to go to the next paragraph.
  </>,
  <>
    Press <span className="kbd">Enter</span> key to check the current paragraph
    as possible bias.
  </>,
  <>
    Press equal key{" "}
    <span className="kbd" aria-hidden="true">
      =
    </span>{" "}
    to go to Alice panel.
  </>,
  <>
    Press question mark
    <span className="kbd" aria-hidden="true">
      ?
    </span>{" "}
    to open help guide panel.
  </>,
  <>
    Press <span className="kbd">Escape</span> key to close the help guide panel.
  </>,
];

const HelpGuidePanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  // const justOpenedPanelRef = useRef(false);

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheBiasReducer.currentFocusedPanel,
  );

  useEffect(() => {
    // justOpenedPanelRef.current = true;
    dispatch(setCurrentFocusedPanel("helpGuidePanel"));
    panelRef.current?.focus();
  }, [dispatch]);

  // useEffect(() => {
  //   if (justOpenedPanelRef.current) {
  //     justOpenedPanelRef.current = false;
  //     return;
  //   }

  //   if (currentFocusedPanel !== "helpGuidePanel") {
  //     onClose();
  //   }
  // }, [currentFocusedPanel, onClose]);

  const focusPanel = () => {
    dispatch(setCurrentFocusedPanel("helpGuidePanel"));
  };

  const handleHelpGuidePanelKeyDown = (event) => {
    const activeElement = document.activeElement;

    const isTyping =
      activeElement?.tagName === "TEXTAREA" ||
      activeElement?.tagName === "INPUT" ||
      activeElement?.tagName === "SELECT" ||
      activeElement?.isContentEditable;

    if (isTyping) return;

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key === "[" || event.key === "]" || event.key === "=") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  };

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-labelledby="help-guide-title"
      className={
        currentFocusedPanel === "helpGuidePanel"
          ? "help-guide-sidebar-panel current-focused-panel"
          : "help-guide-sidebar-panel"
      }
      onMouseEnter={focusPanel}
      onFocusCapture={focusPanel}
      onKeyDown={handleHelpGuidePanelKeyDown}
    >
      <h2 id="help-guide-title" className="help-guide-title">
        Help Guide with the List of Keyboard Instructions
      </h2>

      <ul
        className="help-guide-list"
        aria-label="Keyboard shortcuts for reading Mia's story"
      >
        {instructions.map((instruction, index) => (
          <li key={index}>{instruction}</li>
        ))}
      </ul>

      <button
        type="button"
        className="page-button"
        aria-label="Close help guide"
        onClick={onClose}
      >
        Close
      </button>
    </section>
  );
};

export default HelpGuidePanel;
