import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './index.css'; // Optional: for styling if you want to add CSS
import Carousel from '../carousel/carousel';
import { API_URL } from '../../config';

export function Displayevents() {
  const location = useLocation();
  const { state } = location || {};
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
         const dataSource = state?.dataSource;
        // Fetch data for the selected card (based on previous selection)
        if (dataSource === 'spotlight') {
          const response = await fetch('/dataJSON/spotlight.json');
          if (!response.ok) throw new Error('Failed to fetch data');
          const result = await response.json();
          setData(result);
          return;
        } 
        const eventTypeMap = { societies: 'society', clubevents: 'club' };
        const eventType = eventTypeMap[dataSource];
 
        if (!eventType) {
          setData(null);
          return;
        }
        const url = API_URL;
        const response = await fetch(`${url}/api/events`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const { events } = await response.json();
        const filtered = (events || []).filter((ev) => ev.eventType === eventType);
        setData(filtered)
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [state]);

  if (isLoading) {
    return <p>Loading...</p>; 
  }

  if (!data) {
    return <p>No data available</p>; 
  }

  return (
    <div className="coming-soon">
     
      <Carousel data={data} />
    </div>
  );
}

export default Displayevents;