import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '@dotenv'

const NoteContext = createContext();

const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);

  /**
   * Load Notes data from API
   */
  const fetchNotesData = () => {
    fetch(API_URL + `/notes`)
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson !== null) {
          setNotes(responseJson.Items);
        }
      }).catch(error => {
        console.log('Can not load data: ' + error)
      })
  }

  useEffect(() => {
    fetchNotesData();
  }, []);

  return (
    <NoteContext.Provider value={{ notes, setNotes, fetchNotesData }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => useContext(NoteContext);

export default NoteProvider;
