import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../../SpotTheLieReducer";

const HelpGuidePanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    if (currentFocusedPanel !== "helpGuidePanel") {
      onClose();
    }
  }, [currentFocusedPanel, onClose]);

  const focusHelpGuidePanel = () => {
    dispatch(setCurrentFocusedPanel("helpGuidePanel"));
  };

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "helpGuidePanel"
          ? "help-guide-sidebar-panel current-focused-panel"
          : "help-guide-sidebar-panel"
      }
      aria-labelledby="help-guide-title"
      onMouseEnter={focusHelpGuidePanel}
      onFocusCapture={focusHelpGuidePanel}
    >
      <h2 id="help-guide-title" className="help-guide-title">
        Help Guide with Keyboard Instructions
      </h2>

      <ul className="help-guide-list">
        <li>
          Press <span className="kbd">[</span> to go to the previous line.
        </li>
        <li>
          Press <span className="kbd">]</span> to go to the next line.
        </li>
        <li>
          Press <span className="kbd">Enter</span> to check the current line as
          a possible lie.
        </li>
        <li>
          Press <span className="kbd">=</span> to jump to Sara's follow-up
          question panel.
        </li>
      </ul>

      <button type="button" className="page-button" onClick={onClose}>
        Close
      </button>
    </section>
  );
};

export default HelpGuidePanel;
