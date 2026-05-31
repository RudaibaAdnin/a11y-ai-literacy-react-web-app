import { HashRouter } from "react-router-dom";
import { Routes, Route } from "react-router";
import { Provider } from "react-redux";
import store from "./store";

import LandingPage from "./LandingPage";

import ImageCategoryPage from "./SpotTheLie/ImageCategoryPage";
import ImageSelectionPage from "./SpotTheLie/ImageSelectionPage";
import ImageDescriptionPage from "./SpotTheLie/ImageDescriptionPage";
import ImageReviewPage from "./SpotTheLie/ImageReviewPage";

import StoryTopicSelectionPage from "./SpotTheBias/StoryTopicSelectionPage";
import StoryQuestionPage from "./SpotTheBias/StoryQuestionPage";
import StoryReadingPage from "./SpotTheBias/StoryReadingPage";
import StoryReviewPage from "./SpotTheBias/StoryReviewPage";

import ImageReadingPage from "./SpotTheBias/ImageReadingPage";
import ImageReviewPageStory from "./SpotTheBias/ImageReviewPageStory";

function App() {
  return (
    <div>
      <Provider store={store}>
        <HashRouter>
          <div>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/spot-the-lie" element={<ImageCategoryPage />} />
              <Route
                path="/spot-the-lie/:imagecategory"
                element={<ImageSelectionPage />}
              />
              <Route
                path="/spot-the-lie/:imagecategory/:imagename"
                element={<ImageDescriptionPage />}
              />
              <Route
                path="/spot-the-lie/:imagecategory/:imagename/review-page"
                element={<ImageReviewPage />}
              />

              <Route
                path="/spot-the-bias"
                element={<StoryTopicSelectionPage />}
              />
              <Route
                path="/spot-the-bias/:storytopic"
                element={<StoryQuestionPage />}
              />
              <Route
                path="/spot-the-bias/:storytopic/story-reading"
                element={<StoryReadingPage />}
              />
              <Route
                path="/spot-the-bias/:storytopic/review-page"
                element={<StoryReviewPage />}
              />

              <Route
                path="/spot-the-bias/:storytopic/image-reading"
                element={<ImageReadingPage />}
              />
              <Route
                path="/spot-the-bias/:storytopic/image-review-page"
                element={<ImageReviewPageStory />}
              />
            </Routes>
          </div>
        </HashRouter>
      </Provider>
    </div>
  );
}

export default App;
