// src/context/ServiceContext.jsx
import { createContext, useContext, useState } from "react";

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
  const [activeService, setActiveService] = useState("home");

  return (
    <ServiceContext.Provider value={{ activeService, setActiveService }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => useContext(ServiceContext);
