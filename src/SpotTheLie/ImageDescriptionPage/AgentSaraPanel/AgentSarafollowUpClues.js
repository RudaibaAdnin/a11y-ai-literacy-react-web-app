// //  import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";

// import "./index.css";
// import { imageDescriptions } from "../../util/imageDescriptions.js";
// import {
//   setCurrentFocusedPanel,
// } from "../../SpotTheLieReducer";
// import * as client from "./client.js";

// import { imageDescriptions } from "../util/imageDescriptions.js";
// import { imageHallucinations } from "../util/imageHallucinations.js";

//   const dispatch = useDispatch();

//   const selectedImageDescription = imageDescriptions[imagename] || [];
//   const selectedImageHallucinations = imageHallucinations[imagename] || [];

//   const detectedImageHallucination = useSelector(
//     (state) => state.SpotTheLieReducer.detectedImageHallucination,
//   );

//   const currentFocusedPanel = useSelector(
//     (state) => state.SpotTheLieReducer.currentFocusedPanel,
//   );

// //  function AgentSarafollowUpClues()
//<section>
//     className={
//       currentFocusedPanel === "saraFollowupWithCluesPanel"
//         ? "sara-followup-withclues-section current-focused-panel"
//         : "sara-followup-withclues-section"
//     }
//     aria-label="Follow-up questioning with clues"
//     onMouseEnter={focusSaraFollowupWithCluesSectionPanel}
//     onFocusCapture={focusSaraFollowupWithCluesSectionPanel}
//   >
//     <h2 className="panel-title">Get Clues and Ask Follow-up Questions</h2>

//     <div className="sara-followupsection-buttons">
//       <button type="button" className="page-button">
//         Get Clues
//       </button>

//       <button type="button" className="page-button">
//         Clear Chat
//       </button>
//     </div>

//     <p className="followup-instructions">
//       Ask Sara a question about the image description.
//     </p>

//     <button type="button" className="page-button">
//       Ask Sara
//     </button>
//   </section>
