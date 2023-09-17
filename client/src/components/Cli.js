import React, { useMemo, useRef, useState } from 'react';
import '../components/Cli.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';


import Papa from "papaparse"

// * Chart Component Function contains all the Logic for Chart //

function ChartComponent({ data, columns, keys}) {
  
  // * Get First Key for X Axis
  const xAxisKey = keys[0]

  const filteredKeys = []

  // * Get Keys specified by User in Columns Argument
  for (let i = 1 ; i < columns; i++) {
      filteredKeys[i] = keys[i]
  }

  return (
    <LineChart
    width={1700}
    height={500}
    data={data}
    margin={{
      top: 5,
      right: 30,
      left: 20,
      bottom: 5,
    }}
  >
    <CartesianGrid strokeDasharray="2 2" />
    <XAxis dataKey={xAxisKey} />
    <YAxis />
    <Tooltip />
    <Legend />

    
{filteredKeys.map((key , index)=>{
return (
  <Line type="monotone" key={index} dataKey={key} stroke="#82ca9d"/>
  )
})}
  </LineChart>
  );
}


const Cli = () => {

  const currentURL = window.location.href;
  // console.log(currentURL);
  console.log("State Changed")
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);

  const [chartData, setChartData] = useState(null); 
  const [keys, setKeys] = useState()
  const [columns, setColumns] = useState()

  const fileInputRef = useRef(null);


  // * We Used the useMemo Hook to Avoid Extra Chart Renders//
  const memoizedChartComponent = useMemo(() => {
    if (chartData) {
      return (
        <div className="chart-container">
          <ChartComponent data={chartData} columns={columns} keys={keys} />
        </div>
      );
    }
    return null;
  }, [chartData, columns, keys]);


  // * The main function who handles all the CLI inputs and then directs to their respective functions//
  const handleCommand = () => {
    const command = input.trim().toLowerCase();
    const parts = command.split(' ');

    // console.log(parts)


    switch (parts[0]) {

      case 'help':
        showHelp();
        break;

      case 'clear':
        clearCli();
        break;

      case 'about':
        aboutCli();
        break;

      case 'fetch-price':
        if (parts.length === 2) {
          const pair = parts[1].toUpperCase();
          fetchPrice(pair);
        } else {
          setOutput([...output, `Invalid command format. Use: fetch-price `]);
        }
        break;

      case 'upload':
        handleUploadCsv();
        break;

      case 'delete':
        if (parts.length === 2) {
          const fileName = parts[1];
          handleDeleteCsv(fileName);
        } 
        else {
          setOutput([...output, `Invalid command format. Use: delete [filename.csv] `]);
        }
        break;

      case 'draw':
        if (parts[0] === 'draw' && parts.length === 3) {
          console.log(parts)
          const fileName = parts[1];
          const selectedColumns = parts[2];
          setColumns(selectedColumns)
          // Fetch data and draw chart here
          fetchDataAndDrawChart(fileName);
        }
        else {
          setOutput([...output, `This File Does Not Exist`]);
        }
        break;

      default:
        setOutput([...output, `Command not found: ${input}`]);
        break;
    }

    setInput('');
  };


  // * Help Command Funtion //
  const showHelp = () => {
    const helpText = [
      'Available commands:',
      '- help: Show available commands',
      '- about: Display information about this CLI',
      '- fetch-price [coin]: Fetch the current price of a specified cryptocurrency',
      '- upload: Opens the file explorer to allow uploading CSV files only.',
      '- draw [file] [columns]: Draws the chart of the specified columns of the file present in the draw-chart directory.',
    ];
    setOutput([...output, ...helpText]);
  };

  // * To Clear the CLI previous Data //
  const clearCli = () => {
    setOutput([])
    setChartData()
  }

  // * About the CLI //
  const aboutCli = () => {
    const aboutText = [
      'CLI Version 1.0',
      'This is a front-end CLI created as a part of the Full Stack Hiring test. It simulates various command-line functionalities.'
    ];
    setOutput([...output, ...aboutText]);
  };

  // * Fetch the Price from the Binnance API just need the Argument of the {Pair} //
  const fetchPrice = async (pair) => {
    if (pair) {
      try {
        const apiUrl = `https://api.binance.com/api/v3/avgPrice?symbol=${pair}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data && data.price) {
          const price = parseFloat(data.price).toFixed(2);
          setOutput([...output, `The current price of ${pair} is $${price}`]);
        } else {
          setOutput([...output, 'Unable to fetch price.']);
        }
      } catch (error) {
        console.error('Error:', error);
        setOutput([...output, 'Internal server error']);
      }
    } else {
      setOutput(...output, [`Invalid command format. Use: fetch-price ${pair}`]);
    }
  };

  // * Will Post the CSV file to the Backend  //
  const handleUploadCsv = async (event) => {
    const file = event ? event.target.files[0] : null;
  
    if (file) {
      console.log("I AM HERE");
      try {
        const formData = new FormData();
        formData.append('file', file);
  
        const response = await fetch('https://cli-server.vercel.app/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.text(); // Parse the response as text
  
        // Check if the response message contains "File Upload"
        if (data.includes('File Upload')) {
          // Handle the success message
          setOutput([...output, `${file} uploaded successfully`]);
          console.log('Backend Response:', data);
        } else {
          setOutput([...output, 'Invalid response from the backend.']);
        }
      } catch (error) {
        setOutput([...output, `${error}`]);
      }
    } else {
      // Programmatically trigger the file input click event
      fileInputRef.current.click();
    }
  };


  // * Will Get the CSV file from the Backend First Convert the Response to {TEXT} and then to an {ARRAY}
  const fetchDataAndDrawChart = async (fileName) => {
    try {
      const response = await fetch(`https://cli-server.vercel.app/draw-chart/${fileName}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const csvText = await response.text();

      // Split the CSV text into lines
      const lines = csvText.trim().split('\n');

      // Split the first line (header row) into an array of keys
      // INFO: regex used for replacing " with empty string
      const headerRow = lines[0].replace(/"/g, '').split(',');

      setKeys(headerRow)

      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setChartData(results.data);
        },
      });
      setOutput([...output, 'Chart drawn successfully.']);

    } catch (error) {
      console.error('Error:', error);
      setOutput([...output, 'Error: Unable to fetch data or draw chart.']);
    }
  };


    // * Will Delete CSV file from the Backend 
  const handleDeleteCsv = async(FileName)  => {

    try {
      const response = await fetch(`https://cli-server.vercel.app/delete-file/${FileName}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // File was deleted successfully
        setOutput([...output, `File ${FileName} has been deleted.`]);
       
      } else if (response.status === 404) {
        // File not found
        setOutput([...output, `File ${FileName} not Found.`]);
      } else {
        // Handle other errors
        setOutput([...output, `An error occurred while deleting the file.`]);
       
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }

  }

  return (
    <div className="cli">

     {/* All the Input Commands ?   */}
      <div className='cli-input'>
        <div>{currentURL}&gt;</div>
        <input
          className='input'
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCommand();
            }
          }}
        />
      </div>


      {/* Chart Data is Displayed in this function to avoid extra Renders ?  */}
      
      {chartData ? (memoizedChartComponent) : (<div></div>)}
      
    
      {/* All the Commands Output Data  */}
      <div className="output">
        {output.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
  
      {/* Hidden file input element This Input is Designed for the CSV Upload File ?  */}
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(event) => handleUploadCsv(event)}
      />

    </div>
  );
}

export default Cli;
