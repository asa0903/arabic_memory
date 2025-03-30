import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sleepMilliSeconds } from '../utils/sleep';
import '../styles/Game.css';
import ResultDialog from './dialog/ResultDialog';

// jsonファイルのパス定数
const JSON_PATH: string = `${import.meta.env.BASE_URL}data/letters.json`;
// 最大時間表示の定数
const MAX_TIME: string = '99:99';
// 取得する文字数の定数
const LETTERS_COUNT = 12;
// カードの状態定数
const CARD_STATUS = {
  NONE: '',
  CORRECT: 'correct',
  WRONG: 'wrong',
} as const

// カード状態の型
type CardStatusType = (typeof CARD_STATUS)[keyof typeof CARD_STATUS];
// カードpropsの型
type CardProps = {
  id: number;
  content: string;
  onClick: (id: number) => void;
  isRotated: boolean;
  status: CardStatusType;
}
// カード情報の型
type CardInfo = {
  id: number,
  content: string;
  status: CardStatusType ;
}
// めくられたカードの型
type RotatedCardInfo = {
  id: number;
  content: string;
}
// jsonデータ
type JsonData = {
  letters: string[];
}

/**
 * カード本体部分
 */
const Card: React.FC<CardProps> = ({ id, content, onClick, isRotated, status }) => (
  <div
    className={`card ${isRotated ? 'rotate' : ''}`}
    onClick={() => onClick(id)}
  >
    <div className='front'></div>
    <div className={`back ${status}`}>{content}</div>
  </div>
);

const Game = () => {
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [rotatedCards, setRotatedCards] = useState<RotatedCardInfo[]>([]);
  const [canRotate, setCanRotate] = useState<boolean>(false);
  // スタート表示
  const [isVisibleStart, setIsVisibleStart] = useState<boolean>(true);
  // タイマー
  const [time, setTime] = useState(0);
  const [isTimerStop, setIsTimerStop] = useState<boolean>(true);
  // ダイアログ表示
  const [isOpenResult, setIsOpenResult] = useState<boolean>(false);

  const navigate = useNavigate();

  /**
   * 画面に来たときの最初の処理
   */
  useEffect(() => {
    // 最初の準備処理
    firstProcess();
    // 準備処理完了後、触れるようにする
    setCanRotate(true);
  }, []);

  /**
   * タイマー処理
   */
  useEffect(() => {
    if (isTimerStop) {
      // タイマーが止まっている場合
      return;
    }
    // 1秒ごとに1ずつ足していくインターバル処理
    const timerId = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
    // isTimerStop値変更時に実行され、今のインターバルを止める
    return () => {
      clearInterval(timerId);
    };
  }, [isTimerStop]);

  /**
   * めくられたカードが変わったとき処理
   */
  useEffect(() => {
    if(rotatedCards.length < 2){
      // 2枚カードが開かれていない場合
      return;
    }

    // これ以上カードをめくれないようにする
    setCanRotate(false);

    // 結果判定
    const result = isSameCard();
    changeCardStatus(result);

    // 合っていたら0.5秒だけ止める、間違っていたら確認できるように2秒止める
    const timeoutMilliSecond = result ? 500 : 2000
    // 少し待ってから元に戻す
    setTimeout(() => {
      // statusを元に戻す
      setCards(prevCards =>
        prevCards.map(card =>
          card.status === CARD_STATUS.WRONG
            ? { ...card, status: CARD_STATUS.NONE }
            : card
      ))
      setRotatedCards([]);
      setCanRotate(true);
    }, timeoutMilliSecond);
  }, [rotatedCards]);

  /**
   * カードの状態が変化したとき処理
   */
  useEffect(() => {
    // ゲームクリア判定
    const isWin = isGameWin();
    if(isWin){
      // ゲームクリアしていた場合
      winGame();
    }
  }, [cards]);

  /**
   * 最初の処理
   */
    const firstProcess = async () => {
      // カードに表示するデータを取得する
      const cardsData: JsonData = await fetchCardsData();
      // 取得データから指定した個数分、ランダムにデータを取得する。
      const pickedData = pickRandomData(cardsData, LETTERS_COUNT);
      // データを2つずつに複製する
      const duplicatedCardData: JsonData = duplicateData(pickedData);
      // 順番をランダムにシャッフル
      const shuffledCardData: JsonData = shuffleData(duplicatedCardData);
      // データセット
      setCards(shuffledCardData.letters.map(
        (letter: string, index: number) => ({
          id: index,
          content: letter,
          status: ''
        })
      ));
      // 3秒待って
      await sleepMilliSeconds(3000);
      // スタート画面非表示
      setIsVisibleStart(false);
      // タイマースタート
      setIsTimerStop(false);
    };

  /**
   * jsonからカードに表示するデータを取得
   */
  const fetchCardsData = async (): Promise<JsonData> => {
    try {
      // jsonからデータを取得
      const response = await fetch(JSON_PATH);
      const data: JsonData = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      // とりあえずスタート画面に戻す
      navigate('/');
    }

    // 空のデータを返す（基本通らない）
    const emptyData: JsonData = {
      letters: []
    };
    return emptyData;
  }

  /**
   * データから指定した個数分、ランダムにデータを取得
   * @returns ランダムに選定されたデータ
   */
  const pickRandomData = (data: JsonData, count: number): JsonData => {
    if(data.letters.length <= count){
      // データの総数より、指定された個数が多い場合
      // そのまま何もせずに返す
      return data;
    }

    // ランダムシャッフル
    const shuffledData: JsonData = shuffleData(data);
    // その中から指定された個数、文字を取得
    const pickedLetters: string[] = shuffledData.letters.slice(0, count);

    const pickedData: JsonData = { letters: pickedLetters };
    return pickedData;
  }

  /**
   * データ複製処理
   * @returns 複製されたデータ
   */
  const duplicateData = (data: JsonData): JsonData  => {
    const duplicatedData: string[] = data.letters.flatMap(letter => [letter, letter]);
    const duplicatedJsonData: JsonData = {
      letters: duplicatedData
    }
    return duplicatedJsonData;
  }

  /**
   * データシャッフル処理
   * @returns シャッフルされたデータ
   */
  const shuffleData = (data: JsonData): JsonData => {
    const shuffledLetters = [...data.letters];

    // シャッフル処理
    for (let i = shuffledLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
    }

    const shuffledData = { letters: shuffledLetters }
    return shuffledData
  }

  /**
   * めくられたカードが同じ文字かチェック
   * @returns 同じ文字だったかの結果
   */
  const isSameCard = (): boolean => {
    const isSame = rotatedCards[0].content === rotatedCards[1].content;
    return isSame;
  }

  /**
   * カード状態変更
   * @param result 合っていたかどうかの結果
   */
  const changeCardStatus = async (result: boolean) => {
    await sleepMilliSeconds(500);
    if(result){
      // 合っていた場合
      changeStatusCorrect();
    }else{
      // 間違っていた場合
      changeStatusWrong();
    }
  }

  /**
   * カードの状態をcorrectに変更
   */
  const changeStatusCorrect = async () => {
    const newCards: CardInfo[] = cards.map(card =>
      rotatedCards.some(rotatedCard => rotatedCard.id === card.id)
        ? { ...card, status: CARD_STATUS.CORRECT }
        : card
    );
    setCards(newCards);
  }

  /**
   * カードの状態をwrongに変更
   */
  const changeStatusWrong = async () => {
    // めくられたカードのstatusをwrongに変更
    const newCards: CardInfo[] = cards.map(card =>
      rotatedCards.some(rotatedCard => rotatedCard.id === card.id)
        ? { ...card, status: CARD_STATUS.WRONG }
        : card
    );
    setCards(newCards);
  }

  /**
   * ゲームクリア判定処理
   */
  const isGameWin = (): boolean => {
    if(cards.length === 0){
      // カード情報がまだない場合
      return false;
    }
    // クリア判定
    const isWin: boolean = cards.every((card) => {
      return card.status === CARD_STATUS.CORRECT
    });
    return isWin;
  }

  /**
   * ゲームクリア時処理
   */
  const winGame = () => {
    // タイマーを止める
    stopTimer();
    // リザルトダイアログ表示
    setIsOpenResult(true);
  }

  /*
   * タイマー終了
   */
  const stopTimer = () => {
    setIsTimerStop(true);
  };

  /**
   * 秒数を表示用に変換
   * @param nowSeconds 現在秒数
   * @returns 表示用時間
   */
  const formatTime = (nowSeconds: number): string => {
    // 秒数をミリ秒に変換してDateオブジェクトを作成
    const date = new Date(nowSeconds * 1000);

    // 分と秒を取得
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    // 分と秒を2桁に揃える
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // 'mm:ss'形式に変換
    const formattedTime = `${formattedMinutes}:${formattedSeconds}`;
    if (formattedTime === MAX_TIME) {
      // カンストでタイマーストップ
      stopTimer();
    }
    return formattedTime;
  };

  /**
   * カードクリック時処理
   * @param id クリックされたカードのID
   */
  const handleCardClick = (id: number) => {
    // すでに回転したカードが含まれている場合
    if (rotatedCards.some((card) => card.id === id)) return;
    // 全てのカードがめくれない状態の場合
    if (canRotate === false) return;

    // クリックされたカード情報
    const clickedCard: RotatedCardInfo = {id, content: cards[id].content};

    setRotatedCards([...rotatedCards, clickedCard]);
  };

  return (
    <main>
      <div id='timer'>経過時間：{formatTime(time)}</div>
      <div id='card_list'>
        {cards.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            content={card.content}
            onClick={handleCardClick}
            isRotated={rotatedCards.some((rotatedCard) => rotatedCard.id === card.id)}
            status={card.status}
          />
        ))}
      </div>
      <div id='start_background' className={isVisibleStart ? '' : 'hidden'}>
        <div id='start'>
          <div id='start_text'>START!</div>
        </div>
      </div>
      { isOpenResult && (
        <ResultDialog isOpen={isOpenResult} time={formatTime(time)} />
      )}
    </main>
  );
};

export default Game;
