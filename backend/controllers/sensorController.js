const SensorRecord = require('../models/SensorRecordModel');

// Controller function to insert sensor record
const insertSensorRecord = async (req, res) => {
  try {
    // Extract data from the request body
    const { deviceId, soilMoisture, humidity, temperature } = req.body;

    // Create a new sensor record object
    const newSensorRecord = new SensorRecord({
      deviceId,
      soilMoisture,
      humidity,
      temperature
    });

    // Save the new sensor record to the database
    await newSensorRecord.save();

    // Respond with success message
    res.status(201).json({ success: true, message: 'Sensor record inserted successfully' });
  } catch (error) {
    // Handle any errors
    console.error('Error inserting sensor record:', error);
    res.status(500).json({ success: false, message: 'Failed to insert sensor record' });
  }
};

// Controller function to fetch all sensor records from start date to end date for a particular device
const getAllSensorRecords = async (req, res) => {
  try {
    // Extract parameters from the request, e.g., deviceId, time range, etc.
    const { deviceId, startDate, endDate } = req.query;

    // Construct the query based on parameters
    const query = { deviceId };

    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Fetch sensor records from the database
    const sensorRecords = await SensorRecord.find(query).sort({ timestamp: 1 });

    // Respond with the fetched sensor records
    res.status(200).json({ success: true, data: sensorRecords });
  } catch (error) {
    // Handle any errors
    console.error('Error fetching sensor records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sensor records' });
  }
};

// Controller function to fetch the latest sensor record for a given deviceId
const getLatestSensorRecord = async (req, res) => {
  try {
    const { deviceId } = req.query;
    console.log("Device Id: " + deviceId);

    // Find the latest sensor record for the given deviceId
    const latestRecord = await SensorRecord.findOne({ deviceId })
      .sort({ timestamp: -1 })
      .lean();

    if (!latestRecord) {
      return res
        .status(404)
        .json({ success: false, message: 'No sensor records found for the given deviceId' });
    }

    res.status(200).json({ success: true, data: latestRecord });
  } catch (error) {
    console.error('Error fetching the latest sensor record:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch the latest sensor record' });
  }
};

const getAverageSoilMoisture = async (req, res) => {
  try {
    const { deviceId, startDate, endDate } = req.query;

    // Construct the query based on parameters
    const query = { deviceId };

    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Fetch sensor records from the database
    const sensorRecords = await SensorRecord.find(query).sort({ timestamp: 1 });

    // Initialize an array to store hourly average soil moisture
    const hourlyAverages = Array.from({ length: 24 }, () => ({ count: 0, sum: 0 }));

    // Calculate hourly averages
    sensorRecords.forEach((record) => {
      const hour = new Date(record.timestamp).getHours();
      hourlyAverages[hour].count += 1;
      hourlyAverages[hour].sum += record.soilMoisture;
    });

    // Define the time ranges
    const timeRanges = Array.from({ length: 24 }, (_, index) => {
      const endHour = (index ).toString().padStart(2, '0');
      return `${endHour}`;
    });

    // Calculate average soil moisture for each hour
    const formattedHourlyAverages = hourlyAverages.map((hourData, hour) => {
      const average = hourData.count > 0 ? (hourData.sum / hourData.count).toFixed(2) : 0;
      return { timeRange: timeRanges[hour], soilMoisture: average };
    });

    // Respond with the hourly average soil moisture
    res.status(200).json({ success: true, data: formattedHourlyAverages });
  } catch (error) {
    // Handle any errors
    console.error('Error fetching and calculating hourly average soil moisture:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch and calculate hourly average soil moisture' });
  }
};

const getAverageTemperature = async (req, res) => {
  try {
    const { deviceId, startDate, endDate } = req.query;

    // Construct the query based on parameters
    const query = { deviceId };

    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    // Fetch sensor records from the database
    const sensorRecords = await SensorRecord.find(query);

    // Initialize an array to store hourly average temperature
    const hourlyAverages = Array.from({ length: 24 }, () => ({ count: 0, sum: 0 }));
    // Calculate hourly averages
    sensorRecords.forEach((record) => {
      const hour = new Date(record.timestamp).getHours();
      hourlyAverages[hour].count += 1;
      hourlyAverages[hour].sum += record.temperature;
    });

    // Define the time ranges
    const timeRanges = Array.from({ length: 24 }, (_, index) => {
      const startHour = index.toString().padStart(2, '0');
      return `${startHour}`;
    });

    // Calculate average temperature for each hour
    const formattedHourlyAverages = hourlyAverages.map((hourData, hour) => {
      const average = hourData.count > 0 ? (hourData.sum / hourData.count).toFixed(2) : 0;
      return { timeRange: timeRanges[hour], temperature: average };
    });
    // Respond with the hourly average temperature
    res.status(200).json({ success: true, data: formattedHourlyAverages });
  } catch (error) {
    // Handle any errors
    console.error('Error fetching and calculating hourly average temperature:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch and calculate hourly average temperature' });
  }
};

const getAllSoilMoistureRecords = async (req, res) => {
  try {
    const { deviceId, startDate, endDate } = req.query;
    
    const endhour=new Date().getHours()+1;
    console.log(endhour)
    // Construct the query based on parameters
    const query = { deviceId };
    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Fetch sensor records from the database
    const sensorRecords = await SensorRecord.find(query);
    console.log(sensorRecords)
    // Initialize an array to store hourly average soil moisture
    const hourlyAverages = Array.from({ length: 24 }, () => ({ count: 0, sum: 0 }));
    
    // Calculate hourly averages
    sensorRecords.forEach((record) => {
      const hour = new Date(record.timestamp).getHours();
      
      console.log("TIME: ",hour);
      hourlyAverages[hour].count += 1;
      console.log(hourlyAverages[hour].count);
      hourlyAverages[hour].sum += record.soilMoisture;
      console.log(hourlyAverages[hour].sum);
    });

    console.log("\n",hourlyAverages);
    // Calculate average soil moisture for each hour
    const formattedHourlyAverages = hourlyAverages.map((hourData, hour) => {
      const average = hourData.count > 0 ? (hourData.sum / hourData.count).toFixed(2) : 0;
      const timeRange = (hour+endhour)%24;
      console.log("Average:",average,timeRange);
      return { timeRange, soilMoisture: average };
    });

    // Respond with the hourly average soil moisture
    res.status(200).json({ success: true, data: formattedHourlyAverages });
  } catch (error) {
    // Handle any errors
    console.error('Error fetching and calculating hourly average soil moisture:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch and calculate hourly average soil moisture' });
  }
};

const getAllTemperatureRecords = async (req, res) => {
  try {
    const { deviceId, startDate, endDate } = req.query;
    const endhour=new Date().getHours()+1;
    // Construct the query based on parameters
    const query = { deviceId };

    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Fetch sensor records from the database
    const sensorRecords = await SensorRecord.find(query);
    
    // Initialize an array to store hourly average temperature
    const hourlyAverages = Array.from({ length: 24 }, () => ({ count: 0, sum: 0 }));

    // Calculate hourly averages
    sensorRecords.forEach((record) => {
      const hour = new Date(record.timestamp).getHours();
      hourlyAverages[hour].count += 1;
      hourlyAverages[hour].sum += record.temperature;
    });

    // Calculate average temperature for each hour
    const formattedHourlyAverages = hourlyAverages.map((hourData, hour) => {
      const average = hourData.count > 0 ? (hourData.sum / hourData.count).toFixed(2) : 0;
      const timeRange = (hour+endhour)%24;
      return { timeRange, temperature: average };
    });

    // Respond with the hourly average temperature
    res.status(200).json({ success: true, data: formattedHourlyAverages });
  } catch (error) {
    // Handle any errors
    console.error('Error fetching and calculating hourly average temperature:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch and calculate hourly average temperature' });
  }
};


module.exports = {
  insertSensorRecord,
  getAllSensorRecords,
  getAverageTemperature,
  getAverageSoilMoisture,
  getAllTemperatureRecords,
  getAllSoilMoistureRecords,
  getLatestSensorRecord
};