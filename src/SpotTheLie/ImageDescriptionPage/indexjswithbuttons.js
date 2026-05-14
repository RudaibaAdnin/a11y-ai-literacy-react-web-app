import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { imageDescriptions } from "../util/imageDescriptions.js";
import { imageHallucinations } from "../util/imageHallucinations.js";
import { setSelectedImage, setSelectedLine } from "../SpotTheLieReducer";
import HallucinationCheckingPanel from "./HallucinationCheckingPanel";

const ImageDescriptionPage = () => {
  const { imagecategory, imagename } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedImageDescription = imageDescriptions[imagename] || [];
  const selectedImageHallucinations = imageHallucinations[imagename] || [];

  const selectedLine = useSelector(
    (state) => state.SpotTheLieReducer.selectedLine,
  );

  const detectedImageHallucination = useSelector(
    (state) => state.SpotTheLieReducer.detectedImageHallucination,
  );
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    dispatch(
      setSelectedImage({
        imageName: imagename,
        imageDescription: selectedImageDescription,
        imageHallucinations: selectedImageHallucinations,
        selectedLine: selectedLine,
      }),
    );
  }, [
    dispatch,
    imagename,
    selectedImageDescription,
    selectedImageHallucinations,
  ]);

  return (
    <main aria-label="Image Description Page">
      <header className="header-style">
        <img
          src="/images/spot-the-lie-avatar.png"
          className="title-image"
          alt=""
        />
        <h1 className="page-title">Spot the Lie</h1>
      </header>
      <div className="image-description-page">
        <section class="sara-panel">
          <h2 className="image-description-title">AI Image Description</h2>

          {selectedImageDescription.length === 0 ? (
            <p>No description available for this image yet.</p>
          ) : (
            <ol
              className="image-description-list"
              aria-label="Image description"
            >
              {selectedImageDescription.map((line, i) => (
                <li key={i} className="image-description-line">
                  <button
                    type="button"
                    className="description-line-button"
                    onClick={() => dispatch(setSelectedLine(line))}
                  >
                    {line}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
        <HallucinationCheckingPanel />
      </div>
    </main>
  );
};

export default ImageDescriptionPage;
