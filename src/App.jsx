import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./Body.jsx";
import Login from "./Login";
import Home from "./Home";
import { Provider } from "react-redux";
import { store } from "../utils/appStore";

function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Body />}>
              <Route path="/" element={<Home />}></Route>
              <Route path="/login" element={<Login />}></Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;
