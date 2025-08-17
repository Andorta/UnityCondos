import './App.css';
import { AuthProvider } from './custom_hooks/authContext';
import Root from './route/root';
import { toast, ToastContainer } from 'react-toastify';
import './index.css'
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);

  return (
    <AuthProvider>
      <Root />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
    </AuthProvider>
  );
}

export default App;