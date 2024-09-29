import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { IoIosRefresh } from "react-icons/io";
import { MdOutlineNotStarted } from "react-icons/md";
import { Button, Stack, Input, ListItem, List } from '@chakra-ui/react'
import { FaRegStopCircle } from "react-icons/fa";

function App() {
  const [spinning, setSpinning] = useState();
  const [angle, setAngle] = useState(0);
  const accelerationIntervalRef = useRef(null);
  const keepSpeedIntervalRef = useRef(null);
  const decelerationIntervalRef = useRef(null);
  let currentIncrement = 60;
  const decrementFactor = 0.9;
  const [name, setName] = useState('');
  const [follower, setFollower] = useState([]);
  const [color, setColor] = useState([]);


  const handleStart = () => {
    setSpinning(true)
    accelerationIntervalRef.current = setInterval(() => {
      setAngle(prevAngle => {
        const newAngle = prevAngle < 720 ? (prevAngle + 0.7) * 1.1 : prevAngle + currentIncrement;
        return newAngle;
      });
    }, 100);
  }

  const handleStop = () => {
    if (spinning) {
      clearInterval(accelerationIntervalRef.current);
    }

    keepSpeedIntervalRef.current = setInterval(() => {
      setAngle(prevAngle => prevAngle + currentIncrement)
    }, 100);

    const keepSpeedTime = Math.random() * 3000 + 4000;
    setTimeout(() => {
      if (keepSpeedIntervalRef.current) {
        clearInterval(keepSpeedIntervalRef.current);
      }

      decelerationIntervalRef.current = setInterval(() => {
        currentIncrement *= decrementFactor;
        setAngle(prevAngle => prevAngle + currentIncrement);
        if (decelerationIntervalRef.current) {
          if (currentIncrement <= 0.1) {
            clearInterval(decelerationIntervalRef.current);
            setSpinning(false);
          }
        }
      }, 100);
      console.log(spinning);
    }, keepSpeedTime)
  }

  const handleReset = () => {
    setSpinning(false);
    setAngle(0);
  }

  const spinningStyle = { transform: `rotate(${angle}deg)` };

  const handleNameInput = (e) => {
    if (name.trim().length === 0) {
      return;
    }
    setFollower([...follower, name]);
    setName('')
  }

  const handleNameDelete = (deleteName) => {
    setFollower(follower.filter((n) => (n !== deleteName)))
  }

  // const calcCentralAngle = (total) => {
  //   const centralAngle = 360 / total;
  //   return centralAngle;
  // };

  // const setColorArray = (total) => {
  //   const colors = [];
  //   for (let i = 0; i < total; i++) {
  //     const color = i === 0 ? '#bf95ff' : ((i + 1) % 2 === 0 ? '#aee0ff' : '#baffe2');
  //     colors.push(color);
  //   }
  //   setColor(colors);
  // }

  // const setColorStyle = (total) => {
  //   let backgroundText = '';
  //   for (let i = 0; i < total; i++) {
  //     const startAngle = calcCentralAngle(total) * i + 1;
  //     const endAngle = startAngle + calcCentralAngle(total);
  //     backgroundText += `${color[i]}${startAngle}deg ${endAngle} deg,`;
  //   }
  //   return {
  //     background: 'conic-gradient(${backgroundText.slice(0, -2)})'
  //   }
  // }

  const setColorStyle = (length) => {
    const colors = ['#bf95ff', '#baffe2', '#aee0ff'];
    let segments = [];

    for (let i = 0; i < length; i++) {
      const color = i === 0 ? colors[0] : (i % 2 === 0 ? colors[1] : colors[2]);
      segments.push(`${color} ${(i * 360 / length)}deg ${(i + 1) * 360 / length}deg`);
    }

    const background = `conic-gradient(${segments.join(', ')})`;
    return { background };
  };

  const setLabelPosition = (index, length) => {
    const baseDegree = 360 / length;
    return {
      transform: `rotate(${index * baseDegree}deg) translateY(-220px)`
    };
  };

  return (
    <>
      <section className="roulette-container">
        <div className='roulette'>
          <div className="roulette-wheel" style={{ ...setColorStyle(follower.length), ...spinningStyle }}></div>
          <div className='roulette-label-container' style={spinningStyle}>
            {follower.map((name, index) => (
              <div className='roulette-label'
                key={name}
                style={setLabelPosition(index, follower.length)}
              >{name}</div>
            ))}
          </div>
          <div className="roulette-pin"></div>
        </div>
        <div className='name-display'>
          <List className='name-list-container'>
            {follower.map((name) => (
              <ListItem className='name-list-item' key={name}>
                <p className='name-display'>{name}</p>
                <Button
                  className='delete-button'
                  colorScheme='red'
                  onClick={() => handleNameDelete(name)}
                >
                  削除
                </Button>
              </ListItem>
            ))}
          </List>
        </div>
      </section>
      <Stack className='button-container' direction='row' spacing={3} align='center'>
        <Button leftIcon={<MdOutlineNotStarted />} colorScheme='teal' variant='solid' onClick={handleStart} isDisabled={spinning}>START!!</Button>
        <Button leftIcon={<FaRegStopCircle />} colorScheme='teal' variant='outline' onClick={handleStop} isDisabled={!spinning}>STOP!!</Button>
        <Button leftIcon={<IoIosRefresh />} colorScheme='green' onClick={handleReset} isDisabled={spinning}>RESET!!
        </Button>
      </Stack>
      <div className='input-container'>
        <Input className='name-input' type='text' value={name} placeholder='名前を入力' onChange={(e) => setName(e.target.value)} width='auto' />
        <Button colorScheme='blue' variant='solid' onClick={handleNameInput} isDisabled={!name.trim()}>追加</Button>
      </div>
    </>
  );
}

export default App;
