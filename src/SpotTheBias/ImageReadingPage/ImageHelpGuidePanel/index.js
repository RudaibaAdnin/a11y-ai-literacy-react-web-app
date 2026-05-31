import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCurrentFocusedImagePanel } from "../../ImageBiasReducer";
import "./index.css";

const instructions = [
  <>
    Press left square bracket key{" "}
    <span className="kbd" aria-hidden="true">
      [
    </span>{" "}
    to go to the previous image description paragraph.
  </>,
  <>
    Press right square bracket key{" "}
    <span className="kbd" aria-hidden="true">
      ]
    </span>{" "}
    to go to the next image description paragraph.
  </>,
  <>
    Press <span className="kbd">Enter</span> key to check the current image
    description paragraph as possible image bias.
  </>,
  <>
    Press question mark{" "}
    <span className="kbd" aria-hidden="true">
      ?
    </span>{" "}
    to open help guide panel.
  </>,
];

const ImageHelpGuidePanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const justOpenedPanelRef = useRef(false);

  const currentFocusedImagePanel = useSelector(
    (state) => state.ImageBiasReducer.currentFocusedImagePanel,
  );

  useEffect(() => {
    justOpenedPanelRef.current = true;
    dispatch(setCurrentFocusedImagePanel("imageHelpGuidePanel"));
    panelRef.current?.focus();
  }, [dispatch]);

  useEffect(() => {
    if (justOpenedPanelRef.current) {
      justOpenedPanelRef.current = false;
      return;
    }

    if (currentFocusedImagePanel !== "imageHelpGuidePanel") onClose();
  }, [currentFocusedImagePanel, onClose]);

  const focusPanel = () => {
    dispatch(setCurrentFocusedImagePanel("imageHelpGuidePanel"));
  };

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-labelledby="image-help-guide-title"
      className={
        currentFocusedImagePanel === "imageHelpGuidePanel"
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
      <h2 id="image-help-guide-title" className="help-guide-title">
        Help Guide with the List of Keyboard Instructions
      </h2>

      <ul
        className="help-guide-list"
        aria-label="Keyboard shortcuts for reading Mia's image description"
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

export default ImageHelpGuidePanel;
