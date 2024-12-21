import './App.css';
import React, { useState, useRef } from 'react';
import { IoIosRefresh } from "react-icons/io";
import { MdOutlineNotStarted } from "react-icons/md";
import {
  Button,
  Stack,
  Input,
  ListItem,
  List,
  Alert,
  AlertIcon,
  AlertTitle,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import { FaRegStopCircle } from "react-icons/fa";
import { TbArrowsShuffle } from "react-icons/tb";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit2 } from "react-icons/fi";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";

// 定数定義
const ROULETTE_CONSTANTS = {
  ACCELERATION_INTERVAL: 100,
  INITIAL_INCREMENT: 60,
  DECELERATION_FACTOR: 0.9,
  MIN_SPEED: 0.1,
  MIN_PARTICIPANTS: 2,
  MAX_NAME_LENGTH: 20,
  PIN_POSITION: 90, // degrees
  KEEP_SPEED_TIME: {
    MIN: 4000,
    MAX: 7000
  }
};

// ヘルパー関数
const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30) + 70;
  const lightness = Math.floor(Math.random() * 20) + 60;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const calculateWinnerStyles = (participant, isWinner) => ({
  background: participant.color,
  color: '#000000',
  textShadow: '1px 1px 1px rgba(255, 255, 255, 0.5)',
  border: isWinner ? '3px solid #FF6B6B' : 'none',
  transform: isWinner ? 'scale(1.02)' : 'none'
});

const generateRouletteGradient = (participants) => {
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

// Fisher-Yatesシャッフルアルゴリズム
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// コンポーネント
const RouletteWheel = ({ participants, angle, spinning }) => (
  <div className='roulette'>
    <div className="roulette-outer">
      <div
        className="roulette-wheel"
        style={{
          ...generateRouletteGradient(participants),
          transform: `rotate(${angle}deg)`
        }}
      />
    </div>
    <div className="roulette-pin" />
  </div>
);

const ParticipantListItem = ({
  participant,
  isWinner,
  isEditing,
  editValue,
  onEditChange,
  onEditComplete,
  onEditCancel,
  onEditStart,
  onDelete
}) => (
  <ListItem
    className='name-list-item'
    key={participant.name}
    style={calculateWinnerStyles(participant, isWinner)}
  >
    {isEditing ? (
      <div className='edit-container'>
        <input
          type="text"
          value={editValue}
          onChange={onEditChange}
          className='edit-input'
          maxLength={ROULETTE_CONSTANTS.MAX_NAME_LENGTH}
          autoFocus
        />
        <div className='edit-actions'>
          <IconButton
            icon={<IoMdCheckmark />}
            aria-label="完了"
            size="sm"
            colorScheme="green"
            onClick={() => onEditComplete(participant.name)}
            className='edit-button'
            title="編集を完了"
          />
          <IconButton
            icon={<IoMdClose />}
            aria-label="キャンセル"
            size="sm"
            colorScheme="gray"
            onClick={onEditCancel}
            className='edit-button'
            title="編集をキャンセル"
          />
        </div>
      </div>
    ) : (
      <>
        <p className='name-display'>{participant.name}</p>
        <div className='item-actions'>
          <IconButton
            icon={<FiEdit2 />}
            aria-label="編集"
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => onEditStart(participant)}
            className='edit-button'
            title="名前を編集"
          />
          <IconButton
            icon={<RiDeleteBin6Line />}
            aria-label="削除"
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={() => onDelete(participant.name)}
            className='delete-button'
            title="削除"
          />
        </div>
      </>
    )}
  </ListItem>
);

const WinnerAlert = ({ winner }) => (
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
);

const ControlButtons = ({ onStart, onStop, onReset, isSpinning, hasEnoughParticipants }) => (
  <Stack className='button-container' direction='row' spacing={3} align='center'>
    <Button
      leftIcon={<MdOutlineNotStarted />}
      colorScheme='teal'
      variant='solid'
      onClick={onStart}
      isDisabled={isSpinning || !hasEnoughParticipants}
    >
      START!!
    </Button>
    <Button
      leftIcon={<FaRegStopCircle />}
      colorScheme='teal'
      variant='outline'
      onClick={onStop}
      isDisabled={!isSpinning}
    >
      STOP!!
    </Button>
    <Button
      leftIcon={<IoIosRefresh />}
      colorScheme='green'
      onClick={onReset}
      isDisabled={isSpinning}
    >
      RESET!!
    </Button>
  </Stack>
);

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>一括削除の確認</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        全ての名前を削除します。この操作は取り消せません。
        よろしいですか？
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="gray" mr={3} onClick={onClose}>
          キャンセル
        </Button>
        <Button colorScheme="red" onClick={onConfirm}>
          削除する
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

function App() {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const accelerationIntervalRef = useRef(null);
  const keepSpeedIntervalRef = useRef(null);
  const decelerationIntervalRef = useRef(null);
  const [winner, setWinner] = useState(null);
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingName, setEditingName] = useState(null);
  const [editValue, setEditValue] = useState('');
  let currentIncrement = ROULETTE_CONSTANTS.INITIAL_INCREMENT;

  // 当選者を判定する関数
  const determineWinner = (currentAngle, participantsList) => {
    if (participantsList.length === 0) return null;

    const normalizedAngle = ((currentAngle % 360) + 360) % 360;
    const relativeAngle = (360 - normalizedAngle + ROULETTE_CONSTANTS.PIN_POSITION) % 360;
    const segmentAngle = 360 / participantsList.length;
    const winnerIndex = Math.floor(relativeAngle / segmentAngle);

    return participantsList[winnerIndex];
  };

  // 参加者管理関連の関数
  const handleNameInput = () => {
    if (name.trim().length === 0) return;

    const names = name.split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0 && n.length <= ROULETTE_CONSTANTS.MAX_NAME_LENGTH);

    const newParticipants = names.map(n => ({
      name: n,
      color: generateRandomColor()
    }));

    setParticipants([...participants, ...newParticipants]);
    setName('');
  };

  const handleNameDelete = (deleteName) => {
    setParticipants(participants.filter(p => p.name !== deleteName));
    if (winner && winner.name === deleteName) {
      setWinner(null);
    }
  };

  const handleBulkDelete = () => {
    setParticipants([]);
    setWinner(null);
    onClose();
  };

  const handleEditStart = (participant) => {
    setEditingName(participant.name);
    setEditValue(participant.name);
  };

  const handleEditCancel = () => {
    setEditingName(null);
    setEditValue('');
  };

  const handleEditComplete = (oldName) => {
    if (editValue.trim() && editValue.length <= ROULETTE_CONSTANTS.MAX_NAME_LENGTH) {
      setParticipants(participants.map(p =>
        p.name === oldName
          ? { ...p, name: editValue.trim() }
          : p
      ));
      if (winner && winner.name === oldName) {
        setWinner({ ...winner, name: editValue.trim() });
      }
    }
    setEditingName(null);
    setEditValue('');
  };

  // ルーレット制御関連の関数
  const handleStart = () => {
    setWinner(null);
    setSpinning(true);
    accelerationIntervalRef.current = setInterval(() => {
      setAngle(prevAngle => {
        const newAngle = prevAngle < 720 ? (prevAngle + 0.7) * 1.1 : prevAngle + currentIncrement;
        return newAngle;
      });
    }, ROULETTE_CONSTANTS.ACCELERATION_INTERVAL);
  };

  const handleStop = () => {
    if (spinning) {
      clearInterval(accelerationIntervalRef.current);
    }

    keepSpeedIntervalRef.current = setInterval(() => {
      setAngle(prevAngle => prevAngle + currentIncrement);
    }, ROULETTE_CONSTANTS.ACCELERATION_INTERVAL);

    const keepSpeedTime = Math.random() *
      (ROULETTE_CONSTANTS.KEEP_SPEED_TIME.MAX - ROULETTE_CONSTANTS.KEEP_SPEED_TIME.MIN) +
      ROULETTE_CONSTANTS.KEEP_SPEED_TIME.MIN;

    setTimeout(() => {
      if (keepSpeedIntervalRef.current) {
        clearInterval(keepSpeedIntervalRef.current);
      }

      decelerationIntervalRef.current = setInterval(() => {
        currentIncrement *= ROULETTE_CONSTANTS.DECELERATION_FACTOR;
        setAngle(prevAngle => {
          const newAngle = prevAngle + currentIncrement;
          if (currentIncrement <= 1) {
            const currentWinner = determineWinner(newAngle, participants);
            setWinner(currentWinner);
          }
          return newAngle;
        });
        if (decelerationIntervalRef.current) {
          if (currentIncrement <= ROULETTE_CONSTANTS.MIN_SPEED) {
            clearInterval(decelerationIntervalRef.current);
            setSpinning(false);
          }
        }
      }, ROULETTE_CONSTANTS.ACCELERATION_INTERVAL);
    }, keepSpeedTime);
  };

  const handleReset = () => {
    setSpinning(false);
    setAngle(0);
    setWinner(null);
    currentIncrement = ROULETTE_CONSTANTS.INITIAL_INCREMENT;
  };

  const spinningStyle = { transform: `rotate(${angle}deg)` };

  const handleNameChange = (e) => {
    setName(e.target.value);
  }

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
        <RouletteWheel
          participants={participants}
          angle={angle}
          spinning={spinning}
        />
        <div className='name-display'>
          <List className='name-list-container'>
            <div className='name-list-header'>
              <div className='name-list-title'>
                <h3>名前一覧</h3>
                <span className='name-count'>{participants.length}件</span>
              </div>
              <div className='name-list-actions'>
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
                  mr={2}
                />
                <IconButton
                  icon={<RiDeleteBin6Line />}
                  aria-label="一括削除"
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={onOpen}
                  isDisabled={participants.length === 0}
                  className='bulk-delete-button'
                  title="全ての名前を削除"
                />
              </div>
            </div>
            {participants.map((participant) => (
              <ParticipantListItem
                key={participant.name}
                participant={participant}
                isWinner={winner && winner.name === participant.name}
                isEditing={editingName === participant.name}
                editValue={editValue}
                onEditChange={(e) => setEditValue(e.target.value)}
                onEditComplete={handleEditComplete}
                onEditCancel={handleEditCancel}
                onEditStart={handleEditStart}
                onDelete={handleNameDelete}
              />
            ))}
          </List>
        </div>
      </section>

      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleBulkDelete}
      />

      {winner && !spinning && (
        <WinnerAlert winner={winner} />
      )}

      <ControlButtons
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
        isSpinning={spinning}
        hasEnoughParticipants={participants.length >= ROULETTE_CONSTANTS.MIN_PARTICIPANTS}
      />

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
