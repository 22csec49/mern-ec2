import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { startOfToday, addDays, addWeeks, addMonths, addYears, format, addHours } from 'date-fns';
import 'chartjs-adapter-date-fns';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SoilMoistureChart = ({ deviceId }) => {
  // State variables
  const [moistureData, setMoistureData] = useState({ values: [] });
  const [timeRange, setTimeRange] = useState('day');
  const today = startOfToday();
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today + 1,
  });
  const [customStartDate, setCustomStartDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(true);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Effect to fetch data based on changes in deviceId, timeRange, and dateRange
  useEffect(() => {
    if (timeRange === 'custom') {
      fetchCustomRangeData();
    } else {
      fetchSoilMoistureData();
    }
  }, [deviceId, timeRange, dateRange]);

  // Function to fetch soil moisture data based on selected time range
  const fetchSoilMoistureData = async () => {
    try {
      // Determine start and end dates based on the selected time range
      let startDate, endDate;
      switch (timeRange) {
        case 'day':
          startDate = addHours(new Date(), -24);
          endDate = new Date();
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

      // Format dates for API request
      const formattedStartDate = format(startDate, 'yyyy-MM-dd HH:mm:ss');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd HH:mm:ss');

      // Set endpoint based on time range
      let endpoint = '/sensor_readings/daily-averages';
      if (timeRange === 'day') {
        endpoint = '/sensor_readings';
      }

      // Fetch soil moisture data for the specified device and time range
      const response = await fetch(
        `${endpoint}?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      const data = await response.json();

      // Extract soil moisture values and timestamps from fetched data
      const moistureValues = data.data.map((reading) => reading.soilMoisture);
      const timestamps = data.data.map((reading) => reading.timestamp);

      // Update state with soil moisture data
      setMoistureData({ values: moistureValues, timestamps });
    } catch (error) {
      console.error('Error fetching soil moisture data:', error);
    }
  };

  // Function to fetch custom range soil moisture data
  const fetchCustomRangeData = async () => {
    try {
      // Format custom date range for API request
      const formattedStartDate = format(dateRange.startDate, 'yyyy-MM-dd HH:mm:ss');
      const formattedEndDate = format(dateRange.endDate, 'yyyy-MM-dd HH:mm:ss');

      // Fetch soil moisture data for the specified device and custom date range
      const response = await fetch(
        `/sensor_readings/daily-averages?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      const data = await response.json();
      const moistureValues = data.data.map((reading) => reading.soilMoisture);
      const timestamps = data.data.map((reading) => reading.timestamp);

      // Update state with custom range soil moisture data
      setMoistureData({ values: moistureValues, timestamps });
    } catch (error) {
      console.error('Error fetching soil moisture data:', error);
    }
  };

  // Function to render and configure the Chart.js chart
  const renderChart = () => {
    const ctx = document.getElementById('soilMoistureChart');

    if (ctx) {
      const timeUnit = timeRange === 'day' ? 'hour' : 'hour';
      const displayFormat = timeRange === 'day' ? 'H:mm' : 'H:mm';

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
                  day: displayFormat,
                },
              },
              title: {
                display: true,
                text: 'Time',
                font: {
                  size: 17, // Set the desired font size
                  weight: 'bold',
                },
              },
            },
            y: {
              title: {
                display: true,
                text: 'Soil Moisture',
                font: {
                  size: 17, // Set the desired font size
                  weight: 'bold',
                },
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const timestamp = context.parsed.x;
                  // Display soil moisture value in the tooltip
                  return `Soil Moisture: ${context.parsed.y}`;
                },
                title: (tooltipItems) => {
                  // Display time range in the tooltip
                  const formattedHours = new Date(tooltipItems[0].parsed.x).getHours();
                  return `Time Range: ${formattedHours}:00 - ${formattedHours + 1}:00`;
                },
              },
            },
            legend: {
              display: false, // Hide the legend
            },
          },
        },
      });
    }
  };

  // Effect to render and destroy the chart based on changes in moistureData and timeRange
  useEffect(() => {
    const chartInstance = renderChart();

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [moistureData, timeRange]);

  // Data format for the Chart.js chart
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

  // Event handler for time range buttons
  const handleTimeRangeButtonClick = (range) => {
    setTimeRange(range);
  };

  // Event handler for custom start date change
  const handleCustomStartDateChange = (date) => {
    // Set the start time to 00:00:00
    const startDateWithTime = new Date(date);
    startDateWithTime.setHours(0, 0, 0, 0);

    setCustomStartDate(startDateWithTime);
    setDateRange({ ...dateRange, startDate: startDateWithTime, endDate: null });
    setShowStartDatePicker(false);
    setShowEndDatePicker(true);
  };

  // Event handler for custom end date change
  const handleCustomEndDateChange = (date) => {
    // Set the end time to 23:59:59
    const endDateWithTime = new Date(date);
    endDateWithTime.setHours(23, 59, 59, 999);

    // Update date range if end date is after start date
    if (endDateWithTime > customStartDate) {
      setDateRange({ ...dateRange, endDate: endDateWithTime });
      setShowEndDatePicker(false);
      setShowStartDatePicker(true);
    }
  };

  return (
    <div>
      {/* Time range buttons and custom date range pickers */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px', border: '1px solid #000', marginTop: '80px' }}>
        <h4 style={{ marginTop: '0px', marginBottom: '-10px', marginRight: '0px' }}>Soil Moisture Chart</h4>
        <button style={{ marginRight: '4px' }} onClick={() => handleTimeRangeButtonClick('day')}>Day</button>
        <button style={{ marginRight: '4px' }} onClick={() => handleTimeRangeButtonClick('week')}>Week</button>
        <button style={{ marginRight: '4px' }} onClick={() => handleTimeRangeButtonClick('month')}>Month</button>
        <button style={{ marginRight: '4px' }} onClick={() => handleTimeRangeButtonClick('year')}>Year</button>
        <button
  onClick={() => handleTimeRangeButtonClick('custom')}
  style={{
    width: '80px',
    height: '30px',
    background: 'transparent', // Set a background color
    border: '0px solid #000', // Add a border
    borderRadius: '5px', // Optional: Add border-radius for rounded corners
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '20px',
    marginTop: '-2px',
  }}
>
  <span style={{ marginRight: '5px' }}>
    {showStartDatePicker && (
      <DatePicker
        selected={customStartDate}
        onChange={handleCustomStartDateChange}
        customInput={<img src="calendaricon.png" alt="Calendar Icon" style={{ width: '100%', height: '100%' }} />}
        style={{ marginLeft: '10px' }}
      />
    )}
  </span>
  {showEndDatePicker && dateRange.startDate && (
    <DatePicker
      selected={dateRange.endDate}
      onChange={handleCustomEndDateChange}
      minDate={customStartDate}
      customInput={<img src="calendaricon.png" alt="Calendar Icon" style={{ width: '100%', height: '100%' }} />}
      style={{ marginLeft: '10px' }}
    />
  )}
</button>
      </div>
      {/* Canvas for displaying the soil moisture chart */}
      <canvas id="soilMoistureChart" style={{ border: '1px solid #000', marginTop: '-1px', paddingTop: '10px' }}></canvas>
    </div>
  );
};

export default SoilMoistureChart;
