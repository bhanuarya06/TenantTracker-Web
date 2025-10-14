import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/main-components/Body.jsx";
import Login from "./components/header-components/Login.jsx";
import Home from "./components/header-components/Home.jsx";
import Contact from "./components/header-components/Contact.jsx";
import Profile from "./components/header-components/Profile.jsx";
import { store } from "../utils/appStore.js";
import { Provider } from "react-redux";

function App() {

  return (
    <>
    <Provider store={store}>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Body />}>
              <Route path="/" element={<Home />}></Route>
              <Route path="/login" element={<Login />}></Route>
              <Route path="/profile" element={<Profile />}></Route>
              <Route path="/contact" element={<Contact />}></Route>
            </Route>
          </Routes>
        </BrowserRouter>
        </Provider>
    </>
  );
}

export default App;
