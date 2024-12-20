import './App.css';
import React, { useState, useRef } from 'react';
import { IoIosRefresh } from "react-icons/io";
import { MdOutlineNotStarted } from "react-icons/md";
import { Button, Stack, Input, ListItem, List, Alert, AlertIcon, AlertTitle, IconButton } from '@chakra-ui/react'
import { FaRegStopCircle } from "react-icons/fa";
import { TbArrowsShuffle } from "react-icons/tb";

function App() {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const accelerationIntervalRef = useRef(null);
  const keepSpeedIntervalRef = useRef(null);
  const decelerationIntervalRef = useRef(null);
  const [winner, setWinner] = useState(null);
  let currentIncrement = 60;
  const decrementFactor = 0.9;
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState([]);

  // 当選者を判定する関数
  const determineWinner = (currentAngle, participantsList) => {
    if (participantsList.length === 0) return null;

    // 現在の角度を360度以内に正規化
    const normalizedAngle = ((currentAngle % 360) + 360) % 360;
    // ピンの位置は90度
    const pinPosition = 90;
    // ピンの位置から見た相対角度
    const relativeAngle = (360 - normalizedAngle + pinPosition) % 360;

    // 各参加者の扇形の角度を計算
    const segmentAngle = 360 / participantsList.length;
    // 当選者のインデックスを計算
    const winnerIndex = Math.floor(relativeAngle / segmentAngle);

    return participantsList[winnerIndex];
  };

  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30) + 70;
    const lightness = Math.floor(Math.random() * 20) + 60;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const handleStart = () => {
    setWinner(null); // 回転開始時に当選者をリセット
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
        setAngle(prevAngle => {
          const newAngle = prevAngle + currentIncrement;
          // 減速中に当選者を更新
          if (currentIncrement <= 1) {
            const currentWinner = determineWinner(newAngle, participants);
            setWinner(currentWinner);
          }
          return newAngle;
        });
        if (decelerationIntervalRef.current) {
          if (currentIncrement <= 0.1) {
            clearInterval(decelerationIntervalRef.current);
            setSpinning(false);
          }
        }
      }, 100);
    }, keepSpeedTime)
  }

  const handleReset = () => {
    setSpinning(false);
    setAngle(0);
    setWinner(null); // リセット時に当選者をクリア
  }

  const spinningStyle = { transform: `rotate(${angle}deg)` };

  const handleNameInput = () => {
    if (name.trim().length === 0) {
      return;
    }
    // 改行で分割して、空白行を除外
    const names = name.split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0 && n.length <= 20);

    // 新しい参加者リストを作成
    const newParticipants = names.map(n => ({
      name: n,
      color: generateRandomColor()
    }));

    setParticipants([...participants, ...newParticipants]);
    setName('');
  }

  const handleNameChange = (e) => {
    setName(e.target.value);
  }

  const handleNameDelete = (deleteName) => {
    setParticipants(participants.filter(p => p.name !== deleteName));
    if (winner && winner.name === deleteName) {
      setWinner(null); // 当選者が削除された場合、当選表示をクリア
    }
  }

  const setColorStyle = (participants) => {
    if (participants.length === 0) {
      return { background: '#f0f0f0' };
    }

    const segments = participants.map((participant, index) => {
      const startAngle = (index * 360) / participants.length;
      const endAngle = ((index + 1) * 360) / participants.length;
      return `${participant.color} ${startAngle}deg ${endAngle}deg`;
    });

    return {
      background: `conic-gradient(${segments.join(', ')})`
    };
  };

  // Fisher-Yatesシャッフルアルゴリズムを使用
  const shuffleParticipants = () => {
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setParticipants(shuffled);
  };

  return (
    <div className="app-wrapper">
      <section className="roulette-container">
        <div className='roulette'>
          <div className="roulette-outer">
            <div className="roulette-wheel" style={{ ...setColorStyle(participants), ...spinningStyle }}></div>
          </div>
          <div className="roulette-pin"></div>
        </div>
        <div className='name-display'>
          <List className='name-list-container'>
            <div className='name-list-header'>
              <div className='name-list-title'>
                <h3>名前一覧</h3>
                <span className='name-count'>{participants.length}件</span>
              </div>
              <IconButton
                icon={<TbArrowsShuffle />}
                aria-label="シャッフル"
                size="sm"
                colorScheme="purple"
                variant="ghost"
                onClick={shuffleParticipants}
                isDisabled={participants.length < 2}
                className='shuffle-button'
                title="順番をシャッフル"
              />
            </div>
            {participants.map((participant) => (
              <ListItem
                className='name-list-item'
                key={participant.name}
                style={{
                  background: participant.color,
                  color: '#000000',
                  textShadow: '1px 1px 1px rgba(255, 255, 255, 0.5)',
                  border: winner && winner.name === participant.name ? '3px solid #FF6B6B' : 'none',
                  transform: winner && winner.name === participant.name ? 'scale(1.02)' : 'none'
                }}
              >
                <p className='name-display'>{participant.name}</p>
                <Button
                  className='delete-button'
                  colorScheme='red'
                  onClick={() => handleNameDelete(participant.name)}
                >
                  削除
                </Button>
              </ListItem>
            ))}
          </List>
        </div>
      </section>
      {winner && !spinning && (
        <Alert
          status='success'
          variant='subtle'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
          height='100px'
          className='winner-alert'
          style={{
            background: winner.color,
            marginTop: '20px',
            maxWidth: '500px',
            margin: '20px auto'
          }}
        >
          <AlertIcon boxSize='40px' mr={0} />
          <AlertTitle mt={4} mb={1} fontSize='lg'>
            {winner.name}さんが選ばれました！
          </AlertTitle>
        </Alert>
      )}
      <Stack className='button-container' direction='row' spacing={3} align='center'>
        <Button
          leftIcon={<MdOutlineNotStarted />}
          colorScheme='teal'
          variant='solid'
          onClick={handleStart}
          isDisabled={spinning || participants.length < 2}
        >
          START!!
        </Button>
        <Button
          leftIcon={<FaRegStopCircle />}
          colorScheme='teal'
          variant='outline'
          onClick={handleStop}
          isDisabled={!spinning}
        >
          STOP!!
        </Button>
        <Button
          leftIcon={<IoIosRefresh />}
          colorScheme='green'
          onClick={handleReset}
          isDisabled={spinning}
        >
          RESET!!
        </Button>
      </Stack>
      <div className='input-container'>
        <textarea
          className='name-input'
          value={name}
          placeholder='名前を入力（1行に1名、20文字まで）&#13;&#10;例：&#13;&#10;山田太郎&#13;&#10;佐藤花子'
          onChange={handleNameChange}
          rows={4}
        />
        <Button
          colorScheme='blue'
          variant='solid'
          onClick={handleNameInput}
          isDisabled={!name.trim()}
        >
          追加
        </Button>
      </div>
    </div>
  );
}

export default App;
