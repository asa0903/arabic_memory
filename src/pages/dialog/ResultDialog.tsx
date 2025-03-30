import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReward } from "react-rewards";
import '../../styles/ResultDialog.css'

type ResultDialogProps = {
  isOpen: boolean
  time: string;
}

const ResultDialog = (props: ResultDialogProps) => {
  const navigate = useNavigate();
  const { reward } = useReward("rewardId", "confetti");

  /**
   * 戻るボタン押下時
   */
  const clickedBackButton = () => {
    navigate('/');
  }

  /**
   * 再挑戦ボタン押下時
   */
  const clickedRetryButton = () => {
    navigate(0);
  }

  /**
   * 画面が開かれたときの処理
   */
  useEffect(() => {
    // 紙吹雪表示
    reward();
  }, [props.isOpen]);

  return (
    <div id='dialog_background'>
      <div id='result_dialog'>
        <h1 id='title'>リザルト</h1>
        <p id='result'>クリア！</p>
        <p id='time'>クリア時間：{props.time}</p>
        <div id='button_area'>
          <button id='back_button' onClick={clickedBackButton}>
            戻る
          </button>
          <button id='retry_button' onClick={clickedRetryButton}>
            再挑戦
          </button>
        </div>
        <span id='rewardId' />
      </div>
    </div>
  );
}

export default ResultDialog;