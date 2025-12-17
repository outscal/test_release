import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VideoPage from "./ReactComponents/pages/VideoPage";
import VideoPageDeploy from "./ReactComponents/pages/VideoPageDeploy";
import VideoPageDynamic from "./ReactComponents/pages/VideoPageDynamic";

const App: React.FC = () => {
  console.log(window.location.href);
  return (
    <Router>
      <Routes>
        <Route path="/v2/react-video/video" element={<VideoPageDeploy />} />
        <Route path="/v2/test" element={<VideoPage></VideoPage>} />
        <Route path="/v2/react-video" element={<VideoPage></VideoPage>} />
        <Route path="/v2/video" element={<VideoPageDeploy />} />
        <Route path="/" element={<VideoPage></VideoPage>} />
        <Route path="/:version" element={<VideoPageDynamic />} />
        <Route path="/:version/:mode" element={<VideoPageDynamic />} />
      </Routes>
    </Router>
  );
};

export default App;
