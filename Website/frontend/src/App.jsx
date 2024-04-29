// App.jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginForm from './LoginForm';
import ProfilePage from './ProfilePage';
import RegistrationForm from './RegistrationForm';
import History from './History';
import Try2 from './Try2';


function App() {
  return (
    <BrowserRouter>
    
      <Routes>
        <Route path="/" exact element={<RegistrationForm/>} />
        <Route path="/login" exact element={<LoginForm/>} />
        <Route path="/profiles" element={<ProfilePage/>} />
        <Route path="/history" element={<History/>} />
        <Route path="/try2" element={<Try2/>} />
      
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
