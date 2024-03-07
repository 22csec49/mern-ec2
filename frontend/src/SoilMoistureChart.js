import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { startOfToday, addDays, addWeeks, addMonths, addYears, format, addHours, addMinutes } from 'date-fns';
import 'chartjs-adapter-date-fns';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SoilMoistureChart = ({ deviceId }) => {
  const [moistureData, setMoistureData] = useState({ values: [] });
  const [timeRange, setTimeRange] = useState('day');
  const today = startOfToday();
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today+1,
  });
  const [customStartDate, setCustomStartDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(true);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    if (timeRange === 'custom') {
      fetchCustomRangeData();
    } else {
      fetchSoilMoistureData();
    }
  }, [deviceId, timeRange, dateRange]);

  const fetchSoilMoistureData = async () => {
    try {
      let startDate, endDate;
  
      switch (timeRange) {
        case 'day':
          startDate = addHours(new Date(), -24);
          endDate = new Date();
          console.log(startDate)
          break;
        case 'week':
          startDate = addWeeks(today, -1);
          endDate = new Date();
          break;
        case 'month':
          startDate = addMonths(today, -1);
          endDate = new Date();
          break;
        case 'year':
          startDate = addYears(today, -1);
          endDate = new Date();
          break;
        default:
          startDate = addMonths(today, -1);
          endDate = new Date();
      }
  
      // Format dates to 'YYYY-MM-DD' for API request
      const formattedStartDate = format(startDate, 'yyyy-MM-dd HH:mm:ss');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd HH:mm:ss');
  
      // Fetch soil moisture data for the specific device and time range
      const response = await fetch(
        `/sensor_readings?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      const data = await response.json();

      // Extract soil moisture values and timestamps from the fetched data
      const moistureValues = data.data.map((reading) => reading.soilMoisture);
      const timestamps = data.data.map((reading) => reading.timestamp);
  
      // Update the state with the soil moisture data
      setMoistureData({ values: moistureValues, timestamps });
    } catch (error) {
      console.error('Error fetching soil moisture data:', error);
    }
  };

  const fetchCustomRangeData = async () => {
    try {
      const formattedStartDate = format(dateRange.startDate, 'yyyy-MM-dd HH:mm:ss');
      const formattedEndDate = format(dateRange.endDate, 'yyyy-MM-dd HH:mm:ss');

      const response = await fetch(
        `/sensor_readings?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      
      const data = await response.json();
      const moistureValues = data.data.map((reading) => reading.soilMoisture);
      const timestamps = data.data.map((reading) => reading.timestamp);

      setMoistureData({ values: moistureValues, timestamps });
    } catch (error) {
      console.error('Error fetching soil moisture data:', error);
    }
  };

  const renderChart = () => {
    const ctx = document.getElementById('soilMoistureChart');

    if (ctx) {
      const timeUnit = timeRange === 'day' ? 'hour' : 'day';
      const displayFormat = timeRange === 'day' ? 'H:mm' : 'MMM dd';
      const tooltipFormat = timeRange === 'day' ? 'dd-MM-yyyy HH:mm' : 'dd-MM-yyyy ';

      return new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                unit: timeUnit,
                displayFormats: {
                  hour: 'H:mm',
                  day: displayFormat ,
                },
              },
              title: {
                display: true,
                text: 'Time',
                font: {
                  size: 17, // Set the desired font size
                  weight:'bold'
                },
              },
            },
            y: {
              title: {
                display: true,
                text: 'Soil Moisture',
                font: {
                  size: 17, // Set the desired font size
                  weight:'bold'
                },
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const timestamp = context.parsed.x;
                  return ` Soil Moisture : ${context.parsed.y}`;
                },
              },
            },
            legend: {
              display: false, // Set to false to hide the legend
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    const chartInstance = renderChart();

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [moistureData, timeRange]);

  const chartData = {
    labels: moistureData.timestamps,
    datasets: [
      {
        label: 'Soil Moisture',
        data: moistureData.values,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        pointRadius: 1,
      },
    ],
  };

  const handleTimeRangeButtonClick = (range) => {
    setTimeRange(range);
  };

  const handleCustomStartDateChange = (date) => {
    // Set the start time to 00:00:00
    const startDateWithTime = new Date(date);
    startDateWithTime.setHours(0, 0, 0, 0);
  
    setCustomStartDate(startDateWithTime);
    setDateRange({ ...dateRange, startDate: startDateWithTime, endDate: null });
    setShowStartDatePicker(false);
    setShowEndDatePicker(true);
  };
  
  const handleCustomEndDateChange = (date) => {
    // Set the end time to 23:59:59
    const endDateWithTime = new Date(date);
    endDateWithTime.setHours(23, 59, 59, 999);
  
    if (endDateWithTime > customStartDate) {
      setDateRange({ ...dateRange, endDate: endDateWithTime });
      setShowEndDatePicker(false);
      setShowStartDatePicker(true);
    }
  };
  

  return (
    <div>
      <h2>Soil Moisture Chart</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding:'4px', border:'1px solid #000' }}>
        <h4 style={{marginTop:'0px',marginBottom:'-10px', marginRight:'180px'}}>Soil Moisture Chart</h4>
        <button style={{marginRight:'4px'}} onClick={() => handleTimeRangeButtonClick('day')}>Day</button>
        <button style={{marginRight:'4px'}} onClick={() => handleTimeRangeButtonClick('week')}>Week</button>
        <button style={{marginRight:'4px'}} onClick={() => handleTimeRangeButtonClick('month')}>Month</button>
        <button style={{marginRight:'4px'}} onClick={() => handleTimeRangeButtonClick('year')}>Year</button>
        <button 
          onClick={() => handleTimeRangeButtonClick('custom')}
          style={{
            width: '20px',
            height: '25px',
            background: 'transparent',
            border: 'none',
            paddingTop: '0px',
            marginRight:'20px',
            marginTop: '-2px',
          }}
        >
          {showStartDatePicker && (
            <DatePicker
              selected={customStartDate}
              onChange={handleCustomStartDateChange}
              customInput={<img src="calendaricon.png" alt="Calendar Icon" style={{ width: '350%', height: '350%'}} />}
              style={{ marginLeft: '10px' }}/>
          )}
          {showEndDatePicker && dateRange.startDate && (
            <DatePicker
              selected={dateRange.endDate}
              onChange={handleCustomEndDateChange}
              minDate={customStartDate}
              customInput={<img src="calendaricon.png" alt="Calendar Icon" style={{ width: '350%', height: '350%'}} />}
              style={{ marginLeft: '10px' }}/>
          )}
        </button>
      </div>
      <canvas id="soilMoistureChart" style={{border:'1px solid #000', marginTop:'-1px', paddingTop:'10px'}}></canvas>
    </div>
  );
};

export default SoilMoistureChart;