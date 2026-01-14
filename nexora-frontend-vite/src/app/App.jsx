import { BrowserRouter } from "react-router-dom";

import { AuthProvider, AuthContext } from "../context/AuthContext";
import { ServiceProvider } from "../context/ServiceContext";

import AppLayout from './routes';

/*  Root App */
export default function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ServiceProvider>
    </AuthProvider>
  );
}
