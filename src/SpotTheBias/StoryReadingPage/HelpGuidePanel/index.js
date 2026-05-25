import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../../SpotTheBiasReducer";

const instructions = [
  <>
    Press{" "}
    <span className="kbd" aria-label="left square bracket key">
      [
    </span>{" "}
    to go to the previous paragraph.
  </>,
  <>
    Press{" "}
    <span className="kbd" aria-label="right square bracket key">
      ]
    </span>{" "}
    to go to the next paragraph.
  </>,
  <>
    Press{" "}
    <span className="kbd" aria-label="Enter key">
      Enter
    </span>{" "}
    to check the current paragraph as possible bias.
  </>,
];

const HelpGuidePanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const justOpenedPanelRef = useRef(false);

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheBiasReducer.currentFocusedPanel,
  );

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

  const focusPanel = () => {
    dispatch(setCurrentFocusedPanel("helpGuidePanel"));
  };

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-labelledby="help-guide-title"
      className={
        currentFocusedPanel === "helpGuidePanel"
          ? "help-guide-sidebar-panel current-focused-panel"
          : "help-guide-sidebar-panel"
      }
      onMouseEnter={focusPanel}
      onFocusCapture={focusPanel}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <h2 id="help-guide-title" className="help-guide-title">
        Help Guide with Keyboard Instructions
      </h2>

      <ul
        className="help-guide-list"
        aria-label="Keyboard shortcuts for reading Mia's story"
      >
        {instructions.map((instruction, index) => (
          <li key={index}>{instruction}</li>
        ))}
      </ul>

      <button type="button" className="page-button" onClick={onClose}>
        Close
      </button>
    </section>
  );
};

export default HelpGuidePanel;
