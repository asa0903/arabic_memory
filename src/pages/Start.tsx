import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sleepMilliSeconds } from '../utils/sleep';
import '../styles/Start.css';


const Start = () => {

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  /**
   * スタートボタン押下時
   */
  const handleStartClick = async () => {
    setIsVisible(true);
    await sleepMilliSeconds(1000);
    // ゲーム画面へ遷移
    navigate('/game');
  };

  return (
    <div id='start_page' className={isVisible ? 'hidden' : ''}>
      <h1 id='title'>アラビア語 神経衰弱</h1>
      <button id='start_button' onClick={handleStartClick}>スタート</button>
    </div>
  );
};

export default Start;
