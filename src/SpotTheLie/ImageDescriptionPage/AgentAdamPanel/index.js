import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../../SpotTheLieReducer";
import * as client from "./client.js";

const AgentAdamPanel = () => {
  const dispatch = useDispatch();

  const [adamDescription, setAdamDescription] = useState([]);
  const [differenceItems, setDifferenceItems] = useState([]);
  const [showLineDifferences, setShowLineDifferences] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const adamPanelRef = useRef(null);
  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  const selectedImageDescription = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageDescription,
  );

  const selectedImageHallucinations = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageHallucinations,
  );

  const detectedImageHallucination = useSelector(
    (state) => state.SpotTheLieReducer.detectedImageHallucination,
  );

  const focusAdamPanel = () => {
    dispatch(setCurrentFocusedPanel("adamDescriptionPanel"));
  };

  const getCurrentHallucinationForAdam = () => {
    if (selectedImageHallucinations.length === 0) return null;

    const index =
      detectedImageHallucination.count % selectedImageHallucinations.length;

    return selectedImageHallucinations[index];
  };

  const generateNewDescription = async () => {
    const imageHallucination = getCurrentHallucinationForAdam();
    if (!imageHallucination) return;

    setLoadingDescription(true);
    setDifferenceItems([]);
    setShowLineDifferences(false);

    try {
      const data = await client.generateAdamDescription(
        selectedImageDescription,
        imageHallucination,
      );

      setAdamDescription(data.newDescription || []);
      setLoadingDescription(false);
    } catch (error) {
      console.error("Could not generate Adam description:", error);
    }
  };

  const clearDescription = () => {
    setAdamDescription([]);
    setDifferenceItems([]);
    setShowLineDifferences(false);
  };

  const generateSummaryOfDifferences = async () => {
    setLoadingSummary(true);
    setDifferenceItems([]);

    try {
      const data = await client.generateSummaryDifferences(
        selectedImageDescription.join(" "),
        adamDescription.join(" "),
      );

      const items = (data.summaryDifferences || "")
        .split("\n")
        .map((line) => line.replace(/^[-•]\s*/, "").trim())
        .filter(Boolean);

      setDifferenceItems(items);
      setLoadingSummary(false);
    } catch (error) {
      console.error("Could not generate summary differences:", error);
    }
  };

  useEffect(() => {
    const handleAdamPanelFocusKey = (event) => {
      if (event.key !== "/") return;

      event.preventDefault();
      dispatch(setCurrentFocusedPanel("adamDescriptionPanel"));
      adamPanelRef.current?.focus();
    };

    window.addEventListener("keydown", handleAdamPanelFocusKey);

    return () => {
      window.removeEventListener("keydown", handleAdamPanelFocusKey);
    };
  }, [dispatch]);

  return (
    <section
      ref={adamPanelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "adamDescriptionPanel"
          ? "adam-description-section current-focused-panel"
          : "adam-description-section"
      }
      aria-labelledby="adam-description-title"
      onMouseEnter={focusAdamPanel}
      onFocusCapture={focusAdamPanel}
    >
      <h2 id="adam-description-title" className="panel-title" tabIndex={0}>
        Adam: Generate New AI Image Description
      </h2>

      <p className="keyboard-instructions">
        Ask Adam for a new description of the same image with Generate New
        Description button. Then, select Generate Summary of Differences or
        Compare Line by Line buttons to compare Adam's description with Sara's
        description.
      </p>

      <div className="adam-description-buttons">
        <button
          type="button"
          className="page-button"
          onClick={generateNewDescription}
        >
          Generate New Description
        </button>

        <button
          type="button"
          className="page-button"
          onClick={clearDescription}
        >
          Clear Description
        </button>
      </div>

      {loadingDescription && (
        <p className="adam-description-text" role="status" aria-live="polite">
          Loading description...
        </p>
      )}

      {adamDescription.length > 0 && (
        <>
          <p className="adam-description-text" role="status" aria-live="polite">
            {adamDescription.join(" ")}
          </p>

          <div className="adam-description-buttons">
            <button
              type="button"
              className="page-button"
              onClick={generateSummaryOfDifferences}
            >
              Generate Summary of Differences
            </button>

            <button
              type="button"
              className="page-button"
              onClick={() => setShowLineDifferences(true)}
              aria-expanded={showLineDifferences}
            >
              Compare Line by Line
            </button>
          </div>
        </>
      )}

      {loadingSummary && (
        <p className="adam-difference-text" role="status" aria-live="polite">
          Loading summary...
        </p>
      )}

      {differenceItems.length > 0 && (
        <>
          <p className="adam-difference-text" role="status" aria-live="polite">
            <strong> Summary of differences </strong>
          </p>

          <ul
            className="adam-difference-list"
            aria-label="Summary of differences"
          >
            {differenceItems.map((item, index) => (
              <li key={index} className="adam-difference-item">
                {item}
              </li>
            ))}
          </ul>
        </>
      )}

      {showLineDifferences && (
        <table className="adam-difference-table">
          <caption className="table-caption" role="status" aria-live="polite">
            Line-by-line comparison of Sara's and Adam's description
          </caption>
          <thead>
            <tr>
              <th scope="col">Sara's description</th>
              <th scope="col">Adam's description</th>
            </tr>
          </thead>
          <tbody>
            {selectedImageDescription.map((line, index) => (
              <tr key={index}>
                <td>{line}</td>
                <td>{adamDescription[index] || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default AgentAdamPanel;
