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

import BiasOptionSelectionPage from "./SpotTheBias/BiasOptionSelectionPage";
import BiasBusterLandingPage from "./SpotTheBias/BiasBusterLandingPage";

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
                path="/bias-buster/teacher-guide"
                element={<BiasOptionSelectionPage />}
              />

              <Route path="/bias-buster" element={<BiasBusterLandingPage />} />

              <Route
                path="/bias-buster/story-topic-selection"
                element={<StoryTopicSelectionPage />}
              />
              <Route
                path="/bias-buster/:storytopic"
                element={<StoryQuestionPage />}
              />
              <Route
                path="/bias-buster/:storytopic/story-reading"
                element={<StoryReadingPage />}
              />
              <Route
                path="/bias-buster/:storytopic/review-page"
                element={<StoryReviewPage />}
              />

              <Route
                path="/bias-buster/:storytopic/image-reading"
                element={<ImageReadingPage />}
              />
              <Route
                path="/bias-buster/:storytopic/image-review-page"
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
