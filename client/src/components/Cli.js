import React, { useRef, useState } from 'react';
import '../components/Cli.css';


const Cli = () => {

  const currentURL = window.location.href;
  // console.log(currentURL);

  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);

  const fileInputRef = useRef(null);

  const handleCommand = () => {
    const command = input.trim().toLowerCase();
    const parts = command.split(' ');
    console.log(parts)
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
          setOutput(['Invalid command format. Use: fetch-price [pair]']);
        }
        break;
      case 'upload':
        handleUpload();
        break;
      default:
        setOutput([...output, `Command not found: ${input}`]);
        break;
    }

    setInput('');
  };


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

  const clearCli = () => {
    setOutput([])
  }

  const aboutCli = () => {
    const aboutText = [
      'CLI Version 1.0',
      'This is a front-end CLI created as a part of the Full Stack Hiring test. It simulates various command-line functionalities.'
    ];
    setOutput([...output, ...aboutText]);
  };

  const fetchPrice = async (parts) => {
    if (parts.length === 2) {
      const pair = parts[1].toUpperCase();
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
      setOutput(['Invalid command format. Use: fetch-price [pair]']);
    }
  };

  const handleUpload = async (event) => {
    const file = event ? event.target.files[0] : null;
  
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
  
        const response = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
  
        if (data.message) {
          // Handle the response from the backend, e.g., show a success message
          setOutput([...output, `${data.message}`]);
          console.log('Backend Response:', data.message);
        } else {
          setOutput([...output, `Invalid response from the backend.`]);
        }
      } catch (error) {
        setOutput([...output, `${error}`]);

      }
    } else {
      // Programmatically trigger the file input click event
      fileInputRef.current.click();
    }
  };
  


  return (
    <div className="cli">

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

      <div className="output">
        {output.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>


      {/* Hidden file input element */}
      <input
        type="file"
        accept=".csv" // Accept only CSV files
        ref={fileInputRef} // Set the ref to the file input element
        style={{ display: 'none' }} // Hide the input element
        onChange={(event) => handleUpload(event)} // Call handleUpload when a file is selected
      />

    </div>
  );
}

export default Cli;
